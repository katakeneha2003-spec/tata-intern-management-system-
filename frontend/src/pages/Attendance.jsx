import React, { useEffect, useState } from "react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);

const Attendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Present");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = () => {
    setLoading(true);
    API.get("/attendance/my").then((res) => setData(res.data)).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const alreadyMarkedToday = data?.data?.some((a) => a.date.slice(0, 10) === todayISO());

  const markToday = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await API.post("/attendance", { date: todayISO(), status, remarks });
      setMessage("Attendance marked for today.");
      setRemarks("");
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-navy-950">Attendance</h1>
        <p className="text-sm text-steel-600 mt-1">Mark your daily attendance and track your percentage.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5"><p className="text-sm text-steel-600">Attendance %</p><p className="text-3xl font-display font-semibold text-accent mt-1">{data.percentage}%</p></div>
        <div className="card p-5"><p className="text-sm text-steel-600">Present days</p><p className="text-3xl font-display font-semibold mt-1">{data.present}</p></div>
        <div className="card p-5"><p className="text-sm text-steel-600">Total marked</p><p className="text-3xl font-display font-semibold mt-1">{data.total}</p></div>
      </div>

      <div className="card p-5 mb-6 max-w-md">
        <h3 className="font-display font-semibold text-navy-950 mb-3">Mark today's attendance</h3>
        {message && <Alert type="success">{message}</Alert>}
        {alreadyMarkedToday ? (
          <p className="text-sm text-steel-600">You've already marked your attendance for today. You can update it below if needed.</p>
        ) : null}
        <form onSubmit={markToday} className="space-y-3 mt-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {["Present", "Absent", "Leave"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Remarks (optional)</label>
            <input className="input" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <button disabled={saving} className="btn-accent w-full">{saving ? "Saving..." : "Mark attendance"}</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-display font-semibold text-navy-950 px-5 pt-5 mb-2">History</h3>
        {data.data.length === 0 ? <EmptyState title="No attendance marked yet" /> : (
          <table className="table-base">
            <thead><tr><th>Date</th><th>Status</th><th>Remarks</th></tr></thead>
            <tbody>
              {data.data.map((a) => (
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
  );
};

export default Attendance;
