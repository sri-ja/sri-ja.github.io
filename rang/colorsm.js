let squareNumber = 6;
let colorsArray = generateRandomColorsArray(squareNumber);

let squareArray = document.querySelectorAll(".square");
let displayText = document.querySelector("#colorDisplay");
let resultDisplay = document.querySelector("#resultDisplay");
let headingBackGround = document.querySelector("h1");
let resetButton = document.querySelector("#resetGame");
let easyBtn = document.querySelector("#easyBtn");
let hardBtn = document.querySelector("#hardBtn");

let pickedColor = pickAColor();
displayText.textContent = pickedColor;

let responses = ["ROCK","FISH","DOG","DRAGON","SPARROW","HAMSTER","MONKEY","BEAR","PANDA","SOCK","ELF","GOBLIN"];

for(let i=0; i<squareArray.length;i++){
    squareArray[i].style.backgroundColor = colorsArray[i];

    squareArray[i].addEventListener("click",function(){
        let clickedColor = this.style.backgroundColor;

    if(clickedColor === pickedColor){
        changeColor(clickedColor);
        resultDisplay.textContent = "Yaayy, you are a MASTER GUESSER"
        headingBackGround.style.backgroundColor = clickedColor;
        headingBackGround.classList.remove("header");
        resetButton.textContent = "play again"
    }
    else{
        this.style.backgroundColor = "#151515";
        resultDisplay.textContent = "My Pet " + responses[Math.floor(Math.random()*responses.length)] + " has better guessing skills"
    }
    })
}

resetButton.addEventListener("click",function(){
    colorsArray = generateRandomColorsArray(squareNumber);
    pickedColor = pickAColor();
    displayText.textContent = pickedColor;
    
    for(let i=0; i<squareArray.length;i++){
        squareArray[i].style.backgroundColor = colorsArray[i];
    }
    headingBackGround.classList.add("header");
    
    resultDisplay.textContent = "";
    resetButton.textContent = "new colors";
})

easyBtn.addEventListener("click",function(){
    easyBtn.classList.add("selected");
    hardBtn.classList.remove("selected");
    squareNumber = 3;
    colorsArray = generateRandomColorsArray(squareNumber);
    pickedColor = pickAColor();
    displayText.textContent = pickedColor;
    headingBackGround.classList.add("header");
    resultDisplay.textContent = "";
    resetButton.textContent = "new colors";
    
    for(let i=0; i<squareArray.length;i++){
        if(i<squareNumber){
            squareArray[i].style.backgroundColor = colorsArray[i];
        }
        else{
            squareArray[i].style.display = "none";
        }
    }
})

hardBtn.addEventListener("click",function(){
    hardBtn.classList.add("selected");
    easyBtn.classList.remove("selected");
    squareNumber = 6;
    colorsArray = generateRandomColorsArray(squareNumber);
    pickedColor = pickAColor();
    displayText.textContent = pickedColor; 
    headingBackGround.classList.add("header");
    resultDisplay.textContent = "";
    resetButton.textContent = "new colors";

    for(let i=0; i<squareArray.length;i++){
        if(i<squareNumber){
            squareArray[i].style.backgroundColor = colorsArray[i];
            squareArray[i].style.display = "block";
        }
    }
})

function changeColor(color){
   for(let i=0; i<squareArray.length ; i++){
       squareArray[i].style.backgroundColor = color;
   }
}

function pickAColor(){
    let random = Math.floor(Math.random() * colorsArray.length);
    return colorsArray[random];
}

function generateRandomColorsArray(num){
    let arr = [];
    for(let i=0;i<num;i++){
        arr.push(randomlyGeneratedColor());
    }
    return arr;
}

function randomlyGeneratedColor(){
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    let generatedColor = "rgb(" + r + ", " + g + ", " + b + ")";
    return generatedColor;
}
