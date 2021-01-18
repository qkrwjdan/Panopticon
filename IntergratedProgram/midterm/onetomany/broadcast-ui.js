peer_name = [];

var tempStream;
var capacity = 1;

userInfo = userInfo.replace(/&#34;/gi,'\"');
userInfo =JSON.parse(userInfo);

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

      tr.onclick = function() {
          tr = this;
          captureUserMedia(function() {
              broadcastUI.joinRoom({
                  roomToken: tr.querySelector('.join').id,
                  joinUser: tr.id,
                  studentName: userInfo.name
              });
          });
          hideUnnecessaryStuff();
      };

      var html = '<div class="column">' +
                  '<div class="card">' +
                      '<img src="img1.jpg" alt="java" style="width:50%">' +
                      '<div class="container">' +
                          '<h2>'+room.professorName+'</h2>' +
                          '<p class="title">'+room.roomName+'</p>' +
                          '<p>'+room.description+'</p>' +
                          '<p>미팅시간 : '+room.meetingTime+'</p>' +
                          '<p><button id="join_btn" class="button">화상회의 참여</button></p>' +
                      '</div>'+
                  '</div>' +
                  '</div>';
        $('.slides').append(html); 

        var join_btn = document.getElementById('join_btn');
        join_btn.setAttribute('id', room.broadcaster);

        var userEmail = document.getElementById("userEmail").innerText;

        join_btn.onclick = function() {
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
        case "notify" :
          $(".alert_area").append("<div id='toast'></div>")
          toast(data.message);
          console.log("alret arrive");
          break;
        
        case "warning" :
          $(".alert_area").append("<div id='toast'></div>")
          toast("※[경고]강의자가 경고를 보냈습니다※");
          break;

        case "kick" :
          $(".alert_area").append("<div id='toast'></div>")
          toast("[연결 종료] 강제 퇴장 당하셨습니다");
          peerConnections[0].peer.close();
          break;

        case "chat" :
          get_chat(data);
          break;

        case "ban_chat" :
          var index;
          for(i=0;i<peer_name.length;i++){
            if(peer_name[i]==data.name)
              index=i;
          }
          var query = "#peer_video"+String(i);
          
          var msg_window = "<div id=chat_notice>채팅이 금지되었습니다<div>"
          $(".massage_area").append(msg_window);

          
          var chat_input = document.getElementById("chat_message");
          var send_btn = document.getElementById("send_btn");
          chat_input.disabled=true;
          send_btn.disabled=true;

          $(".massage_area").append("<div id=ban_timer_in_chat></div>");
          var time = 300;
          var timer = setInterval(function(){
            var min = parseInt(time/60);
            var sec = time%60;
            if (min< 10 && sec< 10) {
              var timer_text = "0"+ min + ":" + "0" + sec;
            }
            else if (min< 10) {
              var timer_text = "0" + min + ":" + sec;
            }
            else if (sec< 10) {
              var timer_text = min + ":" + "0" + sec;
            }
            else{
              var timer_text = min + ":" + sec;
            }
            $("#ban_timer_in_chat").text(timer_text);
            time--;
          }, 1000);
          

          setTimeout(function(){
            var time = get_timestamp()
            var msg_window = "<div id=chat_notice>채팅금지가 해제되었습니다 "+time+"<div>"
            $("#ban_timer_in_chat").remove("#ban_timer_in_chat");
            $(".massage_area").append(msg_window);
            chat_input.disabled = false;
            send_btn.disabled = false;
            clearInterval(timer);
          }, 300000)
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

        case "concentration_good" :
          //여기여기
          receive_concentration_offer(data.name, true);
          break;

        case "concentration_bad" :
          receive_concentration_offer(data.name, false);
          break;
      }
    }
    if(data.leave){//자리비움
      switch(data.leave){
        case "yes" :
          leaving();
          break;

        case "no" :
          $(".alert_area").append("<div id='toast'></div>")
          toast("※자리비움을 거절당했습니다※")
          var time = get_timestamp()
          var msg_window = "<div id=chat_notice>자리비움을 거절당했습니다 "+time+"<div>"
          $(".massage_area").append(msg_window);
          break;
      }
    }
    if(data.question){//질문
      switch(data.question){
        case "yes" :
          $(".alert_area").append("<div id='toast'></div>")
          toast("※질문 요청이 수락되었습니다※");
          var time = get_timestamp()
          var msg_window = "<div id=chat_notice>질문 요청이 수락되었습니다 " + time + "<div>"
          $(".massage_area").append(msg_window);
          break;
        
        case "no" :
          $(".alert_area").append("<div id='toast'></div>")
          toast("※질문요청을 거절당했습니다※")
          var time = get_timestamp()
          var msg_window = "<div id=chat_notice>질문요청을 거절당했습니다 " + time + "<div>"
          $(".massage_area").append(msg_window);
          break;
        
        case "question_start":
          $(".alert_area").append("<div id='toast'></div>");
          toast("질문이 시작되었습니다");
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

        case "test_concentration" :
          testConcentration();
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


function createButtonClickHandler() {
  var selected_students = [];
  var selected_student_name = [];
            
  $("option[name='students']:checked").each(function() {
      selected_students.push($(this).val());
      selected_student_name.push($(this).text());
  })

  if(selected_students.length == 0) {
    alert("초대할 학생을 1명 이상 선택해 주세요.");
    return;
  }

  capacity = selected_students.length;

  capacity = Number(capacity);
  captureUserMedia(function() {
      broadcastUI.createRoom({
          roomName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
      });
  });
  updateLayout(capacity);
  hideUnnecessaryStuff();

  //진행중
  for(var i = 0; i < capacity; i++) {
    $(".videos").append("<div class='notVisit'></div>");
    notVisit = document.getElementsByClassName("notVisit");
    var index = notVisit.length - 1;

    document.getElementsByName("students").value

    $(".notVisit:last").addClass(String(selected_student_name[i]));
    notVisit[index].innerHTML = "<br>"+selected_student_name[i]+"<br><br>미출석";
  }
  
}


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

/* on page load: get public rooms */
var broadcastUI = broadcast(config);

/* UI specific */
var localvideo = document.getElementById("localvideo") || document.body;
var peervideo = document.getElementById("peer_video") || document.body;
var video_content = document.getElementById("video_content") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    //console.log(selected_student);
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    var header = document.getElementsByTagName('h1');
    header[0].style.display = 'none';

    var non_visual = document.getElementsByClassName('non-visual');
    non_visual[0].style.display = 'block'; //hide peer connection page factor
    //document.getElementById("open_Concentration").style.display = 'block';
}

function redirect_replay(){
  var visibleElements = document.getElementsByClassName('visible'),
    length = visibleElements.length;
  for (var i = 0; i < length; i++) {
    visibleElements[i].style.display = 'none';
  }
  var header = document.getElementsByTagName('h1');
  header[0].style.display = 'none';

  $(".replay_area").css("display","block");
}

function reloadUnnecessaryStuff() {
  //console.log(selected_student);
  var visibleElements = document.getElementsByClassName('visible'),
    length = visibleElements.length;
  for (var i = 0; i < length; i++) {
    visibleElements[i].style.display = 'unset';
  }
  var header = document.getElementsByTagName('h1');
  header[0].style.display = 'block';

  var non_visual = document.getElementsByClassName('non-visual');
  non_visual[0].style.display = 'none'; //hide peer connection page factor
  //document.getElementById("open_Concentration").style.display = 'block';
}

function rotateVideo(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function() {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

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
      font_num = '3rem'
    }
    else if (num > 4 && num <= 9) {
      rowHeight = '1fr';
      colWidth = '1fr';
      col_num = '3';
      row_num = '3';
      font_num = '2.5rem'
    }
    else if (num >9 && num <= 16) {
      rowHeight = '1fr'
      colWidth = '1fr'
      col_num = '4';
      row_num = '4';
      font_num = '2rem'
    }
    else if (num>16){
      colWidth = '1fr'
      rowHeight = '1fr'
      col_num = '5';
      row_num = '6';
      font_num = '1.6rem'
    }

    document.documentElement.style.setProperty(`--rowHeight`, rowHeight);
    document.documentElement.style.setProperty(`--colWidth`, colWidth);
    document.documentElement.style.setProperty(`--row_num`, row_num);
    document.documentElement.style.setProperty(`--col_num`, col_num);
  document.documentElement.style.setProperty(`--font_num`, font_num);
}

(function() {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:right;font-size:12px"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();

function micOnOff(element) {
    if(config.attachStream.getAudioTracks()[0].enabled) {
      config.attachStream.getAudioTracks()[0].enabled = false
      document.getElementById("micIcon").classList.replace('fa-microphone', 'fa-microphone-slash');
    }
    else {
      config.attachStream.getAudioTracks()[0].enabled = true;
      document.getElementById("micIcon").classList.replace('fa-microphone-slash', 'fa-microphone');
    }
  }
  
  function cameraOnOff(element) {
    if(config.attachStream.getVideoTracks()[0].enabled) {
      config.attachStream.getVideoTracks()[0].enabled = false;
      document.getElementById("cameraIcon").classList.replace('fa-video', 'fa-video-slash');
    }
    else {
      config.attachStream.getVideoTracks()[0].enabled = true;
      document.getElementById("cameraIcon").classList.replace('fa-video-slash', 'fa-video');
    }
  }


//화이트보드 기능
if (userInfo.job == "professor") {
  var canvasStream = document.getElementById('canvas').captureStream(30);

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const range = document.getElementById("jsRange");
  const mode = document.getElementById("jsMode");
  const erase = document.getElementById("jsErase");
  const redpen = document.getElementById("redpen");
  const reset = document.getElementById("reset");

  canvas.width = 1100;
  canvas.height = 800;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#2c2c2c";
  ctx.lineWidth = 2.5;

  let painting = false;
  let filling = false;

  stopPainting = () => {
    painting = false;
  };

  onMouseMove = e => {
    const x = e.offsetX;
    const y = e.offsetY;
    if (!painting) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  startPainting = () => {
    painting = true;
  };
  handleCanvasClick = () => {
  };
  handleCM = e => {
    e.preventDefault();
  };

  if (canvas) {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", stopPainting);
    canvas.addEventListener("mouseleave", stopPainting);
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("contextmenu", handleCM);
  }

  handleRangeChange = e => {
    const brushWidth = e.target.value;
    ctx.lineWidth = brushWidth;
  };

  if (range) {
    range.addEventListener("input", handleRangeChange);
  }

  //Paint 클릭 시
  handleModeClick = e => {
    painting = false;
    ctx.strokeStyle = "#2c2c2c";
    filling = false;
  };
  //Erase 클릭 시
  handleEraseClick = e => {
    painting = false;
    ctx.strokeStyle = "white";
    filling = false;
  };
  //Redpen 클릭 시
  handleRedPen = e => {
    painting = false;
    ctx.strokeStyle = "red";
    filling = false;
  }
  //Reset 클릭 시
  handleReset = e => {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (mode) {
    mode.addEventListener("click", handleModeClick);
  }
  if (erase) {
    erase.addEventListener("click", handleEraseClick);
  }
  if (redpen) {
    redpen.addEventListener("click", handleRedPen);
  }
  if (reset) {
    reset.addEventListener("click", handleReset);
  }

  /*  화이트보드가 크롬창 크기 따라 움직이는 코드이지만
  창 크기를 움직이면 화이트보드가 초기화됨 
  function whiteBoardResize() {
    canvas.width = document.getElementById("participants").offsetWidth;
    canvas.height = document.getElementById("participants").offsetHeight;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById("jsRange").style.width = canvas.width * 0.5 + 'px';
    document.getElementById("canvasBtns").style.marginTop = canvas.height * 0.93 + 'px';
    document.getElementById("exitCanvas").style.marginLeft = canvas.width * 0.93 + 'px';
  }

  window.onresize = function() {
    whiteBoardResize();
  }
  */

  function showWhiteBoard() {
    document.getElementById("whiteBoard").style.display = 'block';

    canvas.width = document.getElementById("participants").offsetWidth;
    canvas.height = document.getElementById("participants").offsetHeight;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById("jsRange").style.width = canvas.width * 0.5 + 'px';
    document.getElementById("canvasBtns").style.marginTop = canvas.height * 0.93 + 'px';
    document.getElementById("exitCanvas").style.marginLeft = canvas.width * 0.93 + 'px';

    
    for (id = 0; id < peerConnections.length; id++) {
      var senderlist = peerConnections[id].peer.getSenders();
      senderlist.forEach(function (sender) {
        sender.replaceTrack(canvasStream.getVideoTracks()[0]);
      })
    }
  }

  function hideWhiteBoard() {
    document.getElementById("whiteBoard").style.display = 'none';
    
    for (id = 0; id < peerConnections.length; id++) {
      var senderlist = peerConnections[id].peer.getSenders();
      senderlist.forEach(function (sender) {
        sender.replaceTrack(tempStream.getVideoTracks()[0]);
      })
    }
  }
}

//add button in peer-video
function clickevent_peer_video(id) {
  document.getElementById(id).style.opacity = 0.5;
  var query = "#"+id;
  $(query).parent(".video_content").children(".flex_container").children(".video_btn").css("opacity","1");
  $(query).parent(".video_content").children(".name").css("opacity","1");
  //btn.style.opacity = 1;
  
  setTimeout(function () {
    if(!blur_flag){
      document.getElementById(id).style.opacity = 1;
    }
    if(!request_blur_flag){
      document.getElementById(id).style.opacity = 1;
      $(query).parent(".video_content").children(".name").css("opacity", "0");
    }
    $(query).parent(".video_content").children(".flex_container").children(".video_btn").css("opacity", "0");
  }, 5000);
}

//자리비움
function send_leave_request(){
  obj = {
    "type":"leave_request",
    "name" : userInfo.name
  }
  obj = JSON.stringify(obj);
  peerConnections[0].channel.send(obj);
  var time = get_timestamp()
  var msg_window = "<div id=chat_notice>자리비움을 요청했습니다 "+time+"<div>"
  $(".massage_area").append(msg_window);
}

var leave_id;
function receive_leave_offer(name){
  for (i = 0; i < peer_name.length; i++) {
    if (peer_name[i] == name){
      leave_id = i;
      break;
    }
  }
  var msg_window = "<div id=chat_notice>"+peer_name[leave_id]+"님께서 자리비움을 요청했습니다<div>"
  $(".massage_area").append(msg_window);
  
  $(".video_btn." + leave_id).css("display", "none");
  $("#peer_video" + leave_id).css("opacity", "0.5");
  $(".name." + leave_id).css("opacity", "1");

  $(".name." + leave_id).after("<div style='text-align:center;'><div class='request_sign " + leave_id + "' id='question'>자리비움</div><div class='request_sign " + leave_id + "'>요청</div></div>")

  var btn_accept = "<button class='request_btn " + leave_id + "' onclick='leave_accept(this.classList)'>수락</button>";
  var btn_reject = "<button class='request_btn " + leave_id + "' onclick='leave_reject(this.classList)' style = 'background-color:rgb(255, 108, 108); color:white;'>거절</button>";

  $(".flex_container." + leave_id).append(btn_accept);
  $(".flex_container." + leave_id).append(btn_reject);

  request_blur_flag = true;
  timerId = setTimeout(function () {
    leave_reject($(".request_btn." + leave_id).classList);
  }, 60000); //1분뒤 자동 거절
}

function leave_accept(index){
  index = index[1];
  clearTimeout(timerId);
  $(".request_btn." + index).remove();
  $(".request_sign." + index).remove();
  $(".name." + index).css("opacity", "0");
  $("#peer_video" + index).css("opacity", "1");
  $(".video_btn." + index).css("display", "inline-block");;
  request_blur_flag = false;

  obj = {
  "leave": "yes"
}
obj = JSON.stringify(obj)
peerConnections[index].channel.send(obj);
var msg_window = "<div id=chat_notice>" + peer_name[index] + "님의 자리비움 요청을 수락했습니다<div>"
$(".massage_area").append(msg_window);
}

function leave_reject(index){
  index = index[1];
  clearTimeout(timerId);
  $(".request_btn." + index).remove();
  $(".request_sign." + index).remove();
  $(".name." + index).css("opacity", "0");
  $("#peer_video" + index).css("opacity", "1");
  $(".video_btn." + index).css("display", "inline-block");;
  request_blur_flag = false;

    obj = {
      "leave": "no"
    }
    obj = JSON.stringify(obj)
    peerConnections[index].channel.send(obj);

    var msg_window = "<div id=chat_notice>" + peer_name[index] + "님의 자리비움 요청을 거절했습니다<div>"
}

var timer_;
var leavingText = document.getElementById('leaving_cancle');

function leaving() {
  var leaveIcon = document.getElementById('leaveIcon');
  var micIcon = document.getElementById('micIcon');
  var cameraIcon = document.getElementById('cameraIcon');

  var micBtn = document.getElementById('micBtn');
  var cameraBtn = document.getElementById('cameraBtn');

  //leaveIcon.style.color="#FA4949";
  micIcon.style.color="#FA4949";
  cameraIcon.style.color="#FA4949";

  micBtn.disabled = 'disabled';
  cameraBtn.disabled = 'disabled';

  if(config.attachStream.getAudioTracks()[0].enabled) {
    config.attachStream.getAudioTracks()[0].enabled = false
    document.getElementById("micIcon").classList.replace('fa-microphone', 'fa-microphone-slash');
  }
  if(config.attachStream.getVideoTracks()[0].enabled) {
    config.attachStream.getVideoTracks()[0].enabled = false;
    document.getElementById("cameraIcon").classList.replace('fa-video', 'fa-video-slash');
  }
  //배경 어둡게
  bg.setStyle({
    position: 'fixed',
    zIndex: 5000,
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'rgba(0,0,0,0.6)'
  });
  document.body.append(bg);

  leavingText.setStyle({
    position: 'fixed',
    display: 'block',
    zIndex: 5001,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    msTransform: 'translate(-50%, -50%)',
    webkitTransform: 'translate(-50%, -50%)'
  });

  var time_ = 0;
  var min_ = "";
  var sec_ = "";
  var leavingTime = document.getElementById('leaving_time');

  timer_ = setInterval(function() {
    min_ = parseInt(time_ / 60);
    sec_ = time_ % 60;

    if(min_ < 10 && sec_ < 10) {
      leavingTime.innerHTML = "0" + min_ + ":0" + sec_;
    }
    else if (min_ < 10) {
      leavingTime.innerHTML = "0" + min_ + ":" + sec_;
    }
    else if (sec_ < 10) {
      leavingTime.innerHTML = min_ + ":" + "0" + sec_;
    }
    else {
      leavingTime.innerHTML = min_ + ":" + sec_;
    }
    time_++;

    leaveCtx.fillStyle = "black"
    leaveCtx.fillRect(0, 100, leave.width, leave.height);
    leaveCtx.fillStyle = "white";
    leaveCtx.fillText(leavingTime.innerHTML, 190, 160);
  }, 1000);

  var leave = document.getElementById("leave");
  leave.width = document.getElementById('localvideo').offsetWidth;
  leave.height = document.getElementById('localvideo').offsetHeight;
  if(leave.getContext){
    var leaveCtx = leave.getContext("2d");

    leaveCtx.fillStyle = "black";
    leaveCtx.fillRect(0, 0, leave.width, leave.height);
    
    leaveCtx.fillStyle = "white";
    leaveCtx.font = '45px 맑은 고딕';
    leaveCtx.textAlign = 'center';
    leaveCtx.fillText(document.getElementById("studentName").innerText, 190, 80);
  }

  var leavingStream = document.getElementById('leave').captureStream(30);

  for (id = 0; id < peerConnections.length; id++) {
    var senderlist = peerConnections[id].peer.getSenders();
    senderlist.forEach(function (sender) {
      sender.replaceTrack(leavingStream.getVideoTracks()[0]);
    })
  }

  
}

//자리비움 취소(복귀)
function leaving_cancle() {
  //leaveIcon.style.color="white";
  micIcon.style.color="white";
  cameraIcon.style.color="white";

  micBtn.disabled = false;
  cameraBtn.disabled = false;

  config.attachStream.getAudioTracks()[0].enabled = true;
  document.getElementById("micIcon").classList.replace('fa-microphone-slash', 'fa-microphone');
  config.attachStream.getVideoTracks()[0].enabled = true;
  document.getElementById("cameraIcon").classList.replace('fa-video-slash', 'fa-video');

  leavingText.style.display = "none";
  bg.remove();
  clearInterval(timer_);

  for (id = 0; id < peerConnections.length; id++) {
    var senderlist = peerConnections[id].peer.getSenders();
    senderlist.forEach(function (sender) {
      sender.replaceTrack(tempStream.getVideoTracks()[0]);
    })
  }
  
}

function toggleFullScreen() { //전체화면
  let elem = document.querySelector("body");

  if (!document.fullscreenElement) {
    if (elem.requestFullScreen) {
      elem.requestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen(); // IE
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozExitFullscreen) {
      document.mozExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen(); // IE
    }
  }
}

//집중도테스트
var success;
var bg = document.createElement('div');
var modal = document.getElementById('testConcentration')
function testConcentration() {
  success = false;
  var zIndex = 9999;
  bg.setStyle({
      position: 'fixed',
      zIndex: zIndex,
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      overflow: 'auto',
      backgroundColor: 'rgba(0,0,0,0.4)'
  });
  document.body.append(bg);

  modal.setStyle({
      position: 'fixed',
      display: 'block',
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',

      zIndex: zIndex + 1,

      // div center 정렬
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      msTransform: 'translate(-50%, -50%)',
      webkitTransform: 'translate(-50%, -50%)'
  });

  document.getElementById("randomNumber").innerHTML=makeRandomNumber();


  //타이머
  var time = 15;  //타임 설정
  var min = "";
  var sec = "";
  var timer = setInterval(function() {
    min = parseInt(time / 60);
    sec = time % 60;

    if(min < 10 && sec < 10) {
      document.getElementById("timer").innerHTML = "0" + min + " : 0" + sec;
    }
    else if (min < 10) {
      document.getElementById("timer").innerHTML = "0" + min + " : " + sec;
    }
    else if (sec < 10) {
      document.getElementById("timer").innerHTML = min + " : " + "0" + sec;
    }
    else {
      document.getElementById("timer").innerHTML = min + " : " + sec;
    }

    time--;
    //여기여기
    if(success == true) {  //잘 입력했으면 타이머 중지
      clearInterval(timer);
      var msg_window = "<div id=chat_notice>" + userInfo.name +  "님 집중도 테스트 통과 <div>";
      
      obj = {
        "type": "concentration_good",
        "name" : userInfo.name
      }
      obj = JSON.stringify(obj)
      peerConnections[0].channel.send(obj);
      $(".massage_area").append(msg_window);

    }
    if(time < 0) {  //타임오버
      clearInterval(timer);
      document.getElementById("timer").innerHTML = "집중 안해요?";
      var msg_window = "<div id=chat_notice>" + userInfo.name +  "님 집중도 테스트 실패 <div>";
      
      obj = {
        "type": "concentration_bad",
        "name" : userInfo.name
      }
      obj = JSON.stringify(obj)
      peerConnections[0].channel.send(obj);
      $(".massage_area").append(msg_window);
    }
  }, 1000);
}

// Element 에 style 한번에 오브젝트로 설정하는 함수 추가
Element.prototype.setStyle = function(styles) {
  for (var k in styles) this.style[k] = styles[k];
  return this;
};

function maxLengthCheck(object){
  if (object.value.length > object.maxLength){
    object.value = object.value.slice(0, object.maxLength);
  }    
}

var randomNumber;
function makeRandomNumber() {
  randomNumber = Math.floor(Math.random() * 9 + 1);  //1~9까지
 
  return randomNumber;
}

function submit_concentration() {
  var inputNumber = document.getElementById('input_randomNumber').value;

  if(inputNumber == randomNumber) {
    success = true;
    bg.remove();
    modal.style.display = 'none';
    document.getElementById('guideWord').innerHTML = "위 숫자를 입력해주세요.";
  }
  else {
    document.getElementById('guideWord').innerHTML = "올바른 숫자를 입력해주세요.";
  }
  document.getElementById('input_randomNumber').value="";
}



//녹화 기능
var record_time=0;
function record_request(){
  obj={
    "control" : "record"
  }
  obj=JSON.stringify(obj)
  for(i=0;i<peerConnections.length;i++){
    peerConnections[i].channel.send(obj);
  }
  setInterval(()=>{
    record_time++;
  },1000)

  if (recordStart == true) {
      recordStart = false;
      timestamp.disabled = false;
      recordButton.style.color = "red";
    } else {
    timestamp.disabled = true;
      obj={
        "timestamp_title" : stamp_title,
        "record_timestamp" : record_stamp
      }
      obj = JSON.stringify(obj)

      for (i = 0; i < peerConnections.length; i++) {
        peerConnections[i].channel.send(obj);
      }
      recordStart = true;
      recordButton.style.color = "white";
    }
}

var record_stamp = [];
var stamp_title = [];
function record_timestamp() {
  msg = prompt("책갈피 제목을 입력하세요");
  stamp_title[stamp_title.length]=msg;
  record_stamp[record_stamp.length]=record_time;
}

let recordedBlobs;
var recordStart = true;
var recordButton = document.getElementById("record");
function recordButton_start(){
    if (recordStart == true) {
      recordStart = false;
      startRecording();
      recordButton.style.color = "red";
    } else {
      recordStart = true;
      stopRecording();
      downloadButton.disabled = false;
      recordButton.style.color = "white";
    }
}


function getDateFormat(date, delimiter) { //날짜 구하기 > filename
  var newDate = new Date();
  if (date != null) newDate = date;

  var yy = newDate.getFullYear();
  var mm = newDate.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  var dd = newDate.getDate();
  if (dd < 10) dd = "0" + dd;

  if (delimiter == null) delimiter = "";
  return yy + delimiter + mm + delimiter + dd + get_timestamp();
}

const downloadButton = document.querySelector('button#download');
if(downloadButton){
    downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    file_name_date = getDateFormat(new Date());
    file_name=file_name_date;
    file_name.concat(".webm");
    a.download = file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

      var dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record_stamp));
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataUri;
    file_name = file_name_date;
    file_name.concat(".JSON");
    a.download = file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  });
}

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  var record_option = {
    audio: true ,
    video: true
  }
  recordedBlobs = [];
  var canvas = document.getElementById("peer_video0")
  // Optional frames per second argument.
  var stream = canvas.captureStream(25);
  var recordedChunks = [];

  console.log(stream);
  var options = { mimeType: "video/webm; codecs=vp9" };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not supported`);
    options = { mimeType: 'video/webm;codecs=vp8,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`);
      options = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        options = { mimeType: '' };
      }
    }
  }

  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  // downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}

