const Evaluation = require("../models/Evaluation");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");
const notify = require("../utils/notify");


const createEvaluation = asyncHandler(async (req, res) => {
  const { intern, technicalSkills, problemSolving, communication, teamwork, discipline, comments } = req.body;

  const internDoc = await Intern.findById(intern);
  if (!internDoc) return res.status(404).json({ success: false, message: "Intern not found" });
  if (req.user.role === "mentor" && internDoc.mentor?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only evaluate your own interns" });
  }

  const evaluation = await Evaluation.create({
    intern, mentor: req.user._id, technicalSkills, problemSolving, communication, teamwork, discipline, comments,
  });

  await notify({
    user: internDoc.user,
    title: "Performance evaluation submitted",
    message: "Your mentor has submitted a new performance evaluation.",
    type: "evaluation",
  });

  res.status(201).json({ success: true, data: evaluation });
});

const getEvaluationsForIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.internId);
  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });

  if (req.user.role === "mentor" && intern.mentor?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  if (req.user.role === "intern" && intern.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const evaluations = await Evaluation.find({ intern: intern._id })
    .populate("mentor", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: evaluations.length, data: evaluations });
});


const getMyEvaluations = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id });
  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });

  const evaluations = await Evaluation.find({ intern: intern._id })
    .populate("mentor", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: evaluations.length, data: evaluations });
});

module.exports = { createEvaluation, getEvaluationsForIntern, getMyEvaluations };
