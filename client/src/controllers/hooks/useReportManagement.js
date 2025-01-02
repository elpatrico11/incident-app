import { useState, useEffect, useCallback } from "react";
import {
  fetchReports,
  downloadReportsCSV,
} from "../../api/services/reportService";
import useAuthStore from "../../models/stores/useAuthStore";

const useReportManagement = () => {
  // Data States
  const [reportData, setReportData] = useState(null);

  // Loading States
  const [loading, setLoading] = useState(true);

  // Feedback States
  const [error, setError] = useState("");

  // Current User (from Auth Store)
  const currentUser = useAuthStore((state) => state.user);

  // Fetch Reports
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchReports();
      if (!data) {
        throw new Error("No data received from server");
      }
      setReportData(data);
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.msg || "Błąd podczas pobierania raportów.");
      } else if (err.request) {
        setError("Nie otrzymano odpowiedzi od serwera.");
      } else {
        setError("Wystąpił nieoczekiwany błąd.");
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle Download CSV
  const handleDownload = useCallback(async () => {
    try {
      const blob = await downloadReportsCSV();
      const file = new Blob([blob], { type: "text/csv;charset=utf-8;" });
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = fileURL;
      a.download = "raporty.csv";
      a.click();
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(
          err.response.data.msg || "Błąd podczas pobierania raportu CSV."
        );
      } else if (err.request) {
        setError("Nie otrzymano odpowiedzi od serwera.");
      } else {
        setError("Wystąpił nieoczekiwany błąd.");
      }
    }
  }, []);

  return {
    // Data
    reportData,

    // Loading
    loading,

    // Feedback
    error,

    // Handlers
    handleDownload,

    // Current User
    currentUser,
  };
};

export default useReportManagement;
