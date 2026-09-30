import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const emptyForm = {
  name: "", description: "", department: "", mentor: "", interns: [], technologies: "",
  startDate: "", endDate: "", status: "Planning",
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [projRes, deptRes, internRes] = await Promise.all([
      API.get("/projects"),
      API.get("/departments"),
      API.get("/interns"),
    ]);
    setProjects(projRes.data.data);
    setDepartments(deptRes.data.data);
    setInterns(internRes.data.data);
    if (user.role === "admin") {
      const mentorRes = await API.get("/mentors");
      setMentors(mentorRes.data.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const openCreate = () => { setForm(emptyForm); setError(""); setModalOpen(true); };

  const toggleIntern = (id) => {
    setForm((f) => ({
      ...f,
      interns: f.interns.includes(id) ? f.interns.filter((i) => i !== id) : [...f.interns, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.post("/projects", {
        ...form,
        technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-950">Projects</h1>
          <p className="text-sm text-steel-600 mt-1">Track project scope, assigned interns and technologies.</p>
        </div>
        {(user.role === "admin" || user.role === "mentor") && (
          <button className="btn-accent" onClick={openCreate}><Plus size={16} /> New project</button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : projects.length === 0 ? (
        <div className="card"><EmptyState title="No projects yet" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="card p-5 hover:border-navy-700 transition-colors block">
              <div className="flex items-start justify-between mb-2">
                <p className="font-display font-semibold text-navy-950">{p.name}</p>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-steel-600 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.technologies?.map((t) => (
                  <span key={t} className="text-xs bg-steel-100 text-steel-600 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <div className="flex justify-between text-xs text-steel-600 pt-3 border-t border-steel-100">
                <span>{p.mentor?.name}</span>
                <span>{p.interns?.length || 0} interns</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="New project" onClose={() => setModalOpen(false)} wide>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Project name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            {user.role === "admin" && (
              <div>
                <label className="label">Mentor</label>
                <select required className="input" value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })}>
                  <option value="">Select mentor</option>
                  {mentors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
            )}
            <div><label className="label">Start date</label><input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="label">End date</label><input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Technologies (comma-separated)</label><input className="input" placeholder="React, Node.js, MongoDB" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></div>
            <div className="sm:col-span-2">
              <label className="label">Assign interns</label>
              <div className="border border-steel-200 rounded-md max-h-36 overflow-y-auto p-2 space-y-1">
                {interns.map((i) => (
                  <label key={i._id} className="flex items-center gap-2 text-sm px-1 py-1 rounded hover:bg-steel-100 cursor-pointer">
                    <input type="checkbox" checked={form.interns.includes(i._id)} onChange={() => toggleIntern(i._id)} />
                    {i.user?.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving..." : "Create project"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
