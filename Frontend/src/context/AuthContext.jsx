// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

// local helper
const jwtDecode = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [token, setToken] = useState(null);

  // boot: restore from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const decoded = jwtDecode(savedToken);
      if (decoded?.username || decoded?.name) {
        setUsername(decoded.username || decoded.name);
        setIsLoggedIn(true);
        setToken(savedToken);
        return;
      }
    }
    const raw = localStorage.getItem("lp_user");
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj?.username) {
          setUsername(obj.username);
          setIsLoggedIn(true);
        }
      } catch {}
    }
  }, []);

  const login = (newToken, displayName) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }

    if (displayName) {
      setUsername(displayName);
      setIsLoggedIn(true);
      localStorage.setItem("lp_user", JSON.stringify({ username: displayName }));
      return;
    }

    if (newToken) {
      const decoded = jwtDecode(newToken);
      if (decoded?.username || decoded?.name) {
        setUsername(decoded.username || decoded.name);
        setIsLoggedIn(true);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lp_user");
    setIsLoggedIn(false);
    setUsername("Guest");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
