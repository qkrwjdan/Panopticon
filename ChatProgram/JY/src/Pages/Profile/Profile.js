import React from "react"
import './Profile.css';
import { Typography } from "@material-ui/core"

function Profile({user}) {
    const { email, password, name } = user || {};
    return(
        <header className="Pro">
            <h1>Profile</h1>
            <head className="Pro-center">
                <Typography variant="h4">Name : {name}</Typography>
                <Typography variant="h4">Email : {email}</Typography>
                <Typography variant="h4">Password : {password}</Typography>
                {/* <dt>Email</dt>
                <dd>{email}</dd>
                <dt>password</dt>
                <dd>{password}</dd>
                <dt>Name</dt>
                <dd>{name}</dd> */}
            </head>
        </header>
    );
}

export default Profile