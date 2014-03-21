'use strict';


var chartMultiPost = (function ($, _, nv) {
        function chart() {
            var elId, chartSize, data, graph, nvChart;

            function init(config) {
                if (!config || !config.elId) {
                    throw new Error('snapsPerDay.init - missing config properties: ', config);
                }

                elId = config.elId;
                chartSize = config.chartSize;
                data = config.data;

                d3.select(idToSelector(elId, 'chart'))
                    .append("svg")


            }

            /**
             *
             * @param data -
             *  [
             ...
             history :
             [
             {
               "points": 6,
               "rank": 7,
               "comments": 0,
               "timestamp_str": "2014-02-24 14:42:36"
             },
             ...
             ]
             ]
             * @return [{x: 0, y: value}, ...]
             */
            function dataCloudantToNV(raw, metric) {
                var rawSeries, outSeries, out = [];

                for (var key in raw) {
                    if (key == 'timestamp') {
                        continue;
                    }

                    rawSeries = raw[key];
                    outSeries = {
                        key: rawSeries.id ,
                        title: rawSeries.title,
                        values: []
                    };

                    rawSeries.history.forEach(function (snap) {
                        outSeries.values.push({x: snap.timestamp_d, y: snap[metric]})
                    });

                    out.push(outSeries);
                }

                console.log('dataCloudantToNV. ', raw, '-->', out);
                return out;
            }


            function idToSelector(id, subSelector) {
                if (!_.contains(['chart', 'svg'], subSelector)) {
                    throw new Error('idToSelector - unexpected element name: ', subSelector);
                }

                var sel = '#' + id;

                if (subSelector === 'svg') {
                    sel += ' svg';
                } else if (subSelector == 'chart') {
                    sel += ' .chart';
                }

                return sel;
            }


            function draw(config) {

                if (!config || !config.data || !config.metric) {
                    throw new Error('snapsPerDay.draw - missing config.data: ', config);
                }

                var postData = dataCloudantToNV(config.data, config.metric);

                nv.addGraph(function () {
                    nvChart = nv.models.lineChart()
                        .margin({top: 30, right: 50, bottom: 50, left: 50})


                    nvChart.xAxis
                        .axisLabel('Time (local timezone)')
                        .tickFormat(function (d, i) {
                            return d3.time.format('%_m/%_d/%y %H:%M')(new Date(d));
                        });


                    nvChart.yAxis
                        .axisLabel(config.metric)
                        .axisLabelDistance(50)
                        .tickFormat(d3.format('d'));


                    d3.select(idToSelector(elId, 'svg'))
                        .datum(postData)
                        .call(nvChart);

                    nv.utils.windowResize(function () {
                        nvChart.update()
                    });

                    return nvChart;
                });

            }


            return {
                init: init,
                draw: draw
            }
        }


        return {
            chart: chart
        };

    }
        ($, _, nv)
        )
    ;

