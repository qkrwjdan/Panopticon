let totalScore = 0;


function score_clear() {
    totalScore = 0;
}
navigator.geolocation.getCurrentPosition(function(position) {
    document.getElementById('Loc').innerHTML = "위도:" + position.coords.latitude + ", 경도:" + position.coords.longitude;
});