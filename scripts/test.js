
var spotifyApi = new SpotifyWebApi();

var initSpotify = (accessToken) => {

  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setPromiseImplementation(Q);

  loadPlayListData();


}

var loadPlayListData = () => {

  spotifyApi.getUserPlaylists()
  .then(function(data) {
    console.log(data);
  }, function(err) {
    console.log(err);
  })
}