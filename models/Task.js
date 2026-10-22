const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in-progress",
        "completed",
      ],
      default: "todo",
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
      ],
      default: "medium",
    },

    dueDate: {
      type: Date,
      default: null,
    },


    // --------------------------------
    // NEW REAL RELATIONSHIPS
    // --------------------------------

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    // --------------------------------
    // OLD FIELDS
    // Keep temporarily for compatibility
    // --------------------------------

    assignee: {
      type: String,
      default: "",
      trim: true,
    },

    project: {
      type: String,
      default: "",
      trim: true,
    },


    // --------------------------------
    // TASK CREATOR
    // --------------------------------

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Task",
    taskSchema
  );