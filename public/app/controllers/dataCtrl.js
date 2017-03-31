angular.module('dataController', ['userServices'])

.controller('dataCtrl', function(User){
    var graphYearLabel = [];
    var graphPreviousYearLabel = [];
    var graphYearData = [];
    var graphPreviousYearData = [];
    var realGraphYearLabel = [];
    var realGraphPreviousYearLabel = [];
    var finalGraphLabel = [];

    function getMonthStringFromMonthNumber(monthNum){
        var monthName = moment.months(monthNum - 1);
        return monthName;
    }

    var app = this;
    app.totalUsers = 0;

    User.getUsers().then(function(data){
        var currentMonthArray = [];
        var previousMonthArray = [];

        var currentTime = new Date();
        var currentYear = parseInt(currentTime.getFullYear());
        var previousYear = currentYear - 1;
        var m,t,s,dateArray,year,parsedYear,day,month,parsedMonth;
        if(data.data.success){
            app.totalUsers = data.data.users.length;
            console.log(data.data.users.length);
            for(var i = 0; i < app.totalUsers; i++){
                m = data.data.users[i].createdate;
                t = m.split('T');
                s = t[0];
                dateArray = s.split('-');
                year = dateArray[0];
                parsedYear = parseInt(dateArray[0]);

                if(parsedYear === currentYear){
                    //console.log("2017");
                     month = dateArray[1];
                     parsedChecker = parseInt(month);
                     day = dateArray[2];
                    currentMonthArray.push(parsedChecker);
                }
                else if(parsedYear === previousYear){
                    //console.log("2017");
                     month = dateArray[1];
                     parsedChecker = parseInt(month);
                     day = dateArray[2];
                    previousMonthArray.push(parsedChecker);
                }

            }
            foo(currentMonthArray);
            foo(previousMonthArray);
            console.log(foo(currentMonthArray),foo(previousMonthArray));
            //var obj = {
            //    "January":
            //}
            graphYearLabel = foo(currentMonthArray)[0];
            graphPreviousYearLabel = foo(previousMonthArray)[0];

            graphYearData = foo(currentMonthArray)[1];
            graphPreviousYearData = foo(previousMonthArray)[1];

            for(var j = 0; j < graphYearLabel.length; j++){
                realGraphYearLabel.push(getMonthStringFromMonthNumber(graphYearLabel[j]));
            }
            for(var k = 0; k < graphPreviousYearLabel.length; k++){
                realGraphPreviousYearLabel.push(getMonthStringFromMonthNumber(graphPreviousYearLabel[k]));
            }
            console.log(graphPreviousYearData,realGraphPreviousYearLabel);
            /*for(var j = 0; j < graphPreviousYearLabel.length; j++){
                realGraphPreviousYearLabel.push(getMonthStringFromMonthNumber(graphPreviousYearLabel[j]));
            }*/

            Array.prototype.unique = function() {
                var a = this.concat();
                for(var i=0; i<a.length; ++i) {
                    for(var j=i+1; j<a.length; ++j) {
                        if(a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }
                return a;
            };

            //finalGraphLabel = realGraphYearLabel.concat(realGraphPreviousYearLabel).unique();
            console.log(finalGraphLabel);
        }

        function foo(arr) {
            var a = [], b = [], prev;

            arr.sort();
            for ( var i = 0; i < arr.length; i++ ) {
                if ( arr[i] !== prev ) {
                    a.push(arr[i]);
                    b.push(1);
                } else {
                    b[b.length-1]++;
                }
                prev = arr[i];
            }
            return [a, b];
        }
        var ctx1 = document.getElementById("lineChart1");
    			var lineChart = new Chart(ctx1, {
    				type: 'line',
    				data: {
    					labels: realGraphYearLabel,
    					datasets: [{
    						label: "This Year - " + currentYear,
    						backgroundColor: "rgba(38, 185, 154, 0.31)",
    						borderColor: "rgba(38, 185, 154, 0.7)",
    						pointBorderColor: "rgba(38, 185, 154, 0.7)",
    						pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
    						pointHoverBackgroundColor: "#fff",
    						pointHoverBorderColor: "rgba(220,220,220,1)",
    						pointBorderWidth: 1,
    						data: graphYearData
    					}]
    				},
    			});
                var ctx11 = document.getElementById("lineChart2");
            			var lineChart = new Chart(ctx11, {
            				type: 'line',
            				data: {
            					labels: realGraphPreviousYearLabel,
            					datasets: [{
            						label: "Previous Year - " + previousYear,
            						backgroundColor: "rgba(38, 185, 154, 0.31)",
            						borderColor: "rgba(38, 185, 154, 0.7)",
            						pointBorderColor: "rgba(38, 185, 154, 0.7)",
            						pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
            						pointHoverBackgroundColor: "#fff",
            						pointHoverBorderColor: "rgba(220,220,220,1)",
            						pointBorderWidth: 1,
            						data: graphPreviousYearData
            					}]
            				},
            			});

                var ctx2 = document.getElementById("radarChart1");
    			var radarChart = new Chart(ctx2, {
    				type: 'radar',
    				data: {
    				    labels: realGraphYearLabel,
    					datasets: [{
    					    label: "This Year - " + currentYear,
    						backgroundColor: "rgba(116, 130, 143, 0.7)",
    						borderColor: "rgba(116, 130, 143, 1)",
    						pointBorderColor: "rgba(116, 130, 143,1)",
    						pointBackgroundColor: "rgba(116, 130, 143,1)",
    						pointHoverBackgroundColor: "#fff",
    						pointHoverBorderColor: "rgba(220,220,220,1)",
    						pointBorderWidth: 1,
    						data: graphYearData
    					}]
    				},
    			});

                var ctx22 = document.getElementById("radarChart2");
                var radarChart = new Chart(ctx22, {
                    type: 'radar',
                    data: {
                        labels: realGraphPreviousYearLabel,
                        datasets: [{
                            label: "Previous Year - " + previousYear,
                            backgroundColor: "rgba(150, 192, 206, 0.7)",
                            borderColor: "rgba(150, 192, 206, 1)",
                            pointBorderColor: "rgba(150, 192, 206, 1)",
                            pointBackgroundColor: "rgba(150, 192, 206, 1)",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(151,187,205,1)",
                            pointBorderWidth: 1,
                            data: graphPreviousYearData
                        }]
                    },
                });



                var ctx3 = document.getElementById("doughnutChart1");
    			var doughnutChart = new Chart(ctx3, {
    				type: 'doughnut',
    				data: {
    				    labels: realGraphYearLabel,
    					datasets: [{
    					    label: "This Year - " + currentYear,
    						backgroundColor: "rgba(115, 44, 123, 0.31)",
    						borderColor: "rgba(115, 44, 123, 0.7)",
    						pointBorderColor: "rgba(115, 44, 123, 0.7)",
    						pointBackgroundColor: "rgba(115, 44, 123, 0.7)",
    						pointHoverBackgroundColor: "#fff",
    						pointHoverBorderColor: "rgba(220,220,220,1)",
    						pointBorderWidth: 1,
    						data: graphYearData
    					}]
                    },
                });

                var ctx33 = document.getElementById("doughnutChart2");
    			var doughnutChart = new Chart(ctx33, {
    				type: 'doughnut',
    				data: {
    				    labels: realGraphPreviousYearLabel,
    					datasets: [{
                            label: "Previous Year - " + previousYear,
                            backgroundColor: "rgba(189, 174, 198, 0.31)",
                            borderColor: "rgba(189, 174, 198, 0.7)",
                            pointBorderColor: "rgba(189, 174, 198, 0.7)",
                            pointBackgroundColor: "rgba(189, 174, 198, 0.7)",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(151,187,205,1)",
                            pointBorderWidth: 1,
                            data: graphPreviousYearData
    					}]
                    },
                });

                var ctx4 = document.getElementById("pieChart1");
    			var pieChart = new Chart(ctx4, {
    				type: 'pie',
    				data: {
    				    labels: realGraphYearLabel,
    					datasets: [{
    					    label: "This Year - " + currentYear,
    						backgroundColor: "rgba(182, 33, 45, 0.31)",
    						borderColor: "rgba(182, 33, 45, 0.7)",
    						pointBorderColor: "rgba(182, 33, 45, 0.7)",
    						pointBackgroundColor: "rgba(182, 33, 45, 0.7)",
    						pointHoverBackgroundColor: "#fff",
    						pointHoverBorderColor: "rgba(220,220,220,1)",
    						pointBorderWidth: 1,
    						data: graphYearData
    					}]
    				},
    			});

                var ctx44 = document.getElementById("pieChart2");
    			var pieChart = new Chart(ctx44, {
    				type: 'pie',
    				data: {
    				    labels: realGraphPreviousYearLabel,
    					datasets: [{
                            label: "Previous Year - " + previousYear,
                            backgroundColor: "rgba(255, 113, 130, 0.31)",
                            borderColor: "rgba(255, 113, 130, 0.7)",
                            pointBorderColor: "rgba(255, 113, 130, 0.7)",
                            pointBackgroundColor: "rgba(255, 113, 130, 0.7)",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(151,187,205,1)",
                            pointBorderWidth: 1,
                            data: graphPreviousYearData
    					}]
    				},
    			});



                var ctx5 = document.getElementById("polarareaChart1");
    			var polarareaChart = new Chart(ctx5, {
    				type: 'polarArea',
    				data: {
    				    labels: realGraphYearLabel,
    					datasets: [{
    					    label: "This Year - " + currentYear,
    						backgroundColor: "rgba(255, 207, 121, 0.31)",
    						borderColor: "rgba(255, 207, 121, 0.7)",
    						pointBorderColor: "rgba(255, 207, 121, 0.7)",
    						pointBackgroundColor: "rgba(255, 207, 121, 0.7)",
    						pointHoverBackgroundColor: "#fff",
    						pointHoverBorderColor: "rgba(220,220,220,1)",
    						pointBorderWidth: 1,
    						data: graphYearData
    					}]
    				},
    			});

                var ctx55 = document.getElementById("polarareaChart2");
    			var polarareaChart = new Chart(ctx55, {
    				type: 'polarArea',
    				data: {
    				    labels: realGraphPreviousYearLabel,
    					datasets: [{
                            label: "Previous Year - " + previousYear,
                            backgroundColor: "rgba(169, 207, 84, 0.31)",
                            borderColor: "rgba(169, 207, 84, 0.7)",
                            pointBorderColor: "rgba(169, 207, 84, 0.7)",
                            pointBackgroundColor: "rgba(169, 207, 84, 0.7)",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(151,187,205,1)",
                            pointBorderWidth: 1,
                            data: graphPreviousYearData
    					}]
    				},
    			});



                var ctx6 = document.getElementById("barChart1");
    			var barChart = new Chart(ctx6, {
    				type: 'bar',
    				data: {
    				    labels: realGraphYearLabel,
                        datasets: [{
    					    label: "This Year - " + currentYear,
    						backgroundColor: "rgba(255, 113, 130, 1)",
    						borderColor: "rgba(255, 113, 130, 0.7)",
    						pointBorderColor: "rgba(255, 113, 130, 0.7)",
    						pointBackgroundColor: "rgba(255, 113, 130, 0.7)",
    						pointHoverBackgroundColor: "#fff",
    						pointHoverBorderColor: "rgba(220,220,220,1)",
    						pointBorderWidth: 1,
    						data: graphYearData
    					}]
    				},
    			});

                var ctx66 = document.getElementById("barChart2");
                var barChart = new Chart(ctx66, {
                    type: 'bar',
                    data: {
                        labels: realGraphPreviousYearLabel,
                        datasets: [{
                            label: "Previous Year - " + previousYear,
                            backgroundColor: "rgba(255, 174, 93, 1)",
                            borderColor: "rgba(255, 174, 93, 0.7)",
                            pointBorderColor: "rgba(255, 174, 93, 0.7)",
                            pointBackgroundColor: "rgba(255, 174, 93, 0.7)",
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "rgba(220,220,220,1",
                            pointBorderWidth: 1,
                            data: graphPreviousYearData
                        }]
                    },
                });


    });
});
