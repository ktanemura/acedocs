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
        name: ''
    };

    //  -- DEPRECATED MAINTAIN OWN COPY --- 
    // If this is not the first client we need to send them the most updated text that is currently held by the clients

    // let s = Object.keys(sockets);
    // if (s.length > 0) {
    //     sockets[s[0]].socket.emit("RequestServerTextUpdate", function(answer) {
    //         socket.emit("SetText", answer);
    //     });
    // }

    //  -- DEPRECATED MAINTAIN OWN COPY --- 


    // Client sent us a username to use
    socket.on("SetUsername", data => {
        let u = data;
        if (users[u]) { // Check if username taken
            socket.emit("UsernameError", "Username is already taken");
        } else if (u === '') { // Check username valid
            socket.emit("UsernameError", "Username cannot be empty");        
        } else {
            // Add username and socket to map
            users[u] = socket.id;
            sockets[socket.id].name = u;

            // Send client initial text and list of users
            socket.emit("UsernameSuccess", {
                name: u,
                users: Object.keys(users),
                text: text
            });

            // Update all other clients of new user
            socket.broadcast.emit("UsernameUpdate", Object.keys(users));
        }
    });

    // -- CURRENTLY UNUSED --
    // Client is asking for full text
    socket.on("RequestFullText", () => {
        socket.emit("SetFullText", text);
    });
    // -- CURRENTLY UNUSED --


    // Client updated shared text editor
    socket.on("TextUpdate", data => {
        // Send diff chages to all other clients
        socket.broadcast.emit('UpdateText', data);

        let t = text;
        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === 1) { // String insertion
                // Insert added string
                t = t.slice(0, data[i][2]) + data[i][1] + t.slice(data[i][2]);
            } else if (data[i][0] === -1) { // String deletion
                // Remove string
                t = t.slice(0, data[i][2]) + t.slice(data[i][2] + data[i][1].length);
            }
        }

        text = t;
    });

    // Client D/C
    socket.on("disconnect", () => {
        // Remove socket and username from map
        let u = sockets[socket.id].name;
        delete users[u];
        delete sockets[socket.id];

        console.log("CLIENT DISCONNECTED", u);

        // Update all clients with username list
        io.sockets.emit('UsernameUpdate', Object.keys(users));
    });
});

server.listen(3001, () => {
    console.log('Running on port 3001');
});