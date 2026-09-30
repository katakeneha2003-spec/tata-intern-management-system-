const WeeklyReport = require("../models/WeeklyReport");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");
const notify = require("../utils/notify");


const submitReport = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id });
  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });

  const { weekStart, weekEnd, workCompleted, problemsFaced, skillsLearned, nextWeekPlan } = req.body;

  const report = await WeeklyReport.create({
    intern: intern._id, weekStart, weekEnd, workCompleted, problemsFaced, skillsLearned, nextWeekPlan,
  });

  if (intern.mentor) {
    await notify({
      user: intern.mentor,
      title: "Weekly report submitted",
      message: `A new weekly report was submitted and needs review.`,
      type: "report",
    });
  }

  res.status(201).json({ success: true, data: report });
});


const getMyReports = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id });
  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });

  const reports = await WeeklyReport.find({ intern: intern._id }).sort({ weekStart: -1 });
  res.json({ success: true, count: reports.length, data: reports });
});


const getReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  let internFilter = {};
  if (req.user.role === "mentor") internFilter.mentor = req.user._id;

  const relevantInterns = await Intern.find(internFilter).select("_id");
  filter.intern = { $in: relevantInterns.map((i) => i._id) };

  const reports = await WeeklyReport.find(filter)
    .populate({ path: "intern", populate: { path: "user", select: "name email" } })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: reports.length, data: reports });
});


const reviewReport = asyncHandler(async (req, res) => {
  const { status, mentorFeedback } = req.body;

  const report = await WeeklyReport.findById(req.params.id).populate({
    path: "intern",
    populate: { path: "user", select: "name" },
  });
  if (!report) return res.status(404).json({ success: false, message: "Report not found" });

  if (req.user.role === "mentor" && report.intern.mentor?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only review reports of your own interns" });
  }

  report.status = status;
  report.mentorFeedback = mentorFeedback;
  await report.save();

  await notify({
    user: report.intern.user._id,
    title: `Weekly report ${status.toLowerCase()}`,
    message: `Your weekly report was marked as "${status}".`,
    type: "report",
  });

  res.json({ success: true, data: report });
});

module.exports = { submitReport, getMyReports, getReports, reviewReport };
