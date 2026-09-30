import React from "react";

const EmptyState = ({ title, message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-4">
    {Icon && <Icon size={32} className="text-steel-400 mb-3" strokeWidth={1.5} />}
    <p className="font-medium text-navy-950">{title}</p>
    {message && <p className="text-sm text-steel-600 mt-1 max-w-sm">{message}</p>}
  </div>
);

export default EmptyState;
