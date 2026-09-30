import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const emptyForm = {
  name: "", email: "", password: "", phone: "", internId: "", college: "", branch: "",
  department: "", mentor: "", startDate: "", endDate: "", status: "Upcoming",
};

const Interns = () => {
  const { user } = useAuth();
  const [interns, setInterns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (deptFilter) params.department = deptFilter;

    const [internsRes, deptRes] = await Promise.all([
      API.get("/interns", { params }),
      API.get("/departments"),
    ]);
    setInterns(internsRes.data.data);
    setDepartments(deptRes.data.data);

    if (user.role === "admin") {
      const mentorsRes = await API.get("/mentors");
      setMentors(mentorsRes.data.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [statusFilter, deptFilter]);
  useEffect(() => {
    const t = setTimeout(fetchAll, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (intern) => {
    setEditing(intern);
    setForm({
      name: intern.user?.name || "", email: intern.user?.email || "", password: "",
      phone: intern.user?.phone || "", internId: intern.internId, college: intern.college || "",
      branch: intern.branch || "", department: intern.department?._id || "", mentor: intern.mentor?._id || "",
      startDate: intern.startDate?.slice(0, 10) || "", endDate: intern.endDate?.slice(0, 10) || "",
      status: intern.status,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await API.put(`/interns/${editing._id}`, form);
      } else {
        await API.post("/interns", form);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await API.delete(`/interns/${confirmDelete._id}`);
    setConfirmDelete(null);
    fetchAll();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-950">
            {user.role === "admin" ? "Interns" : "My Interns"}
          </h1>
          <p className="text-sm text-steel-600 mt-1">Manage intern onboarding, department and mentor allocation.</p>
        </div>
        {user.role === "admin" && (
          <button className="btn-accent" onClick={openCreate}>
            <Plus size={16} /> Add intern
          </button>
        )}
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, email or intern ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {["Upcoming", "Active", "Completed", "Terminated"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <LoadingSpinner />
        ) : interns.length === 0 ? (
          <EmptyState title="No interns found" message="Try adjusting your filters, or add a new intern to get started." />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Intern</th><th>Intern ID</th><th>Department</th><th>Mentor</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {interns.map((i) => (
                <tr key={i._id}>
                  <td>
                    <p className="font-medium text-navy-950">{i.user?.name}</p>
                    <p className="text-xs text-steel-600">{i.user?.email}</p>
                  </td>
                  <td>{i.internId}</td>
                  <td>{i.department?.name || "—"}</td>
                  <td>{i.mentor?.name || "—"}</td>
                  <td><StatusBadge status={i.status} /></td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/interns/${i._id}`} className="p-1.5 rounded hover:bg-steel-100 text-navy-800" title="View">
                        <Eye size={16} />
                      </Link>
                      {user.role === "admin" && (
                        <>
                          <button onClick={() => openEdit(i)} className="p-1.5 rounded hover:bg-steel-100 text-navy-800" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setConfirmDelete(i)} className="p-1.5 rounded hover:bg-steel-100 text-danger" title="Deactivate">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? "Edit intern" : "Add intern"} onClose={() => setModalOpen(false)} wide>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" disabled={!!editing} className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {!editing && (
              <div>
                <label className="label">Temporary password</label>
                <input className="input" placeholder="Defaults to Intern@123" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            )}
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Intern ID</label>
              <input required disabled={!!editing} className="input" value={form.internId} onChange={(e) => setForm({ ...form, internId: e.target.value })} />
            </div>
            <div>
              <label className="label">College</label>
              <input className="input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            </div>
            <div>
              <label className="label">Branch</label>
              <input className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Mentor</label>
              <select className="input" value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })}>
                <option value="">Select mentor</option>
                {mentors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start date</label>
              <input required type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End date</label>
              <input required type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["Upcoming", "Active", "Completed", "Terminated"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving..." : "Save intern"}</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Deactivate intern" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-steel-600 mb-5">
            This marks <span className="font-medium text-navy-950">{confirmDelete.user?.name}</span> as Terminated and
            deactivates their login. Historical records are kept for audit purposes.
          </p>
          <div className="flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Deactivate</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Interns;
