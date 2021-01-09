//After creating the room, this code will run the room
/*import React, {useRef, useEffect} from 'react'
import io from 'socket.io-client'

const Room = (props) => {
    const userVideo = useRef()
    const partnerVideo = useRef()
    const peerRef = useRef()
    const socketRef = useRef()
    const otherUser = useRef()
    const userStream = useRef()

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
            userVideo.current.srcObject = stream
            userStream.current = stream

            socketRef.current = io.connect('/')     //connect to the socket.io server
            socketRef.current.emit('join room', props.match.params.roomID)

            socketRef.current.on('ohter user', userID => {
                callUser(userID)        //function
                otherUser.current = userID
            })

            socketRef.current.on('user joined', userID => {
                otherUser.current = userID
            })

            socketRef.current.on('offer', handleReciveCall)
            socketRef.current.on('answer', handleAnswer)
            socketRef.current.on('ice-candidate', handleNewICECandidateMsg)
        })
    }, [])  //empty array for dependency array

    function callUser(userID){
        peerRef.current = createPeer(userID)
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current))
    } 

    function createPeer(userID){    //userID: the person who is recieving the call 
        const peer = new RTCPeerConnection({
            iceServers: [       //figure out a proper path for our peer connection -> be able to conncect with each other
                {
                    urls: "stun:stun.stunprotocol.org" 
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        })
        //attach 3 event handler on peer
        peer.onicecandidate = handleICECandidateEvent
        peer.ontrack = handleTrackEvent
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)

        return peer     //function callUser() 의 peerRef 로 들어감
    }

    function handleNegotiationNeededEvent(userID){  //make call
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer)
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit('offer', payload)
        }).catch(e => console.log(e))
    }

    function handleReciveCall(incoming){    //recieve call
        peerRef.current = createPeer();     //call createPeer function
        const desc = new RTCSessionDescription(incoming.sdp)    //description
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach((track => peerRef.current.addTrack(track, userStream.current)))
        }).then(() => {
            return peerRef.current.createAnswer()
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer)
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit('answer', payload)
        })
    }

    function handleAnswer(message){
        const desc = new RTCSessionDescription(message.sdp)
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e)) 
    }

    function handleICECandidateEvent(e){
        if(e.candidate){
            const payload = {
                target: otherUser.current,
                candidate: e.candidate
            }
            socketRef.current.emit('ice-candidate', payload)
        }
    }

    function handleNewICECandidateMsg(incoming){
        const candidate = new RTCIceCandidate(incoming)
        peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
    }

    function handleTrackEvent(e){
        partnerVideo.current.srcObject = e.streams[0];
    }

    return (
        <div>
            <video autoPlay ref={userVideo} />
            <video autoPlay ref={partnerVideo} />
        </div>
    )
}

export default Room*/

import React, { useRef, useEffect } from "react";
import io from "socket.io-client";

const Room = (props) => {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
            userVideo.current.srcObject = stream;
            userStream.current = stream;

            socketRef.current = io.connect("/");
            socketRef.current.emit("join room", props.match.params.roomID);

            socketRef.current.on('other user', userID => {
                callUser(userID);
                otherUser.current = userID;
            });

            socketRef.current.on("user joined", userID => {
                otherUser.current = userID;
            });

            socketRef.current.on("offer", handleRecieveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        });

    }, []);

    function callUser(userID) {
        peerRef.current = createPeer(userID);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }

    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

        return peer;
    }

    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit("offer", payload);
        }).catch(e => console.log(e));
    }

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        })
    }

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];
    };

    return (
        <div>
            <video autoPlay ref={userVideo} />
            <video autoPlay ref={partnerVideo} />
        </div>
    );
};

export default Room;