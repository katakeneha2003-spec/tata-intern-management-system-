const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technicalSkills: { type: Number, min: 1, max: 5, required: true },
    problemSolving: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    teamwork: { type: Number, min: 1, max: 5, required: true },
    discipline: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String, trim: true },
  },
  { timestamps: true }
);

evaluationSchema.virtual("average").get(function () {
  return (
    (this.technicalSkills +
      this.problemSolving +
      this.communication +
      this.teamwork +
      this.discipline) /
    5
  ).toFixed(1);
});

evaluationSchema.set("toJSON", { virtuals: true });
evaluationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Evaluation", evaluationSchema);
