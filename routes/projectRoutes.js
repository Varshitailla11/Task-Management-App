const express = require("express");

const {
  createProject,
  getMyProjects,
  getProjectMembers,
  addProjectMember,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE PROJECT
router.post(
  "/",
  protect,
  createProject
);


// GET MY PROJECTS
router.get(
  "/",
  protect,
  getMyProjects
);


// GET PROJECT MEMBERS
router.get(
  "/:projectId/members",
  protect,
  getProjectMembers
);


// ADD MEMBER TO PROJECT
router.post(
  "/:projectId/members",
  protect,
  addProjectMember
);


module.exports = router;