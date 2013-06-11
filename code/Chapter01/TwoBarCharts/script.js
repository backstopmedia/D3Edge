var data1 = [10, 20, 30, 40];

var w = 400,
    h = 300,
    margins = {left:50, top:50, right:50, bottom: 50},
    x1 = d3.scale.ordinal().rangeBands([0, w]).domain(data1);
    y1 = d3.scale.linear().range([h,0]).domain([0, d3.max(data1)]);

var chart1 = d3.select("#container1").append("svg")
      .attr('class', 'chart1')
      .attr('width', w)
      .attr('height', h)
    .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  chart1.selectAll(".bar")
      .data(data1)
    .enter().append("rect")
      .attr('class', 'bar')
      .attr('x', function (d, i) {return  x1(d);})
      .attr('y', function (d) {return y1(d);})
      .attr('height', function (d) {return h-y1(d);})
      .attr('width', x1.rangeBand())
      .on('mouseover', function (d,i) {
        d3.selectAll('text').remove();
        chart1.append('text')
          .text(d)
          .attr('x', function () {return  x1(d) + (x1.rangeBand()/2);})
          .attr('y', function () {return y1(d)- 5;});
      });

var data2 = [100, 259, 332, 435, 905, 429];

var w = 400,
    h = 300,
    margins = {left:50, top:50, right:50, bottom: 50},
    x2 = d3.scale.ordinal().rangeBands([0, w]).domain(data2);
    y2 = d3.scale.linear().range([h,0]).domain([0, d3.max(data2)]);

var chart2 = d3.select("#container2").append("svg")
      .attr('class', 'chart2')
      .attr('width', w)
      .attr('height', h)
    .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  chart2.selectAll(".bar")
      .data(data2)
    .enter().append("rect")
      .attr('class', 'bar')
      .attr('x', function (d, i) {return  x2(d);})
      .attr('y', function (d) {return y2(d);})
      .attr('height', function (d) {return h-y2(d);})
      .attr('width', x2.rangeBand())
      .on('mouseover', function (d,i) {
        d3.selectAll('text').remove();
        chart2.append('text')
          .text(d)
          .attr('x', function () {return  x2(d) + (x2.rangeBand()/2);})
          .attr('y', function () {return y2(d)- 5;});
      });