//화면공유 기능
if (userInfo.job == "professor") {
  function screenshare_suc(screenStream) {
    screenshare.disabled = true;

    for(id=0;id<peerConnections.length;id++){
      var senderlist=peerConnections[id].peer.getSenders();
      senderlist.forEach(function(sender){
        sender.replaceTrack(screenStream.getVideoTracks()[0]);
      })
    }

    var local_video = document.getElementById("local_video");
    local_video.srcObject= screenStream;
    local_video.play();

    // demonstrates how to detect that the user has stopped
    // sharing the screen via the browser UI.
    screenStream.getVideoTracks()[0].addEventListener('ended', () => {

      for (id = 0; id < peerConnections.length; id++) {
        var senderlist = peerConnections[id].peer.getSenders();
        senderlist.forEach(function (sender) {
          sender.replaceTrack(tempStream.getVideoTracks()[0]);
        })
      }

      var local_video = document.getElementById("local_video");
      local_video.srcObject = tempStream;
      local_video.play();

      errorMsg('The user has ended sharing the screen');
      screenshare.disabled = false;
    });
  }

  function screenshare_err(error) {
    console.error()
    errorMsg(`getDisplayMedia error: ${error.name}`, error);
  }

  function errorMsg(msg, error) {
  //const errorElement = document.querySelector('#errorMsg');
    //errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
    // console.error(error);
    }
  }

  const screenshare = document.getElementById('screenshare');
  screenshare.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
      .then(screenshare_suc, screenshare_err);
  });

  if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    screenshare.disabled = false;
  } else {
    errorMsg('getDisplayMedia is not supported');
  }
}

