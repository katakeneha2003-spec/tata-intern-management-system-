const express = require("express");
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getProjects).post(authorize("admin", "mentor"), createProject);
router.route("/:id")
  .get(getProject)
  .put(authorize("admin", "mentor"), updateProject)
  .delete(authorize("admin"), deleteProject);

module.exports = router;
