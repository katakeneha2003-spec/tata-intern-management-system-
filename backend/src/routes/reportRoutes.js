const express = require("express");
const {
  submitReport, getMyReports, getReports, reviewReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", authorize("intern"), submitReport);
router.get("/my", authorize("intern"), getMyReports);
router.get("/", authorize("admin", "mentor"), getReports);
router.put("/:id/review", authorize("admin", "mentor"), reviewReport);

module.exports = router;
