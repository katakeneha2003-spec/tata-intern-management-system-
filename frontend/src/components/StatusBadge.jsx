import React from "react";

const styles = {
  Active: "bg-success/10 text-success",
  Present: "bg-success/10 text-success",
  Approved: "bg-success/10 text-success",
  Completed: "bg-navy-800/10 text-navy-800",
  Upcoming: "bg-steel-600/10 text-steel-600",
  Planning: "bg-steel-600/10 text-steel-600",
  Pending: "bg-warning/10 text-warning",
  "In Progress": "bg-warning/10 text-warning",
  Submitted: "bg-warning/10 text-warning",
  "Under Review": "bg-warning/10 text-warning",
  Leave: "bg-warning/10 text-warning",
  Terminated: "bg-danger/10 text-danger",
  Rejected: "bg-danger/10 text-danger",
  Absent: "bg-danger/10 text-danger",
  "Changes Required": "bg-danger/10 text-danger",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-steel-100 text-steel-600"}`}>
    {status}
  </span>
);

export default StatusBadge;
