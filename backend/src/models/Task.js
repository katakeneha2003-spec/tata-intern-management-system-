const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Submitted", "Approved", "Rejected"],
      default: "Pending",
    },
    dueDate: { type: Date },
    submission: {
      text: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      submittedAt: { type: Date },
    },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
