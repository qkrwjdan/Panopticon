import React from "react"
import {Route, Redirect} from "react-router-dom"

function AuthRoute({ authenticated, component: Component, render, ...rest}){
    return(
        <Route
            {...rest}
            render={(props) =>
            authenticated ? (
                render?(
                    render(props)
                ) : (<Component {...props} />)
            ) : (<Redirect to ={{ pathname: "/Login",state: {from:props.location} }} />
            )} />
    )
}

export default AuthRoute