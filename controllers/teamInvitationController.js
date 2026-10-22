const crypto = require("crypto");

const Team = require("../models/Team");
const User = require("../models/User");
const TeamMembership = require("../models/TeamMembership");
const TeamInvitation = require("../models/TeamInvitation");


// CREATE TEAM INVITATION
const inviteUser = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const currentMembership =
      await TeamMembership.findOne({
        teamId,
        userId: req.user._id,
        status: "active",
      });

    if (!currentMembership) {
      return res.status(403).json({
        message:
          "You are not a member of this team",
      });
    }

    if (
      currentMembership.role !== "owner" &&
      currentMembership.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Only team owners and admins can invite members",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      const existingMembership =
        await TeamMembership.findOne({
          teamId,
          userId: user._id,
          status: "active",
        });

      if (existingMembership) {
        return res.status(409).json({
          message:
            "This user is already a member of the team",
        });
      }
    }

    const existingInvitation =
      await TeamInvitation.findOne({
        teamId,
        email: normalizedEmail,
        status: "pending",
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (existingInvitation) {
      return res.status(409).json({
        message:
          "An invitation is already pending for this email",
      });
    }

    const invitationToken =
      crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    const invitation =
      await TeamInvitation.create({
        teamId,
        invitedBy: req.user._id,
        email: normalizedEmail,
        role: role || "member",
        token: invitationToken,
        status: "pending",
        expiresAt,
      });

    return res.status(201).json({
      message:
        "Team invitation created successfully",
      invitation: {
        id: invitation._id,
        teamId: invitation.teamId,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Invite user error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create team invitation",
      error: error.message,
    });
  }
};


// GET INVITATIONS FOR THE LOGGED-IN USER (invitee-side inbox)
const getMyInvitations = async (req, res) => {
  try {
    const invitations =
      await TeamInvitation.find({
        email: req.user.email.toLowerCase(),
        status: "pending",
        expiresAt: {
          $gt: new Date(),
        },
      })
        .populate(
          "teamId",
          "name owner"
        )
        .populate(
          "invitedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    const formattedInvitations =
      invitations.map((invitation) => ({
        id: invitation._id,
        teamId: invitation.teamId
          ? invitation.teamId._id
          : null,
        teamName: invitation.teamId
          ? invitation.teamId.name
          : "Unknown team",
        invitedBy: invitation.invitedBy
          ? invitation.invitedBy.name
          : "Unknown user",
        invitedByEmail:
          invitation.invitedBy
            ? invitation.invitedBy.email
            : "",
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt:
          invitation.expiresAt,
        createdAt:
          invitation.createdAt,
      }));

    return res.status(200).json(
      formattedInvitations
    );
  } catch (error) {
    console.error(
      "Get invitations error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch invitations",
      error: error.message,
    });
  }
};


// GET PENDING INVITATIONS FOR A TEAM (owner/admin view — for managing outstanding invites)
const getTeamInvitations = async (
  req,
  res
) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const currentMembership =
      await TeamMembership.findOne({
        teamId,
        userId: req.user._id,
        status: "active",
      });

    if (!currentMembership) {
      return res.status(403).json({
        message:
          "You are not a member of this team",
      });
    }

    if (
      currentMembership.role !== "owner" &&
      currentMembership.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Only team owners and admins can view team invitations",
      });
    }

    const invitations =
      await TeamInvitation.find({
        teamId,
        status: "pending",
        expiresAt: {
          $gt: new Date(),
        },
      })
        .populate(
          "invitedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    const formattedInvitations =
      invitations.map((invitation) => ({
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        invitedBy: invitation.invitedBy
          ? invitation.invitedBy.name
          : "Unknown user",
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      }));

    return res.status(200).json(
      formattedInvitations
    );
  } catch (error) {
    console.error(
      "Get team invitations error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch team invitations",
      error: error.message,
    });
  }
};


