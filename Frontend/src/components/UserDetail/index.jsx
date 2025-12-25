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
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [requested, setRequested] = useState(false);
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
  useEffect(() => {
    if (me) {
      fetchModel("/api/user/listfriend").then((data) => {
        setFriends(data || []);
        if (userId) setIsFriend(data.some((f) => f._id === userId));
      });
      fetchModel("/api/user/requests").then((data) => {
        setRequests(data || []);
        if (userId) setRequested(data.some((r) => r._id === userId));
      });
    }
  }, [me, userId]);

  if (loading) return <Typography>Loading user...</Typography>;
  if (!user) return <Typography>User not found.</Typography>;

  const isMe = me && String(me._id) === String(user._id);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const updated = await fetchModel("/api/user/edit/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (updated) {
      setUser(updated);
      setEditing(false);
    } else {
      alert("Update failed");
    }
  };
  const sendRequest = async () => {
    const res = await fetchModel(`/api/user/request/${user._id}`, {
      method: "POST",
    });
    alert(res.message);
    setRequested(true);
  };
  const acceptRequest = async () => {
    const res = await fetchModel(`/api/user/accept/${user._id}`, {
      method: "POST",
    });
    alert(res.message);
    setRequests((prev) => prev.filter((r) => r._id !== user._id));
    setIsFriend(true);
  };
  const rejectRequest = async () => {
    const res = await fetchModel(`/api/user/reject/${user._id}`, {
      method: "POST",
    });
    alert(res.message);
    setRequests((prev) => prev.filter((r) => r._id !== user._id));
  };
  const unfriend = async () => {
    const res = await fetchModel(`/api/user/unfriend/${user._id}`, {
      method: "POST",
    });
    if (res && res.message) {
      alert(res.message);
      setIsFriend(false);
      setFriends((prev) =>
        prev.filter((f) => f._id.toString() !== user._id.toString())
      );
    } else {
      alert("Unfriend failed");
    }
  };
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
      {/* {!isMe && (
  <>
    {!isFriend && !requested && (
      <Button variant="contained" sx={{ mt: 2 }} onClick={sendRequest}>
        Add Friend
      </Button>
    )}
    {requested && <Typography sx={{ mt: 2 }}>Friend request sent</Typography>}
    {requests.some(r => r._id === user._id) && (
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="success" onClick={acceptRequest} sx={{ mr: 1 }}>
          Accept
        </Button>
        <Button variant="contained" color="error" onClick={rejectRequest}>
          Reject
        </Button>
 
      </Box>
    )}
    {isFriend && !isMe && (
           <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={unfriend}>
           Unfriend
        </Button>
        )}
  </>
)} */}
    </>
    // <>
    //   {!editing ? (
    //     <>
    //       <Typography variant="h6">
    //         {user.first_name} {user.last_name}
    //       </Typography>
    //       <Typography variant="body2">Location: {user.location}</Typography>
    //       <Typography variant="body2">Description: {user.description}</Typography>
    //       <Typography variant="body2">Occupation: {user.occupation}</Typography>

    //       {isMe && (
    //         <Button
    //           variant="contained"
    //           sx={{ mt: 2 }}
    //           onClick={() => setEditing(true)}
    //         >
    //           Edit Profile
    //         </Button>
    //       )}
    //     </>
    //   ) : (
    //     <Box sx={{ mt: 2, maxWidth: 400 }}>
    //       <TextField
    //         label="First Name"
    //         name="first_name"
    //         value={formData.first_name || ""}
    //         onChange={handleChange}
    //         fullWidth
    //         margin="dense"
    //       />
    //       <TextField
    //         label="Last Name"
    //         name="last_name"
    //         value={formData.last_name || ""}
    //         onChange={handleChange}
    //         fullWidth
    //         margin="dense"
    //       />
    //       <TextField
    //         label="Location"
    //         name="location"
    //         value={formData.location || ""}
    //         onChange={handleChange}
    //         fullWidth
    //         margin="dense"
    //       />
    //       <TextField
    //         label="Description"
    //         name="description"
    //         value={formData.description || ""}
    //         onChange={handleChange}
    //         fullWidth
    //         margin="dense"
    //       />
    //       <TextField
    //         label="Occupation"
    //         name="occupation"
    //         value={formData.occupation || ""}
    //         onChange={handleChange}
    //         fullWidth
    //         margin="dense"
    //       />
    //       <Box sx={{ mt: 2 }}>
    //         <Button variant="contained" onClick={handleSave}>
    //           Save
    //         </Button>
    //       </Box>
    //     </Box>
    //   )}

    //   <Typography variant="body1" sx={{ mt: 3 }}>
    //     <Link to={`/photos/${user._id}`}>View Photos</Link>
    //   </Typography>
    // </>
  );
}

export default UserDetail;
