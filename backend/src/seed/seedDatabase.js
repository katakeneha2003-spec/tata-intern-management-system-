
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");

const User = require("../models/User");
const Department = require("../models/Department");
const Intern = require("../models/Intern");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Attendance = require("../models/Attendance");
const WeeklyReport = require("../models/WeeklyReport");
const Evaluation = require("../models/Evaluation");
const Notification = require("../models/Notification");
const DocumentModel = require("../models/Document");

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo collections...");
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Intern.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Attendance.deleteMany({}),
    WeeklyReport.deleteMany({}),
    Evaluation.deleteMany({}),
    Notification.deleteMany({}),
    DocumentModel.deleteMany({}),
  ]);

  console.log("Creating admin...");
  const admin = await User.create({
    name: "Priya Sharma",
    email: process.env.SEED_ADMIN_EMAIL || "admin@tatamotors-ims.com",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    role: "admin",
    phone: "9876500000",
  });

  console.log("Creating departments...");
  const departmentData = [
    { name: "CEMM", description: "Commercial Engineering & Metallurgical Manufacturing", location: "Pune" },
    { name: "EV Shop", description: "Electric Vehicle assembly and testing", location: "Pune" },
    { name: "R&D", description: "Research & Development", location: "Pimpri" },
    { name: "Manufacturing", description: "Core vehicle manufacturing operations", location: "Jamshedpur" },
    { name: "Quality", description: "Quality assurance and control", location: "Pune" },
    { name: "IT", description: "Information Technology & digital systems", location: "Mumbai" },
  ];
  const departments = await Department.insertMany(departmentData);

  console.log("Creating mentors...");
  const mentorData = [
    { name: "Rahul Deshmukh", email: "rahul.deshmukh@tatamotors-ims.com", phone: "9876500001" },
    { name: "Ananya Iyer", email: "ananya.iyer@tatamotors-ims.com", phone: "9876500002" },
    { name: "Vikram Singh", email: "vikram.singh@tatamotors-ims.com", phone: "9876500003" },
  ];
  const mentors = [];
  for (const m of mentorData) {
    const mentor = await User.create({ ...m, password: "Mentor@123", role: "mentor" });
    mentors.push(mentor);
  }

  console.log("Creating projects...");
  const projectData = [
    {
      name: "EV Battery Thermal Management",
      description: "Design and validation of a thermal management module for the next-gen EV battery pack.",
      department: departments[1]._id,
      mentor: mentors[0]._id,
      technologies: ["MATLAB", "ANSYS", "Python"],
      startDate: daysAgo(60),
      endDate: daysAgo(-30),
      status: "Active",
    },
    {
      name: "Predictive Maintenance Dashboard",
      description: "Internal analytics dashboard predicting assembly-line equipment failures from sensor data.",
      department: departments[5]._id,
      mentor: mentors[1]._id,
      technologies: ["React", "Node.js", "MongoDB", "Python"],
      startDate: daysAgo(45),
      endDate: daysAgo(-15),
      status: "Active",
    },
    {
      name: "Chassis Weight Optimization Study",
      description: "Structural analysis to reduce chassis weight while maintaining crash-safety ratings.",
      department: departments[2]._id,
      mentor: mentors[2]._id,
      technologies: ["ANSYS", "CATIA"],
      startDate: daysAgo(30),
      endDate: daysAgo(-45),
      status: "Planning",
    },
  ];
  const projects = await Project.insertMany(projectData);

  console.log("Creating interns...");
  const internData = [
    { name: "Aditya Kulkarni", email: "aditya.kulkarni@intern.tatamotors-ims.com", internId: "TMI2026001", college: "COEP Technological University", branch: "Mechanical Engineering", department: departments[1]._id, mentor: mentors[0]._id, project: projects[0]._id, status: "Active" },
    { name: "Sneha Patil", email: "sneha.patil@intern.tatamotors-ims.com", internId: "TMI2026002", college: "VJTI Mumbai", branch: "Electrical Engineering", department: departments[1]._id, mentor: mentors[0]._id, project: projects[0]._id, status: "Active" },
    { name: "Karan Mehta", email: "karan.mehta@intern.tatamotors-ims.com", internId: "TMI2026003", college: "BITS Pilani", branch: "Computer Science", department: departments[5]._id, mentor: mentors[1]._id, project: projects[1]._id, status: "Active" },
    { name: "Ishita Rao", email: "ishita.rao@intern.tatamotors-ims.com", internId: "TMI2026004", college: "IIT Bombay", branch: "Computer Science", department: departments[5]._id, mentor: mentors[1]._id, project: projects[1]._id, status: "Active" },
    { name: "Rohan Joshi", email: "rohan.joshi@intern.tatamotors-ims.com", internId: "TMI2026005", college: "VNIT Nagpur", branch: "Mechanical Engineering", department: departments[2]._id, mentor: mentors[2]._id, project: projects[2]._id, status: "Active" },
    { name: "Neha Gupta", email: "neha.gupta@intern.tatamotors-ims.com", internId: "TMI2026006", college: "PICT Pune", branch: "Instrumentation", department: departments[4]._id, mentor: mentors[2]._id, status: "Upcoming" },
    { name: "Arjun Nair", email: "arjun.nair@intern.tatamotors-ims.com", internId: "TMI2025098", college: "NIT Trichy", branch: "Mechanical Engineering", department: departments[3]._id, mentor: mentors[0]._id, status: "Completed" },
    { name: "Divya Menon", email: "divya.menon@intern.tatamotors-ims.com", internId: "TMI2025076", college: "SPIT Mumbai", branch: "Computer Engineering", department: departments[5]._id, mentor: mentors[1]._id, status: "Terminated" },
  ];

  const internDocs = [];
  for (const [idx, i] of internData.entries()) {
    const user = await User.create({ name: i.name, email: i.email, password: "Intern@123", role: "intern", phone: `98765${(10 + idx).toString().padStart(5, "0")}` });
    const intern = await Intern.create({
      user: user._id, internId: i.internId, college: i.college, branch: i.branch,
      department: i.department, mentor: i.mentor, project: i.project || undefined,
      startDate: daysAgo(60 - idx * 3), endDate: daysAgo(-(30 + idx * 3)), status: i.status,
    });
    internDocs.push({ intern, user });
  }

  console.log("Linking interns to their projects...");
  await Project.findByIdAndUpdate(projects[0]._id, { $set: { interns: [internDocs[0].intern._id, internDocs[1].intern._id] } });
  await Project.findByIdAndUpdate(projects[1]._id, { $set: { interns: [internDocs[2].intern._id, internDocs[3].intern._id] } });
  await Project.findByIdAndUpdate(projects[2]._id, { $set: { interns: [internDocs[4].intern._id] } });

  console.log("Creating tasks...");
  const taskTitles = [
    ["Literature review on battery thermal models", "Medium", "Approved"],
    ["Build CAD model of cooling plate", "High", "Submitted"],
    ["Set up sensor data ingestion pipeline", "High", "In Progress"],
    ["Build dashboard UI for failure predictions", "Medium", "Pending"],
    ["Run FEA simulation on chassis mount", "High", "In Progress"],
  ];
  for (let idx = 0; idx < 5; idx++) {
    const owner = internDocs[idx % 5];
    const [title, priority, status] = taskTitles[idx];
    await Task.create({
      title, priority, status,
      description: `${title} as part of the assigned project deliverables.`,
      assignedTo: owner.intern._id,
      assignedBy: owner.intern.mentor,
      project: owner.intern.project,
      dueDate: daysAgo(-7),
      ...(status === "Submitted" || status === "Approved"
        ? { submission: { text: "Initial draft completed and shared for review.", submittedAt: daysAgo(2) } }
        : {}),
    });
  }

  console.log("Creating attendance history (last 14 days for active interns)...");
  for (const { intern } of internDocs.filter((i) => i.intern.status === "Active")) {
    for (let d = 14; d >= 1; d--) {
      const isWeekend = [0, 6].includes(new Date(daysAgo(d)).getDay());
      if (isWeekend) continue;
      const roll = Math.random();
      await Attendance.create({
        intern: intern._id,
        date: daysAgo(d),
        status: roll > 0.9 ? "Absent" : roll > 0.85 ? "Leave" : "Present",
      });
    }
  }

  console.log("Creating weekly reports...");
  for (const [idx, { intern }] of internDocs.filter((i) => i.intern.status === "Active").entries()) {
    await WeeklyReport.create({
      intern: intern._id,
      weekStart: daysAgo(13),
      weekEnd: daysAgo(7),
      workCompleted: "Completed the assigned literature review and initial design draft for the module.",
      problemsFaced: "Faced minor simulation convergence issues, resolved with mentor's guidance.",
      skillsLearned: "Improved proficiency in simulation tooling and technical documentation.",
      nextWeekPlan: "Begin detailed design iteration and prepare for mentor review.",
      status: idx % 2 === 0 ? "Approved" : "Submitted",
      mentorFeedback: idx % 2 === 0 ? "Good progress, keep documenting assumptions clearly." : "",
    });
  }

  console.log("Creating evaluations for completed intern...");
  const completedIntern = internDocs.find((i) => i.intern.status === "Completed");
  if (completedIntern) {
    await Evaluation.create({
      intern: completedIntern.intern._id,
      mentor: completedIntern.intern.mentor,
      technicalSkills: 4, problemSolving: 4, communication: 5, teamwork: 5, discipline: 5,
      comments: "Consistently reliable and delivered high-quality work throughout the internship.",
    });
  }

  console.log("\nSeed complete. Demo credentials:");
  console.log("--------------------------------------------------");
  console.log(`Admin   -> ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || "Admin@12345"}`);
  console.log(`Mentor  -> ${mentors[0].email} / Mentor@123`);
  console.log(`Mentor  -> ${mentors[1].email} / Mentor@123`);
  console.log(`Intern  -> ${internData[0].email} / Intern@123`);
  console.log("--------------------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
