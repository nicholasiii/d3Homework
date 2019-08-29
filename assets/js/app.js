// Had to redo everything from what Tom saw
//Setting up the SVG's height/width, this is a very elegent way to do the height I stole from some chick on the net
var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 10;
var labArea = 110;
var padding = 45;

// Creating SVG object 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Starting the work to label the axes
svg.append("g").attr("class", "xaxisText");
var xaxisText = d3.select(".xaxisText");
var botTextx =  (width - labArea)/2 + labArea;
var botTexty = height - margin - padding;
xaxisText.attr("transform",`translate(
    ${botTextx}, 
    ${botTexty})`
    );

// x-axis (bottom)
// Building xaxisText details (css class)
xaxisText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xaxisText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xaxisText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

// y-axis (left)
// Second g tag for yText (css class)
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// Transform to adjust for yText
var leftTextx =  margin + padding;
var leftTexty = (height + labArea) / 2 - labArea;
yText.attr("transform",`translate(
    ${leftTextx}, 
     ${leftTexty}
    )rotate(-90)`
    );

// Build yText details (css class)
yText .append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
// Visualize data  _______________________________________  
// Define dynamic circle radius
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

// Read in data as promise and visualize
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (csvData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // Current X & Y selections, double asdefault selections
   var curX = "poverty";
   var curY = "obesity";

   // Creates the tooltip
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //Build text box
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${curY}: ${d[curY]}%</div>`;
            if (curX === "poverty") {
                xLine = `<div>${curX}: ${d[curX]}%</div>`}          
            else {
                xLine = `<div>${curX}: ${parseFloat(d[curX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    // Actually adds the tooltip
    svg.call(toolTip);

    // Lets you switch your axis variables
    function  labelUpdate(axis, clickText) {
        // Switch old choice off
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        // switches new choice on
        clickText.classed("inactive", false).classed("active", true);
        }

    // Need Min/Max for scaling, this sets up the functions
    function xMinMax() {
      xMin = d3.min(csvData, function(d) {
        return parseFloat(d[curX]) * 0.85;
      });
      xMax = d3.max(csvData, function(d) {
        return parseFloat(d[curX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(csvData, function(d) {
        return parseFloat(d[curY]) * 0.85;
      });
      yMax = d3.max(csvData, function(d) {
        return parseFloat(d[curY]) * 1.15;
      }); 
    }

    // Running the functions
    xMinMax();
    yMinMax();
	
	//Creating the scale
    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labArea, margin])

    // Actually create the Axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Function to calculate the number of ticks on the graph
    function tickCount() {
      if (width <= 530) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();

    // Appending the axes to the SVG
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labArea}, 
            0 )`
        );

    // Appending the circles
    var alltheCircles = svg.selectAll("g alltheCircles").data(csvData).enter();

    alltheCircles.append("circle")
        .attr("cx", function(d) {
            // xScale figures the pixels
            return xScale(d[curX]);
        })
        .attr("cy", function(d) {
            return yScale(d[curY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        //cool graphical shit for when they click a circle
        .on("mouseover", function(d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        //undoing said cool graphical shit when they leave the circle
        .on("mouseout", function (d) {
            toolTip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3")
        });

        // Putting the state abbr. on the circles (dx & dy are locations)
        alltheCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[curX]);
            })
            .attr("dy", function(d) {
              // Moving the text so it looks better
              return yScale(d[curY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

          // Moving circles when clicked
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              // Getting rid of the old data
              if (self.classed("inactive")) {
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  curX = name;

                  // Update min/max for x
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  // Moving Circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[curX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(700)
                        .attr("dx", function(d) {
                            return xScale(d[curX])                          
                        });
                  });          
                  labelUpdate(axis, self);
                }

                 // Now for Y 
                else {
                  curY = name;

                  // Y min/max need changing
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(700)
                        .call(yAxis);

                  // Moving circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(700)
                        .attr("cy", function(d) {
                            return yScale(d[curY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                           // Center text
                            return yScale(d[curY]) + cRadius/3;                          
                        });
                  });

                  // change the classes of to active and the clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}