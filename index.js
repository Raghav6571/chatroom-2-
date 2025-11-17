const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "somekey",
    resave: false,
    saveUninitialized: true
  })
);

const users = ["raghav", "pawan", "shivam", "nirmal", "omkar"];

// LOGIN PAGE
app.get("/", (req, res) => {
  res.render("login", { users });
});

app.post("/login", (req, res) => {
  const user = req.body.username;
  if (!users.includes(user)) return res.send("Invalid user");

  req.session.user = user;
  res.redirect("/home");
});

// HOME AFTER LOGIN
app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const filtered = users.filter(u => u !== req.session.user);
  res.render("index", { users: filtered, me: req.session.user });
});

// CHAT PAGE
app.get("/chat/:user", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const otherUser = req.params.user;
  if (!users.includes(otherUser)) return res.send("User not found");

  res.render("chat", {
    username: req.session.user,
    talkingTo: otherUser
  });
});

// SOCKET LOGIC
io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
  });

  socket.on("message", (data) => {
    // Emit to everyone EXCEPT sender
    socket.to(data.room).emit("message", {
      msg: data.msg,
      from: data.from
    });
  });
});

server.listen(3000, () => {
  console.log("running on 3000");
});
