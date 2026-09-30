import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const Tasks = () => {
  const { user } = useAuth();
  return user.role === "intern" ? <InternTasks /> : <MentorAdminTasks />;
};

// ---------- Intern view ----------
const InternTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTasks = () => {
    setLoading(true);
    API.get("/tasks/my").then((res) => setTasks(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchTasks, []);

  const startWork = async (task) => {
    await API.put(`/tasks/${task._id}`, { status: "In Progress" });
    fetchTasks();
  };

  const openSubmit = (task) => { setActive(task); setText(""); };

  const submit = async () => {
    setSaving(true);
    await API.put(`/tasks/${active._id}`, { submissionText: text });
    setSaving(false);
    setActive(null);
    fetchTasks();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-navy-950">My Tasks</h1>
        <p className="text-sm text-steel-600 mt-1">Tasks assigned to you by your mentor.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="card"><EmptyState title="No tasks assigned yet" message="Your mentor will assign tasks here as your project progresses." /></div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t._id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-navy-950">{t.title}</p>
                  <p className="text-xs text-steel-600 mt-0.5">
                    {t.project?.name && `${t.project.name} · `}
                    Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"} · Priority: {t.priority}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm text-steel-600 mb-3">{t.description}</p>
              {t.feedback && (
                <p className="text-sm bg-steel-100 rounded-md px-3 py-2 mb-3"><span className="font-medium">Mentor feedback: </span>{t.feedback}</p>
              )}
              <div className="flex gap-2">
                {t.status === "Pending" && <button className="btn-outline" onClick={() => startWork(t)}>Start work</button>}
                {(t.status === "In Progress" || t.status === "Rejected") && (
                  <button className="btn-accent" onClick={() => openSubmit(t)}>Submit work</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <Modal title={`Submit: ${active.title}`} onClose={() => setActive(null)}>
          <label className="label">Describe your submission</label>
          <textarea rows={5} className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Summarize the work completed, links to code/documents, etc." />
          <div className="flex justify-end gap-2 pt-4">
            <button className="btn-outline" onClick={() => setActive(null)}>Cancel</button>
            <button disabled={saving || !text} className="btn-accent" onClick={submit}>{saving ? "Submitting..." : "Submit for review"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ---------- Mentor / Admin view ----------
const MentorAdminTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewTask, setReviewTask] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", project: "", priority: "Medium", dueDate: "" });

  const fetchAll = async () => {
    setLoading(true);
    const [taskRes, internRes, projRes] = await Promise.all([
      API.get("/tasks"), API.get("/interns"), API.get("/projects"),
    ]);
    setTasks(taskRes.data.data);
    setInterns(internRes.data.data);
    setProjects(projRes.data.data);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const createTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.post("/tasks", form);
      setCreateOpen(false);
      setForm({ title: "", description: "", assignedTo: "", project: "", priority: "Medium", dueDate: "" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async (status) => {
    await API.put(`/tasks/${reviewTask._id}`, { status, feedback });
    setReviewTask(null);
    setFeedback("");
    fetchAll();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-950">Tasks</h1>
          <p className="text-sm text-steel-600 mt-1">Assign tasks and review intern submissions.</p>
        </div>
        <button className="btn-accent" onClick={() => setCreateOpen(true)}><Plus size={16} /> Assign task</button>
      </div>

      <div className="card overflow-x-auto">
        {tasks.length === 0 ? <EmptyState title="No tasks yet" /> : (
          <table className="table-base">
            <thead><tr><th>Task</th><th>Intern</th><th>Priority</th><th>Due date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td className="font-medium text-navy-950">{t.title}</td>
                  <td>{t.assignedTo?.user?.name}</td>
                  <td>{t.priority}</td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    {t.status === "Submitted" && (
                      <button className="btn-outline !py-1 !px-2.5 text-xs" onClick={() => { setReviewTask(t); setFeedback(""); }}>Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && (
        <Modal title="Assign task" onClose={() => setCreateOpen(false)} wide>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={createTask} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Title</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <label className="label">Assign to intern</label>
              <select required className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Select intern</option>
                {interns.map((i) => <option key={i._id} value={i._id}>{i.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Project (optional)</label>
              <select className="input" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                <option value="">No project</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Due date</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving..." : "Assign task"}</button>
            </div>
          </form>
        </Modal>
      )}

      {reviewTask && (
        <Modal title={`Review: ${reviewTask.title}`} onClose={() => setReviewTask(null)}>
          <p className="text-sm text-steel-600 mb-3">
            <span className="font-medium text-navy-950">Submission: </span>{reviewTask.submission?.text || "No text provided."}
          </p>
          <label className="label">Feedback</label>
          <textarea rows={3} className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4">
            <button className="btn-danger" onClick={() => submitReview("Rejected")}>Request changes</button>
            <button className="btn-accent" onClick={() => submitReview("Approved")}>Approve</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
