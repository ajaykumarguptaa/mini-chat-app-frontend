import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";
import { api } from "../api/client.js";

export default function ChatWindow({ channel }) {
  const { token, socket, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");

  const loadMessages = async (pageToLoad) => {
    if (!channel?._id) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(
        `/api/messages/${channel._id}?page=${pageToLoad}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // NOTE: this assumes backend sends { count, messages }
      if (res.data.count === 0) {
        setHasMore(false);
        return;
      }

      if (pageToLoad === 1) {
        setMessages(res.data.messages);
      } else {
        setMessages((prev) => [...res.data.messages, ...prev]);
      }
      setPage(pageToLoad);
    } catch (err) {
      console.error("Messages error:", err.response?.data || err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    if (channel?._id) {
      loadMessages(1);
    }
  }, [channel?._id]); // eslint-disable-line

  useEffect(() => {
    if (!socket || !channel?._id) return;

    socket.emit("join-channel", channel._id);

    const handleReceive = (msg) => {
      if (msg.channelId === channel._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive-message", handleReceive);

    return () => {
      socket.emit("leave-channel", channel._id);
      socket.off("receive-message", handleReceive);
    };
  }, [socket, channel?._id]); // eslint-disable-line

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit("send-message", { channelId: channel._id, text: text.trim() });
    setText("");
  };

  const handleLoadOlder = () => {
    if (!hasMore || loadingMessages) return;
    loadMessages(page + 1);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] bg-[#1A1A1A]">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-[#E5E5E5]">
            <span className="text-[#E5E5E5]/40">#</span>
            <span>{channel.name}</span>
          </h2>
          <p className="text-[11px] text-[#E5E5E5]/50">
            Channel ID:{" "}
            <span className="font-mono text-[#E5E5E5]/70">
              {channel._id}
            </span>
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#0F0F0F]">
        {hasMore && (
          <div className="flex justify-center mb-2">
            <button
              onClick={handleLoadOlder}
              disabled={loadingMessages}
              className="text-[11px] px-3 py-1 rounded-full border border-[#1A1A1A] text-[#E5E5E5]/80 hover:bg-[#1A1A1A] disabled:opacity-60"
            >
              {loadingMessages ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-lg rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  isMe
                    ? "bg-[#4F46E5] text-[#E5E5E5]"
                    : "bg-[#1A1A1A] text-[#E5E5E5]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] font-semibold">
                    {msg.sender?.name || "User"}
                  </span>
                  <span className="text-[10px] opacity-80">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-sm ">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[#E5E5E5]/50">
              No messages yet. Be the first to say hi 
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-[#1A1A1A] bg-[#1A1A1A]"
      >
        <input
          type="text"
          placeholder={`Message #${channel.name}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-full bg-[#0F0F0F] border border-[#1A1A1A] px-4 py-2 text-sm text-[#E5E5E5] outline-none focus:border-[#4F46E5]"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm rounded-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 font-medium text-[#E5E5E5] transition-colors disabled:opacity-60"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}










// {
//   import React, { useEffect, useState } from "react";
// import { useAuth } from "../state/AuthContext.jsx";
// import { api } from "../api/client.js";

// export default function ChatWindow({ channel }) {
//   const { token, socket, user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const [text, setText] = useState("");

//   const loadMessages = async (pageToLoad) => {
//     if (!channel?._id) return;
//     setLoadingMessages(true);
//     try {
//       const res = await api.get(
//         `/api/messages/${channel._id}?page=${pageToLoad}&limit=20`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Make sure backend returns: { count, messages }
//       const { count, messages: fetched } = res.data;

//       if (count === 0 || fetched.length === 0) {
//         setHasMore(false);
//         if (pageToLoad === 1) setMessages([]);
//         return;
//       }

//       if (pageToLoad === 1) {
//         setMessages(fetched);
//       } else {
//         setMessages((prev) => [...fetched, ...prev]);
//       }
//       setPage(pageToLoad);
//     } catch (err) {
//       console.error("Messages error:", err.response?.data || err.message);
//     } finally {
//       setLoadingMessages(false);
//     }
//   };

//   useEffect(() => {
//     setMessages([]);
//     setPage(1);
//     setHasMore(true);
//     if (channel?._id) {
//       loadMessages(1);
//     }
//   }, [channel?._id]); // eslint-disable-line

//   useEffect(() => {
//     if (!socket || !channel?._id) return;

//     socket.emit("join-channel", channel._id);

//     const handleReceive = (msg) => {
//       if (msg.channelId === channel._id) {
//         setMessages((prev) => [...prev, msg]);
//       }
//     };

//     const handleDeleted = ({ messageId }) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m._id === messageId ? { ...m, deleted: true, text: "" } : m
//         )
//       );
//     };

//     socket.on("receive-message", handleReceive);
//     socket.on("message-deleted", handleDeleted);

//     return () => {
//       socket.emit("leave-channel", channel._id);
//       socket.off("receive-message", handleReceive);
//       socket.off("message-deleted", handleDeleted);
//     };
//   }, [socket, channel?._id]); // eslint-disable-line

//   const handleSend = (e) => {
//     e.preventDefault();
//     if (!text.trim() || !socket) return;
//     socket.emit("send-message", { channelId: channel._id, text: text.trim() });
//     setText("");
//   };

//   const handleLoadOlder = () => {
//     if (!hasMore || loadingMessages) return;
//     loadMessages(page + 1);
//   };

//   const handleDelete = (messageId) => {
//     if (!socket) return;
//     socket.emit("delete-message", { messageId });
//   };

//   return (
//     <div className="flex flex-col h-full bg-[#0F0F0F]">
//       {/* Header */}
//       <header className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] bg-[#1A1A1A]">
//         <div>
//           <h2 className="text-lg font-semibold flex items-center gap-2 text-[#E5E5E5]">
//             <span className="text-[#E5E5E5]/40">#</span>
//             <span>{channel.name}</span>
//           </h2>
//           <p className="text-[11px] text-[#E5E5E5]/50">
//             Channel ID:{" "}
//             <span className="font-mono text-[#E5E5E5]/70">{channel._id}</span>
//           </p>
//         </div>
//       </header>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#0F0F0F]">
//         {hasMore && (
//           <div className="flex justify-center mb-2">
//             <button
//               onClick={handleLoadOlder}
//               disabled={loadingMessages}
//               className="text-[11px] px-3 py-1 rounded-full border border-[#1A1A1A] text-[#E5E5E5]/80 hover:bg-[#1A1A1A] disabled:opacity-60"
//             >
//               {loadingMessages ? "Loading..." : "Load older messages"}
//             </button>
//           </div>
//         )}

//         {messages.map((msg) => {
//           const isMe = msg.sender?._id === user?._id;

//           return (
//             <div
//               key={msg._id}
//               className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-lg rounded-2xl px-3 py-2 text-sm shadow-sm ${
//                   isMe
//                     ? "bg-[#4F46E5] text-[#E5E5E5]"
//                     : "bg-[#1A1A1A] text-[#E5E5E5]"
//                 }`}
//               >
//                 <div className="flex items-center justify-between gap-2 mb-0.5">
//                   <span className="text-[11px] font-semibold">
//                     {msg.sender?.name || "User"}
//                   </span>

//                   <div className="flex items-center gap-2">
//                     <span className="text-[10px] opacity-80">
//                       {new Date(msg.createdAt).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>

//                     {isMe && !msg.deleted && (
//                       <button
//                         type="button"
//                         onClick={() => handleDelete(msg._id)}
//                         className="text-[10px] px-2 py-0.5 rounded-full border border-[#0F0F0F] hover:bg-[#0F0F0F]/60"
//                       >
//                         Delete
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="text-sm break-words">
//                   {msg.deleted ? (
//                     <span className="text-[11px] opacity-70 italic">
//                       This message was deleted
//                     </span>
//                   ) : (
//                     msg.text
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {messages.length === 0 && (
//           <div className="h-full flex items-center justify-center">
//             <p className="text-sm text-[#E5E5E5]/50">
//               No messages yet. Be the first to say hi 👋
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={handleSend}
//         className="flex items-center gap-2 px-4 py-3 border-t border-[#1A1A1A] bg-[#1A1A1A]"
//       >
//         <input
//           type="text"
//           placeholder={`Message #${channel.name}`}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           className="flex-1 rounded-full bg-[#0F0F0F] border border-[#1A1A1A] px-4 py-2 text-sm text-[#E5E5E5] outline-none focus:border-[#4F46E5]"
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 text-sm rounded-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 font-medium text-[#E5E5E5] transition-colors disabled:opacity-60"
//           disabled={!text.trim()}
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }

// }