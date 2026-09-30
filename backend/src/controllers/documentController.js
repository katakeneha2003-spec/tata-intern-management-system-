const path = require("path");
const fs = require("fs");
const DocumentModel = require("../models/Document");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");


const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  let internId = req.body.intern;
  if (req.user.role === "intern") {
    const intern = await Intern.findOne({ user: req.user._id });
    if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });
    internId = intern._id;
  }

  const doc = await DocumentModel.create({
    intern: internId,
    uploadedBy: req.user._id,
    type: req.body.type || "Other",
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    filePath: req.file.path,
    fileSize: req.file.size,
  });

  res.status(201).json({ success: true, data: doc });
});


const getMyDocuments = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ user: req.user._id });
  if (!intern) return res.status(404).json({ success: false, message: "Intern profile not found" });
  const docs = await DocumentModel.find({ intern: intern._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: docs.length, data: docs });
});


const getDocumentsForIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.internId);
  if (!intern) return res.status(404).json({ success: false, message: "Intern not found" });
  if (req.user.role === "mentor" && intern.mentor?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  const docs = await DocumentModel.find({ intern: intern._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: docs.length, data: docs });
});


const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await DocumentModel.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

  if (req.user.role === "intern" && doc.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "You can only delete documents you uploaded" });
  }

  if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
  await doc.deleteOne();

  res.json({ success: true, message: "Document deleted" });
});

module.exports = { uploadDocument, getMyDocuments, getDocumentsForIntern, deleteDocument };
