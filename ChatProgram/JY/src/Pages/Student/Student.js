import React from "react";
import './Student.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import { Button } from "@material-ui/core"

function Student() {
    return (
        <header className="Student">
            <h1>정지영 응시자님 환영합니다.</h1>
            <head className="Stu-center">
                <Link to="/StuMeeting">
                    <Button variant="contained" size="large">Participate in Meeting Room</Button>
                </Link>
            </head>
            <body className="Stu-bottom">
            </body>
        </header>
      );
  }
  
  export default Student;