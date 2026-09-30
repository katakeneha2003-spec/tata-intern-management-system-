const Task = require("../models/Task");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");
const notify = require("../utils/notify");


const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, project, priority, dueDate } = req.body;

  const intern = await Intern.findById(assignedTo);
  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });
  if (req.user.role === "mentor" && intern.mentor?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only assign tasks to your own interns" });
  }

  const task = await Task.create({
    title, description, assignedTo, project, priority, dueDate, assignedBy: req.user._id,
  });

  await notify({
    user: intern.user,
    title: "New task assigned",
    message: `You have been assigned a new task: "${title}"`,
    type: "task",
  });

  res.status(201).json({ success: true, data: task });
});


const getTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "mentor") filter.assignedBy = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.project) filter.project = req.query.project;

  const tasks = await Task.find(filter)
    .populate({ path: "assignedTo", populate: { path: "user", select: "name email" } })
    .populate("assignedBy", "name")
    .populate("project", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: tasks.length, data: tasks });
});

// @route GET /api/tasks/my   (Private/Intern)
const getMyTasks = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id });
  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });

  const filter = { assignedTo: intern._id };
  if (req.query.status) filter.status = req.query.status;

  const tasks = await Task.find(filter)
    .populate("assignedBy", "name")
    .populate("project", "name")
    .sort({ dueDate: 1 });

  res.json({ success: true, count: tasks.length, data: tasks });
});


const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate({ path: "assignedTo", populate: { path: "user", select: "name email" } })
    .populate("assignedBy", "name")
    .populate("project", "name");
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });
  res.json({ success: true, data: task });
});


const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("assignedTo");
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  if (req.user.role === "intern") {
    const intern = await Intern.findOne({ user: req.user._id });
    if (!intern || task.assignedTo._id.toString() !== intern._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own tasks" });
    }
    const { status, submissionText, fileUrl } = req.body;
    if (status && ["In Progress", "Submitted"].includes(status)) task.status = status;
    if (submissionText || fileUrl) {
      task.submission = { text: submissionText, fileUrl, submittedAt: new Date() };
      task.status = "Submitted";
    }
  } else {
    
    const { status, feedback } = req.body;
    if (status) task.status = status;
    if (feedback !== undefined) task.feedback = feedback;

    if (status === "Approved" || status === "Rejected") {
      await notify({
        user: task.assignedTo.user,
        title: `Task ${status.toLowerCase()}`,
        message: `Your task "${task.title}" was ${status.toLowerCase()} by your mentor.`,
        type: "task",
      });
    }
  }

  await task.save();
  res.json({ success: true, data: task });
});


const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });
  if (req.user.role === "mentor" && task.assignedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only delete tasks you created" });
  }
  await task.deleteOne();
  res.json({ success: true, message: "Task deleted" });
});

module.exports = { createTask, getTasks, getMyTasks, getTask, updateTask, deleteTask };
