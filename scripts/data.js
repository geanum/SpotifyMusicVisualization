
var spotifyApi = new SpotifyWebApi();

var userID;

var initSpotify = (accessToken) => {

  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMe()
    .then(function(data) {
      userID = data.id;
    })
    .then(loadPlayLists());
}

var loadPlayLists = () => {

  spotifyApi.getUserPlaylists()
  .then(function(data) {
    playlistTable(data.items, '#user-playlists')

  }, function(err) {
    console.log(err);
  })
}

// Takes list and appends to element
var playlistTable = (list,element) => {

  console.log(list);
  console.log(element);

  var table = $('<table></table>');

  $(table).append('<tr><th>PLAYLIST</th></tr>');

  list.forEach(function(item) {

    var row = $('<tr></tr>');

    $(row).on('click', function() {
      console.log(item.id);
      loadSongs(item.id);
    });
    $(row).append('<td>' + item.name + '</td>');
    $(table).append(row);
  })

  $(element).append(table);

}

var loadSongs = (playlistID) => {

  spotifyApi.getPlaylistTracks(userID, playlistID)
  .then(function(data) {
    console.log(data);
    songTable(data.items,'#user-playlists-songs')
  }, function(err) {
    console.log(err);
  })

}

var songTable = (list,element) => {

  $(element + ' table').remove();

  var table = $('<table></table>');

  $(table).append('<col width="500"><col width="180">');  // col widths set manually for now
  $(table).append('<tr><th>SONG</th><th>ARTIST</th></tr>');

  list.forEach(function(item) {

    var row = $('<tr></tr>');

    $(row).on('click', function() {
      console.log(item.track.name);
    });
    $(row).append('<td>' + item.track.name + '</td>');
    $(row).append('<td>' + item.track.artists[0].name + '</td>'); // only display one artist for now
    $(table).append(row);
  })

  $(element).append(table);

}