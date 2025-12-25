import React, { useState, useEffect, useRef } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useLocation } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import Search from "../Search";
function TopBar({ user, handleLogout, onPhotoUpload }) {
  const [contextText, setContextText] = useState("");
  const location = useLocation();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const parts = location.pathname.split("/");
    const page = parts[1];
    const userId = parts[2];

    if (!userId) {
      setContextText("");
      return;
    }

    async function loadUser() {
      try {
        const userData = await fetchModel(`/api/user/${userId}`);
        if (!userData) {
          setContextText("");
          return;
        }

        const name = `${userData.first_name} ${userData.last_name}`;
        if (page === "photos") setContextText(`Photos of ${name}`);
        else if (page === "users") setContextText(name);
        else setContextText("");
      } catch (err) {
        console.error("TopBar fetch error:", err);
        setContextText("");
      }
    }

    loadUser();
  }, [location]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("https://pdyj5t-8081.csb.app/photos/new", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        alert("Upload failed");
        return;
      }

      alert("Photo uploaded!");
      const userId = location.pathname.split("/")[2];
      if (userId) {
        const updatedPhotos = await fetchModel(
          `/api/photo/photosOfUser/${userId}`
        );
        if (onPhotoUpload)
          updatedPhotos.forEach((photo) => onPhotoUpload(photo));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error");
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" sx={{ flexGrow: 1 }}>
          Phạm Tiến Phát
        </Typography>

        <Box sx={{ mr: 2 }}>
          <Typography variant="h6" color="inherit">
            {contextText}
          </Typography>
        </Box>
        {user && (
          <Box sx={{ mr: 2 }}>
            <Search />
          </Box>
        )}
        {!user ? (
          <Typography variant="h6" color="inherit">
            Please Login
          </Typography>
        ) : (
          <>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Hi {user.first_name}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                sx={{ color: "white", borderColor: "white" }}
                onClick={handleUploadClick}
              >
                Add Photo
              </Button>

              <Button
                color="inherit"
                variant="outlined"
                size="small"
                onClick={handleLogout}
                sx={{ color: "white", borderColor: "white" }}
              >
                Logout
              </Button>
            </Box>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelected}
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
