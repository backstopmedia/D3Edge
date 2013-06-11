//Define the namespace for our API.
var d3Edge = {};

//Define our data manager module.
d3Edge.dataManager = function module() {
  var exports = {},
    dispatch = d3.dispatch('geoReady', 'dataReady', 'dataLoading'),
    data,
    //Instantiate a new Crossfilter.
    transitCrossfilter = crossfilter(),
    //Define a location variable for our location dimension.
    location;

  //Create a method to load the csv file, and apply cleaning function asynchronously.
  exports.loadCsvData = function(_file, _cleaningFunc) {

    //Create the csv request using d3.csv.
    var loadCsv = d3.csv(_file);

    //On the progress event, dispatch the custom dataLoading event.
    loadCsv.on('progress', function() { dispatch.dataLoading(d3.event.loaded);});

    loadCsv.get(function (_err, _response) {
      //Apply the cleaning function supplied in the _cleaningFunc parameter.
      _response.forEach(function (d) {
        _cleaningFunc(d);
      });
      //Assign the cleaned response to our data variable.
      data = _response;

      //Add data to our Crossfilter.
      transitCrossfilter.add(_response);

      //Setup the location dimension.
      location = transitCrossfilter.dimension(function (d) {return d.LOCATION;});

      //Dispatch our custom dataReady event passing in the cleaned data.
      dispatch.dataReady(_response);
    });
  };
  //Create a method to access the cleaned data.
  exports.getCleanedData = function () {
    return data;
  };

  //Create a method to load the geojson file, and execute a custom callback on response.
  exports.loadGeoJson = function(_file, _callback) {
    //Load json file using d3.json.
    d3.json(_file, function (_err, _data) {
      //Execute the callback, assign the data to the context.
      _callback(_data);
    });
  };

  //Create a convienence method to get the size of our Crossfilter
  exports.getCrossfilterSize = function () {
    return transitCrossfilter.size();
  };

  //Create a filterLocation method to filter stop data by location area.
  exports.filterLocation = function (_locationArea) {
        //Get the longitudes of our bounding box, and contruct an array from them.
    var longitudes = [_locationArea[0][0], _locationArea[1][0]],
        //Get the latitudes of our bounding box, and construct an array from them.
        latitudes = [_locationArea[0][1], _locationArea[1][1]];

    location.filterFunction(function (d) {
      return d[0] >= longitudes[0] &&
      d[0] <= longitudes[1] &&
      d[1] >= latitudes[0] &&
      d[1] <= latitudes[1];
    });
    //Return all records within our boundin box.
    return location.top(Infinity);
  };

  //Create a getDelays method to filter and aggregate the delay data by stop.
  exports.getDelays = function (_locations) {
    var delayCrossfilter = crossfilter(),
        //Create a dimension by hour of the scheduled stop time.
        stopTime = delayCrossfilter.dimension(function (d) {return d.SCHEDULED.getHours();});

        //Group the dimension by hour, and reduce it by increasing the count for all delays greater than 1.
        lateArrivalsByStopTime = stopTime.group().reduce(
          function reduceAdd(p,v) {return v.DELAY > 0 ? p+1 : p+0;},
          function reduceRemove(p,v) {return 0;},
          function reduceInitial(p,v) {return 0;}
        );

    //Add our filtered locations to the crossfilter.
    delayCrossfilter.add(_locations);

    //Return an array contained the aggregated data, and the stopTime dimension.
    return [stopTime, lateArrivalsByStopTime];
  };

  d3.rebind(exports, dispatch, 'on');

  return exports;
};

