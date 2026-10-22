const Task = require("../models/Task");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const TeamMembership = require("../models/TeamMembership");


// ---------------------------------------------
// GET ALL TASKS
// ---------------------------------------------

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      createdBy: req.user._id,
    })
      .populate("assignedTo", "name email avatar")
      .populate("projectId", "name")
      .populate("teamId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};


// ---------------------------------------------
// GET ONE TASK
// ---------------------------------------------

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate("assignedTo", "name email avatar")
      .populate("projectId", "name")
      .populate("teamId", "name");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};


// ---------------------------------------------
// CREATE TASK
// ---------------------------------------------

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      project,

      // NEW
      teamId,
      projectId,
      assignedTo,
    } = req.body;


    // -----------------------------------------
    // Validate project if provided
    // -----------------------------------------

    let selectedProject = null;

    if (projectId) {
      selectedProject =
        await Project.findById(projectId);

      if (!selectedProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }


      // User must belong to project team
      const teamMembership =
        await TeamMembership.findOne({
          teamId:
            selectedProject.teamId,
          userId: req.user._id,
          status: "active",
        });

      if (!teamMembership) {
        return res.status(403).json({
          message:
            "You are not a member of this project's team",
        });
      }


      // If assignedTo is provided,
      // verify project membership
      if (assignedTo) {
        const projectMembership =
          await ProjectMembership.findOne({
            projectId,
            userId: assignedTo,
            status: "active",
          });

        if (!projectMembership) {
          return res.status(400).json({
            message:
              "Assigned user is not a member of this project",
          });
        }
      }
    }


    // -----------------------------------------
    // Create task
    // -----------------------------------------

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate || null,

      // OLD FIELDS
      assignee: assignee || "",
      project: project || "",

      // NEW RELATIONSHIPS
      teamId:
        teamId ||
        (selectedProject
          ? selectedProject.teamId
          : null),

      projectId:
        projectId || null,

      assignedTo:
        assignedTo || null,

      createdBy: req.user._id,
    });


    const populatedTask =
      await Task.findById(task._id)
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "projectId",
          "name"
        )
        .populate(
          "teamId",
          "name"
        );


    res.status(201).json(
      populatedTask
    );

  } catch (error) {
    console.error(
      "Create task error:",
      error
    );

    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};


// ---------------------------------------------
// UPDATE TASK
// ---------------------------------------------

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      project,

      // NEW
      teamId,
      projectId,
      assignedTo,
    } = req.body;


    const updates = {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      project,

      // NEW
      teamId,
      projectId,
      assignedTo,
    };


    Object.keys(updates).forEach(
      (key) => {
        if (
          updates[key] === undefined
        ) {
          delete updates[key];
        }
      }
    );


    // -----------------------------------------
    // Validate project if changing it
    // -----------------------------------------

    if (projectId) {
      const selectedProject =
        await Project.findById(projectId);

      if (!selectedProject) {
        return res.status(404).json({
          message:
            "Project not found",
        });
      }


      const teamMembership =
        await TeamMembership.findOne({
          teamId:
            selectedProject.teamId,
          userId: req.user._id,
          status: "active",
        });

      if (!teamMembership) {
        return res.status(403).json({
          message:
            "You are not a member of this project's team",
        });
      }


      if (assignedTo) {
        const projectMembership =
          await ProjectMembership.findOne({
            projectId,
            userId: assignedTo,
            status: "active",
          });

        if (!projectMembership) {
          return res.status(400).json({
            message:
              "Assigned user is not a member of this project",
          });
        }
      }
    }


    const task =
      await Task.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user._id,
        },
        updates,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "projectId",
          "name"
        )
        .populate(
          "teamId",
          "name"
        );


    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }


    res.status(200).json(task);

  } catch (error) {
    console.error(
      "Update task error:",
      error
    );

    res.status(400).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};


// ---------------------------------------------
// DELETE TASK
// ---------------------------------------------

const deleteTask = async (req, res) => {
  try {
    const task =
      await Task.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id,
      });


    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }


    res.status(200).json({
      message:
        "Task deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to delete task",
      error: error.message,
    });
  }
};


module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};