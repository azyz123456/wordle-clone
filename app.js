//main game variables
let guesses = document.getElementById("guesses");
let str = document.querySelector("#debug");
let numGuesses=0;
let currBoxNum = 0;
let gameOver = false;

let answer;
let words;
let guess = "";
let occurrencesInAnswer;
let occurencesInGuess;

//keyboard rows
let firstRow = document.querySelector("#firstrow");
let secondRow = document.querySelector("#secondrow");
let thirdRow = document.querySelector("#thirdrow");

window.onload = function() {
    setAnswer();
    //create guess boxes

        for (let box=0; box<30; box++) {
            let c = document.createElement("div");
            c.id = box;
            c.classList.add("box");
            guesses.appendChild(c);
        }


    //create keyboard
    let row1 = "QWERTYUIOP";
    let row2 = "ASDFGHJKL";
    let row3 = "ZXCVBNM";

    //listen to physical keyboard
    document.addEventListener('keyup', (event) => {
        setLetterWithKeyboard(event);
    });
    
    for (let i=0; i<row1.length; i++) {
        let keytile = document.createElement("div");
        keytile.classList.add("keytile");
        keytile.innerHTML = row1[i];
        keytile.id = "key" + row1[i];
        keytile.addEventListener("click", setLetter);
        firstRow.appendChild(keytile);
    }

    for (let i=0; i<row2.length; i++) {
        let keytile = document.createElement("div");
        keytile.classList.add("keytile");
        keytile.innerHTML = row2[i];
        keytile.id = "key" + row2[i];
        keytile.addEventListener("click", setLetter);
        secondRow.appendChild(keytile);
    }


    let enterKey = document.createElement("div");
    enterKey.classList.add("bigkeytile");
    enterKey.innerHTML = "ENTER";
    enterKey.addEventListener("click", () => setGuess());
    thirdRow.appendChild(enterKey);

    for (let i=0; i<row3.length; i++) {
        let keytile = document.createElement("div");
        keytile.classList.add("keytile");
        keytile.innerHTML = row3[i];
        keytile.id = "key" + row3[i];
        keytile.addEventListener("click", setLetter);
        thirdRow.appendChild(keytile);
    }


    let xKey = document.createElement("div")
    xKey.addEventListener("click", backspace);
    xKey.classList.add("bigkeytile");
    xKey.innerHTML = "←";
    thirdRow.appendChild(xKey);
    

}

async function setAnswer() {

    let ret = await fetch("http://127.0.0.1:5500/Wordle/answerWords.txt");
    words = await ret.text();
    words = words.split("\n");
    
    for (let i=0; i<words.length; i++) {
        words[i]=words[i].substring(0,words[i].length-1);
        words[i] = words[i].toUpperCase();
    }

    //console.log("words:", words);

    //choose an answer for the game
    let index = Math.floor(Math.random()*words.length);
    answer = words[index];
    console.log(answer);

    occurrencesInAnswer = [];

    for (let letter of answer) {
        if (occurrencesInAnswer[letter]) {
            occurrencesInAnswer[letter]++;
        } else {
            occurrencesInAnswer[letter] = 1;
        }
    }
}

