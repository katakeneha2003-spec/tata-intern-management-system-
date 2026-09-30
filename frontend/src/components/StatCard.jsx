import React from "react";

const StatCard = ({ label, value, icon: Icon, accent = false, suffix = "" }) => (
  <div className="card p-5 flex items-start justify-between">
    <div>
      <p className="text-sm text-steel-600">{label}</p>
      <p className={`text-3xl font-display font-semibold mt-1 ${accent ? "text-accent" : "text-navy-950"}`}>
        {value}{suffix}
      </p>
    </div>
    {Icon && (
      <div className="w-10 h-10 rounded-md bg-navy-950 text-white flex items-center justify-center shrink-0">
        <Icon size={20} strokeWidth={1.75} />
      </div>
    )}
  </div>
);

export default StatCard;
