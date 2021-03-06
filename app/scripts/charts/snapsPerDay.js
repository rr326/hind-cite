/* global d3:false, _:false, nv:false*/
/* exported chartSnapsPerDay */

var chartSnapsPerDay = (function ($, _, nv) {
    'use strict';
    function chart() {
        var elId, data;

        function init(config) {
            if (!config || !config.elId) {
                throw new Error('snapsPerDay.init - missing config properties: ', config);
            }

            nv.dev = false;  // turn off nvd3 automatic console logging
            elId = config.elId;
            data = config.data;

            d3.select(idToSelector(elId, 'chart'))
                .append('svg');
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
        function dataCloudantToNV(data) {
            var datal = [
                []
            ];
            var format = d3.time.format('%Y-%m-%d');

            data.forEach(function (d) {
                datal[0].push({x: format.parse(d.key), y: d.value});

            });

            //noinspection UnnecessaryLocalVariableJS
            var nvdata = [
                {key: 'Snaps Per Day', values: datal[0]}
            ];

            return nvdata;
        }

        /**
         Makes sure every date between first and last has at least a 0 value
         */
        function fillEmptyDates(data) {
            if (data === null || data[0].values.length === 0) {
                return data;
            }

            if (Date.prototype.tomorrow == null) {
                Date.prototype.tomorrow=function(){
                    /* Returns a new date object*/
                    var newd = new Date(this);
                    newd.setDate(newd.getDate()+1);
                    return newd;
                };
            }


            var newdata = [];

            var curDate = data[0].values[0].x;

            data[0].values.forEach(function(d){
                while(curDate < d.x) {
                    newdata.push({x:curDate, y:0});
                    curDate = curDate.tomorrow();
                }
                newdata.push(d);
                curDate = curDate.tomorrow();
            });

            return [{key: 'Snaps Per Day', values: newdata}];
        }

        function idToSelector(id, subSelector) {
            if (!_.contains(['chart', 'svg'], subSelector)) {
                throw new Error('idToSelector - unexpected element name: ', subSelector);
            }

            var sel = '#' + id;

            if (subSelector === 'svg') {
                sel += ' svg';
            } else if (subSelector === 'chart') {
                sel += ' .chart';
            }

            return sel;
        }

        function draw(config) {

            if (!config || !config.data) {
                throw new Error('snapsPerDay.draw - missing config.data: ', config);
            }

            var postData = dataCloudantToNV(config.data);
            postData = fillEmptyDates(postData);

            nv.addGraph(function () {
                var chart = nv.models.multiBarChart()
                        .x(function (d) {
                            return d.x;
                        })
                        .y(function (d) {
                            return d.y;
                        })
                        .tooltips(true)
                        .reduceXTicks(true)
                        .transitionDuration(350)
                        .showControls(false)
                        .showLegend(false)
                        .delay(0)
                    ;


                chart.xAxis
                    .tickFormat(function (d) {
                        return d3.time.format('%x')(d);
                    })
                    .axisLabel('Date (UTC)');

                chart.yAxis
                    .tickFormat(d3.format(',g'))
                    .axisLabel('Number');


                d3.select(idToSelector(elId, 'svg'))
                    .datum(postData)
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });


        }

        return {
            init: init,
            draw: draw
        };
    }


    return {
        chart: chart
    };

}($, _, nv));

