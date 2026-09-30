import React from "react";

const styles = {
  error: "bg-danger/10 text-danger border-danger/20",
  success: "bg-success/10 text-success border-success/20",
  info: "bg-navy-900/5 text-navy-900 border-navy-900/10",
};

const Alert = ({ type = "info", children }) => (
  <div className={`text-sm border rounded-md px-3 py-2 mb-4 ${styles[type]}`}>{children}</div>
);

export default Alert;
