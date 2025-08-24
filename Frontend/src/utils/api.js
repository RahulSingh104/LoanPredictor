// // src/utils/api.js
// import axios from "axios";

// const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// const api = axios.create({
//   baseURL: BASE,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   // you can add timeout: 10000,
// });

// export default api;


// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // only ONE /api here
  withCredentials: true,
});

export default api;
