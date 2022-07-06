const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const router = require("./router");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {addUser, removeUser, getUser, getUserInRoom} = require("./users");

app.use(cors());

io.on("connection", (socket) => {
    socket.on("join", ({name, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, name: name, room: room });

        if(error){
            return callback(error);
        }

        socket.emit('message', {user: "admin", text: `${user.name} Welcome to the Room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: "admin", text: `${user.name} has joined the room`});

        socket.join(user.room);

        io.to(user.room).emit("roomData", {room: user.room, users: getUserInRoom(user.room)})

        callback();
    });

    socket.on("sendMessage", (message,callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit("message", {user: user.name, text: message});
        io.to(user.room).emit("roomData", {room: user.room, users: getUserInRoom(user.room)})

        callback();
    });
    
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit("message", {user: "admin", text: `${user.name} has Left`})
        }
    })
});

app.use(router);

server.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`)
})