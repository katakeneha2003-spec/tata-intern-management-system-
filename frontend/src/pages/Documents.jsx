import React, { useEffect, useState } from "react";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const docTypes = ["Resume", "Joining Document", "Weekly Report", "Project Report", "Presentation", "Other"];

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("Resume");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchDocs = () => {
    setLoading(true);
    API.get("/documents/my").then((res) => setDocs(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchDocs, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please choose a file to upload");
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      await API.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setModalOpen(false);
      setFile(null);
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/documents/${id}`);
    fetchDocs();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-950">Documents</h1>
          <p className="text-sm text-steel-600 mt-1">Resume, joining documents, project reports and presentations.</p>
        </div>
        <button className="btn-accent" onClick={() => { setModalOpen(true); setError(""); }}><Upload size={16} /> Upload document</button>
      </div>

      {loading ? <LoadingSpinner /> : docs.length === 0 ? (
        <div className="card"><EmptyState title="No documents uploaded yet" icon={FileText} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => (
            <div key={d._id} className="card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-navy-950 text-white flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-950 truncate" title={d.fileName}>{d.fileName}</p>
                <p className="text-xs text-steel-600">{d.type} &middot; {(d.fileSize / 1024).toFixed(0)} KB</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <a href={`${API_ORIGIN}${d.fileUrl}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-steel-100 text-navy-800"><Download size={15} /></a>
                <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded hover:bg-steel-100 text-danger"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Upload document" onClose={() => setModalOpen(false)}>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="label">Document type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {docTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">File</label>
              <input type="file" className="input" onChange={(e) => setFile(e.target.files[0])} />
              <p className="text-xs text-steel-600 mt-1">PDF, Word, PowerPoint or image files, up to 5MB.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={uploading} className="btn-accent">{uploading ? "Uploading..." : "Upload"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Documents;
