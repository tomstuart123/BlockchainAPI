// NOTE - I know this code isn't the most efficient. To be honest I'm really happy the web app works as feel like I stretched myself.. but I really need to work on structuring my code. I approached this challenge too much on an issue by issue basis which meant that the code ended up a mess. Happy it works but I'm really looking for feedback on how I could have structured it better through the flow. I've commented as best I can to help you follow my thinking



// set overarching app
const blockApp = {};
// set time periods for the initial and the one that chnages
let initialTimePeriod = '1years'
let dateRange = '1years'
// set roll Avg for the rolling average function to allow data to be spread visibly
var rollAvg;
// set the metrics for the API to pull in the right wording
const transactionMetricTracked = 'n-transactions-excluding-popular';
const userMetricTracked = "n-unique-addresses";
const hashMetricTracked = 'hash-rate';
const marketSizeMetricTracked = "market-cap";
// set arrays for usage later
let yArray = [];
blockApp.clickHappened = false;
let xArray = [];
let newXArray = [];
let sizeLineChart;
let competitorLineChart;
let transUserLineChart;
let hashLineChart;
let userLineChart
// set line chart as empty so we can add to it later

// with multiple GET DATA FUNCTIONS, we have multiple API calls. Most are from blockchain.com. The chart for competitors uses coin gecko
blockApp.getUserData = (timePeriodLength = initialTimePeriod) => {
    // get user data from API
    const dataPromise = $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `https://api.blockchain.info/charts/${userMetricTracked}`,
            params: {
                timespan: timePeriodLength,
                rollingAverage: blockApp.updateRollAvgOnDatePeriod(timePeriodLength),
                format: 'json',
            }
        }
    })

    return dataPromise;

}


blockApp.getTransactionData = (timePeriodLength = initialTimePeriod) => {
    // get transaction data from API
    const dataPromise = $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `https://api.blockchain.info/charts/${transactionMetricTracked}`,
            params: {
                timespan: timePeriodLength,
                rollingAverage: blockApp.updateRollAvgOnDatePeriod(timePeriodLength),
                format: 'json',
            }
        }
    })

    return dataPromise;
}

blockApp.getMarketSizeData = (timePeriodLength = initialTimePeriod) => {
    // get market size data from API
    const dataPromise = $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `https://api.blockchain.info/charts/${marketSizeMetricTracked}`,
            params: {
                timespan: timePeriodLength,
                rollingAverage: blockApp.updateRollAvgOnDatePeriod(timePeriodLength),
                format: 'json',
            }
        }
    })

    return dataPromise;
}


blockApp.getHashData = (timePeriodLength = initialTimePeriod) => {
    // get user data from API
    const dataPromise = $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `https://api.blockchain.info/charts/${hashMetricTracked}`,
            params: {
                timespan: timePeriodLength,
                format: 'json',
            }
        }
    })
    return dataPromise;

}

blockApp.getBTCCompetitorData = (timePeriodLength = initialTimePeriod) => {
    // get competitor data. This is a different API so needs to change the initial time period so it is understandable by API
    if (timePeriodLength.includes('5')) {
        timePeriodLength = '1825';
    } else if (timePeriodLength.includes('2')) {
        timePeriodLength = '730';
    } else if (timePeriodLength.includes('1year')) {
        timePeriodLength = '365';
    } else if (timePeriodLength.includes('3month')) {
        timePeriodLength = '90';
    } else if (timePeriodLength.includes('1month')) {
        timePeriodLength = '30';
    } else if (timePeriodLength.includes('7days')) {
        timePeriodLength = '7';
    }

    // get competitor data from API
    const dataPromise = $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${timePeriodLength}`, // ${timePeriodLength}

        }
    })
    return dataPromise;

}

blockApp.getBCHCompetitorData = (timePeriodLength = initialTimePeriod) => {
    // get the second competitor data from the different API. This is a different API so needs to change the initial time period so it is understandable by API
    if (timePeriodLength.includes('5')) {
        timePeriodLength = '1825';
    } else if (timePeriodLength.includes('2')) {
        timePeriodLength = '730';
    } else if (timePeriodLength.includes('1year')) {
        timePeriodLength = '365';
    } else if (timePeriodLength.includes('3month')) {
        timePeriodLength = '90';
    } else if (timePeriodLength.includes('1month')) {
        timePeriodLength = '30';
    } else if (timePeriodLength.includes('7days')) {
        timePeriodLength = '7';
    }

    // get transaction data from API
    const dataPromise = $.ajax({
        url: 'http://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: `https://api.coingecko.com/api/v3/coins/litecoin/market_chart?vs_currency=usd&days=${timePeriodLength}`, // ${timePeriodLength}

        }
    })
    return dataPromise;

}


