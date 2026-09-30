import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const criteria = [
  { key: "technicalSkills", label: "Technical skills" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "communication", label: "Communication" },
  { key: "teamwork", label: "Teamwork" },
  { key: "discipline", label: "Discipline" },
];

const emptyForm = { intern: "", technicalSkills: 3, problemSolving: 3, communication: 3, teamwork: 3, discipline: 3, comments: "" };

const Evaluations = () => {
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/interns").then((res) => {
      setInterns(res.data.data);
      if (res.data.data.length) setSelectedIntern(res.data.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedIntern) { setLoading(false); return; }
    setLoading(true);
    API.get(`/evaluations/intern/${selectedIntern}`).then((res) => setEvaluations(res.data.data)).finally(() => setLoading(false));
  }, [selectedIntern]);

  const openCreate = () => { setForm({ ...emptyForm, intern: selectedIntern }); setError(""); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.post("/evaluations", form);
      setModalOpen(false);
      const res = await API.get(`/evaluations/intern/${selectedIntern}`);
      setEvaluations(res.data.data);
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
          <h1 className="text-2xl font-display font-semibold text-navy-950">Evaluations</h1>
          <p className="text-sm text-steel-600 mt-1">Rate intern performance across five core criteria.</p>
        </div>
        <button className="btn-accent" onClick={openCreate} disabled={!selectedIntern}><Plus size={16} /> New evaluation</button>
      </div>

      <div className="card p-4 mb-4">
        <label className="label">Select intern</label>
        <select className="input max-w-sm" value={selectedIntern} onChange={(e) => setSelectedIntern(e.target.value)}>
          {interns.map((i) => <option key={i._id} value={i._id}>{i.user?.name} ({i.internId})</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : evaluations.length === 0 ? (
        <div className="card"><EmptyState title="No evaluations for this intern yet" /></div>
      ) : (
        <div className="space-y-3">
          {evaluations.map((ev) => (
            <div key={ev._id} className="card p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-steel-600">By {ev.mentor?.name} on {new Date(ev.createdAt).toLocaleDateString()}</p>
                <p className="text-lg font-display font-semibold text-accent">{ev.average} / 5</p>
              </div>
              <div className="grid grid-cols-5 gap-3 text-center text-xs">
                {criteria.map((c) => (
                  <div key={c.key}>
                    <p className="text-steel-600 mb-1">{c.label}</p>
                    <p className="font-display font-semibold text-navy-950">{ev[c.key]}</p>
                  </div>
                ))}
              </div>
              {ev.comments && <p className="text-sm text-steel-600 mt-3">{ev.comments}</p>}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="New evaluation" onClose={() => setModalOpen(false)}>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {criteria.map((c) => (
              <div key={c.key}>
                <div className="flex justify-between mb-1">
                  <label className="label !mb-0">{c.label}</label>
                  <span className="text-sm font-medium text-navy-950">{form[c.key]} / 5</span>
                </div>
                <input
                  type="range" min="1" max="5" step="1"
                  value={form[c.key]}
                  onChange={(e) => setForm({ ...form, [c.key]: Number(e.target.value) })}
                  className="w-full accent-navy-900"
                />
              </div>
            ))}
            <div>
              <label className="label">Comments</label>
              <textarea rows={3} className="input" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Saving..." : "Save evaluation"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Evaluations;
