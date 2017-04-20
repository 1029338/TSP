var cities = [];
var edges = [];
var distanceMatrix = [];
var cityNumber = 0;
var myTimerSoltuion;

function setup() {
    h1 = createElement("h1","Visualization of TSP with Dynamic programming");
    h1.style('text-align:center');
    
    var p1 = createP("Please upload data, use the random point plotter or simply click anywhere on the canvas to get vertices/cities.");
    
    createP("");
    var p=createP("Types of Input: ");
	p.id("para");
    input1 = createInput();
    input1.class('inputStyle');
    buttonGo = createButton("Plot Random Cities");
    buttonFile= createButton("Upload data");
	buttonFile.id("fileDiv");
	buttonFile.mousePressed(triggerFile);
    var div=createDiv();
	div.id('upfilediv');
	var fileSelect = createFileInput(fileUploaded, 'multiple');
	fileSelect.id('upfile');
	fileSelect.parent('upfilediv');
	createP("");
	var maindiv=createDiv("");
	maindiv.id('maindiv');
	var canspan=createDiv("");
	canspan.id('canspan');
	infoSpan=createDiv("");
	infoSpan.id('infoSpan');
	canspan.parent('maindiv');
	infoSpan.parent('maindiv');
	var infoP=createP(distanceMatrix);
	infoP.id('infoP');
	infoP.parent('infoSpan');
    var can=createCanvas(800,422.4);
	can.class('canvasStyle');
	can.parent('canspan');
    createP("");
    
    buttonStart = createButton("Start");
    createP("");
    //buttonNext = createButton("Next");

    buttonGo.mousePressed(buttonPlotRandomSeeds);
   // buttonNext.mousePressed(buttonNextTSP);
    buttonStart.mousePressed(buttonStartTSP);
    frameRate(200);
}


function fileUploaded(file) {

  var table = loadTable(file.name);
  rowCount = table.getRowCount();
  for (var row = 0; row < rowCount; row++) {
    
    var x = table.getRow(row).get(1);
    var y = table.getRow(row).get(2);
    
  console.write("("+ x + " , "+y+")");
	}
}

 function triggerFile(file) {
  document.getElementById("upfile").click();
 }

function draw() {
    
    background(0);
	smooth();
    
    if(cities.length == 1){
        noStroke();
        fill(255);
        ellipse(cities[0].xCoordinate,cities[0].yCoordinate,16,16);
        
        fill(255,0,0);
        textAlign(CENTER,CENTER);
        textStyle(BOLD)
        text(cities[0].name, cities[0].xCoordinate, cities[0].yCoordinate);
    }
    for(var i=0; i < edges.length;i++){
        edges[i].displayEdge();
    }
    noLoop();
}

function mousePressed(){		
    cityNumber++;		
    if(0 <= mouseX && mouseX <= width && 0 <= mouseY && mouseY <= height){		
        cities.push(new city(mouseX,mouseY,cityNumber));		
        //console.log(cities);		
        populateEdges();		
    }		
    loop();		
}

function buttonPlotRandomSeeds() {
    seeds = input1.value();
    cities = [];
    edges = [];
    distanceMatrix = [];
    
    for(var i=0; i<seeds; i++){
          cities[i] = new city(floor(random(20,width-20)),floor(random(20,height-20)),i+1);
    }
	populateEdges();		    
    loop();		
}

function populateEdges(){		
    edges = [];    
    for(var i=0; i<cities.length;i++){
        distanceMatrix[i] = [];
        for(var j=0;j<cities.length;j++){
            if(i!=j){
                distanceMatrix[i][j] = cities[i].distance(cities[j]);
                edges.push(new edge(cities[i],cities[j],'#f00'));
            }
            else{
                distanceMatrix[i][j] = 0;
            }
        }
    }
	
	document.getElementById('infoP').innerHTML="Distance Matrix<br>";
	for(var i = 0; i < distanceMatrix.length; i++) {
		document.getElementById('infoP').innerHTML+="<br>"
		if(i==0)
			document.getElementById('infoP').innerHTML+="[";
		for(var j = 0; j < distanceMatrix[i].length; j++) {
			if(j!=distanceMatrix[i].length-1)
				document.getElementById('infoP').innerHTML+=distanceMatrix[i][j]+"&nbsp;&nbsp;,&nbsp;&nbsp;";
			else
				document.getElementById('infoP').innerHTML+=distanceMatrix[i][j]+"&nbsp;&nbsp;";
		}
		if(i==distanceMatrix.length-1)
			document.getElementById('infoP').innerHTML+="]";
	}
    //console.log(distanceMatrix);
    //loop();
}


