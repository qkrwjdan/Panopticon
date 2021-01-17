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
		// url: 'http://localhost:5005/webhooks/rest/webhook',
		url: 'http://localhost:5000/chat',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
			"message": message,
			"sender": "Me"
		}),
		success: function (data, textStatus) {
			console.log(data)
			if(data != null){
					console.log("set bot response")
					setBotResponse(data);
			}
			console.log("Rasa Response: ", data, "\n Status:", textStatus)
		},
		error: function (errorMessage) {
			console.log('Error' + errorMessage);

		}
	});
}

//------------------------------------ Set bot response -------------------------------------
function setBotResponse(val) {
	setTimeout(function () {

        if (val.hasOwnProperty("text")) { 
            var BotAvatarSrc = "/static/img/botAvatar.png";
            var BotResponse = '<img class="botAvatar" src="' + BotAvatarSrc + '"><p class="botMsg">' + val.text + '</p><div class="clearfix"></div>';
            $(BotResponse).appendTo('.chats').hide().fadeIn(1000);
        }

    scrollToBottomOfResults();

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

