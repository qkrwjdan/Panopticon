let model, videoWidth, videoHeight, video, canvas;
let faceState, pupilState;

faceState = document.getElementById("faceState");
pupilState = document.getElementById("pupilState");

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

const VIDEO_SIZE = 500;
const mobile = isMobile();
const state = {
  backend: 'webgl',
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: true
};

const detectFaceRotate = (C1,C2) => {
  const XDiff = C1[0] - C2[0];
  const YDiff = C1[1] - C2[1];

  if( XDiff < -10 ){
    // facing left
    console.log("left");
    faceState.innerHTML = "left";

  }else if( XDiff > -10 && XDiff < 10){
    // facing front
    console.log("front");
    faceState.innerHTML = "front";

  }else if( XDiff > 10){
    // facing right
    console.log("right");
    faceState.innerHTML = "right";
  }

  if(YDiff > 0){
    console.log("Looking up");
  }

}

const detectPupilMoving = (LEC,REC,LPC,RPC) =>{

  var leftEyeXDiff = LPC[0] - LEC[0];
  var leftEyeYDiff = LPC[1] - LEC[1];

  var rightEyeXDiff = RPC[0] - REC[0];
  var rightEyeYDiff = RPC[1] - REC[1];

  if( (leftEyeXDiff + rightEyeXDiff) < -4 ){
    console.log("eye right");
    pupilState.innerHTML = "right";
  }
  else if ((leftEyeXDiff + rightEyeXDiff) > 4){
    console.log("eye left");
    pupilState.innerHTML = "left";
  }
  else{
    console.log("eye center");
    pupilState.innerHTML = "center";
  }

  if((leftEyeYDiff + rightEyeYDiff) < -15){
    console.log("eye looking up");
  }

}

async function setupCamera() {
    video = document.getElementById('video');
  
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        // Only setting the video to a specified size in order to accommodate a
        // point cloud, so on mobile devices accept the default size.
        width: mobile ? undefined : VIDEO_SIZE,
        height: mobile ? undefined : VIDEO_SIZE
      },
    });
    video.srcObject = stream;
  
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
}

async function main() {
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;
  
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {maxFaces: state.maxFaces});

    const face = await model.estimateFaces({
      input: video,
      returnTensors: false,
      flipHorizontal: false,
      predictIrises: state.predictIrises
    });

    console.log("============");
    if(face.length == 1){

      var D1 = face[0].scaledMesh[454];
      var D2 = face[0].scaledMesh[234];
      var D3 = face[0].scaledMesh[10];
      var D4 = face[0].scaledMesh[152];

      var C1 = [(D1[0] + D2[0]) / 2, (D1[1] + D2[1]) / 2];
      var C2 = [(D3[0] + D4[0]) / 2, (D3[1] + D4[1]) / 2];

      detectFaceRotate(C1,C2);
      
      var P1 = face[0].scaledMesh[469];
      var P2 = face[0].scaledMesh[468];
      var P3 = face[0].scaledMesh[471];

      var P4 = face[0].scaledMesh[476];
      var P5 = face[0].scaledMesh[473];
      var P6 = face[0].scaledMesh[474];

      var LPC = [(P1[0] + P2[0] + P3[0])/3, (P1[1] + P2[1] + P3[1])/3 ]
      var RPC = [(P4[0] + P5[0] + P6[0])/3, (P4[1] + P5[1] + P6[1])/3 ]

      var RE2 = face[0].scaledMesh[244];
      var RE4 = face[0].scaledMesh[226];

      var LE2 = face[0].scaledMesh[446];
      var LE4 = face[0].scaledMesh[464];

      var LEC = [(LE2[0] + LE4[0]) / 2,(LE2[1] + LE4[1]) / 2]
      var REC = [(RE2[0] + RE4[0]) / 2,(RE2[1] + RE4[1]) / 2]

      detectPupilMoving(LEC,REC,LPC,RPC);
    }
    else if(face.length >= 2){
      console.log("***************");
      console.log("face > 2")
      console.log("***************");
    }
    else if(face.length == 0){
      console.log("***************");
      console.log("no face!!!!")
      console.log("***************");
    }

    console.log("============")

  };

const runFacemesh = async() =>{
  await setupCamera();
  setInterval(() => {
    main();
  },1000);
}
runFacemesh();