function buttonStartTSP() {
    
    var startCity = cities[0];
    var setOfCities = [];
    
    for(var i=1 ; i<cities.length; i++){
        setOfCities[i-1] = cities[i];
    }
    
    for(var i=0; i<edges.length; i++){
        edges[i].show = false;
    }
    redraw();
    
    var finalSolution = TSP(startCity, setOfCities, cities);
    var finalpath = finalSolution.path;

    for(var i=0; i<edges.length; i++){
        edges[i].show = false;
    }
    redraw();
    
    for(var a=0; a<finalpath.length; a++){
        var city1,city2;
        if( (a+1) < finalpath.length){
            city1 = cities[finalpath[a]-1];
            city2 = cities[finalpath[a+1]-1];
            var ans = findEdgeIndex(city1,city2);
            for(var index=0;index<ans.length; index++){
                edges[ans[index]].show = true;
                edges[ans[index]].color = '#0f0';
            }               
        }
        else{
            city1 = cities[finalpath[a]-1];
            city2 = cities[finalpath[0]-1];
            var ans = findEdgeIndex(city1,city2);
            for(var index=0;index<ans.length; index++){
                edges[ans[index]].show = true;
                edges[ans[index]].color = '#0f0';
            }
        }
    }
    console.log(finalSolution.minDistance);
    console.log(finalpath);
    console.log(cities);
    loop();
}

function TSP(startCity, setOfCities, cities ){
    if(setOfCities.length == 1){
        var subProblemSolutionToRoot;
        var pathToRoot;
        var temp1 = startCity.distance(setOfCities[0]);
        var temp2 = setOfCities[0].distance(cities[0]);
        pathToRoot = new Array(startCity.name,setOfCities[0].name,cities[0].name);
        subProblemSolutionToRoot = new SubProblemSolution(temp1+temp2,pathToRoot);
        return (subProblemSolutionToRoot);
    }
    else{
        var subProblemSolution;
        var currentDistances = [];
        var currentMin = 500000;
        var path =  [];
        for(var i=0; i<setOfCities.length; i++){
            var newStartCity = setOfCities[i];
            var newSetOfCities = [];
            for(var j=0;j<setOfCities.length; j++){
                if(i!=j){
                    append(newSetOfCities,setOfCities[j]);
                }
            }
            var temp3 = TSP(newStartCity,newSetOfCities,cities);
            var temp4 = startCity.distance(newStartCity);
            var tempDistance = temp3.minDistance+temp4;
            if(currentMin > tempDistance){
                path = [];
                currentMin = tempDistance;
                path.push(startCity.name);
                path.push(newStartCity.name);
                for (var k=1;k< temp3.path.length;k++){
                    path.push(temp3.path[k]);
                }
            }
            append(currentDistances,temp3.minDistance+temp4);
            //console.log("Current MIN "+ currentMin+" While I = "+i);
        }
        currentDistances = sort(currentDistances);
        subProblemSolution = new SubProblemSolution(currentDistances[0],path);
        var subPath = subProblemSolution.path;
        for(var a=0; a<subPath.length; a++){   
            var city1,city2;
            if( (a+1) < subPath.length){
                city1 = cities[subPath[a]-1];
                city2 = cities[subPath[a+1]-1];
                var ans = findEdgeIndex(city1,city2);
                for(var index=0;index<ans.length; index++){
                    edges[ans[index]].show = true;
                    edges[ans[index]].color = '#ff0';
                    edges[ans[index]].displayEdge();
                }
                //redraw();
            }
            else{
                city1 = cities[subPath[a]-1];
                city2 = cities[subPath[0]-1];
                var ans = findEdgeIndex(city1,city2);
                for(var index=0;index<ans.length; index++){
                    edges[ans[index]].show = true;
                    edges[ans[index]].color = '#ff0';
                    edges[ans[index]].displayEdge();
                }
                //redraw();
            }
        }
		redraw();
        return subProblemSolution;
    }
}

function findEdgeIndex(city1,city2){
    var ans = [];
    var edgeName1 = str(city1.name) + str(city2.name);
    var edgeName2 = str(city2.name) + str(city1.name);
    for(var i=0; i<edges.length; i++){
        if(edges[i].name == edgeName1 || edges[i].name == edgeName2 ){
            ans.push(i);
        }
    }
    return ans;
}

/*function buttonNextTSP() {
    NextClicked = true;
}*/