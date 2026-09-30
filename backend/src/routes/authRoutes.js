const express = require("express");
const { register, login, getMe, updateDetails, updatePassword } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, authorize("admin"), register);
router.get("/me", protect, getMe);
router.put("/me", protect, updateDetails);
router.put("/password", protect, updatePassword);

module.exports = router;
