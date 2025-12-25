import React, { useState } from "react";
import { TextField, Paper, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
function Search({ type = "user" }) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const search = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    let url = "";

    if (type === "user") {
      url = `/api/user/search?q=${q}`;
    } else if (type === "comment") {
      url = `/api/photo/comment/search?q=${q}`;
    }

    const res = await fetchModel(url);
    setResults(res || []);
  };

  return (
    <div style={{ position: "relative", width: 220 }}>
      <TextField
        size="small"
        placeholder={`Search ${type}...`}
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          search(e.target.value);
        }}
        fullWidth
      />

      {results.length > 0 && (
        <Paper
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 20,
          }}
        >
          <List dense>
            {results.map((item) => (
              <ListItem
                key={item._id}
                component={Link}
                to={
                  type === "user"
                    ? `/users/${item._id}`
                    : `/photos/${item.photo_owner._id}?highlight=${item._id}`
                }
                onClick={() => {
                  setKeyword("");
                  setResults([]);
                }}
              >
                <ListItemText
                  primary={
                    type === "user"
                      ? `${item.first_name} ${item.last_name}`
                      : item.comment
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}

export default Search;

// 1.1 Tạo schema tin nhắn
// // models/Message.js
// const mongoose = require("mongoose");

// const MessageSchema = new mongoose.Schema({
//   from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   content: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Message", MessageSchema);

// 1.2 Tạo API gửi và nhận tin nhắn
// const express = require("express");
// const router = express.Router();
// const Message = require("../models/Message");

// // Gửi tin nhắn
// router.post("/send", async (req, res) => {
//   const { to, content } = req.body;
//   const from = req.user._id; // giả sử dùng JWT / session, req.user chứa user hiện tại

//   try {
//     const message = await Message.create({ from, to, content });
//     res.json({ message: "Message sent", data: message });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Lấy tất cả tin nhắn giữa 2 user
// router.get("/conversation/:userId", async (req, res) => {
//   const me = req.user._id;
//   const other = req.params.userId;

//   try {
//     const messages = await Message.find({
//       $or: [
//         { from: me, to: other },
//         { from: other, to: me },
//       ]
//     }).sort({ createdAt: 1 }); // sắp xếp theo thời gian
//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// ✅ Lưu ý: phải có middleware xác thực (req.user) để đảm bảo user đang login.

// 2️⃣ Frontend (React)
// 2.1 State và load conversation
// const [messages, setMessages] = useState([]);
// const [input, setInput] = useState("");

// // Lấy tin nhắn với user khác
// useEffect(() => {
//   if (!userId) return;
//   fetchModel(`/api/message/conversation/${userId}`)
//     .then(setMessages)
//     .catch(() => setMessages([]));
// }, [userId]);

// 2.2 Gửi tin nhắn
// const sendMessage = async () => {
//   if (!input.trim()) return;

//   const res = await fetchModel("/api/message/send", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ to: userId, content: input }),
//   });

//   if (res.data) {
//     setMessages((prev) => [...prev, res.data]); // thêm tin nhắn mới vào state
//     setInput(""); // xóa input
//   } else {
//     alert("Send failed");
//   }
// };

// 2.3 Hiển thị tin nhắn
// <Box sx={{ maxHeight: 400, overflowY: "auto", border: "1px solid #ccc", p: 2 }}>
//   {messages.map((msg, idx) => (
//     <Typography
//       key={idx}
//       sx={{ textAlign: msg.from === me._id ? "right" : "left" }}
//     >
//       {msg.content}
//     </Typography>
//   ))}
// </Box>

// <Box sx={{ display: "flex", mt: 1 }}>
//   <TextField
//     fullWidth
//     value={input}
//     onChange={(e) => setInput(e.target.value)}
//     placeholder="Type a message..."
//   />
//   <Button onClick={sendMessage} variant="contained">Send</Button>
// </Box>
