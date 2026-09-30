import React, { useEffect, useState } from "react";
import { Plus, Users, FolderKanban } from "lucide-react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchMentors = () => {
    setLoading(true);
    API.get("/mentors").then((res) => setMentors(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(fetchMentors, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.post("/mentors", form);
      setModalOpen(false);
      setForm({ name: "", email: "", password: "", phone: "" });
      fetchMentors();
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
          <h1 className="text-2xl font-display font-semibold text-navy-950">Mentors</h1>
          <p className="text-sm text-steel-600 mt-1">Mentors assigned to guide and evaluate interns.</p>
        </div>
        <button className="btn-accent" onClick={() => setModalOpen(true)}><Plus size={16} /> Add mentor</button>
      </div>

      {loading ? <LoadingSpinner /> : mentors.length === 0 ? (
        <div className="card"><EmptyState title="No mentors yet" message="Add a mentor to start assigning interns to them." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((m) => (
            <div key={m._id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-navy-950 text-white flex items-center justify-center text-sm font-medium">
                  {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-medium text-navy-950">{m.name}</p>
                  <p className="text-xs text-steel-600">{m.email}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-steel-600 pt-3 border-t border-steel-100">
                <span className="flex items-center gap-1.5"><Users size={14} /> {m.internCount} interns</span>
                <span className="flex items-center gap-1.5"><FolderKanban size={14} /> {m.projectCount} projects</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Add mentor" onClose={() => setModalOpen(false)}>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">Temporary password</label><input className="input" placeholder="Defaults to Mentor@123" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving..." : "Save mentor"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Mentors;
