const express = require("express");
const {
  markAttendance, getMyAttendance, getAttendanceForIntern,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", authorize("intern", "admin"), markAttendance);
router.get("/my", authorize("intern"), getMyAttendance);
router.get("/intern/:internId", authorize("admin", "mentor"), getAttendanceForIntern);

module.exports = router;
