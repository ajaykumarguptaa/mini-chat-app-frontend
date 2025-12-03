import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../api/client.js";
import ChatWindow from "../components/ChatWindow.jsx";

export default function Dashboard() {
  const { user, token, logout, socket } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await api.get("/api/channels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChannels(res.data);
      } catch (err) {
        console.error("Channels error:", err.response?.data || err.message);
      }
    };
    if (token) fetchChannels();
  }, [token]);

  // Presence events
  useEffect(() => {
    if (!socket) return;

    const handleOnline = ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };

    const handleOffline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(userId);
        return copy;
      });
    };

    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);

    return () => {
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
    };
  }, [socket]);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const res = await api.post(
        "/api/channels",
        { name: newChannelName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChannels((prev) => [...prev, res.data]);
      setNewChannelName("");
    } catch (err) {
      console.error("Create channel error:", err.response?.data || err.message);
    }
  };

  const handleJoin = async (channelId) => {
    try {
      await api.post(
        `/api/channels/${channelId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const channel = channels.find((c) => c._id === channelId);
      setActiveChannel(channel);
    } catch (err) {
      console.error("Join error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="h-screen flex bg-[#0F0F0F] text-[#E5E5E5]">

      {/* Sidebar */}
      <aside className="w-72 border-r border-[#1A1A1A] bg-[#111111] flex flex-col">

        {/* Header */}
        <div className="px-4 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">TeamChat</h1>
            {" "}
             {/* <p className="text-xs text-[#E5E5E5]/60">
            <span className="font-medium">{user?.email}</span>
            </p> */}
            <p className="text-xs text-[#E5E5E5]/60">
              Logged in as <span className="font-medium">{user?.name}</span>
            </p>
            
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1 rounded-md bg-[#1A1A1A] hover:bg-[#1E1E1E]"
          >
            Logout
          </button>
        </div>

        {/* Create Channel */}
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <form className="flex gap-2" onSubmit={handleCreateChannel}>
            <input
              type="text"
              placeholder="New channel"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="flex-1 rounded-md bg-[#1A1A1A] border border-[#1A1A1A] px-2 py-1.5 text-xs text-[#E5E5E5] focus:outline-none focus:border-[#4F46E5]"
            />
            <button
              type="submit"
              className="text-xs px-2 py-1 rounded-md bg-[#4F46E5] hover:bg-[#3F3AC9]"
            >
              Add
            </button>
          </form>
        </div>

        {/* Channels */}
        <div className="px-3 py-3 flex-1 overflow-y-auto">
          <h3 className="text-xs uppercase text-[#E5E5E5]/40 mb-2 tracking-wide">
            Channels
          </h3>
          <ul className="space-y-1">
            {channels.map((ch) => (
              <li key={ch._id}>
                <button
                  onClick={() => handleJoin(ch._id)}
                  className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition 
                    ${
                      activeChannel?._id === ch._id
                        ? "bg-[#1A1A1A] text-[#4F46E5]"
                        : "text-[#E5E5E5]/80 hover:bg-[#1A1A1A]"
                    }`}
                >
                  <span className="text-[#E5E5E5]/40">#</span>
                  <span className="truncate">{ch.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Online Users */}
        <div className="px-3 py-3 border-t border-[#1A1A1A]">
          <h3 className="text-xs uppercase text-[#E5E5E5]/40 mb-2 tracking-wide">
            Online Users
          </h3>
          <ul className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {[...onlineUsers].map((id) => (
              <li key={id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="truncate">{id}</span>
              </li>
            ))}
            {onlineUsers.size === 0 && (
              <li className="text-[#E5E5E5]/50">No one online yet</li>
            )}
          </ul>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-[#0F0F0F]">
        {activeChannel ? (
          <ChatWindow channel={activeChannel} />
        ) : (
          <div className="flex flex-1 items-center justify-center flex-col gap-2">
            <h2 className="text-xl font-semibold">Welcome to Team Chat</h2>
            <p className="text-sm text-[#E5E5E5]/60">
              Create or join a channel from the left sidebar to start chatting.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
