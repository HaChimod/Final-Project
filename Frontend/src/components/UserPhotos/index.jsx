import React, { useEffect, useState } from "react";
import { Typography, Box, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

function UserPhotos({ newPhotoFromTopBar }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState({});

  const sortByDateDesc = (arr) => {
    return arr.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  };

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const data = await fetchModel(`/api/photo/photosOfUser/${userId}`);
        setPhotos(sortByDateDesc(data));
      } catch (err) {
        console.error("Error fetching photos:", err);
        alert("Error fetching photos");
      } finally {
        setLoading(false);
      }
    }
    fetchPhotos();
  }, [userId]);

  // Cập nhật khi có ảnh mới từ TopBar
  useEffect(() => {
    if (newPhotoFromTopBar) {
      setPhotos((prev) => sortByDateDesc([newPhotoFromTopBar, ...prev]));
    }
  }, [newPhotoFromTopBar]);

  async function addComment(photoId) {
    const commentText = commentInput[photoId] || "";

    if (commentText.trim() === "") {
      alert("Comment cannot be empty");
      return;
    }

    try {
      await fetchModel(`/api/photo/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText }),
      });

      setCommentInput((prev) => ({ ...prev, [photoId]: "" }));

      // Fetch lại photos mới nhất
      const updated = await fetchModel(`/api/photo/photosOfUser/${userId}`);
      setPhotos(sortByDateDesc(updated));
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Error posting comment");
    }
  }

  if (loading) return <Typography>Loading photos...</Typography>;
  if (!photos.length) return <Typography>No photos yet.</Typography>;

  return (
    <>
      {photos.map((photo) => (
        <Box key={photo._id} mb={3}>
          <img
            src={`https://lkmrjm-8081.csb.app/images/${photo.file_name}`}
            alt={photo.file_name}
            style={{ maxWidth: "100%", borderRadius: "5px" }}
          />

          <p>{new Date(photo.date_time).toLocaleString()}</p>

          {photo.comments &&
            photo.comments.map((comment) => (
              <p key={comment._id}>
                {comment.user?.first_name || "Unknown"}{" "}
                {comment.user?.last_name || "User"}: {comment.comment}
              </p>
            ))}

          <Box display="flex" mt={1}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              fullWidth
              value={commentInput[photo._id] || ""}
              onChange={(e) =>
                setCommentInput((prev) => ({
                  ...prev,
                  [photo._id]: e.target.value,
                }))
              }
            />
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={() => addComment(photo._id)}
            >
              Post
            </Button>
          </Box>
        </Box>
      ))}
    </>
  );
}

export default UserPhotos;
