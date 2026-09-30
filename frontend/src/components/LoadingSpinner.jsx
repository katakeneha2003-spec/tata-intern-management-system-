import React from "react";

const LoadingSpinner = ({ full, label = "Loading..." }) => (
  <div className={full ? "min-h-screen flex items-center justify-center bg-canvas" : "flex items-center justify-center py-16"}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-steel-200 border-t-navy-800 rounded-full animate-spin" />
      <span className="text-sm text-steel-600">{label}</span>
    </div>
  </div>
);

export default LoadingSpinner;
