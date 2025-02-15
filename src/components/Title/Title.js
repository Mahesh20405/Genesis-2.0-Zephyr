import React, { Component } from 'react';
import './Title.css';

class Title extends Component {
    constructor(props) {
        super(props);
        this.state = {
            postreq: '',
            postres: ''
        }
    }

    render() {
        return (
            <div className="title">
                <div className="main-title">
                    <h3><b>HCR Using Custom MM Framework</b></h3>
                    <h5>-Web Interface for Testing Handwritten Characters and Words Prediction-</h5>
                </div>
            </div>
        )
    }
}

export default Title;
