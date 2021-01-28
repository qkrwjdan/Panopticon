var config = {
    openSocket: function(config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]|host|view/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });
        
        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function(media) {  //진행중
      
        var video = media.video;
        // video.setAttribute('controls', true);
        
        if(userInfo.job=="professor") {
            $(".notVisit:first").before("<div class='video_content'></div>");
            $(".notVisit").remove(String("."+media.response.studentName));
        }
        else {
            $(".videos").append("<div class='video_content'></div>");
        }
        video_content = document.getElementsByClassName("video_content");

        
        var index = video_content.length - 1;
        var id = "peer_video" + index.toString();
        video.setAttribute("class","peer_video");
        video.id = id;
        if (userInfo.job == "professor"){
            video.setAttribute("onClick","clickevent_peer_video(this.id)");
        }

        // video_content[index].setAttribute("id", id);
        video_content[index].insertBefore(video, video_content[index].firstChild);
        $(".video_content:last").addClass(String(index));

        if (userInfo.job == "professor") {
            var user_name = "<div class='name "+ index +"' style='opacity:0'>"+media.response.studentName+"</div>"
            $(".video_content:last").append(user_name);
            $(".video_content:last").append("<div class='flex_container "+ index + "'></div>");
        
            var btn_warn = "<button class='video_btn "+index+ "' onclick='warning_event(this.classList)' style='opacity:0'>경고</button>";
            var btn_kick = "<button class='video_btn " + index + "' onclick='kick_event(this.classList)' style='opacity:0'>강퇴</button>";
            var btn_ban_chat = "<button class='video_btn " + index +"' onclick='ban_chat_event(this.classList)' style='opacity:0'>채팅금지</button>";
            $(".flex_container:last").append(btn_warn);
            $(".flex_container:last").append(btn_kick);
            $(".flex_container:last").append(btn_ban_chat);
        }
        if(userInfo.job == "student"){
            obj = { 
                "type" : "name",
                "name" : userInfo.name,
            };
            obj = JSON.stringify(obj);
            peerConnections[0].channel.send(obj);
        }
        video.play();
        //rotateVideo(video);
    },
    onRoomFound: function(room) {

        if(document.getElementById("job").innerText == "professor") return;
        
        document.getElementById("no_class").style.display="none";
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        console.log("room founded");

        // tr.onclick = async function() {
        //   console.log("tr click");
        //   tr = this;
        //   captureUserMedia(function() {
        //       broadcastUI.joinRoom({
        //           roomToken: tr.querySelector('.join').id,
        //           joinUser: tr.id,
        //           studentName: userInfo.name
        //       });
        //   });

        //   hideUnnecessaryStuff();
        // };

        var html = '<div class="column">' +
                  '<div style="width:100%">' +
                      '<div class="container">' +
                          '<h1 style="color:black">미팅 참여 요청</h1>' + '<br></br>' +
                          '<h2 style="color:black">'+room.professorName+' 교수님</h2>' +
                          '<h2 style="color:black">'+room.roomName+'</h2>' +
                          '<h2 style="color:black">'+room.description+'</h2>' +
                          '<h2 style="color:black">미팅시간 : '+room.meetingTime+'</h2>' + '<br>' +
                          '<h2><button id="join_btn" class="button">화상회의 참여</button></h2>' +
                      '</div>'+
                  '</div>' +
                  '</div>';
        $('.slides').append(html);

        var join_btn = document.getElementById('join_btn');
        join_btn.setAttribute('id', room.broadcaster);

        var userEmail = document.getElementById("userEmail").innerText;

        join_btn.onclick = async function() {
            var count = 0;
            for(var i = 0; i < room.selected_students.length; i++, count++) {
                //초대된 학생이면 통과
                if(room.selected_students[i] == userEmail) {
                break;
                }
                //초대되지 않은 학생이면 입장 거부
                if(count == room.selected_students.length - 1) {
                alert("허용되지 않은 사용자입니다.");
                return;
                }
            }
            join_btn = this;
            captureUserMedia(function() {
                    broadcastUI.joinRoom({
                        roomToken: tr.querySelector('.join').id,
                        joinUser: tr.id
                    });
                });

            hideUnnecessaryStuff();
         };
    },
    onChannelMessage: function (event) {
        data = JSON.parse(event.data);
        if(data.type){
            switch(data.type){

                case "chat" :
                get_chat(data);
                break;
                
                case "leave_request" :
                receive_leave_offer(data.name);
                break;
                
                case "question" :
                recevie_question(data.name)
                break;

                case "name":
                peer_name[peer_name.length] = data.name;
                break;
            }
        }
        
        if(data.control){
            switch(data.control){
                case "micOff":
                if(config.attachStream.getAudioTracks()[0].enabled) {
                    config.attachStream.getAudioTracks()[0].enabled = false;
                    document.getElementById("micIcon").classList.replace('fa-microphone', 'fa-microphone-slash');
                }
                break;

                case "micOn":
                if (!(config.attachStream.getAudioTracks()[0].enabled)) {
                    config.attachStream.getAudioTracks()[0].enabled = true;
                    document.getElementById("micIcon").classList.replace('fa-microphone-slash', 'fa-microphone');
                }
                break;
                
                case "exit":
                setTimeout(exit_yes, 5000); 
                break;
                
                case "record":
                recordButton_start();
                break;
            }
        }
        if (data.record_timestamp) {
            record_stamp = data;
        }
    },
    onRemoteStreamEnded: function(stream){
        console.log(stream);
    },

    onChannelClose: function(event){
        if(userInfo.job == "student"){
        $(".peer_video").remove();
        }
    }
};