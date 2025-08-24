import React from "react";

export default function LastTrainedInfo({ lastTrained }) {
  return (
    <div className="mt-4 text-sm text-gray-600">
      <strong>Last Trained:</strong>{" "}
      {lastTrained ? new Date(lastTrained).toLocaleString() : "Never trained"}
    </div>
  );
}
