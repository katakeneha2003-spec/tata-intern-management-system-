const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ intern: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
