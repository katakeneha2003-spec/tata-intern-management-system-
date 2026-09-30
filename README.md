# Tata Motors Internship Management System

A full-stack MERN application that centralizes the internship lifecycle — onboarding, department/mentor allocation, project assignment, task tracking, attendance, weekly reports, performance evaluations, document management and notifications — for three roles: **Admin/HR**, **Mentor**, and **Intern**.





## Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Vite, React Router 6, Axios, Tailwind CSS, Recharts, Lucide icons |
| Backend    | Node.js, Express.js, Mongoose |
| Database   | MongoDB Atlas |
| Auth       | JWT + bcryptjs, role-based authorization middleware |
| File uploads | Multer (resumes, reports, presentations) |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

## What's included

- **Full REST API** covering auth, interns, mentors, departments, projects, tasks, attendance, weekly reports, evaluations, documents, notifications and role-based dashboard analytics.
- **Role-based authorization** at the middleware level (`protect` + `authorize`), so every endpoint enforces who is allowed to do what — not just who is logged in.
- **A seed script** that populates a working demo dataset (1 admin, 3 mentors, 8 interns, 3 projects, tasks, attendance history, reports and an evaluation) so you can log in and see a populated system immediately.
- **A complete React frontend** with a distinct visual identity (navy/steel/orange industrial palette, Space Grotesk + Inter typefaces), role-aware navigation, and working screens for every module in the spec.

## Project structure

```
tata-intern-management-system/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/        (12 controllers — one per module)
│   │   ├── models/              (10 Mongoose schemas)
│   │   ├── routes/              (12 route files)
│   │   ├── middleware/          (auth, error handling, file upload)
│   │   ├── utils/
│   │   ├── seed/seedDatabase.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          (Layout, Modal, StatCard, StatusBadge, etc.)
│   │   ├── pages/                (17 pages)
│   │   ├── context/AuthContext.jsx
│   │   └── services/api.js
│   ├── .env.example
│   └── package.json
└── SETUP_GUIDE.md
```


