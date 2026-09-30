const Project = require("../models/Project");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");


const createProject = asyncHandler(async (req, res) => {
  const { name, description, department, mentor, interns, technologies, startDate, endDate, status } = req.body;

  
  const mentorId = req.user.role === "mentor" ? req.user._id : mentor;
  if (!mentorId) return res.status(400).json({ success: false, message: "A mentor must be assigned to the project" });

  const project = await Project.create({
    name, description, department, mentor: mentorId,
    interns: interns || [], technologies: technologies || [], startDate, endDate, status,
  });

  if (interns && interns.length) {
    await Intern.updateMany({ _id: { $in: interns } }, { project: project._id });
  }

  const populated = await Project.findById(project._id)
    .populate("mentor", "name email")
    .populate("department", "name")
    .populate({ path: "interns", populate: { path: "user", select: "name email" } });

  res.status(201).json({ success: true, data: populated });
});


const getProjects = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "mentor") {
    filter.mentor = req.user._id;
  } else if (req.user.role === "intern") {
    const intern = await Intern.findOne({ user: req.user._id });
    filter._id = intern ? intern.project : null;
  }

  const projects = await Project.find(filter)
    .populate("mentor", "name email")
    .populate("department", "name")
    .populate({ path: "interns", populate: { path: "user", select: "name email" } })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: projects.length, data: projects });
});

const canAccessProject = async (req, project) => {
  if (req.user.role === "admin") return true;
  if (req.user.role === "mentor") return project.mentor._id.toString() === req.user._id.toString();
  if (req.user.role === "intern") {
    const intern = await Intern.findOne({ user: req.user._id });
    return intern && intern.project && intern.project.toString() === project._id.toString();
  }
  return false;
};


const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("mentor", "name email")
    .populate("department", "name")
    .populate({ path: "interns", populate: { path: "user", select: "name email" } });

  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  if (!(await canAccessProject(req, project))) {
    return res.status(403).json({ success: false, message: "You are not authorized to view this project" });
  }

  res.json({ success: true, data: project });
});


const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });

  if (req.user.role === "mentor" && project.mentor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only update your own projects" });
  }

  Object.assign(project, req.body);
  await project.save();

  if (req.body.interns) {
    await Intern.updateMany({ _id: { $in: req.body.interns } }, { project: project._id });
  }

  const populated = await Project.findById(project._id)
    .populate("mentor", "name email")
    .populate("department", "name")
    .populate({ path: "interns", populate: { path: "user", select: "name email" } });

  res.json({ success: true, data: populated });
});


const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  await Intern.updateMany({ project: project._id }, { $unset: { project: "" } });
  res.json({ success: true, message: "Project deleted" });
});

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
