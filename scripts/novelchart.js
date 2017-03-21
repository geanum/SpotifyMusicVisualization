
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    modal.style.display = "none";
}


function createNovelChart(id, trackdata, segmentsdata) {

  var width = 500,
      height = 500,
      radius = Math.min(width, height) / 2 - 30;

  var svg = d3.select("#novel").selectAll("svg")
  
  svg  
    .selectAll("g").remove();

  svg = svg
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var data = [];
  segmentsdata.forEach(function(d) {
    if (d.confidence >= 0.95) {
      data.push({
        confidence: d.confidence,
        time: d.start,
        // pitch: Object.keys(d.pitches).reduce(function(a, b){
        //   return d.pitches[a] > d.pitches[b] ? a : b
        //   }),
        pitches: d.pitches,
        loudness: d.loudness_max
      });
    }
  });

  var duration = trackdata.start_of_fade_out - trackdata.end_of_fade_in;

  var r = d3.scaleLinear()
    .domain([0, 1])
    .range([radius/2, radius]);


  // console.log(trackdata);
  console.log(data[0]);



  var gr = svg.append("g")
    .attr("class", "r axis")
  .selectAll("g")
    .data(r.ticks(5).slice(1))
  .enter().append("g");



gr.append("circle")
    .attr("r", r);

// gr.append("text")
//     .attr("y", function(d) { return -r(d) - 4; })
//     .attr("transform", "rotate(15)")
//     .style("text-anchor", "middle")
//     .text(function(d) { return d; });

var ga = svg.append("g")
    .attr("class", "a axis")
  .selectAll("g")
    .data(d3.range(0, 360, 30))
  .enter().append("g")
    .attr("transform", function(d) { return "rotate(" + (d - 90) + ")"; });

ga.append("line")
    .attr("x2", radius);

ga.append("text")
    .attr("x", radius + 6)
    .attr("dy", ".35em")
    .style("text-anchor", function(d) { return d < 360 && d > 180 ? "end" : null; })
    .attr("transform", function(d) { return d < 360 && d > 180 ? "rotate(180 " + (radius + 6) + ",0)" : null; })
    .text(function(d) { return Math.floor((d / 360) * duration) + "s"; })
    .style("fill", "white");

  var color = ["#ff8080", "#ffbf80", "#ffff80", "#bfff80", "#80ff80", "#80ffbf",
    "#80ffff", "#80bfff", "#8080ff", "#bf80ff", "#ff80df", "ff809f"];

  var pitchArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  var combined = []


  for (var i = 0; i < 12; i++) {

    combined.push({
      color : color[i],
      pitch : pitchArray[i],
      active : 1
    });

    var line = d3.radialLine()
      .angle(function(d) { return  2*Math.PI*(d.time / duration); })
      .radius(function(d) { return r(d.pitches[i]); })
      .curve(d3.curveCatmullRomClosed.alpha(0.5));


    var path = svg.append("path")
      .data([data])
      .attr("class", "pitchline")
      .attr("id", "pitchline" + i)
      .attr("d", line)
      .attr("data-legend", function(i) { return pitchArray[i]; })
      .style("stroke", color[i]);

  }
  // console.log(combined);

  var legendRectSize = 12;
  var legendSpacing = 4;

  var legend = svg.selectAll('.legend')
    .data(combined)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.length / 2;
      var horz = -1 * legendRectSize;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

  legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', function(d) {return d.color;})
  .style('stroke', function(d) {return d.color;})
  .on("click", function(d, i) {
    if (d.active == 1) {
      d3.select("#pitchline" + i)
        .style("opacity", 0);
      d3.select(this).style("fill", "black");
      d.active = 0;
    } else if (d.active == 0) {
      d3.select("#pitchline" + i)
      .style("opacity", 1);
      d3.select(this).style("fill", d.color);
      d.active = 1;
    }
  });

  legend.append('text')
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize - 0*legendSpacing)
  .text(function(d) { return d.pitch; })
  .style('fill', function(d) {return d.color;});

}

function createLoader() {
  var width = 100,
      height = 100,
      n = 18,
      r = 5,
      pi = Math.PI,
      p = 1000;
  var svg = d3.select("#novel").select("svg")
    .append("g")
    .attr("height", height)
    .attr("width", width)
    .attr("transform", "translate(" + (500/2 - 50) + "," + (500/2 - 50) + ")");

  var g = svg.selectAll("g")
      .data(d3.range(0, 2 * pi, 2 * pi / n))
      .enter().append("g")
      .attr("transform", function(d) {
          var x = width  * (0.35 * Math.cos(d) + 0.5),
              y = height * (0.35 * Math.sin(d) + 0.5);
          return "translate(" + [x, y] + ")rotate(" + d * 180 / pi + ")";
      });
  var moons = g.append("path")
      .attr("fill", "#1db954");
  d3.timer(function(t) {
      var theta = 2 * pi * (t % p / p);
      moons.attr("d", function(d) { return moon((theta + d) % (2 * pi)); });
  });
  function moon(theta) {
      var rx0 = theta < pi ? r : -r,
          s0  = theta < pi ? 0 : 1,
          rx1 = r * Math.cos(theta),
          s1  = theta < pi/2 || (pi <= theta && theta < 3*pi/2) ? 0 : 1;
      return "M" + [                  0,  r] +
             "A" + [rx0, r, 0, 0, s0, 0, -r] +
             "A" + [rx1, r, 0, 0, s1, 0,  r];
  }
}

function removeLoader() {
  d3.select("#novel").select("svg").selectAll("g").remove();
}

function displayModal() {
  modal.style.display = "block";
}