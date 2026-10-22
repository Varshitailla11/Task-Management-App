const express = require("express");

const {
  createTeam,
  getMyTeams,
  getTeamMembers,
  updateMemberRole,
  removeMember,
} = require("../controllers/teamController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create a new team
router.post("/", protect, createTeam);


// Get teams belonging to the logged-in user
router.get("/", protect, getMyTeams);


// Get members of a specific team
router.get(
  "/:teamId/members",
  protect,
  getTeamMembers
);


// Update a member's role (owner/admin only)
router.patch(
  "/:teamId/members/:userId",
  protect,
  updateMemberRole
);


// Remove a member from the team (owner/admin only)
router.delete(
  "/:teamId/members/:userId",
  protect,
  removeMember
);


module.exports = router;