const { Medicine } = require("../models");

// Create new medicine (admin, doctor)
const createMedicine = async (req, res) => {
  try {
    const { name, quantity, expiryDate, description, createdBy } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Name and expiry date are required",
      });
    }

    const medicine = await Medicine.create({
      name,
      quantity,
      expiryDate,
      description,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("Create medicine error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all medicines (all roles)
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll();
    res.json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error("Get medicines error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get single medicine
const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByPk(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error("Get medicine error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update medicine (admin, doctor)
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, expiryDate, description } = req.body;

    const medicine = await Medicine.findByPk(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await medicine.update({ name, quantity, expiryDate, description });

    res.json({
      success: true,
      message: "Medicine updated successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete medicine (admin only)
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findByPk(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await medicine.destroy();

    res.json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    console.error("Delete medicine error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
