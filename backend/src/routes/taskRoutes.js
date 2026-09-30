const express = require("express");
const {
  createTask, getTasks, getMyTasks, getTask, updateTask, deleteTask,
} = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/my", authorize("intern"), getMyTasks);
router.route("/").get(authorize("admin", "mentor"), getTasks).post(authorize("mentor", "admin"), createTask);
router.route("/:id")
  .get(getTask)
  .put(authorize("admin", "mentor", "intern"), updateTask)
  .delete(authorize("admin", "mentor"), deleteTask);

module.exports = router;
