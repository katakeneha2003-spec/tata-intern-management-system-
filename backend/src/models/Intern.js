const mongoose = require("mongoose");

const internSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    internId: { type: String, required: true, unique: true, trim: true },
    college: { type: String, trim: true },
    branch: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Completed", "Terminated"],
      default: "Upcoming",
    },
  },
  { timestamps: true }
);

internSchema.index({ status: 1 });
internSchema.index({ department: 1 });

module.exports = mongoose.model("Intern", internSchema);