function checkGuess() {
    //check guess against answer

    occurrencesInGuess = [];

    for (let letter of guess) {
        if (occurrencesInGuess[letter]) {
            occurrencesInGuess[letter]++;
        } else {
            occurrencesInGuess[letter] = 1;
        }
    }


    for (let i=0; i<answer.length; i++) {
        //troubleshooting: str.innerHTML = "Occurrences in guess: " + occurrencesInGuess[guess[i]];
        //str.innerHTML += " Occurrences in answer: " + occurrencesInAnswer[guess[i]];
        let id = i+numGuesses*5;
        let tile = document.getElementById(id);
        let keytile = document.getElementById("key" + tile.innerHTML);

        if (guess[i]===answer[i]) {
            //tile turns green
            tile.style.backgroundColor = "#6AAA64";
            tile.style.borderColor = "#6AAA64";
            tile.style.color = "white";

            //key turns green
            keytile.style.backgroundColor = "rgb(106, 170, 100)";
            keytile.style.color = "white";

        }
        else if (answer.includes(guess[i])) {
            //troubleshooting: console.log("background color of key tile: ", keytile.style.backgroundColor);
            //when the guess has more of a specific letter than the answer, turn tiles that are not in the correct place grey until the number of remaining letters in guess and the answer is the same

            if (keytile.style.backgroundColor != "rgb(106, 170, 100)") {
                keytile.style.backgroundColor = "#C9B458";
                keytile.style.color = "white";
            } 

            if (occurrencesInGuess[guess[i]] > occurrencesInAnswer[guess[i]]) {
                //tile turns grey
                tile.style.backgroundColor = "#787C7E";
                tile.style.borderColor = "#787C7E";
                tile.style.color = "white";
                occurrencesInGuess[guess[i]]--;

            } else {
                //tile turns yellow
                tile.style.backgroundColor = "#C9B458";
                tile.style.borderColor = "#C9B458";
                tile.style.color = "white";
            }

        }
        else {
            //tile turns grey
            tile.style.backgroundColor = "#787C7E";
            tile.style.borderColor = "#787C7E";
            tile.style.color = "white";

            //key turns grey
            keytile.style.backgroundColor = "#787C7E";
            keytile.style.color = "white";
        }
    }
    //number of guesses increases by 1
    numGuesses++;
}

async function setGuess() {
    //check if guess is valid
    //if guess is valid, go to check guess, if not, print invalid guess

    if (currBoxNum % 5 !== 4) {
        str.innerHTML = "Not enough letters!";
        return;
    }

    if (await validGuess() === true) {
        checkGuess();
        if (checkWin()===false && gameOver === false) {
            //reset guess
            guess = "";
            currBoxNum++;
        }

    } else {
        str.innerHTML = "Invalid word";
    }
}

async function validGuess() {
    //array of valid five-letter guesses
    let ret = await fetch("http://127.0.0.1:5500/Wordle/wordleWords.txt");
    validWords = await ret.text();
    validWords = validWords.split("\n");

    //check if guess is a valid five-letter word in the dictionary
    for (let i=0; i<validWords.length; i++) {
        validWords[i] = validWords[i].toUpperCase();
    }
    //troubleshooting: console.log("valid guesses: " , validWords, guess);

    if (validWords.includes(guess)) {
        return true;
    }
    return false;
    
}

function checkWin() {
    //check if the winner has won or lost
    if (guess === answer) {
        str.innerHTML = "You won!";
        return true;
    } else if (numGuesses===6) {
        str.innerHTML = "You lost!";
    }
    return false;
}


function setLetter() {
    //set the letter when the keyboard tile is clicked or the key is pressed on the user's keyboard

    let box = document.getElementById(currBoxNum);
    if (box.innerText.length !== 1) {
        box.innerHTML = this.innerHTML;
        box.style.borderColor = "gray";
    }
    if (currBoxNum % 5 !== 4) {
        currBoxNum++;
    }

    //JS
    guess += this.innerHTML;
}

async function setLetterWithKeyboard(event) {

    //set guess when "enter" is clicked
    if (event.key === "Enter") {
        await setGuess();
    }

    //delete the current letter
    else if (event.key === "Backspace") {
        backspace();
    }


    //add a letter to guess
    else {
            let box = document.getElementById(currBoxNum);
            if (box.innerText.length !== 1) {
                box.innerHTML = event.code[3];
                box.style.borderColor = "gray";
            }
            if (currBoxNum % 5 !== 4) {
                currBoxNum++;
            }
            
            guess += event.code[3];
    }
}

function backspace() {
    //delete the last letter in the guess

    let box = document.getElementById(currBoxNum);

    if (currBoxNum % 5 === 0) {
        return;
    }

    if (box.innerText.length === 1) {
        box.innerHTML = ""; 
        box.style.borderColor = "lightgray";
    } else {
        box = document.getElementById(--currBoxNum);
        box.innerHTML = ""; 
        box.style.borderColor = "lightgray";
    }

    guess = guess.substring(0, guess.length-1);
}

