const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
let users = {};
let sockets = {};
let text = '';



app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());


const server = http.createServer(app);
let io = socketIo(server);

io.on("connection", socket => {
    console.log("NEW CLIENT");
    sockets[socket.id] = {
        name: '',
    };

    socket.on("SetUsername", data => {
        let u = data;
        if (users[u]) {
            socket.emit("UsernameError", "Username is already taken");
        } else {
            users[u] = socket.id;
            sockets[socket.id].name = u;
            socket.emit("UsernameSuccess", {
                name: u,
                users: Object.keys(users),
                text: text
            });
            socket.broadcast.emit("UsernameUpdate", Object.keys(users));
        }
    });

    socket.on("TextUpdate", data => {
        text = data;
        socket.broadcast.emit('UpdateText', text);
    });

    socket.on("disconnect", () => {
        let u = sockets[socket.id].name;
        delete users[u];
        delete sockets[socket.id];
        console.log("CLIENT DISCONNECTED", u);
        io.sockets.emit('UsernameUpdate', Object.keys(users));
    });
});

server.listen(3001, () => {
    console.log('Running on port 3001');
});