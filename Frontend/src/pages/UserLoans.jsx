import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  Approved:
    "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300",
  Pending:
    "text-amber-700 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300",
  Rejected: "text-rose-700 bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300",
};

const UserLoans = () => {
  const { token } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get("/loan/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoans(res.data.loans || []);
      } catch (err) {
        console.error("Failed to fetch loans:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchLoans();
  }, [token]);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        My Loan Applications
      </h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : loans.length === 0 ? (
        <p className="text-center text-gray-500">No loan records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Loan ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            {/* <tbody>
              {loans.map((loan) => (
                <tr key={loan._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="py-4 px-4">{loan._id}</td>
                  <td className="py-4 px-4">₹{loan.loan_amount?.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[loan.status]}`}>{loan.status}</span>
                  </td>
                  <td className="py-4 px-4">{loan.created_at}</td>
                </tr>
              ))}
            </tbody> */}

            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="py-4 px-4">{loan.loan_id || loan.id}</td>
                  <td className="py-4 px-4">
                    ₹{loan.loan_amount?.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusColors[loan.status]
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">{loan.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserLoans;