//Define our map module.
d3Edge.map = function module() {
  //Create our custom events, and variables.
  var dispatch = d3.dispatch('hover', 'stopsEnd', 'routesEnd', 'brushing'),
    projection, path, t, s, svg, center, scale, size, brush, x1, x2, y1, y2, brushX, brushY;

  //Create and exports function that can be invoked on a selection.
  function exports(_selection) {

      //Set svg equal to the selection that invokes this module.
      svg = svg || _selection;

      //Bind an empty datum to the selection. Usefull later for zooming.
      svg.datum([]);

      //Set the projection up using our scale, center, and size parameters.
      projection = projection || d3.geo.mercator()
        .scale(scale)
        .center(center)
        .translate([size[0]/2, size[1]/2]);

      //Set the path up using our projection definied above.
      path = path || d3.geo.path()
        .projection(projection);

      //Get the longitude of the top left corner of our map area.
      long1 = projection.invert([0,0])[0];
      //Get the longitude of the top right corner of our map area.
      long2 = projection.invert([width, 0])[0];

      //Get the latitude of the top left corner of our map area.
      lat1 = projection.invert([0,0])[1];
      //Get the latitude of the bottom left corner of our map area.
      lat2 = projection.invert([width, height])[1];

      //Create a linear scale generator for the x of our brush.
      brushX = d3.scale.linear()
        .range([0, size[0]])
        .domain([long1,long2]);

      //Create a linear scale generator for the y of our brush.
      brushY = d3.scale.linear()
        .range([0, size[1]])
        .domain([lat1, lat2]);

      //Create our brush using our brushX and brushY scales.
      brush = d3.svg.brush()
        .x(brushX)
        .y(brushY)
        .on('brush', function () {dispatch.brushing(brush);});
  }

  //Create a center method to serve as both a getter, and a setter.
  exports.center = function(_coords) {
    if (!arguments.length) return center;
    center = _coords;
    return this;
  };

  //Create a scale method to serve as both a getter, and a setter.
  exports.scale = function(_scale) {
    if (!arguments.length) return scale;
    scale = _scale;
    return this;
  };

  //Create a size method to serve as both a getter and setter.
  exports.size = function(_size) {
    if (!arguments.length) return size;
    size = _size;
    return this;
  };

  //Create a drawRoutes method that can be invoked to create routes for each city.
  exports.drawRoutes = function(_data) {
    svg.append('path')
      .attr('class', 'route')
      .datum(topojson.object(_data, _data.objects.routes))
      .attr('d', function(d, i) {
        return path(d);
      });

    //Dispatch our routesEnd event so we know with the routes visualization is complete.
    dispatch.routesEnd();
  };

  exports.drawStops = function(_data) {
    svg.selectAll('.stop')
      .data( _data.features)
      .enter().append('circle')
      .attr('cx', function (d) {return projection(d.geometry.coordinates)[0];})
      .attr('cy', function (d) {return projection(d.geometry.coordinates)[1];})
      .attr('r', 2)
      .attr('class', 'stop')
      .on('mouseover', dispatch.hover);
  };

  //Create our addBrush method.
  exports.addBrush = function () {
    svg.append('g')
      .attr('class', 'brush')
      .call(brush)
      .selectAll('rect')
      .attr('width', width);

    return this;
  };

  //Dispatch our stopsEnd event so we know with the stops visualization is complete.
  dispatch.stopsEnd();

  //Bind our custom events to the 'on' method of our function.
  d3.rebind(exports, dispatch, 'on');

  return exports;
};

