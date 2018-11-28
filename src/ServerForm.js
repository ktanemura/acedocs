import React, { Component } from 'react';
import { TextInput } from 'react-desktop/macOs';
import { Button } from 'react-desktop/macOs';

class ServerForm extends Component {
    constructor() {
        super();
        this.state = {
            server: 'http://127.0.0.1:3001',
        };
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.handleSubmit(this.state.server);
    }

    handleChange = e => {
        this.setState({
            server: e.target.value
        });
    }


    render() {
        return (
            <div className="server-form">
              <form onSubmit={this.handleSubmit}>
                <div>
                   <TextInput
                    label="Server:"
                    value={this.state.server}
                    onChange={this.handleChange}
                  />
                </div>
                <div>
                  <Button color="blue" type="submit">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
        )
    }

}

export default ServerForm;