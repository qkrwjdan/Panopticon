import React,{useRef} from "react";
import './SupMeeting.css';
import { Link, Route, BrowserRouter as Router } from "react-router-dom"
import { Button } from "@material-ui/core"

import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh"
import WebCam from "react-webcam"
import {drawMesh} from "../.././utilities"

function SupMeeting() {
    //setup References
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

      //load facemesh
    const runFacemesh = async() =>{
        const net = await facemesh.load({
            inputResolution:{width:640,height:480}, scale:0.8
        });
        setInterval(() => {
            detect(net)
        },100)
    }
    
    //Detect function
    const detect = async (net) => {
        if( typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState===4){
        
        // Get Video property
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        
        // Set Video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        // Set Canvas width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // Make detections
        const face = await net.estimateFaces(video);
        console.log(face)

        // Get Canvas context for drawing
        const ctx = canvasRef.current.getContext("2d");
        drawMesh(face,ctx);

        }
    }

    runFacemesh();

    return (
        <header className="Meeting">
            <h1>SUP</h1>
            <head className="Meeting-center">
            <WebCam ref = {webcamRef} style={
                {
                    position : "absolute",
                    marginLeft : "auto",
                    marginRight : "auto",
                    left : 0,
                    right : 0,
                    textAlign : "center",
                    zIndex : 9,
                    width : 640,
                    height : 480,
                }
            }/>
            <canvas ref = {canvasRef}
                style = {
                {
                    position : "absolute",
                    marginLeft : "auto",
                    marginRight : "auto",
                    left : 0,
                    right : 0,
                    textAlign : "center",
                    zIndex : 9,
                    width : 640,
                    height : 480,
                }
            }/>

            </head>
            <body className="Meeting-bottom">
            </body>
        </header>
    );
}

export default SupMeeting;