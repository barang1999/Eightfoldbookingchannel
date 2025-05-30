import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { Clock, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_BASE_URL);

const ReservationChat = ({ reservationId, guestEmail, propertyId, sender = "hotel" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesRef = useRef([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${reservationId}`)
      .then(res => res.json())
      .then(data => {
        console.log("📥 Initial messages loaded from server:", data.messages);
        const msgs = data.messages || [];
        setMessages(msgs);
        messagesRef.current = msgs;

        if (sender === "hotel") {
          const unseen = msgs.filter(m => m.sender !== "hotel" && !m.seen);
          unseen.forEach((msg) => {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/seen`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reservationId, messageId: msg._id })
            })
            .then(() => {
              console.log("✅ Seen updated on init for:", msg._id);
              setMessages((prev) =>
                prev.map((m) => m._id === msg._id ? { ...m, seen: true } : m)
              );
            })
            .catch(console.error);
          });
        }

        if (sender === "guest") {
          const unseen = msgs.filter(m => m.sender !== "guest" && !m.seen);
          console.log("🧹 Unseen hotel messages on load:", unseen);
          unseen.forEach((msg) => {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/seen`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reservationId, messageId: msg._id })
            })
            .then(() => {
              console.log("✅ Marked seen (guest):", msg._id);
              setMessages((prev) =>
                prev.map((m) => m._id === msg._id ? { ...m, seen: true } : m)
              );
            })
            .catch((err) => {
              console.error("❌ Failed to update seen status (guest) for:", msg._id, err);
            });
          });
        }
      });

    socket.emit("joinRoom", reservationId);

    socket.on("newMessage", (msg) => {
      console.log("📡 WebSocket message received:", msg);
      console.log("📋 Current optimistic messagesRef:", messagesRef.current);
      if (msg.reservationId && msg.reservationId !== reservationId) return;

      console.log("📨 Incoming sender:", msg.sender, "| local sender:", sender);
      if (msg.sender !== sender) {
        console.log("👁️ Triggered mark-as-seen logic for:", msg._id);
        console.log("👁️ Marking message as seen:", msg._id);
        msg.seen = true;
        // Notify backend to persist the seen status
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/seen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservationId: msg.reservationId, messageId: msg._id })
        })
        .then(() => {
          console.log("✅ Seen status updated for:", msg._id);
          socket.emit("messageSeen", { messageId: msg._id, reservationId: msg.reservationId });
          setMessages((prev) => {
            const updated = prev.map((m) =>
              m._id === msg._id || m.tempId === msg.tempId ? { ...m, seen: true } : m
            );
            console.log("✅ Seen update applied in state:", updated);
            return updated;
          });
        })
        .catch((err) => {
          console.error("❌ Failed to update seen status:", err);
        });
      }

      console.log("🧲 Entering setMessages with:", msg);

      // Only update status to "delivered" here to avoid overwriting .seen
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === msg._id || m.tempId === msg.tempId) {
            return {
              ...m,
              status: "delivered"
            };
          }
          return m;
        })
      );

      setMessages((prev) => {
        console.log("📌 Existing messages:", prev);
        const matchIndex = prev.findIndex((m) =>
          m._id === msg._id || m.tempId === msg.tempId
        );
        console.log("🔍 Match index found:", matchIndex);

        if (matchIndex !== -1) {
          const updated = [...prev];
          const existing = updated[matchIndex];
          const merged = {
            ...existing,
            _id: msg._id, // ensure backend _id replaces tempId
            content: msg.content,
            timestamp: msg.timestamp,
            status: "delivered",
            seen: existing.seen || msg.seen, // preserve seen:true if already set
          };
          updated[matchIndex] = merged;
          messagesRef.current = updated;
          console.log("✅ Merged update at index", matchIndex, ":", merged);
          return updated;
        }

        const newMsg = { ...msg, status: "delivered" };
        messagesRef.current = [...prev, newMsg];
        console.log("➕ Appending new message to list:", newMsg);
        return [...prev, newMsg];
      });
    });

    socket.on("messageSeen", ({ messageId }) => {
      console.log("👁️ Real-time seen received (full message list):", messagesRef.current);
      // Use messagesRef.current to update the correct message reliably
      const updated = messagesRef.current.map((m) => {
        const isMatch = m._id === messageId || m.tempId === messageId;
        if (isMatch) {
          console.log("✅ Matched message for seen update:", m);
          return { ...m, seen: true, status: m.status ?? "delivered" };
        }
        return m;
      });
      console.log("✅ Seen update applied in state (final):", updated);
      messagesRef.current = updated;
      setMessages(updated);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
    };
  }, [reservationId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const tempId = `temp-${Math.random().toString(36).substring(2, 9)}`;
    const msg = {
      reservationId,
      sender,
      content: input,
      guestEmail,
      propertyId,
      tempId
    };

    console.log("📨 Submitting new message:", msg);

    const optimisticMsg = {
      ...msg,
      timestamp: new Date(),
      _id: tempId,
      status: "sending"
    };
    console.log("🚀 Sending optimistic message:", optimisticMsg);
    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      messagesRef.current = updated;
      console.log("🧪 Optimistic state after push:", messagesRef.current);
      return updated;
    });
    setInput("");

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }).catch((err) => {
      console.error("Message send failed:", err);
    });
  };

  return (
    <Box mt={1} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Paper
          
          sx={{
            maxHeight: 700,
            minHeight: 450,
            overflowY: "auto",
            mb: 0,
            p: 2,
            maxWidth: '100%',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {messages.map((msg, i) => (
            <Box key={i} textAlign={msg.sender === sender ? "right" : "left"}>
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: msg.sender === sender ? "#e6f4ea" : "#f0f0f0",
                  borderRadius: 3,
                  px: 2,
                  py: 1.2,
                  my: 1.2,
                  maxWidth: "85%",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                }}
              >
                <Typography variant="body2">
                  {msg.content}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(msg.timestamp).fromNow()}
                  </Typography>
                  {msg.status === "sending" && <Clock size={14} style={{ marginLeft: 6 }} />}
                  {msg.status === "delivered" && !msg.seen && <Check size={14} style={{ marginLeft: 6 }} />}
                  {msg.seen && <CheckCheck size={14} style={{ marginLeft: 6 }} />}
                  {msg.status === "failed" && <AlertCircle size={14} style={{ marginLeft: 6 }} />}
                </Box>
              </Box>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Paper>
      </Box>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          p: 2,
          borderTop: '1px solid #eee',
          zIndex: 10
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            InputProps={{
              sx: {
                height: { xs: 40, sm: 48, md: 52 }, // slightly larger for desktop
                fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' }
              }
            }}
          />
          <Button type="submit" variant="contained" disabled={!input.trim()}>
            Send
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ReservationChat;