//팝업 알림 기능

function sendMessage(msg) {
  let obj = {
    "type": "notify",
    "message": msg,
  }
  obj = JSON.stringify(obj)
  for(id=0;id<peerConnections.length;id++){
    peerConnections[id].channel.send(obj);
  }
}

function alert_msg(){
  msg = prompt("알림사항을 입력하세요");
  sendMessage(msg);
}


let removeToast; 
function toast(string) {  //toast message function
  const toast = document.getElementById("toast");

  toast.classList.contains("reveal") ?
    (clearTimeout(removeToast), removeToast = setTimeout(function () {
      document.getElementById("toast").classList.remove("reveal")
    }, 10000)) :
    removeToast = setTimeout(function () {
      document.getElementById("toast").classList.remove("reveal")
    }, 10000)
  toast.classList.add("reveal"),
    toast.innerText = string
}

//경고 기능
function warning_event(id){
  var id = parseInt(id[1])
  obj = {
    "type" : "warning",
  }
  obj = JSON.stringify(obj)
  peerConnections[id].channel.send(obj);
}

//강퇴기능
function kick_event(id){
  var id = parseInt(id[1])
  obj = {
    "type": "kick",
  }
  obj = JSON.stringify(obj)
  peerConnections[id].channel.send(obj)
  peerConnections[id].peer.close();
  var query = "#"+id;
  $(query).parent(".video_content").children(".peer_video").remove(".peer_video");
}

