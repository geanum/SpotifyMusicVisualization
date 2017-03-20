
var spotifyApi = new SpotifyWebApi();

var userID;
var currentPlaylist;
var currentPlaylistSongs = [];
var scatterPlotX = 'Danceability';
var scatterPlotY = 'Popularity';

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
    structurePlaylistSongs(data.items, function(data) {
      var dataPoints = songDataPoints(data, scatterPlotX, scatterPlotY);
      makeScatterPlot(dataPoints);
    });
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

var scaleLoudness = (loudness) => {

  loudness = loudness*(-1);

  return loudness/(10+ loudness);

}

var structurePlaylistSongs = (allSongs, callback) => {

  var listSongIDs = [];
  var listAlbumIDs = []

  var playListSongs = [];

  allSongs.forEach(function(song) {
    listSongIDs.push(song.track.id);
    listAlbumIDs.push(song.track.album.id)
  })

  console.log(listSongIDs);

  spotifyApi.getAudioFeaturesForTracks(listSongIDs)
  .then(function(data) {

    data = data.audio_features;
    
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
        Album: allSongs[i].track.album,
        DateAdded: allSongs[i].added_at,
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
    //getAlbumData();
  }, function(err) {
    console.log(err)
  });
}

// returns list of data points using parameterX and parameterY from song properties
var songDataPoints = (listSongs, parameterX, parameterY) => {

  console.log(listSongs);
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
      .attr("fill", "#1db954")
      .on('click', function(d,i) {
        selectedSong = currentPlaylistSongs[i];
        makeNovel(selectedSong.id);
      })
      .on('mouseover', function(d,i) {
        d3.select(this)
          .attr("r", 5)

      })
      .on('mouseout', function(d,i) {
        d3.select(this)
          .attr("r", 3)
      })
      // .style("filter" , "url(#glow)")
      .transition()
        .duration(750)
        .attr("r", 3);

  console.log(data);
}

var appendSelect = (element, axis) => {

  var values = ['Danceability', 'Tempo', 'Energy', 'Popularity', 'Valence'];

  var table = $('<table id="axis'+ axis + '"></table>');
  var row = $('<tr></tr>');

  values.forEach(function(item) {

    var col = $('<td id=' + item + axis + '>' + item + '</td>');

    $(col).on('click', function() {

      $(".selected-parameter" + axis).removeClass("selected-parameter" + axis);
      console.log(item);
      changeAxis(axis, item);
      col.addClass("selected-parameter" + axis);
    });
    $(row).append(col)
  })

  if (axis == 'Y') {
    console.log("LOLOL")
    $('#PopularityY').addClass("selected-parameter" + axis);
  }
  if (axis == 'X')
    $('#DanceabilityX').addClass("selected-parameter" + axis);

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
      .transition()  // Transition from old to new
      .duration(1000)  // Length of animation
      // .each("start", function() {  // Start animation
      //     d3.select(this)  // 'this' means the current element
      //         .attr("fill", "red")  // Change color
      //         .attr("r", 5);  // Change size
      // })
      .delay(function(d, i) {
          return i / data.length * 500;  // Dynamic delay (i.e. each item delays a little longer)
      })
      //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
      .attr("cx", function(d) {
          return xScale(d[0]);  // Circle's X
      })
      .attr("cy", function(d) {
          return yScale(d[1]);  // Circle's Y
      });
      // .each("end", function() {  // End animation
      //     d3.select(this)  // 'this' means the current element
      //         .transition()
      //         .duration(500)
      //         .attr("fill", "black")  // Change color
      //         .attr("r", 2);  // Change radius
      // });

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

// var getAlbumData = () => {

//   var promises; // janky promises

//   currentPlaylistSongs.forEach(function(song) {
//     spotifyApi.getAlbum(song.Album.id)
//     .then(function(data) {
//       console.log(data);
//       if (data)
//         song.genre = data.genres;
//       console.log(song.Name);
//       console.log(song.genre);
//       promises++;
//     }, function(err) {
//       console.log(err);
//       promises++;
//     })
//   })

//   while (promises < currentPlaylistSongs.length);
// }