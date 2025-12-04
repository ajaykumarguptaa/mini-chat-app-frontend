import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("chat_token") || null
  );

  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Auth me error:", err.response?.data || err.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem("chat_token");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  // Setup socket when token available
  useEffect(() => {
    if (!token) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });

    s.on("connect", () => {
      // console.log("Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("chat_token", t);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await api.post("/api/auth/signup", { name, email, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("chat_token", t);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("chat_token");
    if (socket) socket.disconnect();
    setSocket(null);
  };

  const value = { user, token, socket, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
