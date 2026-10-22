const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const TeamMembership = require("../models/TeamMembership");
const Team = require("../models/Team");
const User = require("../models/User");


// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      teamId,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    if (!teamId) {
      return res.status(400).json({
        message: "Team is required",
      });
    }

    // Check that the team exists
    const team = await Team.findById(
      teamId
    );

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Check that current user belongs
    // to the team
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

    // Only owner/admin can create projects
    if (
      membership.role !== "owner" &&
      membership.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Only team owners and admins can create projects",
      });
    }

    const project =
      await Project.create({
        name: name.trim(),
        description:
          description
            ? description.trim()
            : "",
        teamId,
        createdBy:
          req.user._id,
      });

    // Automatically add project creator
    // as project manager
    await ProjectMembership.create({
      projectId: project._id,
      userId: req.user._id,
      role: "project-manager",
      status: "active",
    });

    return res.status(201).json({
      message:
        "Project created successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Create project error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create project",
      error: error.message,
    });
  }
};


// GET MY PROJECTS
const getMyProjects = async (
  req,
  res
) => {
  try {
    // Find teams where user is a member
    const teamMemberships =
      await TeamMembership.find({
        userId: req.user._id,
        status: "active",
      });

    const teamIds =
      teamMemberships.map(
        (membership) =>
          membership.teamId
      );

    if (teamIds.length === 0) {
      return res.status(200).json([]);
    }

    const projects =
      await Project.find({
        teamId: {
          $in: teamIds,
        },
        status: {
          $ne: "archived",
        },
      })
        .populate(
          "teamId",
          "name"
        )
        .sort({
          createdAt: -1,
        });

    const formattedProjects =
      await Promise.all(
        projects.map(
          async (project) => {
            const memberCount =
              await ProjectMembership.countDocuments(
                {
                  projectId:
                    project._id,
                  status: "active",
                }
              );

            const result = project.toObject();

            return {
              ...result,
              memberCount,
            };
          }
        )
      );

    return res.status(200).json(
      formattedProjects
    );
  } catch (error) {
    console.error(
      "Get projects error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch projects",
      error: error.message,
    });
  }
};


// GET PROJECT MEMBERS
const getProjectMembers = async (
  req,
  res
) => {
  try {
    const { projectId } =
      req.params;

    const project =
      await Project.findById(
        projectId
      );

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found",
      });
    }

    // Check whether current user
    // belongs to the project's team
    const teamMembership =
      await TeamMembership.findOne({
        teamId: project.teamId,
        userId: req.user._id,
        status: "active",
      });

    if (!teamMembership) {
      return res.status(403).json({
        message:
          "You are not a member of this project's team",
      });
    }

    const members =
      await ProjectMembership.find({
        projectId,
        status: "active",
      })
        .populate(
          "userId",
          "name email avatar"
        )
        .sort({
          createdAt: 1,
        });

    const formattedMembers =
      members.map(
        (member) => ({
          id:
            member.userId._id,
          name:
            member.userId.name,
          email:
            member.userId.email,
          avatar:
            member.userId.avatar,
          role:
            member.role,
          joinedAt:
            member.joinedAt,
        })
      );

    return res.status(200).json(
      formattedMembers
    );
  } catch (error) {
    console.error(
      "Get project members error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch project members",
      error: error.message,
    });
  }
};


// ADD MEMBER TO PROJECT
const addProjectMember = async (
  req,
  res
) => {
  try {
    const { projectId } =
      req.params;

    const {
      userId,
      role,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        message:
          "User is required",
      });
    }

    const project =
      await Project.findById(
        projectId
      );

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found",
      });
    }

    // Current user must belong
    // to the project's team
    const currentMembership =
      await TeamMembership.findOne({
        teamId: project.teamId,
        userId: req.user._id,
        status: "active",
      });

    if (!currentMembership) {
      return res.status(403).json({
        message:
          "You are not a member of this project's team",
      });
    }

    // Only owner/admin can add
    // project members
    if (
      currentMembership.role !==
        "owner" &&
      currentMembership.role !==
        "admin"
    ) {
      return res.status(403).json({
        message:
          "Only team owners and admins can add project members",
      });
    }

    // User must be a member of
    // the project's team
    const userMembership =
      await TeamMembership.findOne({
        teamId: project.teamId,
        userId,
        status: "active",
      });

    if (!userMembership) {
      return res.status(400).json({
        message:
          "This user is not a member of the project team",
      });
    }

    // Check duplicate project membership
    const existing =
      await ProjectMembership.findOne({
        projectId,
        userId,
      });

    if (
      existing &&
      existing.status === "active"
    ) {
      return res.status(409).json({
        message:
          "This user is already a project member",
      });
    }

    let projectMembership =
      existing;

    if (projectMembership) {
      projectMembership.status =
        "active";

      projectMembership.role =
        role || "member";

      projectMembership.joinedAt =
        new Date();

      await projectMembership.save();
    } else {
      projectMembership =
        await ProjectMembership.create({
          projectId,
          userId,
          role:
            role || "member",
          status: "active",
        });
    }

    return res.status(201).json({
      message:
        "Project member added successfully",
      membership:
        projectMembership,
    });
  } catch (error) {
    console.error(
      "Add project member error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add project member",
      error: error.message,
    });
  }
};


module.exports = {
  createProject,
  getMyProjects,
  getProjectMembers,
  addProjectMember,
};