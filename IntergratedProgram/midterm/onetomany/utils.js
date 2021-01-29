let totalScore = 0;

function score_clear() {
    totalScore = 0;
}
navigator.geolocation.getCurrentPosition(function(position) {
    console.log(position.coords.latitude, "position", position.coords.longitude);
    //document.getElementById('Loc').innerHTML = "위도:" + position.coords.latitude + ", 경도:" + position.coords.longitude;
});
var userIP = ip();
console.log(userIP);
//document.write("UserIP: " + ip());