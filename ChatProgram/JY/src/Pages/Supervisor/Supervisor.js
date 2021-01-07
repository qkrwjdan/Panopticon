import React from "react";
import './Supervisor.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import { Button } from "@material-ui/core"

function Supervisor() {
    return (
        <header className="Supervisor">
            <h1>정지영 감독자님 환영합니다.</h1>
            <head className="Super-center">
                <Link to="/SupMeeting">
                    <Button variant="contained" size="large">Open Meeting Room</Button>
                </Link>
                <br/>
                <Link to="/Student">
                    <Button variant="contained" size="large">Watching past Meetings</Button>
                </Link>
            </head>
            <body className="Super-bottom">
            </body>
        </header>
      );
  }
  export default Supervisor;