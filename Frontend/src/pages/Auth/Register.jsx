import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    occupation: "",
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((s) => ({ ...s, [e.target.name]: null }));
    setMsg(null);
  }

  function validate() {
    const errs = {};
    if (!form.username || form.username.trim().length < 2) errs.username = "Enter your full name";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      const res = await api.post("/auth/register", payload);
      setMsg({ type: "success", text: res.data?.message || "Registered successfully" });

      // ✅ Auto-login after register
      try {
        const loginRes = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        // ✅ Save to localStorage
        localStorage.setItem("lp_user", JSON.stringify({
          email: form.email,
          id: loginRes.data?.user_id || null
        }));
        localStorage.setItem("token", loginRes.data?.token);

        navigate("/", { replace: true });
        return;
      } catch {
        setMsg({ type: "info", text: "Please login to continue" });
        setTimeout(() => navigate("/login"), 900);
      }
    } catch (err) {
      const t = err?.response?.data?.error || err?.response?.data?.message || err.message || "Registration failed";
      setMsg({ type: "error", text: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-center">Create an account</h2>
        {msg && (
          <div
            className={`p-2 rounded text-sm ${
              msg.type === "error"
                ? "bg-red-50 text-red-700"
                : msg.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* your existing fields unchanged */}
        {/* ... */}
        <button type="submit" disabled={loading} className="w-full py-2 rounded text-white bg-blue-600 hover:bg-blue-700">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
