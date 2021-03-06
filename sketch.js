var cities = [];
var edges = [];
var distanceMatrix = [];
var cityNumber = 0;
var center;

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
    buttonStart = createButton("Start");
	createP("");
	var div=createDiv("Subproblems<br>");
	div.id('div');
	var maindiv=createDiv("");
	maindiv.id('maindiv');
	var canspan=createDiv("");
	canspan.id('canspan');
	infoSpan=createDiv("Distance Matrix<br><br>");
	infoSpan.id('infoSpan');
	infoSpanNew=createDiv("");
	infoSpanNew.id('infoSpanNew');
	canspan.parent('maindiv');
	infoSpan.parent('maindiv');
	infoSpanNew.parent('infoSpan');
    var can=createCanvas(800,350);
	can.class('canvasStyle');
	can.parent('canspan');
    createP("");
    buttonGo.mousePressed(buttonPlotRandomSeeds);
    buttonStart.mousePressed(buttonStartTSP);
    frameRate(200);
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
    if(0 <= mouseX && mouseX <= width && 0 <= mouseY && mouseY <= height){
        cityNumber++;
        cities.push(new city(mouseX,mouseY,cityNumber));
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
	
	var temp=document.getElementById('infoSpanNew');
	if(temp.hasChildNodes())
		temp.removeChild(center);
	center= document.createElement('center');
	var table = document.createElement('table'), tr,trHead, th, td, row, cell;
	center.appendChild(table);
	temp.appendChild(center);
	for(var i = 0; i < distanceMatrix.length; i++) {
		if(i==0){
			trHead = document.createElement('tr');
			table.appendChild(trHead);
			trHead.className='dynamicSpanHead';
				for(var j = 0; j <= distanceMatrix[i].length; j++) {
					th = document.createElement('th');
					th.style='padding:10px;';
					trHead.appendChild(th);
					if(j==0)
						th.innerHTML="";
					else
						th.innerHTML=j;
				}
			}
		tr = document.createElement('tr');
		table.appendChild(tr);
		tr.className='dynamicSpan';
		td = document.createElement('td');
		tr.appendChild(td);
		td.innerHTML=i+1;
		for(var j = 0; j < distanceMatrix[i].length; j++) {
			td = document.createElement('td');
			tr.appendChild(td);
			td.innerHTML=distanceMatrix[i][j];
		}
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
    var darshCities = [];
    for(var darsh=0;darsh<setOfCities.length;darsh++){
        darshCities.push(setOfCities[darsh].name);
    }
    //console.log("Open  Subproblem - " + "StartCity : " + startCity.name + " SetOfCities : "+darshCities);
    if(setOfCities.length == 1){
        var subProblemSolutionToRoot;
        var pathToRoot;
        var temp1 = startCity.distance(setOfCities[0]);
        var temp2 = setOfCities[0].distance(cities[0]);
        pathToRoot = new Array(startCity.name,setOfCities[0].name,cities[0].name);
        subProblemSolutionToRoot = new SubProblemSolution(temp1+temp2,pathToRoot);
        //console.log("Close Subproblem - " + "StartCity : " + startCity.name + " SetOfCities : "+darshCities);
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
            /*else{
                city1 = cities[subPath[a]-1];
                city2 = cities[subPath[0]-1];
                var ans = findEdgeIndex(city1,city2);
                for(var index=0;index<ans.length; index++){
                    edges[ans[index]].show = true;
                    edges[ans[index]].color = '#ff0';
                    edges[ans[index]].displayEdge();
                }
                //redraw();
            }*/
        }
		//redraw();
		//console.log(subProblemSolution);
				
        console.log("Close Subproblem - " + "StartCity : " + startCity.name + " SetOfCities : " + darshCities + " Solution : " + subProblemSolution.path + " MinDistance : " + subProblemSolution.minDistance );
		document.getElementById('div').innerHTML+="<br>StartCity&nbsp;:&nbsp;" + startCity.name + "&nbsp;&nbsp;&nbsp;SetOfCities&nbsp;:&nbsp;" + darshCities + "&nbsp;&nbsp;&nbsp;Min Distance&nbsp;:&nbsp;"+subProblemSolution.minDistance+"&nbsp;&nbsp;&nbsp;Solution:&nbsp;"+subProblemSolution.path;		
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