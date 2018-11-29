import React, { Component } from 'react'
import UsernameForm from './UsernameForm'
import ServerForm from './ServerForm'
import Editor from './Editor'

import socketIOClient from "socket.io-client";

class App extends Component {
    state = {
        currentUsername: null,
        currentId: null,
        currentScreen: 'serverForm',
        server: "",
        error: '',
        text: '',
        users: null,
        socket: null
    }

    onServerSubmitted = (server) => {
        let socket = socketIOClient(server);

        socket.on("UsernameSuccess", data => {
            this.setState({
                currentId: data.name,
                currentUsername: data.name,
                users: data.users,
                text: data.text,
                currentScreen: 'editor'
            });
        });

        socket.on("UsernameError", data => {
            this.setState({
                error: data
            });
        });

        socket.on("UsernameUpdate", data => {
            this.setState({
                users: data
            });
        });

        this.setState({
            socket: socket,
            server: server,
            currentScreen: 'usernameForm'
        });
    }

    onUsernameSubmitted = (username) => {
        const { socket } = this.state;

        socket.emit("SetUsername", username);
    }


    render() {
        if (this.state.currentScreen === 'serverForm') {
            return <ServerForm handleSubmit={this.onServerSubmitted} error={this.state.error}/>
        }
        if (this.state.currentScreen === 'usernameForm') {
            return <UsernameForm handleSubmit={this.onUsernameSubmitted} error={this.state.error}/>
        }
        
        if (this.state.currentScreen === 'editor') {
            return <Editor socket={this.state.socket} currentId={this.state.currentId} users={this.state.users} text={this.state.text}></Editor>
        }
    }
}

export default App