// ACCEPT A TEAM INVITATION
const acceptInvitation = async (
  req,
  res
) => {
  try {
    const { invitationId } =
      req.params;

    const invitation =
      await TeamInvitation.findById(
        invitationId
      );

    if (!invitation) {
      return res.status(404).json({
        message:
          "Invitation not found",
      });
    }

    if (
      invitation.email !==
      req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        message:
          "This invitation does not belong to your account",
      });
    }

    if (
      invitation.status !== "pending"
    ) {
      return res.status(400).json({
        message:
          "This invitation is no longer pending",
      });
    }

    if (
      invitation.expiresAt <=
      new Date()
    ) {
      invitation.status = "expired";

      await invitation.save();

      return res.status(400).json({
        message:
          "This invitation has expired",
      });
    }

    const existingMembership =
      await TeamMembership.findOne({
        teamId: invitation.teamId,
        userId: req.user._id,
      });

    if (
      existingMembership &&
      existingMembership.status ===
        "active"
    ) {
      invitation.status =
        "accepted";

      invitation.acceptedAt =
        new Date();

      await invitation.save();

      return res.status(409).json({
        message:
          "You are already a member of this team",
      });
    }

    let membership =
      existingMembership;

    if (membership) {
      membership.role =
        invitation.role;

      membership.status =
        "active";

      membership.joinedAt =
        new Date();

      await membership.save();
    } else {
      membership =
        await TeamMembership.create({
          teamId:
            invitation.teamId,
          userId:
            req.user._id,
          role:
            invitation.role,
          status:
            "active",
          joinedAt:
            new Date(),
        });
    }

    invitation.status =
      "accepted";

    invitation.acceptedAt =
      new Date();

    await invitation.save();

    return res.status(200).json({
      message:
        "Team invitation accepted successfully",

      membership: {
        id: membership._id,
        teamId:
          membership.teamId,
        userId:
          membership.userId,
        role:
          membership.role,
        status:
          membership.status,
      },
    });
  } catch (error) {
    console.error(
      "Accept invitation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to accept invitation",
      error: error.message,
    });
  }
};


// REJECT/DECLINE A TEAM INVITATION (invitee)
const rejectInvitation = async (
  req,
  res
) => {
  try {
    const { invitationId } =
      req.params;

    const invitation =
      await TeamInvitation.findById(
        invitationId
      );

    if (!invitation) {
      return res.status(404).json({
        message:
          "Invitation not found",
      });
    }

    if (
      invitation.email !==
      req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        message:
          "This invitation does not belong to your account",
      });
    }

    if (
      invitation.status !== "pending"
    ) {
      return res.status(400).json({
        message:
          "This invitation is no longer pending",
      });
    }

    invitation.status = "rejected";

    await invitation.save();

    return res.status(200).json({
      message: "Invitation declined",
    });
  } catch (error) {
    console.error(
      "Reject invitation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to decline invitation",
      error: error.message,
    });
  }
};


// CANCEL A PENDING INVITATION (owner/admin who is a member of the team)
const cancelInvitation = async (
  req,
  res
) => {
  try {
    const { invitationId } =
      req.params;

    const invitation =
      await TeamInvitation.findById(
        invitationId
      );

    if (!invitation) {
      return res.status(404).json({
        message:
          "Invitation not found",
      });
    }

    const currentMembership =
      await TeamMembership.findOne({
        teamId: invitation.teamId,
        userId: req.user._id,
        status: "active",
      });

    if (!currentMembership) {
      return res.status(403).json({
        message:
          "You are not a member of this team",
      });
    }

    if (
      currentMembership.role !== "owner" &&
      currentMembership.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Only team owners and admins can cancel invitations",
      });
    }

    if (
      invitation.status !== "pending"
    ) {
      return res.status(400).json({
        message:
          "This invitation is no longer pending",
      });
    }

    invitation.status = "cancelled";

    await invitation.save();

    return res.status(200).json({
      message:
        "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error(
      "Cancel invitation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel invitation",
      error: error.message,
    });
  }
};


// EXPORT CONTROLLER FUNCTIONS
module.exports = {
  inviteUser,
  getMyInvitations,
  getTeamInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
};