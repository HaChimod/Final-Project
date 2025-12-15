import React, { useState } from "react";
import { Button, Typography } from "@mui/material";

function LoginRegister({ setUser }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [creds, setCreds] = useState({ login_name: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [reg, setReg] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // -------------------- LOGIN HANDLER --------------------
  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8081/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
        setLoginError("");
      } else {
        setLoginError("Sai username hoặc mật khẩu!");
      }
    } catch (err) {
      setLoginError("Lỗi kết nối server!");
    }
  };

  // -------------------- REGISTER HANDLER --------------------
  const handleRegister = async () => {
    if (!reg.login_name || !reg.password || !reg.first_name || !reg.last_name) {
      setRegError(
        "Các trường login_name, password, first_name, last_name là bắt buộc!"
      );
      return;
    }
    if (reg.password !== reg.password2) {
      setRegError("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/admin/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reg),
      });

      if (res.ok) {
        setRegError("");
        setRegSuccess("Đăng ký thành công!");
        setReg({
          login_name: "",
          password: "",
          password2: "",
          first_name: "",
          last_name: "",
          location: "",
          description: "",
          occupation: "",
        });
      } else {
        const errText = await res.text();
        setRegError(errText || "Đăng ký thất bại!");
      }
    } catch (err) {
      setRegError("Lỗi kết nối server!");
    }
  };

  return (
    <div
      style={{
        width: 350,
        margin: "100px auto",
        padding: 24,
        background: "white",
        borderRadius: 8,
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      {/* MODE SWITCH BUTTONS */}
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Button
          variant={mode === "login" ? "contained" : "outlined"}
          onClick={() => setMode("login")}
        >
          Login
        </Button>
        <Button
          variant={mode === "register" ? "contained" : "outlined"}
          onClick={() => setMode("register")}
        >
          Register
        </Button>
      </div>

      {/* ================= LOGIN ================= */}
      {mode === "login" && (
        <div style={{ marginTop: 20 }}>
          <h2>Login</h2>
          <input
            placeholder="Login Name"
            style={{ width: "100%", marginTop: 8 }}
            value={creds.login_name}
            onChange={(e) => setCreds({ ...creds, login_name: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            style={{ width: "100%", marginTop: 8 }}
            value={creds.password}
            onChange={(e) => setCreds({ ...creds, password: e.target.value })}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Typography color="red">{loginError}</Typography>
        </div>
      )}

      {/* ================= REGISTER ================= */}
      {mode === "register" && (
        <div style={{ marginTop: 20 }}>
          <h2>Register</h2>
          <input
            placeholder="Login Name *"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.login_name}
            onChange={(e) => setReg({ ...reg, login_name: e.target.value })}
          />
          <input
            placeholder="Password *"
            type="password"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.password}
            onChange={(e) => setReg({ ...reg, password: e.target.value })}
          />
          <input
            placeholder="Re-enter Password *"
            type="password"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.password2}
            onChange={(e) => setReg({ ...reg, password2: e.target.value })}
          />
          <input
            placeholder="First Name *"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.first_name}
            onChange={(e) => setReg({ ...reg, first_name: e.target.value })}
          />
          <input
            placeholder="Last Name *"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.last_name}
            onChange={(e) => setReg({ ...reg, last_name: e.target.value })}
          />
          <input
            placeholder="Location"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.location}
            onChange={(e) => setReg({ ...reg, location: e.target.value })}
          />
          <input
            placeholder="Description"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.description}
            onChange={(e) => setReg({ ...reg, description: e.target.value })}
          />
          <input
            placeholder="Occupation"
            style={{ width: "100%", marginTop: 8 }}
            value={reg.occupation}
            onChange={(e) => setReg({ ...reg, occupation: e.target.value })}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={handleRegister}
          >
            Register Me
          </Button>
          <Typography color="red">{regError}</Typography>
          <Typography color="green">{regSuccess}</Typography>
        </div>
      )}
    </div>
  );
}

export default LoginRegister;
