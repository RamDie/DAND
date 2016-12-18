/**
* Shows the plots of circles
* @param {type} plot subject
*/

function showPlot(type){

var label_l;
var label_r;


//Circles data (position, text, fill and letter color)
if (type == 'prosper'){
      dataset = [   {"x":50, "r":20, "label":"HR","color":"#edf8e9","letcol":"black"}, 
              {"x":100, "r":23, "label":"E","color":"#c7e9c0","letcol":"black"}, 
              {"x":156, "r":26, "label":"D","color":"#a1d99b","letcol":"black"},
              {"x":300, "r":29, "label":"C","color":"#74c476","letcol":"white"},
              {"x":250, "r":32, "label":"B","color":"#41ab5d","letcol":"white"},
              {"x":300, "r":35, "label":"A","color":"#238b45","letcol":"white"},
              {"x":350, "r":38, "label":"AA","color":"#005a32","letcol":"white"}] 

      label_l = "Higher Risk"; 
      label_r = "Lower Risk";
      tid = "#prates";
      fsize = 15;

}else if (type == 'occup'){ 
      dataset = [   {"x":50, "r":20, "label":"Homemaker","color":"#eff3ff","letcol":"black"}, 
              {"x":100, "r":23, "label":"Bus Driver","color":"#bdd7e7","letcol":"black"}, 
              {"x":156, "r":26, "label":"Sales C.","color":"#6baed6","letcol":"black"},
              {"x":300, "r":29, "label":"Scientist","color":"#3182bd","letcol":"white"},
              {"x":250, "r":32, "label":"Programmer","color":"#08519c","letcol":"white"}] 

      label_l = "Less Technological"; 
      label_r = "More Technological";
      tid = "#occups .plot";
      fsize = 12;
}

  var width = 650,
      height = 138;

  var svg = d3.select(tid).append("svg")
      .attr("width", width)
      .attr("height", height);

  // Circles are drawn
  var nodes = svg.append("g")
             .attr("class", "nodes")
             .selectAll("circle")
             .data(dataset)
             .enter()
             .append("g")
             .attr("transform", function(d, i) {
               d.x = i * 90 + 50,
               d.y = 400 / 2;
               return "translate(" + d.x + "," + 70+ ")"; 
             });
    
  // Feature increasion indicator             
  svg.append("line")
  .style("stroke", "black") 
  .attr("x1", 100)     
  .attr("y1", height)  
  .attr("x2", dataset.length * 92 - 110) 
  .attr("y2", height); 

  svg.append("text")
       .attr("text-anchor", "middle")
       .attr("dx", 50)
       .attr("dy",height - 3)
       .text(label_l)
       .style("font-family","Arial");

  svg.append("text")
       .attr("text-anchor", "middle")
       .attr("dx", dataset.length * 92 - 50)
       .attr("dy",height - 3)
       .text(label_r)
       .style("font-family","Arial");     


  nodes.append("circle")
        .attr("class", "node")
        .attr("r", 40)
        .style("fill", function(d){return d.color});

  nodes.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", function(d){return d.r / 5})
       .text(function(d) {
         return d.label;
        })
       .style("fill", function(d){return d.letcol})
       .style("font-family","Arial")
       .style("font-weight", "bold")
       .style("font-size", fsize);

}

/**
* Shows the animation and interactive barchart
* @param {data} prosper ratings data
*/
function draw(data){

var margin = {top: 20, right: 20, bottom: 30, left: 85},
  width = 1050 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


var x0 = d3.scale.ordinal()           // Distance between groups
  .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
  .range([height, 0]);

var indx_prev;

// Qualitative colors for occupations
var colorRange = ["#98AFC7", "#F2BB66","#307D7E", "#C7B097", "#7D312F"];

// Default colors for introduction
var markColorRange =  ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];  

// Occupations names  
var occupNames = ['Homemaker','Bus Driver','Sales - Commission','Scientist','Computer Programmer'];

// Prosper Rates  
var prospRates = ['HR','E','D','C','B','A','AA'];


// Scales
var color = d3.scale.ordinal()
  .range(colorRange);   

var markColor = d3.scale.ordinal()
  .range(markColorRange);      

// Axis
var xAxis = d3.svg.axis()
  .scale(x0)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(d3.format(".1%"));

d3.select("#plots")
.append("h1")
.text("Prosper Rating per Occupation");

var svg = d3.select("#plots").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("margin-top", 50)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Occupations are filtered based on occupNames array
var filtered = data.filter(function(d) {
    if ( occupNames.indexOf(d.Occupation) != -1 ){
      return true;
    }
});


