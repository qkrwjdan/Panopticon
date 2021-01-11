import React from "react"
import { withRouter } from "react-router-dom"

import { Button } from "@material-ui/core"

function LogoutButton({ logout, history }) {
    const handleClick = () => {
        logout()
        history.push("/")
    }
    return <Button onClick={handleClick}>Logout</Button>
}

export default withRouter(LogoutButton)