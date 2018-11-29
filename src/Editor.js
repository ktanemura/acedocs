import React, { Component } from 'react';
import OnlineList from './OnlineList';
import $ from 'jquery';
import diff from 'fast-diff';

class Editor extends Component {
    constructor() {
        super();
        this.state = {
            text: '',
            oldText: '',
            last_position: -1
        };
    }

    handleChange = (e) => {
        let newText = e.target.value;

        let data = diff(this.state.oldText, newText);
        let d = [];
        let index = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === 0) {
                index += data[i][1].length;
            } else if (data[i][0] === 1) {
                d.push([1, data[i][1], index]);
                index += data[i][1].length;
            } else if (data[i][0] === -1) {
                d.push([-1, data[i][1], index]);
            }
        }

        this.props.socket.emit('TextUpdate', d);
        this.setState({
            text: newText,
            oldText: newText
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
            let t = this.state.text;
            let cursor = this.state.last_position;

            // Iterate over all changes made to text
            for (let i = 0; i < data.length; i++) {
                if (data[i][0] === 1) { // String insertion
                    // Move Cursor appropriately
                    if (data[i][2] <= cursor) {
                        cursor += data[i][1].length;
                    }
                    // Insert added string
                    t = t.slice(0, data[i][2]) + data[i][1] + t.slice(data[i][2]);
                } else if (data[i][0] === -1) { // String deletion
                    // Move cursor appropriately
                    if (data[i][2] <= cursor) {
                        cursor -= data[i][1].length;
                    }

                    // Remove string
                    t = t.slice(0, data[i][2]) + t.slice(data[i][2] + data[i][1].length);
                }
            }

            // Update text and position
            this.setState({
                text: t,
                oldText: t,
                last_position: cursor
            }, () => {
                this.setCursorPos($('#editor')[0], cursor);
            });
        });

        this.setState({
            text: this.props.text,
            oldText: this.props.text
        });
        let that = this;
        $('#editor').bind("keydown click focus", function() {
            if (that.cursor_changed($('#editor'))) {
                that.setState({
                    last_position: that.getCursorPosition($('#editor'))
                });
            }
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
                    <textarea id="editor" className="chat" value={this.state.text} onChange={this.handleChange}></textarea>
            </div>
        );
    }
}

export default Editor;