//채팅금지
var blur_flag = false;
function ban_chat_event(id){
  var id = parseInt(id[1])
  obj = {
    "type" : "ban_chat",
  }
  obj = JSON.stringify(obj)
  peerConnections[id].channel.send(obj)

  var query = "#" + id;

  // $(query).parent(".flex_container").children("#name").css("opacity", "1");
  // $(query).parent(".video_content").children(".peer_video").css("opacity", "0.5");
  // $(query).parent(".flex_container").children(".video_btn").css("display", "none");
  // $(query).parent(".flex_container").append("<div id='ban_timer'></div>");

  // var time = 300;
  // var timer = setInterval(function () {
  //   var min = parseInt(time / 60);
  //   var sec = time % 60;
  //   var timer_text = min + ":" + sec;
  //   $(query).parent(".flex_container").children("#ban_timer").text(timer_text);
  //   time--;
  // }, 1000);

  // setTimeout(function () {
  //   $(query).parent(".flex_container").children("#ban_timer").remove("#ban_timer");
  //   $(query).parent(".flex_container").children(".video_btn").css("display", "inline-block");
  //   clearInterver(timver);
  // }, 300000)

    $("#peer_video"+id).css("opacity", "0.5");
    $(".video_content."+id).append("<div id='chat_ban_img'><i class='fas fa-comment-slash'></i></div>");
    $(".flex_container."+id).css("display","none");
    $(".name."+id).css("display", "none");
  
    blur_flag=true;  
    setTimeout(function(){
        $(".video_content."+id).children("#chat_ban_img").remove("#chat_ban_img");
        $(".flex_container." + id).css("display", "flex");
        $("#peer_video" + id).css("opacity", "1");
        $(".name." + id).css("display", "block");
        blur_flag=false;
    },300000)
}


