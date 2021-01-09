import React from "react";
import './JoinUs.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import { Button } from "@material-ui/core"

function JoinUs() {
    return (
        <header className="JoinUs">
            <h1>JoinUs</h1>
            <head className="JoinUs-center">
                <Link to="/Login">
                    <Button variant="contained">Join Us!</Button>
                </Link>
            </head>
            <body className="JoinUs-bottom">
            </body>
    </header>
    );
  }
  
  export default JoinUs;