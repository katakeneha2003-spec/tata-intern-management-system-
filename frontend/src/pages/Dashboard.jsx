import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { Users, UserCheck, GraduationCap, FileText, ListChecks, FolderKanban, CalendarCheck } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const PIE_COLORS = ["#0F2440", "#D9622B", "#1E7A4C", "#C98A1B", "#4A5D73", "#B23A3A"];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner full={false} />;
  if (!data) return <p className="text-steel-600">Unable to load dashboard.</p>;

  if (user.role === "admin") return <AdminView data={data} />;
  if (user.role === "mentor") return <MentorView data={data} />;
  return <InternView data={data} />;
};

const PageHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-display font-semibold text-navy-950">{title}</h1>
    {subtitle && <p className="text-sm text-steel-600 mt-1">{subtitle}</p>}
  </div>
);

const AdminView = ({ data }) => (
  <div>
    <PageHeader title="Admin Dashboard" subtitle="Program-wide view across all departments and mentors." />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total interns" value={data.totalInterns} icon={Users} />
      <StatCard label="Active interns" value={data.activeInterns} icon={UserCheck} accent />
      <StatCard label="Completed" value={data.completedInterns} icon={GraduationCap} />
      <StatCard label="Pending reports" value={data.pendingReports} icon={FileText} />
    </div>

    <div className="grid lg:grid-cols-3 gap-4 mb-6">
      <div className="card p-5 lg:col-span-2">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Department distribution</h3>
        {data.departmentDistribution?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.departmentDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEFF3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#4A5D73" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4A5D73" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F2440" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-steel-600 py-10 text-center">No department data yet.</p>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Task status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={Object.entries(data.taskStatusCounts || {}).map(([name, value]) => ({ name, value }))}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={80}
            >
              {Object.keys(data.taskStatusCounts || {}).map((_, idx) => (
                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-navy-950">Recently added interns</h3>
        <Link to="/interns" className="text-sm text-accent font-medium hover:underline">View all</Link>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th>Name</th><th>Department</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.recentInterns?.map((i) => (
            <tr key={i._id}>
              <td className="font-medium text-navy-950">{i.user?.name}</td>
              <td>{i.department?.name || "—"}</td>
              <td><StatusBadge status={i.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MentorView = ({ data }) => (
  <div>
    <PageHeader title="Mentor Dashboard" subtitle="Your assigned interns, projects, and pending reviews." />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="My interns" value={data.totalInterns} icon={Users} />
      <StatCard label="Active interns" value={data.activeInterns} icon={UserCheck} accent />
      <StatCard label="My projects" value={data.myProjects} icon={FolderKanban} />
      <StatCard label="Pending reviews" value={data.pendingReports + data.submittedTasks} icon={FileText} />
    </div>

    <div className="card p-5">
      <h3 className="font-display font-semibold text-navy-950 mb-4">Recent tasks assigned</h3>
      {data.recentTasks?.length ? (
        <table className="table-base">
          <thead><tr><th>Task</th><th>Intern</th><th>Status</th></tr></thead>
          <tbody>
            {data.recentTasks.map((t) => (
              <tr key={t._id}>
                <td className="font-medium text-navy-950">{t.title}</td>
                <td>{t.assignedTo?.user?.name}</td>
                <td><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-steel-600 py-6 text-center">No tasks assigned yet.</p>
      )}
    </div>
  </div>
);

const InternView = ({ data }) => (
  <div>
    <PageHeader title={`Welcome, ${data.intern.user?.name?.split(" ")[0] || "Intern"}`} subtitle="Your internship at a glance." />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Attendance" value={data.attendancePercentage} suffix="%" icon={CalendarCheck} accent />
      <StatCard label="Pending tasks" value={data.pendingTasks} icon={ListChecks} />
      <StatCard label="Total tasks" value={data.totalTasks} icon={ListChecks} />
      <StatCard label="Approved reports" value={data.approvedReports} icon={FileText} />
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Internship details</h3>
        <dl className="text-sm space-y-2.5">
          <div className="flex justify-between"><dt className="text-steel-600">Intern ID</dt><dd className="font-medium">{data.intern.internId}</dd></div>
          <div className="flex justify-between"><dt className="text-steel-600">Department</dt><dd className="font-medium">{data.intern.department?.name || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-steel-600">Mentor</dt><dd className="font-medium">{data.intern.mentor?.name || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-steel-600">Status</dt><dd><StatusBadge status={data.intern.status} /></dd></div>
        </dl>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Current project</h3>
        {data.intern.project ? (
          <>
            <p className="font-medium text-navy-950">{data.intern.project.name}</p>
            <div className="mt-2"><StatusBadge status={data.intern.project.status} /></div>
          </>
        ) : (
          <p className="text-sm text-steel-600">No project assigned yet.</p>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