//채팅기능
function sand_chat(){
  msg = document.getElementById("chat_message").value;
  var time = get_timestamp();
  if(msg){
    obj = {
      "type": "chat",
      "message" : msg,
      "time" : time,
      "name" : userInfo.name
    }
    obj = JSON.stringify(obj)
    for (id = 0; id < peerConnections.length; id++) {
      peerConnections[id].channel.send(obj);
    }
    var msg_container = "<div class=msg_container style='text-align : right'></div>";
    $(".massage_area").append(msg_container);
    var msg_time = "<div id=msg_time>" +time+ "</div>";
    var msg_window = "<div id=sand_msg>" + msg + "</div>";
    $(".msg_container:last").append(msg_time);
    $(".msg_container:last").append(msg_window);
    
    document.getElementById("chat_message").value = null;
  }
}

function get_chat(data){
  var msg_container = "<div class=msg_container style='text-align : left'></div>"
  $(".massage_area").append(msg_container);
  var msg_time = "<div id=msg_time>" + data.name + " " + data.time + "</div>"
  var msg_window = "<div id=got_msg>" + data.message + "</div>"
  $(".msg_container:last").append(msg_window);
  $(".msg_container:last").append(msg_time);
}

function get_timestamp(){
  var today = new Date();
  var hour = today.getHours();
  var min = today.getMinutes();
  
  if(min<10 && min>=0) { var time = hour + ":0" + min; }
  else { var time = hour + ":" + min; }
  
  return time;
}

