const Department = require("../models/Department");
const Intern = require("../models/Intern");
const asyncHandler = require("../utils/asyncHandler");


const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  const withCounts = await Promise.all(
    departments.map(async (d) => {
      const internCount = await Intern.countDocuments({ department: d._id, status: { $ne: "Terminated" } });
      return { ...d.toObject(), internCount };
    })
  );
  res.json({ success: true, count: withCounts.length, data: withCounts });
});


const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: "Department not found" });
  res.json({ success: true, data: department });
});


const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, location } = req.body;
  const exists = await Department.findOne({ name });
  if (exists) return res.status(400).json({ success: false, message: "A department with this name already exists" });

  const department = await Department.create({ name, description, location });
  res.status(201).json({ success: true, data: department });
});


const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) return res.status(404).json({ success: false, message: "Department not found" });
  res.json({ success: true, data: department });
});


const deleteDepartment = asyncHandler(async (req, res) => {
  const internCount = await Intern.countDocuments({ department: req.params.id });
  if (internCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete: ${internCount} intern(s) are still linked to this department`,
    });
  }
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: "Department not found" });
  res.json({ success: true, message: "Department deleted" });
});

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
