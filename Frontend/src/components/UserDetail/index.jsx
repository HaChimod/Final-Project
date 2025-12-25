import React, { useState, useEffect } from "react";
import { Typography, Button, TextField, Box } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

function UserDetail() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchModel(`/api/user/${userId}`);
        setUser(data || null);
        setFormData(data || {});
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [userId]);
  useEffect(() => {
    fetchModel("/admin/me")
      .then(setMe)
      .catch(() => setMe(null));
  }, []);
  if (loading) return <Typography>Loading user...</Typography>;
  if (!user) return <Typography>User not found.</Typography>;

  const isMe = me && String(me._id) === String(user._id);

  return (
    <>
      <Typography variant="h6">
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="body2">Location: {user.location}</Typography>
      <Typography variant="body2">Description: {user.description}</Typography>
      <Typography variant="body2">Occupation: {user.occupation}</Typography>

      <Typography variant="body1" sx={{ mt: 3 }}>
        <Link to={`/photos/${user._id}`}>View Photos</Link>
      </Typography>
    </>
  );
}

export default UserDetail;
