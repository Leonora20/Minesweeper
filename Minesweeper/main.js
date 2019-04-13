var size;
let mines = [];
var true_mines_flagged = 0;
var total_divs_flagged = 0;
var tile_data = new Array();
var row_size;

function GetSelectedItem(el) {
    var e = document.getElementById(el);
    var strSel = e.options[e.selectedIndex].value;
    size = strSel;

    init_grid(size);

    var divs = document.getElementsByClassName('tile');
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', divClick, false);
    }
}

//------------------------right click-------------------------------------------//

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('wrapper').addEventListener('contextmenu', function (event) {
        event.preventDefault();
    
            var tile = event.target;

            if (tile.getAttribute("data-isFlag") == "true") {
                tile.removeAttribute("class");
                tile.setAttribute("class", "box tile blank_tile");
                tile.setAttribute("data-isFlag", false);
                
                total_divs_flagged -= 1;
            }
            else {
                flagCheck(tile);

                tile.setAttribute("data-isFlag", true);
                var x = tile.getAttribute("data-x");
                var y = tile.getAttribute("data-y");
                var xy_object = new Pair(x, y);
                var is_mine = check_mine(xy_object);
                if (is_mine) {
                    true_mines_flagged++;
                    total_divs_flagged++;
                } else {
                    total_divs_flagged++;
                }
                if (true_mines_flagged == mines.length && total_divs_flagged == mines.length) {
                    document.getElementById("img").src = img.src.replace("game_images/smiley.png", "game_images/winner.png");
                    //alert("You Win...!");
                }
            }

        //console.log("True Mines: "+true_mines_flagged);
        //console.log("Total divs flagged: "+total_divs_flagged);
    }, false)
});
 
function flagCheck(tile){
    if (tile.getAttribute("class") == "box tile blank_tile"){
        tile.classList.remove("blank_tile");
        tile.classList.add("flag_tile");
    }
    else if(tile.getAttribute("class") == "box tile flag_tile"){
        tile.classList.remove("flag_tile");
        tile.classList.add("blank_tile");
    }
}

//------------------------left click-------------------------------------------//

function main() {  
}

function divClick(event){
    var clickedDiv = event.target;

    var x = clickedDiv.getAttribute("data-x");
    var y = clickedDiv.getAttribute("data-y");
    var x_int = parseInt(x);
    var y_int = parseInt(y);

    var exposeData = tile_data[x][y];

    revealTile(exposeData, x + "-" + y , x_int, y_int);

}

function revealTile(exposeData, divId, x_int, y_int){
    var clickedDiv = document.getElementById(divId);
    if (exposeData == -1) {
        clickedDiv.classList.remove("blank_tile");
        clickedDiv.classList.add("mine_tile");
        clickedDiv.setAttribute("tile_open", true);

        explodeMines();
    }
    else if (exposeData > 0) {
        clickedDiv.classList.remove("blank_tile");
        clickedDiv.classList.add("tile_"+exposeData);
        clickedDiv.setAttribute("tile_open", true); 
    }
    else {
        clickedDiv.classList.remove("blank_tile");
        clickedDiv.classList.add("empty_tile");
        clickedDiv.setAttribute("tile_open", true);

        flood(new Pair(x_int,y_int), row_size);
    }
}

//------------------------flooding-------------------------------------------//

function flood(xy_pair, row_size){
    var floodArray = getSurroundings(xy_pair, row_size);

    for (var i = 0; i < floodArray.length; i++) {

        var element_id = floodArray[i].x + "-" + floodArray[i].y ;
            var n_div = document.getElementById(element_id);
            var tile_open = n_div.getAttribute("tile_open");
            var divId = floodArray[i].x + "-" + floodArray[i].y ;
            
        if(tile_data[floodArray[i].x][floodArray[i].y] == 0 && tile_open == "false"){         
            revealTile(tile_data[floodArray[i].x][floodArray[i].y], divId, floodArray[i].x, floodArray[i].y);
        }
        else if(tile_data[floodArray[i].x][floodArray[i].y] > 0){
            revealTile(tile_data[floodArray[i].x][floodArray[i].y], divId, floodArray[i].x, floodArray[i].y);
        } 
    }    
}

