/*
    wordle rules for duplicates:

If you try a word that shares duplicate letters with the answer, every instance of that letter
will change color. For example, if you guess ”lever” and the answer is “eaten,”
the first E in “lever” will turn yellow and the second one will turn green.
The first one is in the word but in the wrong spot, and the second one is in the correct spot.
The other letters will turn gray.

Keep in mind that Wordle tells you when a letter is not duplicated, too.
If you use two of the same letter in a word, and only one of them turns yellow or green,
then there is only one copy of that letter in the correct Wordle answer.

let str = ["about
above
abuse
actor
acute
admit"];
*/

/*
    to-do: 
    - make array for valid guesses
    - make array for valid answers
*/

//user statistics
let played = 0;
let currentStreak = 0;
let maxStreak = 0;
let guessDistribution = [0,0,0,0,0,0];
let won = 0;
let winPercent = 0;

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

    // fetch("http://127.0.0.1:5500/Wordle/words.txt").then((response) => response.text())
    // .then((text) => {
    //     console.log("Text:", text);
    // });

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
        //str.innerHTML = "Occurrences in guess: " + occurrencesInGuess[guess[i]];
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
            //bug: key should turn yellow if it is not already green
            //why does it now work with #_____ but works with rgb?
            //console.log("background color of key tile: ", keytile.style.backgroundColor);

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

            /*when the guess has more letter[i]s than the answer: turn ones that are not in the correct place grey until number of letters[i] in answer and guess is the same
            remainder: yellow or green according to normal rules
            */
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
    //called when enter is clicked or enter key is pressed

    //check if guess is valid
    //if guess valid, go to check guess
    //if not valid, do the shake box, not in word list notification, keep layout the same

    if (currBoxNum % 5 !== 4) {
        str.innerHTML = "Not enough letters!"; //why does this not work?
        return;
    }

    if (await validGuess() === true) {//if (validGuess()===true) async problem?
        //if guess is a valid word, evaluate its match with the answer
        //str.innerHTML = "Valid word: " + guess;
        //str.innerHTML += " Answer: " + answer;
        checkGuess();
        if (checkWin()===false && gameOver === false) {
            //start new line
            guess = "";
            currBoxNum++;
        }
    } else {
        str.innerHTML = "Invalid word";
    }

}

async function validGuess() {
    return true;
    /*
    //check if guess is a word in the English dictionary
    let ret = await fetch("http://127.0.0.1:5500/Wordle/wordleWords.txt");
    validWords = await ret.text();
    validWords = validWords.split("\n");

    for (let i=0; i<validWords.length; i++) {
        validWords[i] = validWords[i].toUpperCase();
    }
    //console.log("valid guesses: " , validWords, guess);

    if (validWords.includes(guess)) {
        return true;
    }

    return false;
    */
    
}

function checkWin() {
    //check if the winner has won or lost
    if (guess === answer) {
        //JS
        played++;
        won++;
        winPercent = won/played*100;
        currentStreak++;
        maxStreak = Math.max(currentStreak, maxStreak);
        guessDistribution[numGuesses-1]++;

        //HTML
        let popup = document.querySelector("#winpopup");
        let close = document.querySelector("#close");
        close.addEventListener("click", ()=> {
            popup.style.visibility = "hidden";
        });

        popup.style.visibility = "visible";

        document.querySelector("#numplayed").innerText = played;

        let winDisplay = document.createElement("h2");
        winDisplay.innerText = winPercent;

        let currentStreakDisplay = document.createElement("h2");
        currentStreakDisplay.innerText = currentStreak;

        let maxStreakDisplay = document.createElement("h2");
        maxStreakDisplay.innerText = maxStreak;


        return true;
    } else if (numGuesses===6) {
        str.innerHTML = "You lost!";
        gameOver = true;
        played++;
        currentStreak = 0;
        winPercent = won/played*100;
    }
    return false;
}


function setLetter() {
    //set the letter when the keyboard tile is clicked or key is pressed on the physical keyboard

    //HTML
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
    //fix backspace problem
    if (event.key === "Enter") {
        await setGuess();
    }

    else if (event.key === "Backspace") {
        backspace();
    }


    else {
            //Letters HTML
            let box = document.getElementById(currBoxNum);

            if (box.innerText.length !== 1) {
                box.innerHTML = event.code[3];
                box.style.borderColor = "gray";
            }
            
            if (currBoxNum % 5 !== 4) {
                currBoxNum++;
            }
            
            //Letters JS
            guess += event.code[3];
    }


}

function backspace() {

    let box = document.getElementById(currBoxNum);

    if (currBoxNum % 5 === 0) {
        return;
    }

    if (box.innerText.length === 1) { //if last tile in row has value
        box.innerHTML = ""; 
        box.style.borderColor = "lightgray";
    } else {
        box = document.getElementById(--currBoxNum);
        box.innerHTML = ""; 
        box.style.borderColor = "lightgray";
    }

    guess = guess.substring(0, guess.length-1);
}
