const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: "Intern", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["Resume", "Joining Document", "Weekly Report", "Project Report", "Presentation", "Other"],
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