// this is a function used in the get function. What it does is make sure the data is easy to read as the data set gets larger
blockApp.updateRollAvgOnDatePeriod = (timePeriod) => {
    if (timePeriod.includes('5') === true) {
        return '1months'
    } else if (timePeriod.endsWith('years') === true) {
        return '2weeks'
    } else if (timePeriod.endsWith('months') === true) {
        return '3days'
    } else if (timePeriod.endsWith('weeks') === true) {
        return '1days'
    }
}

// IN THIS SECTION WE RUN MULTIPLE FUNCITONS TO KICK OFF THE CHAIN OF FUNCTIONS IN THE APP. It runs either on page load or on click in the Innit method at the bottom. It first gets the data promise then runs loopConvertAndAppend function

blockApp.runUserApp = (chartRunning) => {

    let userDataObject = blockApp.getUserData(dateRange);        
    // use when to receive API
    $.when(userDataObject).done(function (userDataObject) {
        let userDataArray = userDataObject.values;
        blockApp.loopConvertAndAppendData(userDataArray, chartRunning);

    })

}


blockApp.runTransactionPerUserApp = (chartRunning) => {

    let transDataObject = blockApp.getTransactionData(dateRange);        
    // use when to receive API
    $.when(transDataObject).done(function (transDataObject) {
        let transDataArray = transDataObject.values;
        blockApp.loopConvertAndAppendData(transDataArray, chartRunning);
    })

}

blockApp.runMarketSizeApp = (chartRunning) => {
  
    let sizeDataObject = blockApp.getMarketSizeData(dateRange);        
    // use when to receive API
    $.when(sizeDataObject).done(function (sizeDataObject) {
        let sizeDataArray = sizeDataObject.values;
        blockApp.loopConvertAndAppendData(sizeDataArray, chartRunning);
    })

}

blockApp.runHashApp = (chartRunning) => {

    let hashDataObject = blockApp.getHashData(dateRange);        
    // use when to receive API
    $.when(hashDataObject).done(function (hashDataObject) {
        let hashDataArray = hashDataObject.values;
        blockApp.loopConvertAndAppendData(hashDataArray, chartRunning);

    })

}


// this runApp is slightly different. It is the coin gecko api so this one takes two APIs instead of one
blockApp.runBTCCompetitorApp = (chartRunning) => {
    // change date range for different API

    const competitorBTCDataObject = blockApp.getBTCCompetitorData(dateRange);
    const competitorBCHDataObject = blockApp.getBCHCompetitorData(dateRange);

    // use when to receive API
    $.when(competitorBTCDataObject, competitorBCHDataObject).done(function (competitorBTCDataObject, competitorBCHDataObject) {
        let competitorBTCDataArray = competitorBTCDataObject[0].total_volumes;
        let competitorBCHDataArray = competitorBCHDataObject[0].total_volumes;
        blockApp.loopConvertAndAppendBtcCompetitorData(competitorBTCDataArray, competitorBCHDataArray, chartRunning);

    })
}



// IN THIS SECTION ONCE WE KICK OFF THE FUNCTION AND RECEIVED THE DATA, WE THEN LOOP THROUGH THE DATA, PULL OUT X AND Y INTO SEPERATE ARRAYS (HOW THE CHART WANTS IT), CLEANS IT, DOES MATHS ON IT AND THEN RUNS THE FUNCTION THAT APPENDS IT TO CHART 

