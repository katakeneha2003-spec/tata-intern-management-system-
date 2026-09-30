const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");


const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "A user with this email already exists" });
  }

  const user = await User.create({ name, email, password, role, phone });

  res.status(201).json({ success: true, data: user.toSafeObject() });
});



const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "This account has been deactivated. Contact HR/Admin." });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    token,
    data: user.toSafeObject(),
  });
});



const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});


const updateDetails = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) } },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user.toSafeObject() });
});



const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

module.exports = { register, login, getMe, updateDetails, updatePassword };
