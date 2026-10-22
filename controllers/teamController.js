const Team = require("../models/Team");
const TeamMembership = require("../models/TeamMembership");

const MANAGEABLE_ROLES = ["admin", "developer", "designer", "member"];


// CREATE TEAM
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const team = await Team.create({
      name: name.trim(),
      owner: req.user._id,
    });

    await TeamMembership.create({
      teamId: team._id,
      userId: req.user._id,
      role: "owner",
      status: "active",
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Create team error:", error);

    res.status(500).json({
      message: "Failed to create team",
      error: error.message,
    });
  }
};


// GET MY TEAMS
const getMyTeams = async (req, res) => {
  try {
    const memberships =
      await TeamMembership.find({
        userId: req.user._id,
        status: "active",
      })
        .populate("teamId")
        .sort({ createdAt: 1 });

    const teams = memberships
      .filter((membership) => membership.teamId)
      .map((membership) => ({
        id: membership.teamId._id,
        name: membership.teamId.name,
        owner: membership.teamId.owner,
        role: membership.role,
        joinedAt: membership.joinedAt,
      }));

    res.status(200).json(teams);
  } catch (error) {
    console.error("Get teams error:", error);

    res.status(500).json({
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
};


// GET TEAM MEMBERS
const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const membership =
      await TeamMembership.findOne({
        teamId,
        userId: req.user._id,
        status: "active",
      });

    if (!membership) {
      return res.status(403).json({
        message:
          "You are not a member of this team",
      });
    }

    const members =
      await TeamMembership.find({
        teamId,
        status: "active",
      })
        .populate(
          "userId",
          "name email avatar"
        )
        .sort({ createdAt: 1 });

    const formattedMembers = members
      .filter((member) => member.userId)
      .map((member) => ({
        id: member.userId._id,
        userId: member.userId._id,
        name: member.userId.name,
        email: member.userId.email,
        avatar: member.userId.avatar,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
      }));

    res.status(200).json(formattedMembers);
  } catch (error) {
    console.error(
      "Get team members error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
};


// UPDATE A MEMBER'S ROLE (owner/admin only)
const updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    if (!role || !MANAGEABLE_ROLES.includes(role)) {
      return res.status(400).json({
        message:
          "A valid role is required (admin, developer, designer, or member)",
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
          "Only team owners and admins can change member roles",
      });
    }

    const targetMembership =
      await TeamMembership.findOne({
        teamId,
        userId,
        status: "active",
      });

    if (!targetMembership) {
      return res.status(404).json({
        message:
          "This user is not a member of the team",
      });
    }

    if (targetMembership.role === "owner") {
      return res.status(403).json({
        message:
          "The team owner's role cannot be changed",
      });
    }

    if (
      currentMembership.role === "admin" &&
      targetMembership.role === "admin"
    ) {
      return res.status(403).json({
        message:
          "Admins cannot change another admin's role",
      });
    }

    targetMembership.role = role;

    await targetMembership.save();

    return res.status(200).json({
      message: "Member role updated successfully",
      membership: {
        id: targetMembership._id,
        teamId: targetMembership.teamId,
        userId: targetMembership.userId,
        role: targetMembership.role,
        status: targetMembership.status,
      },
    });
  } catch (error) {
    console.error(
      "Update member role error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update member role",
      error: error.message,
    });
  }
};


// REMOVE A MEMBER FROM A TEAM (owner/admin only)
const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

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
          "Only team owners and admins can remove members",
      });
    }

    if (String(userId) === String(req.user._id)) {
      return res.status(400).json({
        message:
          "You cannot remove yourself from the team this way",
      });
    }

    const targetMembership =
      await TeamMembership.findOne({
        teamId,
        userId,
        status: "active",
      });

    if (!targetMembership) {
      return res.status(404).json({
        message:
          "This user is not a member of the team",
      });
    }

    if (targetMembership.role === "owner") {
      return res.status(403).json({
        message: "The team owner cannot be removed",
      });
    }

    if (
      currentMembership.role === "admin" &&
      targetMembership.role === "admin"
    ) {
      return res.status(403).json({
        message: "Admins cannot remove another admin",
      });
    }

    targetMembership.status = "removed";

    await targetMembership.save();

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error(
      "Remove member error:",
      error
    );

    return res.status(500).json({
      message: "Failed to remove member",
      error: error.message,
    });
  }
};


module.exports = {
  createTeam,
  getMyTeams,
  getTeamMembers,
  updateMemberRole,
  removeMember,
};