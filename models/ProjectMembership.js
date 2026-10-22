const mongoose = require("mongoose");

const projectMembershipSchema =
  new mongoose.Schema(
    {
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      role: {
        type: String,
        enum: [
          "project-manager",
          "developer",
          "designer",
          "member",
        ],
        default: "member",
      },

      status: {
        type: String,
        enum: [
          "active",
          "removed",
        ],
        default: "active",
      },

      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

projectMembershipSchema.index(
  {
    projectId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "ProjectMembership",
    projectMembershipSchema
  );