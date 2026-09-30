const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Intern" }],
    technologies: [{ type: String, trim: true }],
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["Planning", "Active", "Completed"],
      default: "Planning",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
