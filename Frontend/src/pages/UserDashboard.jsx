// import React, { useEffect, useState } from "react";
// import { BarChart3, CheckCircle, User } from "lucide-react";
// import UserLoans from "./UserLoans";
// import api from "../utils/api";
// import { useAuth } from "../context/AuthContext";

// const DashboardCard = ({ icon, title, value }) => (
//   <div className="bg-white dark:bg-white-800 shadow-md rounded-2xl p-6 flex items-center gap-4">
//     {icon}
//     <div>
//       <p className="text-gray-900 dark:text-gray-900 text-sm">{title}</p>
//       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h2>
//     </div>
//   </div>
// );

// const UserDashboard = () => {
//   const { username, token } = useAuth();
//   const [stats, setStats] = useState({ total: 0, approved: 0 });

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get("/loan/stats", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setStats({
//           total: res.data.total || 0,
//           approved: res.data.approved || 0,
//         });
//       } catch (err) {
//         console.error("Failed to fetch dashboard stats:", err);
//       }
//     };
//     if (token) fetchStats();
//   }, [token]);

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Dashboard</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <DashboardCard icon={<BarChart3 className="text-blue-500 w-8 h-8" />} title="Total Loans" value={stats.total} />
//         <DashboardCard icon={<CheckCircle className="text-green-500 w-8 h-8" />} title="Approved Loans" value={stats.approved} />
//         <DashboardCard icon={<User className="text-purple-500 w-8 h-8" />} title="Welcome Back" value={username} />
//       </div>
//       <UserLoans />
//     </div>
//   );
// };

// export default UserDashboard;


// --- src/pages/UserDashboard.jsx ---
import React, { useEffect, useState } from "react";
import { BarChart3, CheckCircle, User } from "lucide-react";
import UserLoans from "./UserLoans";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const DashboardCard = ({ icon, title, value }) => (
  // Card with a clean white background, subtle border, and professional shadow
  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 flex items-center gap-4">
    {icon}
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
    </div>
  </div>
);

const UserDashboard = () => {
  const { username, token } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/loan/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats({
          total: res.data.total || 0,
          approved: res.data.approved || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard icon={<BarChart3 className="text-blue-500 w-8 h-8" />} title="Total Loans" value={stats.total} />
        <DashboardCard icon={<CheckCircle className="text-green-500 w-8 h-8" />} title="Approved Loans" value={stats.approved} />
        <DashboardCard icon={<User className="text-purple-500 w-8 h-8" />} title="Welcome Back" value={username} />
      </div>
      <UserLoans />
    </div>
  );
};

export default UserDashboard;