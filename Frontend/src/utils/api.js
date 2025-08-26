


// src/utils/api.js
import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5001/api","https://loanpredictor.onrender.com/api" // only ONE /api here

   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
});

export default api;
