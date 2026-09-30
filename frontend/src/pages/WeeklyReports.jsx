import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const WeeklyReports = () => {
  const { user } = useAuth();
  return user.role === "intern" ? <InternReports /> : <ReviewerReports />;
};

const emptyForm = { weekStart: "", weekEnd: "", workCompleted: "", problemsFaced: "", skillsLearned: "", nextWeekPlan: "" };

const InternReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    API.get("/reports/my").then((res) => setReports(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchReports, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await API.post("/reports", form);
      setModalOpen(false);
      setForm(emptyForm);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-950">Weekly Reports</h1>
          <p className="text-sm text-steel-600 mt-1">Submit your weekly progress for mentor review.</p>
        </div>
        <button className="btn-accent" onClick={() => setModalOpen(true)}><Plus size={16} /> Submit report</button>
      </div>

      {reports.length === 0 ? (
        <div className="card"><EmptyState title="No reports submitted yet" /></div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-navy-950">
                  {new Date(r.weekStart).toLocaleDateString()} — {new Date(r.weekEnd).toLocaleDateString()}
                </p>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-steel-600"><span className="font-medium text-navy-950">Work completed: </span>{r.workCompleted}</p>
              {r.mentorFeedback && <p className="text-sm bg-steel-100 rounded-md px-3 py-2 mt-2"><span className="font-medium">Mentor feedback: </span>{r.mentorFeedback}</p>}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Submit weekly report" onClose={() => setModalOpen(false)} wide>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Week start</label><input required type="date" className="input" value={form.weekStart} onChange={(e) => setForm({ ...form, weekStart: e.target.value })} /></div>
            <div><label className="label">Week end</label><input required type="date" className="input" value={form.weekEnd} onChange={(e) => setForm({ ...form, weekEnd: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Work completed</label><textarea required rows={3} className="input" value={form.workCompleted} onChange={(e) => setForm({ ...form, workCompleted: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Problems faced</label><textarea rows={2} className="input" value={form.problemsFaced} onChange={(e) => setForm({ ...form, problemsFaced: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Skills learned</label><textarea rows={2} className="input" value={form.skillsLearned} onChange={(e) => setForm({ ...form, skillsLearned: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Next week's plan</label><textarea rows={2} className="input" value={form.nextWeekPlan} onChange={(e) => setForm({ ...form, nextWeekPlan: e.target.value })} /></div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-accent">{saving ? "Submitting..." : "Submit report"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const ReviewerReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [feedback, setFeedback] = useState("");

  const fetchReports = () => {
    setLoading(true);
    API.get("/reports").then((res) => setReports(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchReports, []);

  const submitReview = async (status) => {
    await API.put(`/reports/${reviewing._id}/review`, { status, mentorFeedback: feedback });
    setReviewing(null);
    setFeedback("");
    fetchReports();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-navy-950">Weekly Reports</h1>
        <p className="text-sm text-steel-600 mt-1">Review and approve weekly progress reports from your interns.</p>
      </div>

      <div className="card overflow-x-auto">
        {reports.length === 0 ? <EmptyState title="No reports submitted yet" /> : (
          <table className="table-base">
            <thead><tr><th>Intern</th><th>Week</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="font-medium text-navy-950">{r.intern?.user?.name}</td>
                  <td>{new Date(r.weekStart).toLocaleDateString()} — {new Date(r.weekEnd).toLocaleDateString()}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {(r.status === "Submitted" || r.status === "Under Review") && (
                      <button className="btn-outline !py-1 !px-2.5 text-xs" onClick={() => { setReviewing(r); setFeedback(""); }}>Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {reviewing && (
        <Modal title="Review weekly report" onClose={() => setReviewing(null)} wide>
          <div className="text-sm space-y-2 mb-4">
            <p><span className="font-medium text-navy-950">Work completed: </span>{reviewing.workCompleted}</p>
            {reviewing.problemsFaced && <p><span className="font-medium text-navy-950">Problems faced: </span>{reviewing.problemsFaced}</p>}
            {reviewing.skillsLearned && <p><span className="font-medium text-navy-950">Skills learned: </span>{reviewing.skillsLearned}</p>}
            {reviewing.nextWeekPlan && <p><span className="font-medium text-navy-950">Next week's plan: </span>{reviewing.nextWeekPlan}</p>}
          </div>
          <label className="label">Feedback</label>
          <textarea rows={3} className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4">
            <button className="btn-danger" onClick={() => submitReview("Changes Required")}>Request changes</button>
            <button className="btn-accent" onClick={() => submitReview("Approved")}>Approve</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WeeklyReports;
