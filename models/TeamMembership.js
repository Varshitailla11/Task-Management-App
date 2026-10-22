const mongoose = require("mongoose");

const teamMembershipSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
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
        "owner",
        "admin",
        "developer",
        "designer",
        "member",
      ],
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "pending", "removed"],
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

teamMembershipSchema.index(
  {
    teamId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "TeamMembership",
  teamMembershipSchema
);