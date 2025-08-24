import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const ModelTraining = () => {
  const [loading, setLoading] = useState(false);
  const [lastTrained, setLastTrained] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch last trained date on mount
  useEffect(() => {
    fetchLastTrained();
  }, []);

  const fetchLastTrained = async () => {
    try {
      const res = await axios.get("http://localhost:5000/model-info");
      setLastTrained(res.data.last_trained);
    } catch (err) {
      console.error("Error fetching model info", err);
    }
  };

  const handleRetrain = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await axios.post("http://localhost:5000/retrain");
      setSuccess("Model retrained successfully!");
      fetchLastTrained();
    } catch (err) {
      setError("Failed to retrain model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Loan Model Training</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Last trained:</strong>{" "}
            {lastTrained
              ? new Date(lastTrained).toLocaleString()
              : "Loading..."}
          </p>

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleRetrain}
            disabled={loading}
            className="w-full"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelTraining;
