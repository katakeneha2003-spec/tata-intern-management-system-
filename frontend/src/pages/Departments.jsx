import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const emptyForm = { name: "", description: "", location: "" };

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchDepartments = () => {
    setLoading(true);
    API.get("/departments").then((res) => setDepartments(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(fetchDepartments, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, description: d.description || "", location: d.location || "" }); setError(""); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await API.put(`/departments/${editing._id}`, form);
      else await API.post("/departments", form);
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await API.delete(`/departments/${confirmDelete._id}`);
      setConfirmDelete(null);
      fetchDepartments();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete department");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-950">Departments</h1>
          <p className="text-sm text-steel-600 mt-1">Departments interns can be allocated to across the organization.</p>
        </div>
        <button className="btn-accent" onClick={openCreate}><Plus size={16} /> Add department</button>
      </div>

      {loading ? <LoadingSpinner /> : departments.length === 0 ? (
        <div className="card"><EmptyState title="No departments yet" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="font-display font-semibold text-navy-950">{d.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-steel-100 text-navy-800"><Pencil size={15} /></button>
                  <button onClick={() => setConfirmDelete(d)} className="p-1.5 rounded hover:bg-steel-100 text-danger"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="text-sm text-steel-600 mb-3">{d.description || "No description provided."}</p>
              <div className="flex items-center justify-between text-xs text-steel-600 pt-3 border-t border-steel-100">
                <span className="flex items-center gap-1"><MapPin size={13} /> {d.location || "—"}</span>
                <span>{d.internCount} interns</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit department" : "Add department"} onClose={() => setModalOpen(false)}>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving..." : "Save department"}</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete department" onClose={() => setConfirmDelete(null)}>
          {deleteError && <Alert type="error">{deleteError}</Alert>}
          <p className="text-sm text-steel-600 mb-5">Delete <span className="font-medium text-navy-950">{confirmDelete.name}</span>? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Departments;
