


// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // only ONE /api here
  withCredentials: true,
});

export default api;
