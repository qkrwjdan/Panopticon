import React, { useState, useEffect } from "react"
import './App.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import Home from "./Pages/Home"
import Login from "./Pages/Login/Login"
import JoinUs from "./Pages/JoinUs/JoinUs"
import Student from "./Pages/Student/Student"
import StuMeeting from "./Pages/StuMeeting/StuMeeting"
import Supervisor from "./Pages/Supervisor/Supervisor"
import SupMeeting from "./Pages/SupMeeting/SupMeeting"
import Profile from "./Pages/Profile/Profile"
import { signIn } from './auth'
import AuthRoute from "./AuthRoute"
import LogoutButton from "./LogoutButton"

import { Button } from "@material-ui/core"

function App() {
  const [user, setUser] = useState(null);
  const authenticated = user != null;

  const login = ({email, password}) => setUser(signIn({email,password}));
  const logout = () => setUser(null);

  return (
    <Router>
      <header className="App-body">
        {authenticated ? (<LogoutButton logout={logout} /> ) : (
          <Link to="/Login">
            <Button>Login</Button>
          </Link>
        )}
        <Link to="/JoinUs">
          <Button>JoinUs</Button>
        </Link>
        <Link to="/Profile">
          <Button>Profile</Button>
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
        <AuthRoute
          authenticated={authenticated}
          path="/Profile"
          render={props=><Profile user={user} {...props} />}
        />
        <Route exact path="/" component={Home} />
        <Route path="/Login" render={props => (<Login authenticated={authenticated} login={login} {...props}/>
        )} />
        {/* <Route path="/Login" component={Login} /> */}
        <Route path="/JoinUs" component={JoinUs} />
        <Route path="/Student" component={Student} />
        <Route path="/Supervisor" component={Supervisor} />
        <Route path="/SupMeeting" component={SupMeeting} />
        <Route path="/StuMeeting" component={StuMeeting} />
        <Route path="/Profile" component={Profile} />
      </main>
    </Router>
  );
}

export default App;
