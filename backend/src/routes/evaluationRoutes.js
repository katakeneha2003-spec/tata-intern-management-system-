const express = require("express");
const {
  createEvaluation, getEvaluationsForIntern, getMyEvaluations,
} = require("../controllers/evaluationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", authorize("mentor", "admin"), createEvaluation);
router.get("/my", authorize("intern"), getMyEvaluations);
router.get("/intern/:internId", authorize("admin", "mentor", "intern"), getEvaluationsForIntern);

module.exports = router;
