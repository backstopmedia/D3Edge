var dataset = [1, 2, 3, 4];

// Module
///////////////////////////////////////////////////////////////////////
// Our own namespace under the d3 namespace
// Like d3.svg or d3.layout
d3.edge = {};

// The "module" function returns another function
d3.edge.table = function module() {
    // This returned function takes a d3 selection as argument
    function exports(_selection) {
        // So it can loop through this selection with d3.each
        _selection.each(function(_data) {
            // "_data" was bound to this DOM element by d3
            // "this" is the current DOM object
            d3.select(this)
                // Let's add a div to it
                .append("div")
                // and write something useful
                .html("Hello World: " + _data);
        });
    }
    // This is where the function is returned by the "module" function
    return exports;
};

// To use it, first we ask the module to give us the function
var table = d3.edge.table();

// We pass a selection with some data bound to it
table(d3.select("#figure").datum(dataset));

// The same thing can be written using a more typical d3 pattern
// We select an element
d3.select("#figure")
    // bind data to it
    .datum(dataset)
    // and give this to the table
    .call(table);


// Getters//setters
///////////////////////////////////////////////////////////////////////
d3.edge = {};

d3.edge.table = function module() {
    // Here are some "private" methods
    var fontSize = 10,
        fontColor = "red";
    function exports(_selection) {
        _selection.each(function(_data) {
            d3.select(this)
                .append("div")
                .style({
                    "font-size": fontSize + "px",
                    color: fontColor
                })
                .html("Hello World: " + _data);
        });
    }
    // The "public" methods can be set to the "exports" function
    // For example some getters and setters
    exports.setFontSize = function(_size) {
        fontSize = _size;
        // Returning the current context will let us chain setters
        return this;
    };
    exports.getFontSize = function() { return fontSize; };
    // But the typical d3 pattern is to have setter that become a getter when no arguments
    exports.fontColor = function(_x) {
        if (!arguments.length) return fontColor;
        fontColor = _x;
        return this;
    };
    return exports;
};

var table = d3.edge.table();
// Setters can be chained
table.setFontSize("20").fontColor("green");
// Setters are getters when called without argument
console.log(table.fontColor());

d3.select("#figure")
    .datum(dataset)
    .call(table);


// Events
///////////////////////////////////////////////////////////////////////
d3.edge = {};

d3.edge.table = function module() {
    var fontSize = 10,
        fontColor = "red";
    // To get events out of the module
    // we use d3.dispatch, declaring an "hover" event
    var dispatch = d3.dispatch("customHover");
    function exports(_selection) {
        _selection.each(function(_data) {
            d3.select(this)
                .append("div")
                .style({
                    "font-size": fontSize + "px",
                    color: fontColor
                })
                .html("Hello World: " + _data)
                // we trigger the "customHover" event that will receive the usual "d" and "i" arguments
                // as it is equivalent to:
                //     .on("mouseover", function(d, i) { return dispatch.customHover(d, i); });
                .on("mouseover", dispatch.customHover);
        });
    }
    exports.fontSize = function(_x) {
        if (!arguments.length) return fontSize;
        fontSize = _x;
        return this;
    };
    exports.fontColor = function(_x) {
        if (!arguments.length) return fontColor;
        fontColor = _x;
        return this;
    };
    // We can rebind the custom events to the "exports" function
    // so it's available under the typical "on" method
    d3.rebind(exports, dispatch, "on");
    return exports;
};

// Setters can also be chained directly to the returned function
var table = d3.edge.table().fontSize("20").fontColor("green");
// We bind a listener function to the custom event
table.on("customHover", function(d, i) { console.log("customHover: " + d, i); });

d3.select("#figure")
    .datum(dataset)
    .call(table);