blockApp.loopConvertAndAppendData = (data, chartRunning) => {
    // empty old data out so we don't keep adding old and new data to the chart (a major issue I ran into each time the chart ran)
    if (yArray !== []) {
        yArray = [];
    
    }

    console.log(yArray)


    if (xArray !== []) {
        xArray = [];


    }

    newXArray = [];

    // pull out x for usage
    data.forEach((dataPair) => {
        xArray.push(dataPair['x']);
        // console.log(dataPair['x']);
    })

    // convert x into readable date
    newXArray = blockApp.convertDateForX(xArray);


    // pull out y for usage
    data.forEach((dataPair) => {
        yArray.push(dataPair['y']);
    })

    // if maths needed before presentation, run functions to do this here 
    if (chartRunning === "market-size-chart") {
        // to get market size deliverable, divide the data by the total market estimate of gold
        let newYArray = blockApp.mathsOnMarketSize(yArray)
        blockApp.addArrayDataToMarketSizeChart(newXArray, newYArray, chartRunning);
    } else if (chartRunning === "transactions-user-chart") {
        let nextYArray = yArray;
        // to get transactions per user, divide transactions by the number of users
        let userDataObject = blockApp.getUserData(dateRange);
        // to do the maths above, you need another API call to get the user data again
        $.when(userDataObject).done(function (userDataObject) {
            var userDataArray = userDataObject.values;
            userArray = [];
            userDataArray.forEach((dataPair) => {
                userArray.push(dataPair['y']);
            })
      
            let newYArray = blockApp.loopConvertAndMathsOnTransPerUser(nextYArray, userArray)
            
                blockApp.addTransUserArrayDataToChart(newXArray, newYArray, chartRunning);


        })
    } else if (chartRunning === "user-chart") {
        // these are for the normal data sets that don't need maths
        let newYArray = yArray;
        blockApp.addArrayDataToChart(newXArray, newYArray, chartRunning);

    } else {
        let newYArray = yArray;
        blockApp.addHashArrayDataToChart(newXArray, newYArray, chartRunning);
    }

}

// A quick function just helping with the maths in the above function for market size

blockApp.mathsOnMarketSize = (yArray) => {
    var newYArray = [];

    yArray.forEach((yItem) => {

        yItem = (yItem / 7718000000000) * 100;

        newYArray.push(yItem);
    })

    return newYArray
}

// A quick function just helping with the maths in the above function for market size


blockApp.loopConvertAndMathsOnTransPerUser = (yArray, userArray) => {
    var newYArray = [];

    for (transItem in yArray) {
        newItem = yArray[transItem] / userArray[transItem];
        if (newItem === undefined) {
            console.log(undefined);
        } else {
            newYArray.push(newItem);
        }

    }



    // })
    return newYArray;
}


// THIS IS THE SAME AS THE LOOP FUNCTION two above. However, for the COIN GECKO API, you need to add to chart, not just the x and y array but also another y array for the other currency. I split this into another API so as not to ruin the above function

blockApp.loopConvertAndAppendBtcCompetitorData = (btcData, bchData, chartRunning) => {
    // empty old data out
    yArray = [];
    xArray = [];
    newXArray = [];
    bchXArray = [];
    bchYArray = [];

    /// FOR BTC CURRENCY 
    // pull out x for btc
    btcData.forEach((dataPair) => {
        xArray.push(dataPair[0]);
        // console.log(dataPair[0]);

    })

    // convert x
    newXArray = blockApp.convertDateForX(xArray);

    // pull out y
    btcData.forEach((dataPair) => {
        yArray.push(dataPair[1]);
    })

    // extra step for coin gecko. We need to allow for multiple dates on the same day  as they break their data down to hours not days (our first API) given by coingecko API. If any repetitions on the same day, we remove them so its in the same form as our original API

    var novelBtcXArray = [];
    var novelBtcYArray = [];

    for (index in newXArray) {

        if (index == newXArray.indexOf(newXArray[index])) {
            novelBtcXArray.push(newXArray[index]);
            novelBtcYArray.push(yArray[index]);
        }
    }

    /// REPEAT FOR BCH CURRENCY. I KNOW THIS IS A LOT OF DUPLICATE CODE
    // pull out x for btc
    bchData.forEach((dataPair) => {
        bchXArray.push(dataPair[0]);
        // console.log(dataPair[0]);

    })

    // convert x
    newBchXArray = blockApp.convertDateForX(bchXArray);

    // pull out y
    bchData.forEach((dataPair) => {
        bchYArray.push(dataPair[1]);
    })

    // extra step for coin gecko. We need to allow for multiple dates on the same day  as they break their data down to hours not days (our first API) given by coingecko API. If any repetitions on the same day, we remove them so its in the same form as our original API

    var novelBchXArray = [];
    var novelBchYArray = [];

    for (index in newBchXArray) {

        if (index == newBchXArray.indexOf(newBchXArray[index])) {
            novelBchXArray.push(newBchXArray[index]);
            novelBchYArray.push(bchYArray[index]);
        }
    }

    blockApp.addCompetitorArrayDataToChart(novelBtcXArray, novelBtcYArray, novelBchXArray, novelBchYArray, chartRunning);

}





// }

// this is the function used to clean the data 

