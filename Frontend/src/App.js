import "./App.css";

import React, { useState, useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import fetchModel from "./lib/fetchModelData";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

const App = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const loggedInUser = await fetchModel("/admin/me");
        if (loggedInUser) setUser(loggedInUser);
      } catch {
        setUser(null);
      }
    };
    checkLogin();
  }, []);

  const handleLogout = async () => {
    try {
      await fetchModel("/admin/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
      setUser(null);
    }
  };

  return (
    <Router>
      <div>
        <Grid container spacing={2}>
          {/* TOPBAR */}
          <Grid item xs={12}>
            <TopBar user={user} handleLogout={handleLogout} />
          </Grid>

          <div className="main-topbar-buffer" />

          {/* LEFT PANEL */}
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {user ? <UserList user={user} /> : <div>Login to see users</div>}
            </Paper>
          </Grid>

          {/* MAIN CONTENT */}
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                {/* Khi chưa login → luôn redirect về LoginRegister */}
                {!user ? (
                  <>
                    <Route
                      path="*"
                      element={<LoginRegister setUser={setUser} />}
                    />
                  </>
                ) : (
                  <>
                    <Route path="/users/:userId" element={<UserDetail />} />
                    <Route path="/photos/:userId" element={<UserPhotos />} />
                    <Route path="/users" element={<UserList />} />
                    {/* Default route */}
                    <Route
                      path="*"
                      element={<Navigate to={`/users/${user._id}`} />}
                    />
                  </>
                )}
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Router>
  );
};

export default App;
