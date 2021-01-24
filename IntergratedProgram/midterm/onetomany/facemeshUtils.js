let model, videoWidth, videoHeight, video;
let faceState, pupilState;

faceState = document.getElementById("faceState");
pupilState = document.getElementById("pupilState");

var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var audioStream = null;
var sampleRate = 44100;
var context = null;
var analyser = null;
var filter = 0;
var bufferSize = 2048;
var numberOfInputChannels = 2;
var numberOfOutputChannels = 2;

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

const VIDEO_SIZE = 500;
const mobile = isMobile();
const state = {
    backend: 'webgl',
    maxFaces: 2,
    triangulateMesh: true,
    predictIrises: true
};


function colorPids(vol) {

    let all_pids = $('.pid');
    let amout_of_pids = Math.round(vol / 10);
    let elem_range = all_pids.slice(0, amout_of_pids)

    for (var i = 0; i < all_pids.length; i++) {
        all_pids[i].style.backgroundColor = "#e6e7e8";
    }

    for (var i = 0; i < elem_range.length; i++) {
        elem_range[i].style.backgroundColor = "#69ce2b";
    }
    document.getElementById('vol').innerHTML = 'vol=' + vol;
    if (vol > 25) {
        totalScore = totalScore + 0.1;
    }
    if (totalScore < 0) {
        totalScore = 0;
    } else if (totalScore > 100) {
        totalScore = 100
    }
    console.log('부정행위점수', totalScore);
    document.getElementById('score').innerHTML = '부정행위점수=' + totalScore;


}

const detectFaceRotate = (C1, C2) => {
    const XDiff = C1[0] - C2[0];
    const YDiff = C1[1] - C2[1];

    if (XDiff < -10) {
        // facing left
        console.log("left");
        totalScore = totalScore + 2.5;
        faceState.innerHTML = "face left";

    } else if (XDiff > -10 && XDiff < 10) {
        // facing front
        console.log("front");
        totalScore = totalScore - 0.5;
        faceState.innerHTML = "face front";

    } else if (XDiff > 10) {
        // facing right
        console.log("right");
        totalScore = totalScore + 2.5;
        faceState.innerHTML = "face right";
    }

    if (YDiff > 0) {
        console.log("Looking up");
        totalScore = totalScore + 2.5;
    }

}

function flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

const detectPupilMoving = (LEC, REC, LPC, RPC) => {

    var leftEyeXDiff = LPC[0] - LEC[0];
    var leftEyeYDiff = LPC[1] - LEC[1];

    var rightEyeXDiff = RPC[0] - REC[0];
    var rightEyeYDiff = RPC[1] - REC[1];

    if ((leftEyeXDiff + rightEyeXDiff) < -5) {
        console.log("eye right");
        pupilState.innerHTML = "Pupil right";
        totalScore = totalScore + 2.5;
    } else if ((leftEyeXDiff + rightEyeXDiff) > 5) {
        console.log("eye left");
        pupilState.innerHTML = "Pupil left";
        totalScore = totalScore + 2.5;
    } else {
        console.log("eye center");
        pupilState.innerHTML = "Pupil center";
        totalScore = totalScore - 0.5;
    }

    if ((leftEyeYDiff + rightEyeYDiff) < -15) {
        console.log("eye looking up");
        totalScore = totalScore + 2.5;
    }

}

async function setupCamera() {
    video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': true,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: mobile ? undefined : VIDEO_SIZE,
            height: mobile ? undefined : VIDEO_SIZE
        },
    });

    //video setting
    video.srcObject = stream;
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    //audio setting

    // creates the audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    // creates an audio node from the microphone incoming stream
    audioStream = context.createMediaStreamSource(stream);

    // bufferSize: the onaudioprocess event is called when the buffer is full
    if (context.createScriptProcessor) {
        recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    } else {
        recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    }

    recorder.onaudioprocess = function(e) {

        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += (array[i]);
        }

        var average = values / length;

        // console.log(Math.floor(average));
        colorPids(average);

        filter = (filter * 0.8) + (average * 0.2);

        if (filter > 30) {
            console.log("부정행위 경고");
        }
    }

    audioStream.connect(analyser);
    analyser.connect(recorder);
    recorder.connect(context.destination);
}

async function main() {

    model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, { maxFaces: state.maxFaces });

    const face = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: state.predictIrises
    });

    console.log("============");
    if (face.length == 1) {

        var D1 = face[0].scaledMesh[454];
        var D2 = face[0].scaledMesh[234];
        var D3 = face[0].scaledMesh[10];
        var D4 = face[0].scaledMesh[152];

        var C1 = [(D1[0] + D2[0]) / 2, (D1[1] + D2[1]) / 2];
        var C2 = [(D3[0] + D4[0]) / 2, (D3[1] + D4[1]) / 2];

        detectFaceRotate(C1, C2);

        var P1 = face[0].scaledMesh[469];
        var P2 = face[0].scaledMesh[468];
        var P3 = face[0].scaledMesh[471];

        var P4 = face[0].scaledMesh[476];
        var P5 = face[0].scaledMesh[473];
        var P6 = face[0].scaledMesh[474];

        var LPC = [(P1[0] + P2[0] + P3[0]) / 3, (P1[1] + P2[1] + P3[1]) / 3]
        var RPC = [(P4[0] + P5[0] + P6[0]) / 3, (P4[1] + P5[1] + P6[1]) / 3]

        var RE2 = face[0].scaledMesh[244];
        var RE4 = face[0].scaledMesh[226];

        var LE2 = face[0].scaledMesh[446];
        var LE4 = face[0].scaledMesh[464];

        var LEC = [(LE2[0] + LE4[0]) / 2, (LE2[1] + LE4[1]) / 2]
        var REC = [(RE2[0] + RE4[0]) / 2, (RE2[1] + RE4[1]) / 2]

        detectPupilMoving(LEC, REC, LPC, RPC);
    } else if (face.length >= 2) {
        console.log("***************");
        console.log("face > 2")
        console.log("***************");
    } else if (face.length == 0) {
        console.log("***************");
        console.log("no face!!!!")
        console.log("***************");
    }

    console.log("============")

};

annyang.setLanguage('ko');
annyang.start({
    autoRestart: true,
    continuous: true
})
var recognition = annyang.getSpeechRecognizer();
var final_transcript = '';
recognition.interimResults = true;
recognition.onresult = function(event) {
    var interim_transcript = '';
    final_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
            console.log("final_transcript=" + final_transcript);
            //annyang.trigger(final_transcript); //If the sentence is "final" for the Web Speech API, we can try to trigger the sentence
        } else {
            interim_transcript += event.results[i][0].transcript;
            console.log("interim_transcript=" + interim_transcript);
        }
    }
    document.getElementById('result').innerHTML = '텍스트=' + final_transcript;
};

const runFacemesh = async() => {
    await setupCamera();
    setInterval(() => {
        main();
    }, 1000);
}




runFacemesh();