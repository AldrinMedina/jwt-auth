const { Medicine, User } = require("../models");

exports.getRecentActivities = async (req, res) => {
  try {
    // Fetch medicine activities
    const medicineActivities = await Medicine.findAll({
      attributes: ["id", "name", "createdAt", "updatedAt", "createdBy"],
      order: [["updatedAt", "DESC"]],
      limit: 20
    });

    // Fetch user activities
    const userActivities = await User.findAll({
      attributes: ["id", "username", "createdAt", "updatedAt"],
      order: [["updatedAt", "DESC"]],
      limit: 20
    });

    // Normalize activities into a single unified format
    const formattedMedicine = medicineActivities.map((m) => ({
      type: "medicine",
      action: m.createdAt.getTime() === m.updatedAt.getTime() ? "created" : "updated",
      name: m.name,
      user: m.createdBy || null,
      timestamp: m.updatedAt,
    }));

    const formattedUsers = userActivities.map((u) => ({
      type: "user",
      action: u.createdAt.getTime() === u.updatedAt.getTime() ? "created" : "updated",
      username: u.username,
      timestamp: u.updatedAt,
    }));

    // Merge + sort by timestamp DESC
    const merged = [...formattedMedicine, ...formattedUsers].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({
      success: true,
      data: merged.slice(0, 5) // return only the latest 5 events
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to load activities" });
  }
};
