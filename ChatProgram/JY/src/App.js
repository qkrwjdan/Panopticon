import React from "react"
import './App.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import Home from "./Pages/Home"
import Login from "./Pages/Login/Login"
import JoinUs from "./Pages/JoinUs/JoinUs"
import Student from "./Pages/Student/Student"
import StuMeeting from "./Pages/StuMeeting/StuMeeting"
import Supervisor from "./Pages/Supervisor/Supervisor"
import SupMeeting from "./Pages/SupMeeting/SupMeeting"

import { Button } from "@material-ui/core"

function App() {
  return (
    <Router>
      <header className="App-body">
        <Link to="/Login">
          <Button>Login</Button>
        </Link>
        <Link to="/JoinUs">
          <Button>JoinUs</Button>
        </Link>
      </header>
      <body className="App-header">
        <Link to="/">
          <Button size="large" disableRipple>
            <h1>Panopticon</h1>
          </Button>
        </Link>
      </body>
      <main>
        <Route exact path="/" component={Home} />
        <Route path="/Login" component={Login} />
        <Route path="/JoinUs" component={JoinUs} />
        <Route path="/Student" component={Student} />
        <Route path="/Supervisor" component={Supervisor} />
        <Route path="/SupMeeting" component={SupMeeting} />
        <Route path="/StuMeeting" component={StuMeeting} />
      </main>
    </Router>
  );
}

export default App;
