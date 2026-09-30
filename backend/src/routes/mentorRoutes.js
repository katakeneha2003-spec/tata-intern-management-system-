const express = require("express");
const { getMentors, getMentor, createMentor } = require("../controllers/mentorController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(authorize("admin"), getMentors).post(authorize("admin"), createMentor);
router.get("/:id", authorize("admin", "mentor"), getMentor);

module.exports = router;
