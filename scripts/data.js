
var spotifyApi = new SpotifyWebApi();

var userID;
var currentPlaylist;

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

  var table = $('<table style="width:100%"></table>');

  $(table).append('<tr><th>PLAYLIST</th></tr>');

  list.forEach(function(item) {

    var row = $('<tr></tr>');

    $(row).on('click', function() {
      console.log(item.id);
      $(".selected").removeClass("selected-playlist");
      loadSongs(item.id);
      row.addClass("selected-playlist")
    });
    $(row).append('<td>' + item.name + '</td>');
    $(table).append(row);
  })

  $(element).append(table);

}

var loadSongs = (playlistID) => {

  console.log('PlaylistID ')

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

  var table = $('<table width="100%" height="50vh"></table>');

  $(table).append('<col width="50%"><col width="50%">');  // col widths set manually for now
  $(table).append('<tr><th>SONG</th><th>ARTIST</th></tr>');

  list.forEach(function(item) {

    var row = $('<tr></tr>');

    $(row).on('click', function() {
      $(".selected-song").removeClass("selected-song");
      console.log(item.track.name);
      makeRadial(item.track.id);
      row.addClass("selected-song");
    });
    $(row).append('<td>' + item.track.name + '</td>');
    $(row).append('<td>' + item.track.artists[0].name + '</td>'); // only display one artist for now
    $(table).append(row);
  })

  $(element).append(table);

}

var makeRadial = (id) => {
  spotifyApi.getAudioFeaturesForTrack(id)
  .then(function(data) {
    console.log(data);

    var radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 1,
      levels: 5,
      roundStrokes: true,
      color: color,
      opacityCircles: 0.1
    };

    d = [
      {axis: 'Danceability', value: data.danceability},
      {axis: 'Energy', value: data.energy},
      {axis: 'Acousticness', value: data.acousticness},
      {axis: 'Valence', value: data.valence},
    ]

    dat = [d];

    //Call function to draw the Radar chart
    RadarChart("#radial", dat, radarChartOptions)

  }, function(err) {
    console.log(err);
  })

}