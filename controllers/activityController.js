const Activity = require("../models/Activity");

// Get all activities
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

// Create a new activity
const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({
      type: req.body.type,
      message: req.body.message,
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create activity",
      error: error.message,
    });
  }
};

module.exports = {
  getActivities,
  createActivity,
};