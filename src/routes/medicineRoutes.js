const express = require("express");
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

// Public: all roles can view medicines
router.get("/", authenticateToken, requireRole(["admin", "doctor", "staff"]), getMedicines);
router.get("/:id", authenticateToken, requireRole(["admin", "doctor", "staff"]), getMedicineById);

// Protected: only doctors and admins can create or update
router.post("/", authenticateToken, requireRole(["admin", "doctor"]), createMedicine);
router.put("/:id", authenticateToken, requireRole(["admin", "doctor"]), updateMedicine);

// Admin-only: delete medicine
router.delete("/:id", authenticateToken, requireRole(["admin", "doctor"]), deleteMedicine);

module.exports = router;
