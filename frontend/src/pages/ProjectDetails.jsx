import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/projects/${id}`).then((res) => setProject(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!project) return <EmptyState title="Project not found" />;

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-steel-600 hover:text-navy-950 mb-4">
        <ArrowLeft size={15} /> Back to projects
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-xl font-display font-semibold text-navy-950">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-sm text-steel-600 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies?.map((t) => (
            <span key={t} className="text-xs bg-steel-100 text-steel-600 px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-4 border-t border-steel-100">
          <div><p className="text-steel-600">Department</p><p className="font-medium">{project.department?.name || "—"}</p></div>
          <div><p className="text-steel-600">Mentor</p><p className="font-medium">{project.mentor?.name || "—"}</p></div>
          <div><p className="text-steel-600">Start</p><p className="font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</p></div>
          <div><p className="text-steel-600">End</p><p className="font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</p></div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-semibold text-navy-950 mb-4">Assigned interns</h3>
        {project.interns?.length === 0 ? (
          <EmptyState title="No interns assigned to this project yet" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {project.interns.map((i) => (
              <Link to={`/interns/${i._id}`} key={i._id} className="flex items-center gap-3 p-3 border border-steel-200 rounded-md hover:border-navy-700">
                <div className="w-9 h-9 rounded-full bg-navy-950 text-white flex items-center justify-center text-xs font-medium">
                  {i.user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-950">{i.user?.name}</p>
                  <p className="text-xs text-steel-600">{i.user?.email}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