d3Edge.radialHistogram = function module () {
  var slices = 24, //24 hours in a day.
    innerRadius = 100, //Default inner radius
    outerRadius = 300, //Default outer radius
    innerScale = d3.scale.linear(), //Define a scale for sizes segments based on value.
    group, //Our empty group variable
    dimension, //Our empty dimension variable.
    offset = 50, //Label offset value.
    lowerColor, //The color used for the minimum of our range
    upperColor, //The color used for the maximum of our range
    innerRange, //The lower bound for radius value
    outerRange, //The upper bound for radius value
    color = d3.scale.linear(); //Linear color scale used for the segments.

  //The chart function our module will return with the selection that called it,
  // as the only argument.
  function chart (_selection) {

    //If the innerRange is not defined, it equals the innerRadius.
    innerRange = innerRange ? innerRange : innerRadius;
    //If the outerRange is not defined, it equals the outerRadius.
    outerRange = outerRange ? outerRange : outerRadius;

    //Our d3 arc generator for the segments.
    var arc = d3.svg.arc()
      .innerRadius(function (d, i) {return innerScale(d);})
      .outerRadius(function (d, i) {return outerRadius;})
      .startAngle(function (d, i) {return 2 * Math.PI * (i/slices);})
      .endAngle(function (d, i) {return 2 * Math.PI * ((i+1)/slices);});

    //Our d3 arc generator for the labels.
    var label = d3.svg.arc()
      .innerRadius(outerRadius + offset)
      .outerRadius(outerRadius + offset)
      .startAngle(function (d, i) {return 2 * Math.PI * (i/slices);})
      .endAngle(function (d, i) {return 2 * Math.PI * ((i+1)/slices);});


    //The total number of records for the city
    var totalRecords = dimension.group().all(),
        //The total number of delays for they city.
        totalDelays = group.all();

        //Obtain the min and max for both totalRecords and totalDelays.
        // if there are no records, set to zero.
    var mintotalRecords = totalRecords.length ? +totalRecords[0].key : 0,
        maxtotalRecords = totalRecords.length ? +totalRecords[totalRecords.length-1].key : 0,
        mintotalDelays = totalDelays.length ? +totalDelays[0].key : 0,
        maxtotalDelays = totalDelays.length ? +totalDelays[totalDelays.length-1].key : 0;

    //We must always have an array of length 24. Inspect the totalRecords array,
    // and totalDelays array and splice to the beginning and end as required.
    for (i=0; i<mintotalRecords; i++) {
      totalRecords.splice(i, 0, {key:i, value:0});
    }

    for(i=maxtotalRecords; i<24; i++){
      totalRecords.splice(i, 0, {key:i, value:0});
    }

    for (i=0; i<mintotalDelays; i++) {
      totalDelays.splice(i, 0, {key:i, value:0});
    }

    for(i=maxtotalDelays; i<24; i++){
      totalDelays.splice(i, 0, {key:i, value:0});
    }

    //Get the min and max values for both totalRecords, and totalDelays. We
    // will use this for our scales.
    var totalRecordsMax = d3.max(totalRecords, function (d) {return d.value;}),
        totalRecordsMin = d3.min(totalRecords, function (d) {return d.value;});

    //Set the range and domain for our innerScale using the min and max from the totalRecords.
    innerScale.range([outerRange, innerRange]).domain([totalRecordsMin, totalRecordsMax]);

    //Set the color range similarly
    color.range([lowerColor, upperColor]).domain([totalRecordsMin, totalRecordsMax]);

    //Update our segments using the current data.
    var arcs = _selection.selectAll('path')
      .data(totalDelays)
      .attr('d', function (d,i) {return arc(d.value,i);})
      .attr('fill', function (d) {return color(d.value);})
      .attr('stroke', 'black')
      .attr('class', 'slice');

    //Add any new segments using the current data.
    arcs.enter().append('path')
      .attr('d', function (d,i) {return arc(d.value,i);})
      .attr('fill', function (d) {return color(d.value);})
      .attr('class', 'slice')
      .attr('stroke', 'black');

    //Remove and extra segments.
    arcs.exit().remove();

    //Attach our mouseover event.
    arcs.on('mouseover', mouseover);

    //Add our labels.
    var labels = _selection.selectAll('text')
        .data(totalDelays).enter()
      .append("text")
        .attr("transform", function(d,i) { return "translate(" + label.centroid(d,i) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d,i) { return i+1; });

    //Remove center text on chart update. TODO: Better way??
    _selection.selectAll('.centerText').remove();

    //Add the center text for the chart.
    var centerText = _selection.append('text')
      .attr('text-anchor', 'middle')
      .text('Mouse over a segment to see the total.')
      .attr('class', 'centerText');

    //On mouseover function to display segment total.
    function mouseover (d) {
      centerText.text('Total: ' + d.value);
    }
  }

  //Method to get/set the inner radius.
  chart.innerRadius = function (_innerRadius) {
    if(!arguments.length) return innerRadius;
    innerRadius = _innerRadius;
    return chart;
  };

  //Method to get/set the outer radius.
  chart.outerRadius = function (_outerRadius) {
    if(!arguments.length) return outerRadius;
    outerRadius = _outerRadius;
    return chart;
  };

  //Method to get/set the crossfilter group.
  chart.group = function (_group) {
    if(!arguments.length) return group;
    group = _group;
    return chart;
  };

  //Method to get/set the label offset.
  chart.offset = function (_offset) {
    if(!arguments.length) return offset;
    offset = _offset;
    return chart;
  };

  //Method to get/set the crossfilter dimension.
  chart.dimension = function (_dimension) {
    if(!arguments.length) return dimension;
    dimension = _dimension;
    return chart;
  };

  //Method to get/set the color range.
  chart.colorRange = function (_array) {
    if(!arguments.length) return [lowerColor, upperColor];
    lowerColor = _array[0];
    upperColor = _array[1];
    return chart;
  };

  //Method to get/set the radial range/
  chart.radialRange = function (_array) {
    if(!arguments.length) return [innerRange, outerRange];
    innerRange = _array[0];
    outerRange = _array[1];
    return chart;
  };

  //Finally, return the chart.
  return chart;
};

