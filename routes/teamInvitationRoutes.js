const express = require("express");

const {
  inviteUser,
  getMyInvitations,
  getTeamInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} = require("../controllers/teamInvitationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create a team invitation
router.post(
  "/:teamId/invite",
  protect,
  inviteUser
);


// Get invitations for the logged-in user (invitee inbox)
router.get(
  "/",
  protect,
  getMyInvitations
);


// Get pending invitations for a team (owner/admin management view)
router.get(
  "/team/:teamId",
  protect,
  getTeamInvitations
);


// Accept a team invitation
router.post(
  "/:invitationId/accept",
  protect,
  acceptInvitation
);


// Reject/decline a team invitation
router.post(
  "/:invitationId/reject",
  protect,
  rejectInvitation
);


// Cancel a pending invitation (owner/admin)
router.delete(
  "/:invitationId",
  protect,
  cancelInvitation
);


module.exports = router;