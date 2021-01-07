import React from "react";
import './Login.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import { Button } from "@material-ui/core"

function Login() {
  return (
    <header className="Login">
        <h1>Login</h1>
        <head className="Login-center">
        <Link to="/Supervisor">
          <Button variant="contained">Supervisor LogIn</Button>
        </Link>
        <br/>
        <Link to="/Student">
          <Button variant="contained">Student LogIn</Button>
        </Link>
        </head>
        <body className="Login-bottom">
        </body>
    </header>
  );
}

export default Login;
