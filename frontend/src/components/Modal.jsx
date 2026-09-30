import React from "react";
import { X } from "lucide-react";

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-navy-950/40 p-4 overflow-y-auto">
    <div className={`bg-white rounded-lg shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} my-8`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-steel-200">
        <h3 className="font-display font-semibold text-lg text-navy-950">{title}</h3>
        <button onClick={onClose} className="text-steel-600 hover:text-navy-950">
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default Modal;
