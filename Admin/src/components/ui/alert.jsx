import React from "react";

export function Alert({ children, className = "" }) {
  return (
    <div className={`p-3 rounded bg-yellow-100 border border-yellow-400 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children }) {
  return <p className="text-sm">{children}</p>;
}
