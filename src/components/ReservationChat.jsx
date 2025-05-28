import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_BASE_URL);

const ReservationChat = ({ reservationId, guestEmail, propertyId, sender = "hotel" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/${reservationId}`)
      .then(res => res.json())
      .then(data => {
        console.log("📥 Initial messages loaded from server:", data.messages);
        setMessages(data.messages || []);
        messagesRef.current = data.messages || [];
      });

    socket.on("newMessage", (msg) => {
      console.log("📡 WebSocket message received:", msg);
      console.log("📋 Current optimistic messagesRef:", messagesRef.current);
      if (msg.reservationId !== reservationId) return;

      setMessages((prev) => {
        const matchIndex = prev.findIndex((m) => {
          const sameTime = new Date(m.timestamp).toISOString() === new Date(msg.timestamp).toISOString();
          const sameContent = m.content === msg.content;
          const sameSender = m.sender === msg.sender;
          const isOptimistic = m._id && typeof m._id === "string" && m._id.startsWith("temp-");

          return (sameSender && sameContent && sameTime) || (isOptimistic && sameContent && sameSender);
        });

        if (matchIndex !== -1) {
          const updated = [...prev];
          updated[matchIndex] = msg;
          messagesRef.current = updated;
          console.log("🧩 Replaced optimistic with confirmed:", msg);
          return updated;
        }

        const updated = [...prev, msg];
        messagesRef.current = updated;
        console.log("📦 Appended new message:", msg);
        return updated;
      });
    });

    return () => socket.off("newMessage");
  }, [reservationId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const tempId = `temp-${Math.random().toString(36).substring(2, 9)}`;

    const msg = {
      reservationId,
      sender,
      content: input,
      guestEmail,
      propertyId
    };

    console.log("📨 Submitting new message:", msg);

    const optimisticMsg = {
      ...msg,
      timestamp: new Date(),
      _id: tempId
    };
    console.log("🚀 Sending optimistic message:", optimisticMsg);
    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      messagesRef.current = updated;
      console.log("🧪 Optimistic state after push:", messagesRef.current);
      return updated;
    });
    setInput("");
    setLoading(true);

    setTimeout(() => setLoading(false), 150);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }).catch((err) => {
      console.error("Message send failed:", err);
    });
  };

  return (
    <Box mt={1}>
     
      <Paper
        variant="outlined"
        sx={{
          maxHeight: 580,
          minHeight: 450,
          overflowY: "auto",
          mb: 2,
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
              <Typography variant="caption" color="text.secondary">
                {dayjs(msg.timestamp).fromNow()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          sx={{ height: '100%' }}
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </Box>
    </Box>
  );
};

export default ReservationChat;