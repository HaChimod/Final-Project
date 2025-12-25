import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
/**
 * UserList component
 * Props:
 *
 */
function UserList({ user }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      try {
        const data = await fetchModel("/api/user/list");
        if (data) {
          setUsers(data);
          setError("");
        } else {
          setError("Bạn chưa login hoặc session hết hạn.");
        }
      } catch (err) {
        setError("Không kết nối được với server.");
      }
    };

    loadUsers();
  }, [user]);

  if (!user) return <Typography>Please login to see users.</Typography>;
  if (error) return <Typography color="red">{error}</Typography>;

  return (
    <div>
      <List component="nav">
        {users.map((u) => (
          <React.Fragment key={u._id}>
            <ListItemButton component={Link} to={`/users/${u._id}`}>
              <ListItemText primary={`${u.first_name} ${u.last_name}`} />
              <Box display="flex" gap={1}></Box>
            </ListItemButton>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
