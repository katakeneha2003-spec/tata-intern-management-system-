const User = require("../models/User");
const Intern = require("../models/Intern");
const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");
const notify = require("../utils/notify");


const createIntern = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone,
    internId, college, branch, department, mentor,
    startDate, endDate, status,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "A user with this email already exists" });
  }
  const existingInternId = await Intern.findOne({ internId });
  if (existingInternId) {
    return res.status(400).json({ success: false, message: "This Intern ID is already in use" });
  }

  const user = await User.create({
    name, email, password: password || "Intern@123", role: "intern", phone,
  });

  const intern = await Intern.create({
    user: user._id, internId, college, branch, department, mentor,
    startDate, endDate, status: status || "Upcoming",
  });

  if (mentor) {
    await notify({
      user: mentor,
      title: "New intern assigned",
      message: `${name} has been assigned to you as an intern.`,
      type: "general",
    });
  }

  const populated = await Intern.findById(intern._id)
    .populate("user", "name email phone isActive")
    .populate("department", "name")
    .populate("mentor", "name email");

  res.status(201).json({ success: true, data: populated });
});


const getInterns = asyncHandler(async (req, res) => {
  const { search, department, status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === "mentor") {
    filter.mentor = req.user._id;
  }
  if (department) filter.department = department;
  if (status) filter.status = status;

  let query = Intern.find(filter)
    .populate("user", "name email phone isActive")
    .populate("department", "name")
    .populate("mentor", "name email")
    .populate("project", "name status")
    .sort({ createdAt: -1 });

  if (search) {
    
    const all = await query;
    const filtered = all.filter(
      (i) =>
        i.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        i.internId?.toLowerCase().includes(search.toLowerCase())
    );
    return res.json({ success: true, count: filtered.length, data: filtered });
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    query.skip(skip).limit(Number(limit)),
    Intern.countDocuments(filter),
  ]);

  res.json({ success: true, count: data.length, total, page: Number(page), data });
});

const canAccessIntern = (req, intern) => {
  if (req.user.role === "admin") return true;
  if (req.user.role === "mentor") return intern.mentor && intern.mentor.toString() === req.user._id.toString();
  if (req.user.role === "intern") return intern.user._id ? intern.user._id.toString() === req.user._id.toString() : intern.user.toString() === req.user._id.toString();
  return false;
};


const getIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.id)
    .populate("user", "name email phone isActive avatar")
    .populate("department", "name description location")
    .populate("mentor", "name email phone")
    .populate({ path: "project", populate: { path: "mentor", select: "name" } });

  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });
  if (!canAccessIntern(req, intern)) {
    return res.status(403).json({ success: false, message: "You are not authorized to view this intern" });
  }

  res.json({ success: true, data: intern });
});

const getMyInternProfile = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id })
    .populate("department", "name description location")
    .populate("mentor", "name email phone")
    .populate("project");

  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });
  res.json({ success: true, data: intern });
});


const updateIntern = asyncHandler(async (req, res) => {
  const { name, phone, college, branch, department, mentor, project, startDate, endDate, status } = req.body;

  const intern = await Intern.findById(req.params.id);
  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });

  if (name || phone) {
    await User.findByIdAndUpdate(intern.user, { ...(name && { name }), ...(phone && { phone }) });
  }

  Object.assign(intern, {
    ...(college && { college }),
    ...(branch && { branch }),
    ...(department && { department }),
    ...(mentor && { mentor }),
    ...(project && { project }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(status && { status }),
  });
  await intern.save();

  const populated = await Intern.findById(intern._id)
    .populate("user", "name email phone")
    .populate("department", "name")
    .populate("mentor", "name email");

  res.json({ success: true, data: populated });
});


const deleteIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.id);
  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });

  intern.status = "Terminated";
  await intern.save();
  await User.findByIdAndUpdate(intern.user, { isActive: false });

  res.json({ success: true, message: "Intern record deactivated (soft delete). Historical data retained." });
});

module.exports = {
  createIntern, getInterns, getIntern, getMyInternProfile, updateIntern, deleteIntern,
};