function compareOccup(a,b) {
if (occupNames.indexOf(a.Occupation) < occupNames.indexOf(b.Occupation))
return -1;
if (occupNames.indexOf(a.Occupation) > occupNames.indexOf(b.Occupation))
return 1;
return 0;
}

// Data is sorted by occupation position on array occupNames
filtered.sort(compareOccup);

// Data is grouped by occupation and prosper rating in order to totalize the number of clients per prosper rate per occupation
var dataNest = d3.nest()
.key(function(d) {return d.Occupation;})
.key(function(d) {return d['ProsperRating (Alpha)'];})
.rollup(function(d) {
 return {
   frequency:d3.sum(d,function(g) {return 1;}),
 };
})  
.entries(filtered);

// Number of clients per Occupation is determined
var dataTot = d3.nest()
.key(function(d) {return d.Occupation;})
.rollup(function(d) {
 return {
   total:d3.sum(d,function(g) {return 1;}),
 };
})  
.entries(filtered);

var cont = 0;

// Based on totals calculated previously, the proportion of each prosper rate per occupation is calculated
dataNest.forEach(function(d) {
d.values.forEach(function(e) {
  e.values.frequency = e.values.frequency / dataTot[cont].values.total;
});
cont += 1;
});

cont = 0;

var dataChart = [];
var occups = [];

// New array of objects is created when each object key is the prosper rating, and includes other array with occupation proportion for that prosper rating
for(var i = 0; i < prospRates.length ; i++){
var objChart = {prate:'',occups:[]}
var occups = [];

objChart.prate = prospRates[i];

dataNest.forEach(function(d) {
  d.values.forEach(function(e) {
    if (e.key == prospRates[i]){
      occups[cont] = {name:d.key, value:e.values.frequency};
      cont += 1;
    }
  });
});

objChart.occups = occups;
dataChart[i] = objChart;
cont = 0;
}

// Scales are set with domains
x0.domain(dataChart.map(function(d) { return d.prate; }));
x1.domain(occupNames).rangeRoundBands([0, x0.rangeBand()]);
y.domain([0, d3.max(dataChart, function(d) { return d3.max(d.occups, function(d) { return d.value; }); })]);

// X Axis is added to the page
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);


// Y Axis is added to the page
svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("% of workers")
  .attr("font-size","13")
  .attr("font-weight","bold");


var colorIntro = [];

/**
* Update the barchart by using transitions.
* @param {string} occupation 
* @param {string} button
* @param {int} indx 
*/
function update(occupation,button,mark,indx) {
var filteredChart = [];
var occups = [];
var occups_order = [];
var increasion = false;
var prevOccups = [];
var prevOccObj = [];

if (button == null){
  d3.select("h1")
    .text("Prosper Rating per Occupation [" + occupation + "]");
}

console.log(newOccup);
occInd = newOccup.indexOf(occupation);

if (occInd == -1){
    d3.select(button)
    .transition()
    .duration(500)
    .style("background", "white")
    .style("color", "black")
    .style("box-shadow", "0 0 5px -1px rgba(0,0,0,0.6)");
  newOccup.push(occupation);
  increasion = true;
}else{
  d3.select(button)
    .transition()
    .duration(500)
    .style("background", color)
    .style("color", "white")
    .style("weight", "bold");

  prevOccups = newOccup.slice(0);

  for(var i = 0; i<prevOccups.length; i++){
    prevOccObj[i] = {name:prevOccups[i], value:0};
  }

  newOccup.splice(occInd,1);
}

/**
 * Compare the occupations based on the dynamic occupation position (as per user selection)
 * @param {string} a Occupation a
 * @param {string} b Occupation b
*/
function compareOccup(a,b) {
  if (newOccup.indexOf(a.name) < newOccup.indexOf(b.name))
    return -1;
  if (newOccup.indexOf(a.name) > newOccup.indexOf(b.name))
    return 1;
  return 0;
}  

for(var i = 0; i < prospRates.length ; i++){
  var objChart = {prate:'',occups:[],prOccp:[]}
  var occups = [];
  
  objChart.prate = prospRates[i];

  dataNest.forEach(function(d) {
    if (newOccup.indexOf(d.key) != -1 ){ 
      d.values.forEach(function(e) {
        if (e.key == prospRates[i]){
          occups[cont] = {name:d.key, value:e.values.frequency};
          cont += 1;
        }
      });
    }
  });


  
  // Data is ordered by occupation in order to avoid undesirables effects in the transtition
  occups.sort(compareOccup);      

  objChart.occups = occups;
  objChart.prOccp = prevOccObj;
  // console.log(prevOccups);
  filteredChart[i] = objChart;
  cont = 0;
}


for(var i=0; i < filteredChart[0].occups.length; i++){
  occups_order.push(filteredChart[0].occups[i].name);
}

x1.domain(newOccup).rangeRoundBands([0, x0.rangeBand()]);

var occPos = 0;

// The current occupation is colored in red during the animation, and the others in white
if (mark == true){  
  colorIntro = markColorRange.slice();
  occPos = occups_order.indexOf(occupation);
  colorIntro[occPos] = "red";
  var color_scale = d3.scale.ordinal()
      .range(colorIntro); 

}else{
  var color_scale = color;
}


// if ((indx == 0) || (increasion == false)){
if ((increasion == false)){      

  var rects = svg.selectAll(".bar")
    .data(filteredChart)
    .selectAll("rect") 
    .data(function(d) {return d.occups;},function(d) {return d.name;});

  rects
  .exit()
  .remove();
}else{

  if (indx ==0){
    var rects = svg.selectAll("rect")       
    .data(filteredChart)
    .enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x0(d.prate) + ",0)"; });
  }

  var rects = svg.selectAll(".bar") 
    .data(filteredChart)
    .selectAll("rect") 
    .data(function(d) {return d.occups;});

  rects
  .enter()
  .append("rect");
} 

