const express = require("express");
const {
  uploadDocument, getMyDocuments, getDocumentsForIntern, deleteDocument,
} = require("../controllers/documentController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.post("/", authorize("intern", "admin"), upload.single("file"), uploadDocument);
router.get("/my", authorize("intern"), getMyDocuments);
router.get("/intern/:internId", authorize("admin", "mentor"), getDocumentsForIntern);
router.delete("/:id", authorize("admin", "intern"), deleteDocument);

module.exports = router;
