const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    workCompleted: { type: String, required: true },
    problemsFaced: { type: String, trim: true },
    skillsLearned: { type: String, trim: true },
    nextWeekPlan: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Approved", "Changes Required"],
      default: "Submitted",
    },
    mentorFeedback: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);
