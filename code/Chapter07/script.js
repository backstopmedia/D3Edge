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

//Instantiate our data manager module for each city.
var sanFranciscoDataManager = d3Edge.dataManager(),
    zurichDataManager = d3Edge.dataManager(),
    genevaDataManager = d3Edge.dataManager();

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

//Load our Geneva data, and supply the cleaning function.
// genevaDataManager.loadCsvData('../../../data/geneva/geneva_delay_coord.csv', function(d){
//   var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
//   d.DELAY = +d.DELAY;
//   d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
//   d.LATITUDE = +d.LATITUDE;
//   d.LONGITUDE = +d.LONGITUDE;
//   d.LOCATION = [d.LONGITUDE, d.LATITUDE];
// });

//Load our San Francisco data, and supply the cleaning function.
// sanFranciscoDataManager.loadCsvData('../../../data/san_francisco/san_francisco_delay.csv', function(d){
//   var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
//   d.DELAY = +d.DELAY_MIN;
//   delete d.DELAY_MIN;
//   d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
//   d.LATITUDE = +d.LATITUDE;
//   d.LONGITUDE = +d.LONGITUDE;
//   d.LOCATION = [d.LONGITUDE, d.LATITUDE];
// });

//Load the routes data and pass our drawRoutes method as the callback to be executed once the data loads.
zurichDataManager.loadGeoJson('../../../data/zurich/routes_topo.json', function (data) {
  //Do something with the data via a callback.
});

//Load the stops data and pass our drawStops method as the callback to be executed once the data loads.
zurichDataManager.loadGeoJson('../../../data/zurich/stops_geo.json', function (data) {
  //Do something with the data via a callback.
});

zurichDataManager.on('dataReady', function () {
  d3.select('#wait').style('visibility', 'hidden');
  d3.select('#instructions').style('visibility', 'visible');
  console.log(zurichDataManager.getCleanedData()[0]);
});