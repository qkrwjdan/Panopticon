//Creating a Room
import React from 'react'
import {v1 as uuid} from 'uuid'

const CreateRoom = (props) => {
    function create() {
        const id = uuid();                      //create an id(roomID)
        props.history.push(`/room/${id}`)       //id will represent the room
    }
    return (
        <button onClick={create}>Create Room</button>
    )
}

export default CreateRoom