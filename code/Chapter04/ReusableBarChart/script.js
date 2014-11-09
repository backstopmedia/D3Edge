// Simplified two bar charts example: The Reusable Version
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
            d3.select(this)
                .append("svg")
                .attr({class: "chart2", width: w, height: h})
                .append("g")
                .selectAll(".bar")
                .data(_data)
                .enter().append("rect")
                .attr({
                    class: "bar",
                    x: function(d, i) { return i * barW; },
                    width: barW,
                    y: function(d, i) { return h - d * scaling; },
                    height: function(d, i) { return d * scaling; }
                })
                .on("mouseover", dispatch.customHover);
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

// var msg = d3.select("#message").text;
//                                ^^^^^ won't work ...
// ... as D3 will crash internally with:
//    `this` does not have a method `each()`
// which indeed it does not: using `msg` like that would
// feed D3 the WRONG context (`this`). This is JavaScript behaviour.
//
// D3 expects a selection context, so let's make sure it gets that.
// We do that by using another [self-invoking] closure construct,
// so we do not pollute the global variable space.
var msg = (function () {
    var selection = d3.select("#message");
    return function (text_message) {
        selection.text(text_message);
    };
})();

var barChart1 = d3.edge.barChart()
    .w(100).h(200)
    .on("customHover", function(d, i) { msg("chart1: " + d); });
var barChart2 = d3.edge.barChart()
    .w(300).h(100)
    .on("customHover", function(d, i) { msg("chart2: " + d); });

var data1 = [10, 20, 30, 40];
var data2 = [100, 40, 10, 80];

d3.select("#container1")
    .datum(data1)
    .call(barChart1);

d3.select("#container2")
    .datum(data2)
    .call(barChart2);



///////////////////////////////////////////////////////////////////////////////////
// Advantages vs. "one-off" approach as shown in "classical" development such as:
//     code/chapter-01.stadard-D3/02.bar-chart-one-off.html:
//
// - Not less code overall, but DRY (no repetition, a single code base to maintain)
// - Less code exposed to the user, the bar chart module can be in an external file
// - Exposes only the attributes that have to be changed (w, h, customHover)
// - Composable, a bar chart is added to a div container hence an axis could be simply added to a bar chart
// - Extensible, add get/setters, events at will
// - Public and private functions, you can keep some attributes immutable
// - Consistent API, the same approach as used in the core d3. The logic can be changed
//   (i.e., adding transitions) but the API will largely stay the same.
///////////////////////////////////////////////////////////////////////////////////