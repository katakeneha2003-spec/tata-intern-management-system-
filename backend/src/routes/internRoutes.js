const express = require("express");
const {
  createIntern, getInterns, getIntern, getMyInternProfile, updateIntern, deleteIntern,
} = require("../controllers/internController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/me/profile", authorize("intern"), getMyInternProfile);
router.route("/")
  .get(authorize("admin", "mentor"), getInterns)
  .post(authorize("admin"), createIntern);
router.route("/:id")
  .get(authorize("admin", "mentor", "intern"), getIntern)
  .put(authorize("admin"), updateIntern)
  .delete(authorize("admin"), deleteIntern);

module.exports = router;
