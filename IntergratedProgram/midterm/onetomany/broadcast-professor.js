var tempStream;
var localvideo = document.getElementById("localvideo") || document.body;

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

          var video = document.getElementById("local_video");
          hideUnnecessaryStuff();
      };
  },
    onChannelMessage: function (event) {
        data = JSON.parse(event.data);
        if(data.type){
        switch(data.type){
            case "notify" :
            $(".alert_area").append("<div id='toast'></div>")
            toast(data.message);
            console.log("alret arrive");
            break;

            case "chat" :
            get_chat(data);
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
            
            // case "record":
            //   recordButton_start();
            //   break;
        }
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

function updateLayout(num) {
  // update CSS grid based on number of diplayed videos
    var rowHeight = '-webkit-fill-available';
    var colWidth = '-webkit-fill-available';
    var col_num = '1' ,row_num='1';
    var font_num = '4rem'

    if(num>1 && num<=4){
        rowHeight = '1fr';
        colWidth = '1fr';
        col_num = '2';
        row_num = '2';
        font_num = '3rem';
    }
    else if (num > 4 && num <= 9) {
        rowHeight = '1fr';
        colWidth = '1fr';
        col_num = '3';
        row_num = '3';
        font_num = '2.5rem';
    }
    else if (num >9 && num <= 16) {
        rowHeight = '1fr';
        colWidth = '1fr';
        col_num = '4';
        row_num = '4';
        font_num = '2rem';
    }
    else if (num>16){
        colWidth = '1fr';
        rowHeight = '1fr';
        col_num = '5';
        row_num = '6';
        font_num = '1.6rem';
    }

    document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
    document.documentElement.style.setProperty(`--colWidth`, colWidth);
    document.documentElement.style.setProperty(`--row_num`, row_num);
    document.documentElement.style.setProperty(`--col_num`, col_num);
    document.documentElement.style.setProperty(`--font_num`, font_num);
}

var broadcastUI = broadcast(config);

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.id="local_video";
    video.muted = "true"; //본인 마이크 음소거
    //video.setAttribute('controls', true); //재생버튼 및 재생시간
    //participants.insertBefore(video, participants.firstChild);
    localvideo.insertBefore(video, localvideo.firstChild); //insert video in localvideo tag 

    video_constraints = { 
      width : { min:320, ideal : 320 },
      height : { min:180, ideal :180 }
    }

    getUserMedia({
        video : video,
        onsuccess: function(stream) {
            tempStream = stream;
            config.attachStream = stream;
            callback && callback();
            //rotateVideo(video); 한바뀌 도는 넘 
        },
        onerror: function() {
            alert('unable to get access to your webcam.');
            callback && callback();
        }
    });
}

function hideUnnecessaryStuff() {
    //console.log(selected_student);
    var visibleElements = document.getElementsByClassName('visible');
    var length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    // var header = document.getElementsByTagName('h1');
    // header[0].style.display = 'none';

    var non_visual = document.getElementsByClassName('non-visual');
    non_visual[0].style.display = 'block'; //hide peer connection page factor
    //document.getElementById("open_Concentration").style.display = 'block';
}

function uniqueToken() {
    var s4 = function() {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

function clickCreateRoom() {
    // var selected_students = [];
    // var selected_student_name = [];
              
    // $("option[name='students']:checked").each(function() {
    //     selected_students.push($(this).val());
    //     selected_student_name.push($(this).text());
    // })
  
    // if(selected_students.length == 0) {
    //   alert("초대할 학생을 1명 이상 선택해 주세요.");
    //   return;
    // }
    var roomToken = document.getElementById("renderedRoomToken").innerText;
    console.log("roomToken : ",roomToken);
    
    capacity = 5;
  
    capacity = Number(capacity);
    captureUserMedia(function() {
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
        },roomToken);
    });
    console.log("roomToken : ",roomToken);
    updateLayout(capacity);
    hideUnnecessaryStuff();
  
    //진행중
    // for(var i = 0; i < capacity; i++) {
    //   $(".videos").append("<div class='notVisit'></div>");
    //   notVisit = document.getElementsByClassName("notVisit");
    //   var index = notVisit.length - 1;
  
    //   document.getElementsByName("students").value
  
    //   $(".notVisit:last").addClass(String(selected_student_name[i]));
    //   notVisit[index].innerHTML = "<br>"+selected_student_name[i]+"<br><br>미출석";
    // }

    for(var i = 0; i < capacity; i++) {
      $(".videos").append("<div class='notVisit'></div>");
      notVisit = document.getElementsByClassName("notVisit");
      var index = notVisit.length - 1;
  
      $(".notVisit:last").addClass(String(index));
      notVisit[index].innerHTML = "<br>"+String(index)+"<br><br>미출석";
    }
}

var startConferencing = document.getElementById('start-conferencing');
if (startConferencing) startConferencing.onclick = clickCreateRoom;