//질문기능
var timerId;

function question_reqeust(){
  var time = get_timestamp();
  obj={
    "type" : "question",
    "name" : userInfo.name,
    "time" : time,
  }
  obj = JSON.stringify(obj);
  peerConnections[0].channel.send(obj);
  var msg_window = "<div id=chat_notice>질문을 요청하였습니다 "+ time +"<div>";
  $(".massage_area").append(msg_window);

}

var request_blur_flag=false;
function recevie_question(name){
  var id;
  for (i = 0; i < peer_name.length; i++) {
    if (peer_name[i] == name) {
      id = i;
      break;
    }
  }
  $(".video_btn."+id).css("display", "none");
  $("#peer_video" + id).css("opacity", "0.5");
  $(".name." + id).css("opacity", "1");

  $(".name." + id).after("<div style='text-align:center;'><div class='request_sign " + id + "' id='question'>질문</div><div class='request_sign " + id +"'>요청</div></div>")

  var btn_accept = "<button class='request_btn " + id + "' onclick='question_accept(this.classList)'>수락</button>";
  var btn_reject = "<button class='request_btn " + id +"' onclick='question_reject(this.classList)' style = 'background-color:rgb(255, 108, 108); color:white;'>거절</button>";

  $(".flex_container."+id).append(btn_accept);
  $(".flex_container."+id).append(btn_reject);

  request_blur_flag = true;
  timerId = setTimeout(function () {
    question_reject($(".request_btn."+id).classList);
  }, 60000); //1분뒤 자동 거절
}

