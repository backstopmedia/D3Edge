//Define the namespace for our API.
var d3Edge = {};

//Define our data manager module.
d3Edge.dataManager = function module() {
  var exports = {},
    dispatch = d3.dispatch('geoReady', 'dataReady', 'dataLoading'),
    data;

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

  d3.rebind(exports, dispatch, 'on');

  return exports;
};

//Define our map module.
d3Edge.map = function module() {
  //Create our custom events, and variables.
  var dispatch = d3.dispatch('hover', 'stopsEnd', 'routesEnd', 'brushing'),
    projection, path, t, s, svg, center, scale, size, brush;

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

    //Dispatch our stopsEnd event so we know with the stops visualization is complete.
    dispatch.stopsEnd();
  };

  //Bind our custom events to the 'on' method of our function.
  d3.rebind(exports, dispatch, 'on');

  return exports;
};

//Define our width and height for our visualizations.
var width = 570,
    height = 500;

//Instantiate our data manager module for each city.
var sanFranciscoDataManager = d3Edge.dataManager(),
    zurichDataManager = d3Edge.dataManager(),
    genevaDataManager = d3Edge.dataManager();

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
