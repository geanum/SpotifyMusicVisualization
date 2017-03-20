
var spotifyApi = new SpotifyWebApi();

var userID;
var currentPlaylist;
var currentPlaylistSongs;

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
      $(".selected-playlist").removeClass("selected-playlist");
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
    songTable(data.items,'#user-playlists-songs');
    var songs = structurePlaylistSongs(data.items, songDataPoints);
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
      // {axis: 'Instrumentalness', value: data.instrumentalness},
      // {axis: 'Speechiness', value: data.speechiness}
    ]

    d2 = [
      {axis: 'Danceability', value: scaleLoudness(data.loudness)},
      {axis: 'Energy', value: scaleLoudness(data.loudness)},
      {axis: 'Acousticness', value: scaleLoudness(data.loudness)},
      {axis: 'Valence', value: scaleLoudness(data.loudness)},
      // {axis: 'Instrumentalness', value: scaleLoudness(data.loudness)},
      // {axis: 'Speechiness', value: scaleLoudness(data.loudness)}
    ]

    dat = [d,d2];

    //Call function to draw the Radar chart
    RadarChart("#radial", dat, radarChartOptions)

  }, function(err) {
    console.log(err);
  })

}

var scaleLoudness = (loudness) => {

  loudness = loudness*(-1);

  return loudness/(10+ loudness);

}

var structurePlaylistSongs = (allSongs, callback) => {

  var listSongIDs = [];

  var playListSongs = [];

  allSongs.forEach(function(song) {
    listSongIDs.push(song.track.id);
  })

  console.log(listSongIDs);

  spotifyApi.getAudioFeaturesForTracks(listSongIDs)
  .then(function(data) {

    data = data.audio_features;

    console.log(data);


    for (var i = 0; i < data.length; i++) {
      console.log(i);
      var song = {
        name: allSongs[i].track.name,
        id: allSongs[i].track.id,
        popularity: allSongs[i].track.popularity,
        duration: allSongs[i].track.duration_ms,
        artists: allSongs[i].track.artists,
        acousticness: data[i].acousticness,
        danceability: data[i].danceability,
        energy: data[i].energy,
        instrumentalness: data[i].instrumentalness,
        key: data[i].key,
        liveness: data[i].liveness,
        loudness: data[i].loudness, 
        speechiness: data[i].speechiness,
        tempo: data[i].tempo,
        time_signature: data[i].time_signature,
        valence: data[i].valence
      }

      playListSongs.push(song);
    }

    currentPlaylistSongs = playListSongs;
    callback(playListSongs, 'danceability', 'popularity');
  }, function(err) {
    console.log(err)
  })
}

// returns list of data points using parameterX and parameterY from song properties
var songDataPoints = (listSongs, parameterX, parameterY) => {

  var dataPoints = [];

  console.log(parameterX);

  listSongs.forEach(function(song) {
    if(song.hasOwnProperty(parameterX) && song.hasOwnProperty(parameterY)) {
      var point = [song[parameterX], song[parameterY]];
      dataPoints.push(point);
    }
  })

  makeScatterPlot(dataPoints);
  return dataPoints;
}

var makeScatterPlot = (data) => {

  var canvas_width = 500;
  var canvas_height = 300;
  var padding = 30;  // for chart edges

  // Create scale functions
  var xScale = d3.scaleLinear()  // xScale is width of graphic
                  .domain([0, d3.max(data, function(d) {
                      return d[0];  // input domain
                  })])
                  .range([padding, canvas_width - padding * 2]); // output range

  var yScale = d3.scaleLinear()  // yScale is height of graphic
                  .domain([0, d3.max(data, function(d) {
                      return d[1];  // input domain
                  })])
                  .range([canvas_height - padding, padding]);  // remember y starts on top going down so we flip


  // Create SVG element
  var svg = d3.select("#scatter")  // This is where we put our vis
      .append("svg")
      .attr("width", canvas_width)
      .attr("height", canvas_height)

  // Create Circles
  svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")  // Add circle svg
      .attr("cx", function(d) {
          return xScale(d[0]);  // Circle's X
      })
      .attr("cy", function(d) {  // Circle's Y
          return yScale(d[1]);
      })
      .attr("r", 2);  // radius

  svg.append('g')
        .attr('class', 'axisX')
        .attr("transform", "translate(0," + (canvas_height - padding) +")")
        .call(d3.axisBottom(xScale));

  svg.append('g')
      .attr('class', 'axisY')
      .attr("transform", "translate(" + padding +",0)")
      .call(d3.axisLeft(yScale))
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('fill', '#000')
      .text('($)');
  console.log(data);
}