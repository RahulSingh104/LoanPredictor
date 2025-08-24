import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function TrainingButton({ onClick, loading }) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retraining...
        </>
      ) : (
        "Retrain Model"
      )}
    </Button>
  );
}
