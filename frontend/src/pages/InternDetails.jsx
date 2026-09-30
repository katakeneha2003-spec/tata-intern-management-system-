import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";

const tabs = ["Overview", "Tasks", "Attendance", "Reports", "Evaluations"];

const InternDetails = () => {
  const { id } = useParams();
  const [intern, setIntern] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    API.get(`/interns/${id}`).then((res) => setIntern(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!intern) return;
    if (tab === "Attendance") {
      API.get(`/attendance/intern/${intern._id}`).then((res) => setAttendance(res.data));
    }
    if (tab === "Reports") {
      API.get("/reports", { params: {} }).then((res) =>
        setReports(res.data.data.filter((r) => r.intern._id === intern._id))
      );
    }
    if (tab === "Evaluations") {
      API.get(`/evaluations/intern/${intern._id}`).then((res) => setEvaluations(res.data.data));
    }
    if (tab === "Tasks") {
      API.get("/tasks").then((res) =>
        setTasks(res.data.data.filter((t) => t.assignedTo?._id === intern._id))
      );
    }
    // eslint-disable-next-line
  }, [tab, intern]);

  if (loading) return <LoadingSpinner />;
  if (!intern) return <EmptyState title="Intern not found" />;

  return (
    <div>
      <Link to="/interns" className="inline-flex items-center gap-1.5 text-sm text-steel-600 hover:text-navy-950 mb-4">
        <ArrowLeft size={15} /> Back to interns
      </Link>

      <div className="card p-6 mb-6 flex flex-wrap items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-navy-950 text-white flex items-center justify-center text-xl font-display font-semibold shrink-0">
          {intern.user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl font-display font-semibold text-navy-950">{intern.user?.name}</h1>
          <p className="text-sm text-steel-600">{intern.user?.email} &middot; {intern.internId}</p>
        </div>
        <div className="flex gap-8 text-sm">
          <div><p className="text-steel-600">Department</p><p className="font-medium text-navy-950">{intern.department?.name || "—"}</p></div>
          <div><p className="text-steel-600">Mentor</p><p className="font-medium text-navy-950">{intern.mentor?.name || "—"}</p></div>
          <div><p className="text-steel-600">Status</p><StatusBadge status={intern.status} /></div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-steel-200 mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
              tab === t ? "border-accent text-navy-950" : "border-transparent text-steel-600 hover:text-navy-950"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-navy-950 mb-3">Academic details</h3>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-steel-600">College</dt><dd>{intern.college || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-steel-600">Branch</dt><dd>{intern.branch || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-steel-600">Start date</dt><dd>{new Date(intern.startDate).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-steel-600">End date</dt><dd>{new Date(intern.endDate).toLocaleDateString()}</dd></div>
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-semibold text-navy-950 mb-3">Project</h3>
            {intern.project ? (
              <>
                <p className="font-medium text-navy-950">{intern.project.name}</p>
                <p className="text-sm text-steel-600 mt-1">{intern.project.description}</p>
                <div className="mt-2"><StatusBadge status={intern.project.status} /></div>
              </>
            ) : <p className="text-sm text-steel-600">No project assigned.</p>}
          </div>
        </div>
      )}

      {tab === "Tasks" && (
        <div className="card overflow-x-auto">
          {tasks.length === 0 ? <EmptyState title="No tasks yet" /> : (
            <table className="table-base">
              <thead><tr><th>Title</th><th>Priority</th><th>Due date</th><th>Status</th></tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td className="font-medium text-navy-950">{t.title}</td>
                    <td>{t.priority}</td>
                    <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "Attendance" && (
        <div>
          {attendance && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="card p-4"><p className="text-sm text-steel-600">Attendance %</p><p className="text-2xl font-display font-semibold text-accent">{attendance.percentage}%</p></div>
              <div className="card p-4"><p className="text-sm text-steel-600">Present days</p><p className="text-2xl font-display font-semibold">{attendance.present}</p></div>
              <div className="card p-4"><p className="text-sm text-steel-600">Total marked</p><p className="text-2xl font-display font-semibold">{attendance.total}</p></div>
            </div>
          )}
          <div className="card overflow-x-auto">
            {!attendance?.data?.length ? <EmptyState title="No attendance records" /> : (
              <table className="table-base">
                <thead><tr><th>Date</th><th>Status</th><th>Remarks</th></tr></thead>
                <tbody>
                  {attendance.data.map((a) => (
                    <tr key={a._id}>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td className="text-steel-600">{a.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "Reports" && (
        <div className="space-y-3">
          {reports.length === 0 ? <div className="card"><EmptyState title="No weekly reports yet" /></div> : reports.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-navy-950">
                  {new Date(r.weekStart).toLocaleDateString()} — {new Date(r.weekEnd).toLocaleDateString()}
                </p>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-steel-600"><span className="font-medium text-navy-950">Work completed: </span>{r.workCompleted}</p>
              {r.mentorFeedback && <p className="text-sm text-steel-600 mt-1"><span className="font-medium text-navy-950">Mentor feedback: </span>{r.mentorFeedback}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "Evaluations" && (
        <div className="space-y-3">
          {evaluations.length === 0 ? <div className="card"><EmptyState title="No evaluations submitted yet" /></div> : evaluations.map((ev) => (
            <div key={ev._id} className="card p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-steel-600">By {ev.mentor?.name} on {new Date(ev.createdAt).toLocaleDateString()}</p>
                <p className="text-lg font-display font-semibold text-accent">{ev.average} / 5</p>
              </div>
              <div className="grid grid-cols-5 gap-3 text-center text-xs">
                {["technicalSkills", "problemSolving", "communication", "teamwork", "discipline"].map((k) => (
                  <div key={k}>
                    <p className="text-steel-600 capitalize mb-1">{k.replace(/([A-Z])/g, " $1")}</p>
                    <p className="font-display font-semibold text-navy-950">{ev[k]}</p>
                  </div>
                ))}
              </div>
              {ev.comments && <p className="text-sm text-steel-600 mt-3">{ev.comments}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternDetails;
