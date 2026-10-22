const mongoose = require("mongoose");

const teamInvitationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "developer",
        "designer",
        "member",
      ],
      default: "member",
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

teamInvitationSchema.index({
  teamId: 1,
  email: 1,
});

module.exports = mongoose.model(
  "TeamInvitation",
  teamInvitationSchema
);