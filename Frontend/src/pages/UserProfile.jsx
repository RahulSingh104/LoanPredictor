import React, { useEffect, useState } from "react";

const UserProfile = () => {
  const [user, setUser] = useState(null); // store user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token"); // get token from storage

    if (!token) {
      console.error("No token found");
      setLoading(false);
      return;
    }

    // Fetch user data from backend
    fetch("http://localhost:5001/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // send token for authentication
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">No user data found</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">User Profile</h1>
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={user.fullName || ""}
              readOnly
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={user.email || ""}
              readOnly
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;

