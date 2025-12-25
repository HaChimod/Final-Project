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
    let url = `/api/user/search?q=${q}`;
    const res = await fetchModel(url);
    setResults(res || []);
  };

  return (
    <div style={{ position: "relative" }}>
      <TextField
        size="small"
        placeholder={`Search nguoi dung theo ten`}
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
                to={`/users/${item._id}`}
                onClick={() => {
                  setKeyword("");
                  setResults([]);
                }}
              >
                <ListItemText
                  primary={`${item.first_name} ${item.last_name}`}
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
