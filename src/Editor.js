import React, { Component } from 'react';
import OnlineList from './OnlineList';
import $ from 'jquery';

class Editor extends Component {
    constructor() {
        super();
        this.state = {
            text: '',
            last_position: -1
        };
    }

    handleChange = e=> {
        this.props.socket.emit('TextUpdate', e.target.value);
        this.setState({
            text: e.target.value
        });
    }

    
    cursor_changed = (element) => {
        var new_position = this.getCursorPosition(element);
        if (new_position !== this.state.last_position) {
            this.state.last_position = new_position;
            return true;
        }
            return false;
    }
    
    setCursorPos = (input, start, end) => {
        if (arguments.length < 3) end = start;
        if ("selectionStart" in input) {
            setTimeout(function() {
                input.selectionStart = start;
                input.selectionEnd = end;
            }, 1);
        }
        else if (input.createTextRange) {
            var rng = input.createTextRange();
            rng.moveStart("character", start);
            rng.collapse();
            rng.moveEnd("character", end - start);
            rng.select();
        }
    }

    getCursorPosition= (element) => {
        var el = $(element).get(0);
        var pos = 0;
        if ('selectionStart' in el) {
            pos = el.selectionStart;
        } else if ('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }

    componentDidMount() {
        this.props.socket.on("UpdateText", data => {
            this.setState({
                text: data
            });
            this.setCursorPos($('#editor'), this.state.last_position);
        });

        this.setState({
            text: this.props.text
        });
        let that = this;
        $('#editor').bind("keydown click focus", function() {
            if (that.cursor_changed($('#editor'))) {
                that.setState({
                    last_position: that.getCursorPosition($('#editor'))
                });
            }
            // console.log(that.cursor_changed($('#editor')));
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
                    <textarea id="editor" class="chat" value={this.state.text} onChange={this.handleChange}></textarea>
            </div>
        );
    }
}

export default Editor;