blockApp.convertDateForX = (oldXArray) => {
    // data clean / allow for different date from coingecko API. This has longer strings of serialised dates
    if (oldXArray[0].toString().length > 11) {
        let tempXArray = []
        oldXArray.forEach((xItem) => {
            newXItem = xItem.toString().slice(0, - 3)
            tempXArray.push(newXItem);
        })
        oldXArray = tempXArray;
    }

    let novelXArray = [];
    oldXArray.forEach((xItem) => {
        let dateTime = new Date(xItem * 1000);
        let formatted = dateTime.toLocaleString();
        // remove the hours and seconds leaving just the date in days/month/year
        let splitFormatted = formatted.split(',');
        let reformatted = splitFormatted[0]
        novelXArray.push(reformatted);

    })

    return novelXArray;

}

/// FINALLY ONCE THE LOOP FUNCTIONS HAVE RUN AND CLEANED DATA. IT ARRIVES HERE. WE RECEIVE AN X ARRAY AND A Y ARRAY AND WHICH CHART WE ARE REFERRING TO. WE ADD THESE TO CHART.JS IN ORDER TO APPEND TO PAGE. 

blockApp.addArrayDataToChart = (xDataArray, yDataArray, chartRunning) => {
    
    //  fix the hover over the chart issue. Essentially you need to delete each chart before re-adding it to the page
        if (blockApp.clickHappened) {
            userLineChart.destroy();
            console.log('user click')
        }



// add chart

    userLineChart = new Chart(document.getElementById(chartRunning), {
        type: 'line',
        data: {
            labels: xDataArray,
            datasets: [{
                data: yDataArray,
                label: dateRange,
                borderColor: "#3e95cd",
                fill: true,
            }
            ]
        },
        options: {
            tooltips: {
                enabled: true,

                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label + ' : ' + tooltipItems.yLabel.toLocaleString();
                    }
                }
            },

            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8,

                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    gridLines: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        },

                    }
                }]
            }
        }
    });
    return userLineChart;

    
}


blockApp.addHashArrayDataToChart = (xDataArray, yDataArray, chartRunning) => {
    
    // fix the hover over the chart issue. Essentially you need to delete each chart before re-adding it to the page
    if (blockApp.clickHappened) {
        hashLineChart.destroy();
        console.log('hash click')
    }

// add chart

    hashLineChart = new Chart(document.getElementById(chartRunning), {
        type: 'line',
        data: {
            labels: xDataArray,
            datasets: [{
                data: yDataArray,
                label: dateRange,
                borderColor: "#3e95cd",
                fill: true,
            }
            ]
        },
        options: {
            tooltips: {
                enabled: true,

                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label + ' : ' + tooltipItems.yLabel.toLocaleString();
                    }
                }
            },

            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8,

                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    gridLines: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        },

                    }
                }]
            }
        }
    });
    return hashLineChart;

    
}

blockApp.addTransUserArrayDataToChart = (xDataArray, yDataArray, chartRunning) => {
    
    // in office hours we tried to fix the hover over chart change bug with this but it didn't work completely

    if (blockApp.clickHappened) {
        transUserLineChart.destroy();
        console.log('transuser click')
    }

    // add chart

    transUserLineChart = new Chart(document.getElementById(chartRunning), {
        type: 'line',
        data: {
            labels: xDataArray,
            datasets: [{
                data: yDataArray,
                label: dateRange,
                borderColor: "#3e95cd",
                fill: true,
            }
            ]
        },
        options: {
            tooltips: {
                enabled: true,

                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label + ' : ' + tooltipItems.yLabel.toLocaleString();
                    }
                }
            },

            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8,

                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    gridLines: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        },

                    }
                }]
            }
        }
    });

    return transUserLineChart;
    
}

/// same for the above but for competitor data we need to add to the chart not just one coin but two coins


blockApp.addCompetitorArrayDataToChart = (xBtcDataArray, yBtcDataArrayComp1, xBchDataArray, yBchDataArray, chartRunning) => {
    
    if (blockApp.clickHappened) {
        competitorLineChart.destroy();
        console.log('competitor click')
    }
    
    competitorLineChart = new Chart(document.getElementById(chartRunning), {
        type: 'line',
        data: {
            labels: xBtcDataArray,
            datasets: [{
                data: yBtcDataArrayComp1,
                label: 'Bitcoin',
                borderColor: "#3e95cd",
                fill: false,
            },
            {
                data: yBchDataArray,
                label: 'Litecoin',
                borderColor: "green",
                fill: false,
            },
            ]
        },
        options: {
            tooltips: {
                enabled: true,

                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label + ' : ' + tooltipItems.yLabel.toLocaleString();
                    }
                }
            },

            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8,

                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    gridLines: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        },

                    }
                }]
            }
        }
    });

    return competitorLineChart;
}