function question_accept(index){
  index = index[1];
  clearTimeout(timerId);
  $(".request_btn."+index).remove();
  $(".request_sign." + index).remove();
  $(".name." + index).css("opacity", "0");
  $("#peer_video"+index).css("opacity", "1");
  $(".video_btn." + index).css("display", "inline-block");;
  request_blur_flag = false;

  obj={
    "question": "question_start",
    "control" : "micOff"
  }
  obj = JSON.stringify(obj)
  for (i = 0; i < peerConnections.length; i++){
    if(i!=index){
      peerConnections[i].channel.send(obj);
    }
  }

  obj = {
    "question": "yes",
    "control" : "micOn"
  }
  obj = JSON.stringify(obj)
  peerConnections[index].channel.send(obj);
}

function question_reject(index) {
  index = index[1];
  clearTimeout(timerId);
  $(".request_btn." + index).remove();
  $(".request_sign." + index).remove();
  $(".name." + index).css("opacity", "0");
  $("#peer_video" + index).css("opacity", "1");
  $(".video_btn." + index).css("display", "inline-block");;
  request_blur_flag = false;
  
  obj = {
    "question": "no"
  }
  obj = JSON.stringify(obj)
  peerConnections[index].channel.send(obj);
}

//all student mic off
function soundOnOff(element){
  if (document.getElementById("soundIcon").classList[1] == 'fa-volume-up') {
    obj = {
      "control": "micOff"
    }
    obj = JSON.stringify(obj)
    for (i = 0; i < peerConnections.length; i++){
      peerConnections[i].channel.send(obj);
    }
    document.getElementById("soundIcon").classList.replace('fa-volume-up', 'fa-volume-mute');
  }
  else {
    obj = {
      "control": "micOn"
    }
    obj = JSON.stringify(obj)
    for (i = 0; i < peerConnections.length; i++) {
      peerConnections[i].channel.send(obj);
    }
    document.getElementById("soundIcon").classList.replace('fa-volume-mute', 'fa-volume-up');
  }
}