if ((increasion == true) && (newOccup.length == 1)){
  rects
  .attr("width", x1.rangeBand())      
  .attr("x", function(d) { return x1(d.name); })
  .style("fill", "white")
  .transition()
  .duration(500)       
  .style("fill", function(d) { return color_scale(d.name); })
  .style("stroke", "black")
  .attr("y", function(d) { return y(d.value); })    
  .attr("height", function(d) { return height - y(d.value)  ; })
  .style("stroke", "black")
  .style("stroke-width" ,0.5);  
}else if (increasion == true){
  rects
  .transition()
  .duration(500) 
  .attr("width", x1.rangeBand())      
  .attr("x", function(d) { return x1(d.name); })    
  .style("fill", function(d) { return color_scale(d.name); })  
  .transition()
  .duration(500) 
  .attr("y", function(d) { return y(d.value); })    
  .attr("height", function(d) { return height - y(d.value)  ; })
  .style("stroke", "black")
  .style("stroke-width",0.5);          
}else{
  rects
  .transition()
  .duration(500)       
  .attr("width", x1.rangeBand())      
  .attr("x", function(d) { return x1(d.name); })    
  .style("fill", function(d) { return color_scale(d.name); })  
  .attr("y", function(d) { return y(d.value); })    
  .attr("height", function(d) { return height - y(d.value)  ; })
  .style("stroke", "black")
  .style("stroke-width",0.5);         
}


d3.selectAll(".legend").remove();

var legend = svg.selectAll(".legend")
  .data(newOccup.slice())
  .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color_scale);

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });
}// Close update


//******************* ANIMATION ***************//

var newOccup = [];

var occupIdx = 0;

update(occupNames[occupIdx],null,true,occupIdx);
occupIdx++;

startIntroduction(2500);   

/**
* Run the introduction.
* @param {milliseconds} timeInt Set the time between slides.
*/
function startIntroduction(timeInt){
occup_interval = setInterval(function() {


  update(occupNames[occupIdx],null,true,occupIdx);

  timeInt = 1000;
  occupIdx++;

  if(occupIdx > occupNames.length) {
      clearInterval(occup_interval);

/*****************BUTTONS*****************/

      d3.select("h1")
      .text("Prosper Rating per Occupation");
      
      newOccup = [];

      d3.selectAll('rect').remove();
      d3.selectAll(".legend").remove();


       d3.select("body")
              .append("div")
              .attr("class", "occup_buttons")
              .selectAll("div")
              .data(occupNames)
              .enter()
              .append("div")
              .style("background", color)
              .style("color", "white")
              .style("weight", "bold")                   
              .append("label")  
              .append("span")
              .text(function(d) {
                  return d;
              }); 


      var checkboxs = d3.selectAll(".occup_buttons label")
                        .insert("input", ":first-child")
                        .attr("type", "checkbox");

      // On button click event, the update function is called
      checkboxs.on("click", function(d) {
          update(d,this);
      });
  }
}, timeInt);
}  
}