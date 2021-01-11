import React from "react";
import './JoinUs.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import { Button, TextField } from "@material-ui/core"

function JoinUs() {
    return (
        <header className="JoinUs">
            <h1>JoinUs</h1>
        <head className="JoinUs-center">
            <h2>모든 정보를 기입해주세요.</h2>
            <TextField label="email" variant="outlined"/ >
            {/* <TextField value={email} onChange={({target: {value }}) => setEmail(value)}
                type="text" label="email" variant="outlined"/> */}
            <br/>
            <TextField label="password" variant="outlined"/ >
            {/* <TextField value={password} onChange={({target: { value} }) => setPassword(value)}
                type="password" label="password" variant="outlined"/> */}
            <br/>
            <TextField label="password Check" variant="outlined"/ >
            <br/>
            <TextField label="username" variant="outlined"/ >
            <br/>
            <TextField label="Student ID" variant="outlined"/ >
            <br/>
            <Link to="/Login">
                <Button variant="contained">Join Us!</Button>
            </Link>
        </head>
        <body className="JoinUs-bottom">
            <Link to="/Login">
                <Button>Already Signed Up?</Button>
            </Link>
        </body>
    </header>
    );
  }
  
  export default JoinUs;