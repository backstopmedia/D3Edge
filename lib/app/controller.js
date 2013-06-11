var app = angular.module('App', []);

function Controller ($scope, $http) {

  $scope.section = [
    {name: 'Code', path: 'code/'},
    {name: 'Data', path: 'data/'}
  ];

  $scope.chapters = [
    {name: 'Chapter 1', path:'code/Chapter01', sections: [
      {name: 'Typical Bar Chart', path:'code/Chapter01/TypicalBarChart'},
      {name: 'Two Bar Charts', path:'code/Chapter01/TwoBarCharts'}

    ]

    },
    {name: 'Chapter 2', path:'code/Chapter02'},
    {name: 'Chapter 3', path:'code/Chapter03'},
    {name: 'Chapter 4', path:'code/Chapter04', sections: [
      {name: 'Reusable With Axes', path: 'code/Chapter04/ResuableWithAxes'},
      {name: 'Reusable Bar Chart', path: 'code/Chapter04/ResuableBarChart'},
      {name: 'Reusable Chart w/ Transitions', path: 'code/Chapter04/ReusableBarChartWithTransitions'}
    ]
    },
    {name: 'Chapter 5', path:'code/Chapter05', sections: [
      {name: 'Reusable Chart', path: 'code/Chapter05/Chart'},
      {name: 'Unit Testing', path: 'code/Chapter05/test'}
      ]
    },
    {name: 'Chapter 7', path:'code/Chapter07'},
    {name: 'Chapter 8', path:'code/Chapter08', sections: [
        {name:'Draw The Routes', path:'code/Chapter08/DrawingRoutes'},
        {name:'Draw The Stops', path:'code/Chapter08/DrawingStops'},
        {name:'Draw The Routes and Stops', path:'code/Chapter08/DrawRoutesAndStops'},
        {name:'Combine The Maps', path:'code/Chapter08/CombineTheMaps'}

      ]
    },
    {name: 'Chapter 9', path:'code/Chapter09', sections: [
      {name: 'Setting Up Crossfilter', path: 'code/Chapter09/SettingUpCrossfilter'},
      {name: 'Location Dimension', path: 'code/Chapter09/LocationDimension'},
      {name: 'Location Filter', path: 'code/Chapter09/LocationFilter'}
    ]
    },
    {name: 'Chapter 10', path:'code/Chapter10'},
    {name: 'Chapter 11', path:'code/Chapter11'},
    {name: 'Chapter 12', path:'code/Chapter12'}
  ];
}

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: '/partials/index.html',   controller: Controller}).
      when('/examples', {templateUrl: '/partials/examples.html',   controller: Controller}).
      otherwise({redirectTo: '/'});
}]);