
var spotifyApi = new SpotifyWebApi();

var userID;
var currentPlaylist;

var songsClicked = 0;
var svg;

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

  var table = $('<table></table>');

  $(table).append('<col width="500"><col width="180">');  // col widths set manually for now
  $(table).append('<tr><th>SONG</th><th>ARTIST</th></tr>');

  list.forEach(function(item) {

    var row = $('<tr></tr>');

    $(row).on('click', function() {
      console.log(item.track.name);
      // makeRadial(item.track.id);
      makeNovel(item.track.id);
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

var makeNovel = (id) => {
  console.log("Loading Audio Analysis");
  spotifyApi.getAudioAnalysisForTrack(id)
  .then(function(data) {
    // console.log(data);
    // console.log(data.segments);
    // console.log(data.track);
    console.log("data has been retrieved");

    // if (songsClicked == 0) {
    //   svg = createNovelChart("#novel", data.track, data.segments);
    //   songsClicked += 1;
    // } else {
    //   updateNovelChart(svg, data.track, data.segments);
    // }

    createNovelChart("#novel", data.track, data.segments);

    //create chart
    //end loading animation
  }, function(err) {
    console.log(err)
  });
}