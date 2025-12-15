const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const session = require("express-session");

dbConnect();
const requireLogin = require("./routes/requireLogin");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const adminRoute = require("./routes/admin");
const UploadPhotoRouter = require("./routes/UploadPhotoRouter");
// const CommentRouter = require("./routes/CommentRouter");
// app.use(cors());
const path = require("path");
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  cors({
    origin: "https://lkmrjm-3000.csb.app/",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: "mySecretKey12345",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use("/admin", adminRoute);
app.use(requireLogin);
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/photos", UploadPhotoRouter);
app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