function exitRoom(){ 
  $(".pop-up").css("display","block");
  $(".modal").css("display", "block");
}

function exit_yes(){
  if(userInfo.job=="professor"){
    obj={
      "type" : "notify",
      "control" : "exit",
      "message" : "수업이 종료되었습니다. 5초 후 자동종료"
    }
    obj = JSON.stringify(obj);
    for(i=0;i<peerConnections.length;i++){
      peerConnections[i].channel.send(obj);
      peerConnections[i].peer.close();
    }
  }
  else{
    peerConnections[0].peer.close();
  }
  $(".pop-up").css("display", "none");
  $(".modal").css("display", "none");
  reloadUnnecessaryStuff();
}

function exit_no(){
  $(".pop-up").css("display", "none");
  $(".modal").css("display", "none");
}

//집중도테스트 시작
function startTestConcentrationAllStudents() {
  alert("전체 학생에게 집중도 테스트를 시작합니다.");
  obj = {
    "control": "test_concentration"
  }
  obj = JSON.stringify(obj)
  for (i = 0; i < peerConnections.length; i++){
    peerConnections[i].channel.send(obj);
  }
}


var concentration_id;
function receive_concentration_offer(name, isGood){
  for (i = 0; i < peer_name.length; i++) {
    if (peer_name[i] == name){
      concentration_id = i;
      break;
    }
  }

  if(isGood)
    var msg_window = "<div id=chat_notice>" + peer_name[concentration_id] +  "님 집중도 테스트 통과 <div>";

  else
    var msg_window = "<div id=chat_notice>" + peer_name[concentration_id] +  "님 집중도 테스트 실패 <div>";
  $(".massage_area").append(msg_window);
  
}

function chatOff() {
  document.getElementById("chat").style.display = "none";
  document.getElementById("hiddenChat").style.display = "block";
}

function chatOn() {
  document.getElementById("hiddenChat").style.display = "none";
  document.getElementById("chat").style.display = "block";
}

function showNote() {
      document.getElementById("take_notes").style.display = 'block';  
}
                
                
function hideNote(){
      document.getElementById("take_notes").style.display = 'none';
}

function bodyShot() {
  document.getElementById("canvas").style.display = 'block';
      html2canvas(document.body).then(function (canvas) {
        drawImg(canvas.toDataURL('image/png'));
        saveAs(canvas.toDataURL(), 'file-name.png');
      }).catch(
        function (err) {
        console.log(err);
        });
}

function partShot() {
      html2canvas(document.getElementById("take_notes")).then(function (canvas) {
        drawImg(canvas.toDataURL('image/jpeg'));
        saveAs(canvas.toDataURL(), 'file-name.jpg');
      }).catch(function (err) {
        console.log(err);
      });
}

function drawImg(imgData) {
      console.log(imgData);
      return new Promise(function reslove() {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var imageObj = new Image();

        imageObj.onload = function () {
          ctx.drawImage(imageObj, 10, 10);
};

imageObj.src = imgData;
}, function reject() {
  });
}
    
function saveAs(uri, filename) {
      var link = document.createElement('a');
      if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(uri);                        
      }
}


//책갈피 기능(로컬)
 function replay(){
  var record_file = document.getElementById("record_file").files[0];
  var files = document.getElementById("timestamp_file").files[0];

  var fr = new FileReader();
  var data;

  fr.onload = function (e) {
    console.log(e);
    data = JSON.parse(e.target.result);
  }

  fr.readAsText(files);
  var record_video = document.getElementById("record_video");
  record_video.src = window.URL.createObjectURL(record_file);
  
  setTimeout(() => {
    record_stamp = data.record_timestamp;
    stamp_title = data.timestamp_title;
    console.log(record_video.duration);
    for (i = 0; i < record_stamp.length; i++) {
      $(".stamp_btn_area").append("<button class='stamp_btn' onclick='seek_timestamp(this)'>" + stamp_title[i] + "</button>");
    }
  }, 1000);
 
  //record_video.play();
}

function seek_timestamp(element){
  var index
  for(i=0;i<stamp_title.length;i++){
    if(stamp_title[i]==element.textContent){
      index = i;
      break;
    }
  }
  record_video.currentTime=record_stamp[index];
  record_video.pause();
}
