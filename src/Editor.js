import React, { Component } from 'react';
import OnlineList from './OnlineList';

class Editor extends Component {
    constructor() {
        super();
        this.state = {
            text: '',
        };
    }

    handleChange = e=> {
        this.props.socket.emit('TextUpdate', e.target.value);
        this.setState({
            text: e.target.value
        });
    }

    componentDidMount() {
        this.props.socket.on("UpdateText", data => {
            this.setState({
                text: data
            });
        });

        this.setState({
            text: this.props.text
        });
    }

    render() {
        return (
            <div className="wrapper">
                <div>
                    <OnlineList
                        currentId={this.props.currentId}
                        users={this.props.users}
                    />
                </div>
                <div>
                    <textarea class="chat" value={this.state.text} onChange={this.handleChange}></textarea>
                </div>
            </div>
        );
    }
}

export default Editor;