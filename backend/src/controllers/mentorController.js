const User = require("../models/User");
const Intern = require("../models/Intern");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");


const getMentors = asyncHandler(async (req, res) => {
  const mentors = await User.find({ role: "mentor" }).sort({ name: 1 });

  const withCounts = await Promise.all(
    mentors.map(async (m) => {
      const internCount = await Intern.countDocuments({ mentor: m._id, status: { $ne: "Terminated" } });
      const projectCount = await Project.countDocuments({ mentor: m._id });
      return { ...m.toSafeObject(), internCount, projectCount };
    })
  );

  res.json({ success: true, count: withCounts.length, data: withCounts });
});


const getMentor = asyncHandler(async (req, res) => {
  if (req.user.role === "mentor" && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ success: false, message: "You may only view your own mentor profile" });
  }

  const mentor = await User.findOne({ _id: req.params.id, role: "mentor" });
  if (!mentor) return res.status(404).json({ success: false, message: "Mentor not found" });

  const interns = await Intern.find({ mentor: mentor._id })
    .populate("user", "name email")
    .populate("department", "name");
  const projects = await Project.find({ mentor: mentor._id });

  res.json({ success: true, data: { mentor: mentor.toSafeObject(), interns, projects } });
});


const createMentor = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: "A user with this email already exists" });

  const mentor = await User.create({ name, email, password: password || "Mentor@123", phone, role: "mentor" });
  res.status(201).json({ success: true, data: mentor.toSafeObject() });
});

module.exports = { getMentors, getMentor, createMentor };
