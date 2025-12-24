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