//Define our width and height for our visualizations.
var width = 570,
    height = 500;

//Instantiate our data manager module for each city.
var sanFranciscoDataManager = d3Edge.dataManager(),
    zurichDataManager = d3Edge.dataManager(),
    genevaDataManager = d3Edge.dataManager();

//Instantiate our radial module for each city.
var zurichRadial = d3Edge.radialHistogram().colorRange(['lightblue', 'darkblue'])
  .innerRadius(5)
  .outerRadius(200)
  .offset(15)
  .radialRange([100,200]);

//Instantiate our map module for Zurich.
var zurichMap = d3Edge.map()
  .center([8.5390, 47.3687])
  .scale(900000)
  .size([width, height]);

//Instantiate our map module for Geneva.
var genevaMap = d3Edge.map()
  .center([6.14, 46.20])
  .scale(900000)
  .size([width, height]);

//Instantiate our map module for San Francisco.
var sanFranciscoMap = d3Edge.map()
  .center([-122.4376, 37.77])
  .scale(900000)
  .size([width, height]);

//Bind our modules to the DOM.
d3.select('#zurich_map')
  .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(zurichMap);

d3.select('#geneva_map')
  .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(genevaMap);

d3.select('#san_francisco_map')
  .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(sanFranciscoMap);

//Set up the DOM for each city for the radial chart.
var zurichHist = d3.select('#zurich_hist')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

//Load the routes data and pass our drawRoutes method as the callback to be executed once the data loads.
zurichDataManager.loadGeoJson('../../../data/zurich/routes_topo.json', zurichMap.drawRoutes);

//After the routes have been drawn, draw the stops.
zurichMap.on('routesEnd', function () {
  //Load the stops data and pass our drawStops method as the callback to be executed once the data loads.
  zurichDataManager.loadGeoJson('../../../data/zurich/stops_geo.json', zurichMap.drawStops);
});

//Load the routes data and pass our drawRoutes method as the callback to be executed once the data loads.
genevaDataManager.loadGeoJson('../../../data/geneva/routes_topo.json', genevaMap.drawRoutes);

//After the routes have been drawn, draw the stops.
genevaMap.on('routesEnd', function () {
  //Load the stops data and pass our drawStops method as the callback to be executed once the data loads.
  genevaDataManager.loadGeoJson('../../../data/geneva/stops_geo.json', genevaMap.drawStops);
});

//Load the routes data and pass our drawRoutes method as the callback to be executed once the data loads.
sanFranciscoDataManager.loadGeoJson('../../../data/san_francisco/routes_topo.json', sanFranciscoMap.drawRoutes);

//After the routes have been drawn, draw the stops.
sanFranciscoMap.on('routesEnd', function () {
  //Load the stops data and pass our drawStops method as the callback to be executed once the data loads.
  sanFranciscoDataManager.loadGeoJson('../../../data/san_francisco/stops_geo.json', sanFranciscoMap.drawStops);
});

//Load our Zurich data, and supply the cleaning function.
zurichDataManager.loadCsvData('../../../data/zurich/zurich_delay.csv', function(d){
  var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
  d.DELAY = +d.DELAY_MIN;
  delete d.DELAY_MIN;
  d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
  d.LATITUDE = +d.LATITUDE;
  d.LONGITUDE = +d.LONGITUDE;
  d.LOCATION = [d.LONGITUDE, d.LATITUDE];
});

//Add our brush to the map.
zurichMap.addBrush();

//On map brushing, filter the stop metric data, pass filtered data into radial chart.
zurichMap.on('brushing', function (brush) {
  //Get the locations inside the brush.
  var filteredLocations = zurichDataManager.filterLocation(brush.extent()),
      //Get the delays inside the area.
      delaysByHourAndLocation = zurichDataManager.getDelays(filteredLocations);

  //Inspect the total number of events by hour;
  console.log(delaysByHourAndLocation[0].group().all());

  //Inspect the total number of delays by hour.
  console.log(delaysByHourAndLocation[1].all());

  zurichRadial.group(zurichDataManager.getDelays(filteredLocations)[1]).dimension(zurichDataManager.getDelays(filteredLocations)[0]);
  zurichHist.call(zurichRadial);
});
