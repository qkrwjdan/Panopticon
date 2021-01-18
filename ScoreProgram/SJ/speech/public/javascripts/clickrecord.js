// on input/text enter--------------------------------------------------------------------------------------
$('.usrInput').on('keyup keypress', function (e) {
	var keyCode = e.keyCode || e.which;
	var text = $(".usrInput").val();
	if (keyCode === 13) {
		if (text == "" || $.trim(text) == '') {
			e.preventDefault();
			return false;
		} else {
			$(".usrInput").blur();
			setUserResponse(text);
			send(text);
			e.preventDefault();
			return false;
		}
	}
});


//------------------------------------- Set user response------------------------------------
function setUserResponse(val) {

	// var userAvatarSrc = "{{ url_for('static',filename='/img/userAvatar.jpg') }}"
	var userAvatarSrc = "/static/img/userAvatar.jpg";
	var UserResponse = '<img class="userAvatar" src="' + userAvatarSrc + '"><p class="userMsg">' + val + ' </p><div class="clearfix"></div>';
	$(UserResponse).appendTo('.chats').show('slow');
	$(".usrInput").val('');
	scrollToBottomOfResults();
	$('.suggestions').remove();
}

//---------------------------------- Scroll to the bottom of the chats-------------------------------
function scrollToBottomOfResults() {
	var terminalResultsDiv = document.getElementById('chats');
	terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
}

function send(message) {
	console.log("User Message:", message)
	$.ajax({
		url: 'http://localhost:5005/webhooks/rest/webhook',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
			"message": message,
			"sender": "Me"
		}),
		success: function (data, textStatus) {
			if(data != null){
					setBotResponse(data);
			}
			console.log("Rasa Response: ", data, "\n Status:", textStatus)
		},
		error: function (errorMessage) {
			setBotResponse("");
			console.log('Error' + errorMessage);

		}
	});
}

//------------------------------------ Set bot response -------------------------------------
function setBotResponse(val) {
	setTimeout(function () {
		if (val.length < 1) {
			//if there is no response from Rasa
			msg = 'I couldn\'t get that. Let\' try something else!';

			// var BotAvatarSrc = "{{ url_for('static',filename='img/botAvatar.png') }}"
			var BotAvatarSrc = "/static/img/botAvatar.png";
			var BotResponse = '<img class="botAvatar" src="' + BotAvatarSrc + '"><p class="botMsg">' + msg + '</p><div class="clearfix"></div>';
			$(BotResponse).appendTo('.chats').hide().fadeIn(1000);

		} else {
			//if we get response from Rasa
			for (i = 0; i < val.length; i++) {
				//check if there is text message
				if (val[i].hasOwnProperty("text")) { 
					// var BotAvatarSrc = "{{ url_for('static',filename='img/botAvatar.png') }}"
					var BotAvatarSrc = "/static/img/botAvatar.png";
					var BotResponse = '<img class="botAvatar" src="' + BotAvatarSrc + '"><p class="botMsg">' + val[i].text + '</p><div class="clearfix"></div>';
					$(BotResponse).appendTo('.chats').hide().fadeIn(1000);
				}

			}
			scrollToBottomOfResults();
		}

	}, 500);
}

// ------------------------------------------ Toggle chatbot -----------------------------------------------
$('#profile_div').click(function () {
	$('.profile_div').toggle();
	$('.widget').toggle();
	scrollToBottomOfResults();
});

$('#close').click(function () {
	$('.profile_div').toggle();
	$('.widget').toggle();
});


// ------------------------------------------ Suggestions -----------------------------------------------

function addSuggestion(textToAdd) {
	setTimeout(function () {
		var suggestions = textToAdd;
		var suggLength = textToAdd.length;
		$(' <div class="singleCard"> <div class="suggestions"><div class="menu"></div></div></diV>').appendTo('.chats').hide().fadeIn(1000);
		// Loop through suggestions
		for (i = 0; i < suggLength; i++) {
			$('<div class="menuChips" data-payload=\''+(suggestions[i].payload)+'\'>' + suggestions[i].title + "</div>").appendTo(".menu");
		}
		scrollToBottomOfResults();
	}, 1000);
}


// on click of suggestions, get the value and send to rasa
$(document).on("click", ".menu .menuChips", function () {
	var text = this.innerText;
	var payload= this.getAttribute('data-payload');
	console.log("button payload: ",this.getAttribute('data-payload'))
	setUserResponse(text);
	send(payload);
	$('.suggestions').remove(); //delete the suggestions 
});

// ------------------------------------------ Realtime Audio -----------------------------------------------

