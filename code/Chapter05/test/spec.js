describe('Reusable Bar Chart Test Suite', function() {
    var barChart, dataset, fixture;

    beforeEach(function () {
        dataset = [10, 20, 30, 40];
        barChart = d3.edge.barChart();
        fixture = d3.select('body')
            .append('div')
            .classed('test-container', true);
    });

    afterEach(function () {
        fixture.remove();
    });

    it('should render a chart with minimal requirements', function() {
        fixture.datum(dataset).call(barChart);
        expect(fixture.select('.chart')).toBeDefined(1);
    });

    it('should provide getters and setters', function() {
        var defaultWidth = barChart.width();
        var defaultEase = barChart.ease();

        barChart.width(1234).ease('linear');

        var newWidth = barChart.width();
        var newEase = barChart.ease();

        expect(defaultWidth).not.toBe(1234);
        expect(defaultEase).not.toBe('linear');
        expect(newWidth).toBe(1234);
        expect(newEase).toBe('linear');
    });

    it('should scope some private and some public fields and methods', function() {
        expect(barChart.className).toBeUndefined();
        expect(barChart.ease).toBeDefined();
        expect(typeof barChart.ease).toBe('function');
    });

    it('should update a chart with new attributes', function() {
        barChart.width(10000);
        fixture.datum(dataset)
            .call(barChart);

        barChart.width(20000);
        fixture.call(barChart);

        expect(barChart.width()).toBe(20000);
    });

    it('should update a chart with new data', function() {
        fixture.datum(dataset)
            .call(barChart);

        var firstBarNodeData1 = fixture.selectAll('.bar')[0][0].__data__;

        var dataset2 = [1000];
        fixture.datum(dataset2)
            .call(barChart);

        var firstBarNodeData2 = fixture.selectAll('.bar')[0][0].__data__;

        expect(firstBarNodeData1).toBe(dataset[0]);
        expect(firstBarNodeData2).toBe(dataset2[0]);
    });

    it('should render two charts with distinct configuration', function() {
        fixture.append('div')
            .datum(dataset)
            .call(barChart);

        var dataset2 = [400, 300, 200, 100];
        var barChart2 = d3.edge.barChart().ease('linear');

        fixture.append('div')
            .datum(dataset2)
            .call(barChart2);

        var charts = fixture.selectAll('.chart');

        expect(charts[0].length).toBe(2);
        expect(barChart2.ease()).not.toBe(barChart.ease());
    });

    it('can be composed with another one', function() {
        fixture.datum(dataset)
            .call(barChart);

        var barChart2 = d3.edge.barChart();

        fixture.selectAll('.chart')
            .datum(dataset)
            .call(barChart2);

        var charts = fixture.selectAll('.chart');

        expect(charts[0].length).toBe(2);
        expect(charts[0][1].parentElement).toBe(charts[0][0]);
    });

    it('should render a chart for each data series', function() {
        var dataset = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];

        fixture.selectAll('div.container')
            .data(dataset)
            .enter().append('div')
            .classed('container', true)
            .datum(function(d, i){ return d; })
            .call(barChart);

        var charts = fixture.selectAll('.chart');

        expect(charts[0].length).toBe(dataset.length);
        expect(charts[0][0].__data__).toBe(dataset[0]);
        expect(charts[0][1].__data__).toBe(dataset[1]);
        expect(charts[0][2].__data__).toBe(dataset[2]);
    });

    it('should trigger a callback on events', function() {
        fixture.datum(dataset)
            .call(barChart);

        var callback = jasmine.createSpy("filterCallback");
        barChart.on('customHover', callback);

        var bars = fixture.selectAll('.bar');
        bars[0][0].__onmouseover();
        var callBackArguments = callback.argsForCall[0][0];

        expect(callback).toHaveBeenCalled();
        expect(callBackArguments).toBe(dataset[0]);
    });
});
