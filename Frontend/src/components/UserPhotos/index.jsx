import React, { useEffect, useState } from "react";
import { Typography, Box, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserPhotos({ newPhotoFromTopBar }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState({});
  const [editInput, setEditInput] = useState({}); 

  const sortByDateDesc = (arr) =>
    arr.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const data = await fetchModel(`/api/photo/photosOfUser/${userId}`);
        setPhotos(sortByDateDesc(data));
      } catch {
        alert("Error fetching photos");
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, [userId]);

  useEffect(() => {
    if (newPhotoFromTopBar) {
      setPhotos((prev) => sortByDateDesc([newPhotoFromTopBar, ...prev]));
    }
  }, [newPhotoFromTopBar]);

  const addComment = async (photoId) => {
    const commentText = commentInput[photoId] || "";
    if (!commentText.trim()) return;

    await fetchModel(`/api/photo/commentsOfPhoto/${photoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: commentText }),
    });
    setCommentInput((prev) => ({ ...prev, [photoId]: "" }));
    refreshPhotos();
  };

  const editComment = async (photoId, commentId) => {
    const text = editInput[commentId];
    if (!text) return;

    await fetchModel(`/api/photo/comments/${photoId}/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    });
    setEditInput((prev) => ({ ...prev, [commentId]: "" }));
    refreshPhotos();
  };

  const deleteComment = async (photoId, commentId) => {
    await fetchModel(`/api/photo/comments/${photoId}/${commentId}`, {
      method: "DELETE",
    });
    refreshPhotos();
  };

  const refreshPhotos = async () => {
    const data = await fetchModel(`/api/photo/photosOfUser/${userId}`);
    setPhotos(sortByDateDesc(data));
  };

  if (loading) return <Typography>Loading photos...</Typography>;
  if (!photos.length) return <Typography>No photos yet.</Typography>;

  return (
    <>
      {photos.map((photo) => (
        <Box key={photo._id} mb={3}>
          <img
            src={`https://pdyj5t-8081.csb.app/images/${photo.file_name}`}
            alt={photo.file_name}
            style={{ maxWidth: "100%", borderRadius: "5px" }}
          />
          <p>{new Date(photo.date_time).toLocaleString()}</p>

          {photo.comments.map((c) => (
            <Box key={c._id} mb={1}>
              <Typography>
                {c.user?.first_name || "Unknown"} {c.user?.last_name || "User"}:{" "}
                {c.comment}
              </Typography>

              {/* Edit comment */}
              {/* <TextField
                size="small"
                value={editInput[c._id] || ""}
                onChange={(e) =>
                  setEditInput((prev) => ({ ...prev, [c._id]: e.target.value }))
                }
                placeholder="Edit comment"
                sx={{ mr: 1 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={() => editComment(photo._id, c._id)}
              >
                Save
              </Button> */}

              {/* Delete comment */}
              {/* <Button
                variant="contained"
                size="small"
                sx={{ ml: 1 }}
                onClick={() => deleteComment(photo._id, c._id)}
              >
                Delete
              </Button> */}
            </Box>
          ))}

          <Box display="flex" mt={1}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              fullWidth
              value={commentInput[photo._id] || ""}
              onChange={(e) =>
                setCommentInput((prev) => ({ ...prev, [photo._id]: e.target.value }))
              }
            />
            <Button variant="contained" sx={{ ml: 1 }} onClick={() => addComment(photo._id)}>
              Post
            </Button>
          </Box>
        </Box>
      ))}
    </>
  );
}

export default UserPhotos;