function colorPids(vol) {

    let all_pids = $('.pid');
    let amout_of_pids = Math.round(vol/10);
    let elem_range = all_pids.slice(0, amout_of_pids)
    
    for (var i = 0; i < all_pids.length; i++) {
        all_pids[i].style.backgroundColor="#e6e7e8";
    }
    
    for (var i = 0; i < elem_range.length; i++) {
        // console.log(elem_range[i]);
        elem_range[i].style.backgroundColor="#69ce2b";
    }
    
}

// audio recording

// var startRecordingButton = document.getElementById("startRecordingButton");
// var stopRecordingButton = document.getElementById("stopRecordingButton");
// var playButton = document.getElementById("playButton");
// var downloadButton = document.getElementById("downloadButton");
// var postButton = document.getElementById("postButton");
var audioController = document.getElementById("audioController");

var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;
var analyser = null;
var filter = 0;
var bufferSize = 2048;
var numberOfInputChannels = 2;
var numberOfOutputChannels = 2;
var record_status = false;


//web page loaded.
navigator.mediaDevices.getUserMedia({ audio: true })
.then(function(e) {
    console.log("user consent");

    // creates the audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    // creates an audio node from the microphone incoming stream
    mediaStream = context.createMediaStreamSource(e);

    // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
    // bufferSize: the onaudioprocess event is called when the buffer is full
    if (context.createScriptProcessor) {
        recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    } else {
        recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    }

    recorder.onaudioprocess = function (e) {
        console.log("web page load onaudioprocess");

        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += (array[i]);
        }

        var average = values / length;

        // console.log(Math.round(average));
        colorPids(average);

        filter = (filter * 0.8) + (average * 0.2);
        // console.log("filter : " + filter);

        if(filter > 30 && record_status == true){
            console.log("create record start event");
            var event = new Event('record_start');
            audioController.dispatchEvent(event);
        }
    }

    mediaStream.connect(analyser);
    analyser.connect(recorder);
    recorder.connect(context.destination);
    });

//record_start event occurred
audioController.addEventListener("record_start",function(){
    
    recorder.onaudioprocess = function (e) {
        console.log("record_start_onaudioprocess");

        leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
        recordingLength += bufferSize;

        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += (array[i]);
        }

        var average = values / length;

        // console.log(Math.round(average));
        colorPids(average);

        filter = (filter * 0.8) + (average * 0.2);
        // console.log("filter : " + filter);

        if(filter < 10){
            console.log("create record end event");
            var event = new Event('record_end');
            audioController.dispatchEvent(event);
        }
    }
});

audioController.addEventListener("record_end",function(){
    console.log("record end");
    recorder.disconnect(context.destination);
    analyser.disconnect(recorder);
    mediaStream.disconnect(analyser);
    filter = 0;

    // we flat the left and right channels down
    // Float32Array[] => Float32Array
    var leftBuffer = flattenArray(leftchannel, recordingLength);
    var rightBuffer = flattenArray(rightchannel, recordingLength);
    // we interleave both channels together
    // [left[0],right[0],left[1],right[1],...]
    var interleaved = interleave(leftBuffer, rightBuffer);

    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final blob
    blob = new Blob([view], { type: 'audio/wav' });
    sendWav(blob);
    leftchannel = [];
    rightChannel = [];

    recorder.onaudioprocess = function (e) {

        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += (array[i]);
        }

        var average = values / length;

        // console.log(Math.round(average));
        colorPids(average);

        filter = (filter * 0.8) + (average * 0.2);
        // console.log("filter : " + filter);

        if(filter > 30 && record_status == true){
            console.log("create record start event");
            var event = new Event('record_start');
            audioController.dispatchEvent(event);
        }
    }

    mediaStream.connect(analyser);
    analyser.connect(recorder);
    recorder.connect(context.destination);
});

function sendWav(blob) {
    
    if (blob == null) {
        return;
    }

    console.log("Post");
    var file = new File([blob],"test.wav")

    var fd = new FormData();
    fd.append('fname', 'test.wav');
    fd.append('file', file);

    $.ajax({
        url: 'http://localhost:5000/realtime/',
        type:'POST',
        contentType: false,
        processData: false,
        data: fd,
        success: function (data, textStatus) {
            console.log(data)
            if(data != null){
                setUserResponse(data);
                console.log("hi")
            }
            console.log("google STT : ", data, "\n Status:", textStatus)
        },
        error: function (errorMessage) {
            setUserResponse("");
            console.log('Error' + errorMessage);
        }
    }).done(function(data){
        console.log(data);
    });
    
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

function writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
var count = 0;

// ---------------------------------------------- record controller -----------------------------------------------
audioController.addEventListener("click",function(e){
    console.log(audioController.style.color);
    console.log(count);

    if(count % 2 == 0){
        record_status = false;
        audioController.style.color = "white";
    }
    else{
        record_status = true;
        audioController.style.color = "black";
    }
    console.log(record_status);

    count += 1;

})