import React, { useState } from "react";
import './Login.css';
import { Link, Redirect, Route, BrowserRouter as Router } from "react-router-dom"
import { Button, TextField } from "@material-ui/core"

function Login({authenticated, login, location}) {
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")

  const handleClick =() =>{
    try{
      login({email, password})
    } catch(e){
      alert("Failed to login")
      setEmail("")
      setPassword("")
    }
  }

  const {from} = location.state || { from: {pathname: "/"}}
  if(authenticated) return <Redirect to={from} />

  return (
    <header className="Login">
        <h1>Login</h1>
        <head className="Login-center">
          <TextField value={email} onChange={({target: {value }}) => setEmail(value)}
            type="text" label="email" variant="outlined"/>
            <br/>
          <TextField value={password} onChange={({target: { value} }) => setPassword(value)}
            type="password" label="password" variant="outlined"/>
            <br/>
          <Link to="/Supervisor">
            <Button onClick={handleClick} variant="contained">Supervisor LogIn</Button>
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
