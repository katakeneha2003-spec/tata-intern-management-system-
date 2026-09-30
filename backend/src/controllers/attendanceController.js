const Attendance = require("../models/Attendance");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");


const markAttendance = asyncHandler(async (req, res) => {
  let internId = req.body.intern;
  const { date, status, remarks } = req.body;

  if (req.user.role === "intern") {
    const intern = await Intern.findOne({ user: req.user._id });
    if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });
    internId = intern._id;
  }
  if (!internId) return res.status(400).json({ success: false, message: "Intern is required" });

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const record = await Attendance.findOneAndUpdate(
    { intern: internId, date: day },
    { status, remarks },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: record });
});


const getMyAttendance = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id });
  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });

  const records = await Attendance.find({ intern: intern._id }).sort({ date: -1 });
  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const percentage = total ? ((present / total) * 100).toFixed(1) : "0.0";

  res.json({ success: true, percentage: Number(percentage), total, present, data: records });
});

// @route GET /api/attendance/intern/:internId   (Private/Admin,Mentor)
const getAttendanceForIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.internId);
  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });
  if (req.user.role === "mentor" && intern.mentor?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only view attendance for your own interns" });
  }

  const records = await Attendance.find({ intern: intern._id }).sort({ date: -1 });
  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const percentage = total ? ((present / total) * 100).toFixed(1) : "0.0";

  res.json({ success: true, percentage: Number(percentage), total, present, data: records });
});

module.exports = { markAttendance, getMyAttendance, getAttendanceForIntern };
