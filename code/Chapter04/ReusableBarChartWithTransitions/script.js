// Reusable version with transitions
///////////////////////////////////////////////////////////////////////
// Chart module
d3.edge = {};

d3.edge.barChart = function module() {
    var w = 400,
        h = 300;
    var dispatch = d3.dispatch("customHover");
    function exports(_selection) {
        _selection.each(function(_data) {
            var barW = w / _data.length,
                scaling = h / d3.max(_data);

            // Trick to just append the svg skeleton once
            var svg = d3.select(this)
                .selectAll("svg")
                .data([_data]);
            svg.enter().append("svg")
                .classed("chart", true);
            svg.transition().attr({width: w, height: h});

            // Enter, Update, Exit on bars
            var bars = svg.selectAll(".bar")
                .data(function(d, i) { return d; /* d === _data */ });
            bars.enter().append("rect")
                .classed("bar", true)
                .attr({
                    x: w,
                    width: barW,
                    y: function(d, i) { return h - d * scaling; },
                    height: function(d, i) { return d * scaling; }
                })
                .on("mouseover", dispatch.customHover);
            bars.transition()
                .attr({
                    x: function(d, i) { return i * barW; },
                    width: barW,
                    y: function(d, i) { return h - d * scaling; },
                    height: function(d, i) { return d * scaling; }
                });
            bars.exit().transition().style({opacity: 0}).remove();
        });
    }
    exports.w = function(_x) {
        if (!arguments.length) return w;
        w = _x;
        return this;
    };
    exports.h = function(_x) {
        if (!arguments.length) return h;
        h = _x;
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

// Usage
var barChart = d3.edge.barChart()
    .w(500).h(200)
    .on("customHover", function(d, i) {
        d3.select("#message").text(d);
    });

var data = [1, 2, 3, 4];
var container = d3.select("#container")
    .datum(data)
    .call(barChart);

// The chart can be called with new data
function updateData(_data) {
    // Here we generate a random data array of random length
    data = d3.range(~~(Math.random() * 50)).map(function(d, i) {
        return ~~(Math.random() * 100);
    });

    // Transition settings are inherited
    container.datum(data)
        .transition()
        .ease("linear")
        .call(barChart);
}

// The chart can be called with new parameters
function updateWidth(_data) {
    // We define a new random width
    var rnd = ~~(Math.random() * 500);
    // And call the chart again
    container.call(barChart.w(rnd));
}

// We animate the data set and the chart width independently:
// when you disable one of these timers, the other animation will run as before.
setInterval(updateData, 1000);
setInterval(updateWidth, 5000);