/// for the market size data, we need to add a percentage to the string.


blockApp.addArrayDataToMarketSizeChart = (xDataArray, yDataArray, chartRunning) => {

    if (blockApp.clickHappened) {
        sizeLineChart.destroy();
        console.log('sze click')
    }

    sizeLineChart = new Chart(document.getElementById(chartRunning), {
        type: 'line',
        data: {
            labels: xDataArray,
            datasets: [{
                data: yDataArray,
                label: dateRange,
                borderColor: "#3e95cd",
                fill: true,
            }
            ]
        },
        options: {
            tooltips: {
                enabled: true,

                callbacks: {
                    label: function (tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label + ' : ' + tooltipItems.yLabel.toLocaleString();
                    }
                }
            },

            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8,

                    },
                    gridLines: {
                        drawOnChartArea: false
                    }
                }],
                yAxes: [{
                    gridLines: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        },
                // add percentage to y axis
                        callback: function (tick) {
                            return tick.toString() + '%';
                        },

                    }
                }]
            }
        }
    });

    return sizeLineChart;
}


// THE FINAL TWO SECTIONS RUN ONLY ONCE THE APP HAS RUN ONCE. ONCE THE PAGE HAS LOADED, WE WAIT FOR CLICKS ON THE BUTTONS TO RUN THE FUNCTIONS ALL OVER AGAIN

// this function checks for click and pulls out (for later usage in the get / chart appending method) which time period button was clicked and stores it. Then it runs the function below

blockApp.checkClick = (chartButtons) => {
    $(chartButtons).on('click', function () {
    
            if ($(this).is(`#1-weeks-btn`)) {
                dateRange = '7days';
            

            } else if ($(this).is(`#1-months-btn`)) {
                dateRange = '1months';
                // console.log(dateRange);
            } else if ($(this).is(`#3-months-btn`)) {
                dateRange = '3months';
                // console.log(dateRange);
            } else if ($(this).is(`#1-years-btn`)) {
                dateRange = '1years';
                // console.log(dateRange);
            } else if ($(this).is(`#2-years-btn`)) {
                dateRange = '2years';
                // console.log(dateRange);
            } else if ($(this).is(`#5-years-btn`)) {
                dateRange = '5years';
                // console.log(dateRange);
            }

            blockApp.workOutClick(chartButtons);

    })

}

// here you check the click for where it is on the page. This is so we know where to append it on the page

blockApp.workOutClick = (sectionButtonClicked) => {

    if (sectionButtonClicked.includes('transaction')) {
        blockApp.clickHappened = true;
        console.log('click happened')
        blockApp.runTransactionPerUserApp("transactions-user-chart");
    } else if (sectionButtonClicked.includes('user')) {
        blockApp.clickHappened = true;
        console.log('click happened')
        blockApp.runUserApp("user-chart");
    } else if (sectionButtonClicked.includes('market-size')) {
        blockApp.clickHappened = true;
        console.log('click happened')
        blockApp.runMarketSizeApp("market-size-chart");
    }
    else if (sectionButtonClicked.includes('competitor')) {
        blockApp.clickHappened = true;
        console.log('click happened')
        blockApp.runBTCCompetitorApp("competitor-chart");
    } else if (sectionButtonClicked.includes('hash')) {
        blockApp.clickHappened = true;
        console.log('click happened')
        blockApp.runHashApp("hash-chart");
    }


}

// the innit function that kicks everything off. this runs twice, once on page loads and again on any clicks.


blockApp.init = function () {
        blockApp.runTransactionPerUserApp("transactions-user-chart");
        blockApp.runUserApp("user-chart");
        blockApp.runMarketSizeApp("market-size-chart");
        blockApp.runBTCCompetitorApp("competitor-chart");
        blockApp.runHashApp("hash-chart"); 
        blockApp.checkClick('.transactions-user-btn');
        blockApp.checkClick('.users-btn');
        blockApp.checkClick('.market-size-btn');
        blockApp.checkClick('.competitor-btn');
        blockApp.checkClick('.hash-btn');

        // ensure we knwo when page loads
   
}

blockApp.init();


