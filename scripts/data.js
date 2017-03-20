
var spotifyApi = new SpotifyWebApi();

var userID;
var currentPlaylist;
var currentPlaylistSongs = [];
var scatterPlotX;
var scatterPlotY;

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
    songTable(data.items,'#user-playlists-songs');
    structurePlaylistSongs(data.items, function(data) {
      scatterPlotX = 'Danceability';
      scatterPlotY = 'Popularity';
      var dataPoints = songDataPoints(data, scatterPlotX, scatterPlotY);
      makeScatterPlot(dataPoints);
    });
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
      makeRadial(item.track.id);
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

      if(!data[i]) { // if features returns null
        data[i] = {};
      }

      var song = {
        Name: allSongs[i].track.name,
        id: allSongs[i].track.id,
        Popularity: allSongs[i].track.popularity,
        Duration: allSongs[i].track.duration_ms,
        Artists: allSongs[i].track.artists,
        Acousticness: data[i].acousticness,
        Danceability: data[i].danceability,
        Energy: data[i].energy,
        Instrumentalness: data[i].instrumentalness,
        Key: data[i].key,
        Liveness: data[i].liveness,
        Loudness: data[i].loudness, 
        Speechiness: data[i].speechiness,
        Tempo: data[i].tempo,
        time_signature: data[i].time_signature,
        Valence: data[i].valence
      }

      playListSongs.push(song);
    }

    currentPlaylistSongs = playListSongs;
    callback(playListSongs);
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

  return dataPoints;
}

var makeScatterPlot = (data) => {

  var canvas_width = 700;
  var canvas_height = 350;
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

  if (d3.select('#scatter svg').empty()) {

    appendSelect('#scatter', 'Y');
    // Create SVG element
    var svg = d3.select("#scatter")  // This is where we put our vis
        .append("svg")
        .attr("width", canvas_width)
        .attr("height", canvas_height)
    
    svg.append('g')
          .attr('class', 'axisX')
          .attr("transform", "translate(0," + (canvas_height - padding) +")")
          .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('class', 'axisY')
        .attr("transform", "translate(" + padding +",0)")
        .call(d3.axisLeft(yScale))

    appendSelect('#scatter', 'X');
  }


  var svg = d3.select("#scatter svg")

  svg.selectAll("circle").remove()
    .transition()
      .duration(750)

  console.log(data);

  svg.select(".axisX") // change the y axis
    .transition()
      .duration(750)
      .call(d3.axisBottom(xScale))

  svg.select(".axisY") // change the y axis
    .transition()
      .duration(750)
      .call(d3.axisLeft(yScale))

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
      .attr("r", 0)  // radius
      .attr("fill", "steelblue")
      // .style("filter" , "url(#glow)")
      .transition()
        .duration(750)
        .attr("r", 2);

  console.log(data);
}

var appendSelect = (element, axis) => {

  var values = ['Danceability', 'Tempo', 'Energy', 'Popularity', 'Valence'];

  var table = $('<table></table>');
  var row = $('<tr></tr>');

  values.forEach(function(item) {

    var col = $('<td>' + item + '</td>')

    $(col).on('click', function() {
      console.log(item);
      changeAxis(axis, item);
    });
    $(row).append(col)
  })

  $(table).append(row);

  $(element).append(table);
}

var changeAxis = (axis, parameter) => {

  if (axis == 'X') 
    scatterPlotX = parameter;
  if (axis == 'Y') 
    scatterPlotY = parameter;

  data = songDataPoints(currentPlaylistSongs, scatterPlotX, scatterPlotY);

  var canvas_width = 700;
  var canvas_height = 350;
  var padding = 30;  // for chart edges

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

                  var svg = d3.select("#scatter svg")

  svg.selectAll("circle").remove()
    .transition()
      .duration(750)

  console.log(data);

  svg.select(".axisX") // change the y axis
    .transition()
      .duration(750)
      .call(d3.axisBottom(xScale))

  svg.select(".axisY") // change the y axis
    .transition()
      .duration(750)
      .call(d3.axisLeft(yScale))

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
      .attr("r", 0)  // radius
      .attr("fill", "steelblue")
      // .style("filter" , "url(#glow)")
      .transition()
        .duration(750)
        .attr("r", 2);

}