document.addEventListener('click', function (event) {
    event.preventDefault();
});

function openTile(tilePair) {
    var mine_state = check_mine(tilePair);
    if (mine_state == true) {
        alert("Ur Dead..!");
    }
}

function init_grid(size) {
    var i;

    if (size == 1) {
        row_size = 8;
    } else if (size == 2) {
        row_size = 9;
    } else {
        row_size = 10;
    }
    let root = document.documentElement;
    root.style.setProperty('--col-size', row_size);
    root.style.setProperty('--row-size', row_size);
    var count = 0;
    for (i = 0; i < row_size; i++) {
        for (j = 0; j < row_size; j++) {
            var div = document.createElement("DIV");
            div.setAttribute("id", i + "-" + j);
            div.setAttribute("name", i);
            div.setAttribute("data-x", i);
            div.setAttribute("data-y", j);
            div.setAttribute("data-isFlag", false);
            div.setAttribute("tile_open", false);
            div.setAttribute("class", "box tile blank_tile");
            document.getElementById("wrapper").appendChild(div);
        }
    }

    tile_data = new Array(row_size);

    for (var i = 0; i < row_size; i++) {
        tile_data[i] = new Array(row_size);
    }

    for (i = 0; i < row_size; i++) {
        for (j = 0; j < row_size; j++) {
            tile_data[i][j] = 0;
        }
    }
    assign_mines(row_size * row_size);
    generateProx(row_size);
}

function generateProx(row_size) {
    for (var i = 0; i < mines.length; i++) {

        var surrs = getSurroundings(mines[i], row_size);
        for (j = 0; j < surrs.length; j++) {

            var jPair = surrs[j];
            if (tile_data[jPair.x][jPair.y] != -1)
                tile_data[jPair.x][jPair.y]++;
        }
    }
}

function getSurroundings(xy_pair, row_size) {
    var surr = [];
    var lb = 0;
    var ub = row_size - 1;
    var rlb;
    var rub;
    var clb;
    var cub;

    if (xy_pair.x == lb)
        rlb = 0;
    else
        rlb = xy_pair.x - 1;

    if (xy_pair.x == ub)
        rub = ub;
    else
        rub = xy_pair.x + 1;


    if (xy_pair.y == lb)
        clb = 0;
    else
        clb = xy_pair.y - 1;

    if (xy_pair.y == ub)
        cub = ub;
    else
        cub = xy_pair.y + 1;


    for (var i = rlb; i <= rub; i++) {
        for (var j = clb; j <= cub; j++) {
            if (!(i == xy_pair.x && j == xy_pair.y)) {
                var temp_xy = new Pair(i, j);
                surr.push(temp_xy);
            }
        }
    }

    return surr;
}

function assign_mines(size) {

    let mine_count = Math.floor((size / 100) * 2);
    var row_size = Math.sqrt(size);

    while (mines.length <= mine_count) {
        var r = getRandomArbitrary(1, size);
        var ri = Math.floor(r / row_size);
        if (r % row_size == 0) {
            var temp = (ri * row_size);
        }
        else {
            var temp = (ri * row_size) + 1;
        }

        var ci = r - temp;

        var cdr = new Pair(ri, ci);
        var isDuplicate = false;
        for (var i = 0; i < mines.length; i++) {
            if (mines[i].x == ri && mines[i].y == ci) {
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate == false) {
            mines.push(cdr);
            tile_data[cdr.x][cdr.y] = -1;
        }
    }
}

function explodeMines(){
    var audio = new Audio("game_audio/blast.mp3");
    for(i=0;i<mines.length;i++){   
        var mineDiv = document.getElementById(mines[i].x+"-"+mines[i].y);
        mineDiv.classList.remove("blank_tile");
        mineDiv.classList.add("mine_tile");        
    }   
    audio.play();
    document.getElementById("img").src = img.src.replace("game_images/smiley.png", "game_images/loser.png");
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function check_mine(xy_object) {
    for (var i = 0; i < mines.length; i++) {
        if (mines[i].x == xy_object.x && mines[i].y == xy_object.y) {
            return true;
        }
    }
    return false;
}

class Pair {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}