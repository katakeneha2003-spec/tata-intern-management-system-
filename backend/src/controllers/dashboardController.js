const Intern = require("../models/Intern");
const Department = require("../models/Department");
const Task = require("../models/Task");
const WeeklyReport = require("../models/WeeklyReport");
const Attendance = require("../models/Attendance");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");


const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") return getAdminDashboard(req, res);
  if (req.user.role === "mentor") return getMentorDashboard(req, res);
  return getInternDashboard(req, res);
});

const getAdminDashboard = async (req, res) => {
  const [totalInterns, activeInterns, completedInterns, upcomingInterns, terminatedInterns] = await Promise.all([
    Intern.countDocuments(),
    Intern.countDocuments({ status: "Active" }),
    Intern.countDocuments({ status: "Completed" }),
    Intern.countDocuments({ status: "Upcoming" }),
    Intern.countDocuments({ status: "Terminated" }),
  ]);

  const pendingReports = await WeeklyReport.countDocuments({ status: { $in: ["Submitted", "Under Review"] } });
  const totalProjects = await Project.countDocuments();
  const activeProjects = await Project.countDocuments({ status: "Active" });

  const departments = await Department.find();
  const departmentDistribution = await Promise.all(
    departments.map(async (d) => ({
      name: d.name,
      count: await Intern.countDocuments({ department: d._id, status: { $ne: "Terminated" } }),
    }))
  );

  const taskStats = await Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const taskStatusCounts = { Pending: 0, "In Progress": 0, Submitted: 0, Approved: 0, Rejected: 0 };
  taskStats.forEach((t) => { taskStatusCounts[t._id] = t.count; });

  const recentInterns = await Intern.find()
    .populate("user", "name email")
    .populate("department", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalInterns, activeInterns, completedInterns, upcomingInterns, terminatedInterns,
      pendingReports, totalProjects, activeProjects,
      departmentDistribution, taskStatusCounts, recentInterns,
    },
  });
};

const getMentorDashboard = async (req, res) => {
  const myInterns = await Intern.find({ mentor: req.user._id });
  const internIds = myInterns.map((i) => i._id);

  const [pendingReports, submittedTasks, myProjects, activeInterns] = await Promise.all([
    WeeklyReport.countDocuments({ intern: { $in: internIds }, status: { $in: ["Submitted", "Under Review"] } }),
    Task.countDocuments({ assignedTo: { $in: internIds }, status: "Submitted" }),
    Project.countDocuments({ mentor: req.user._id }),
    Intern.countDocuments({ mentor: req.user._id, status: "Active" }),
  ]);

  const recentTasks = await Task.find({ assignedTo: { $in: internIds } })
    .populate({ path: "assignedTo", populate: { path: "user", select: "name" } })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalInterns: myInterns.length, activeInterns, pendingReports, submittedTasks, myProjects, recentTasks,
    },
  });
};

const getInternDashboard = async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id })
    .populate("department", "name")
    .populate("mentor", "name email")
    .populate("project", "name status");

  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });

  const [pendingTasks, approvedReports, totalTasks] = await Promise.all([
    Task.countDocuments({ assignedTo: intern._id, status: { $in: ["Pending", "In Progress"] } }),
    WeeklyReport.countDocuments({ intern: intern._id, status: "Approved" }),
    Task.countDocuments({ assignedTo: intern._id }),
  ]);

  const attendanceRecords = await Attendance.find({ intern: intern._id });
  const present = attendanceRecords.filter((a) => a.status === "Present").length;
  const attendancePercentage = attendanceRecords.length
    ? ((present / attendanceRecords.length) * 100).toFixed(1)
    : "0.0";

  res.json({
    success: true,
    data: {
      intern, pendingTasks, approvedReports, totalTasks,
      attendancePercentage: Number(attendancePercentage),
    },
  });
};

module.exports = { getDashboard };
