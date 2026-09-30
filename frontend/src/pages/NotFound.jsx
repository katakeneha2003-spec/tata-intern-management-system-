import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-center px-4">
    <p className="font-display text-6xl font-semibold text-navy-950 mb-2">404</p>
    <p className="text-steel-600 mb-6">This page doesn't exist or you don't have access to it.</p>
    <Link to="/dashboard" className="btn-accent">Back to dashboard</Link>
  </div>
);

export default NotFound;
