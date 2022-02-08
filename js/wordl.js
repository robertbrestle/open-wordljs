WordlJS = {
    answer: "",
    currentRow: 1,
    maxRowTiles: 5,
    numGuesses: 6,
    difficulty: "easy",
    init:function() {
        var keyboardKeys = document.querySelectorAll("#keyboard .tile");
        keyboardKeys.forEach(function(k) {
            if(typeof k.dataset.action !== "undefined") {
                k.addEventListener("mousedown", function(e) {
                    WordlJS.clickKey(k.dataset.action);
                });
                /*
                k.addEventListener("dblclick", function(e) {
                    e.preventDefault();
                });
                */
            }
        });
        // register keyboard
        document.addEventListener("keydown", function(e) {
            var key = e.key.toLowerCase();
            if(/^[a-zA-Z]$/.test(key) || key == "backspace" || key == "enter") {
                WordlJS.clickKey(key);
            }
        });
        // reset game
        WordlJS.resetGame();

    }//init 
    ,
    clickKey:function(key) {
        if(typeof key === "undefined") {
            return;
        }else {
            let rowTiles = document.querySelectorAll("#gameBoard > div[data-row=\"" + WordlJS.currentRow + "\"] .tile");
            if(key == "enter") {
                // submit
                let guess = "";
                rowTiles.forEach(function(t) {
                    guess += t.textContent.toLowerCase();
                });
                if(/^[a-z]{5}$/.test(guess) && guess.length == WordlJS.maxRowTiles) {
                    WordlJS.validateGuess(guess);
                }
            }else if(key == "backspace") {
                for(let i = rowTiles.length - 1; i >= 0; i--) {
                    if(rowTiles[i].textContent != "") {
                        rowTiles[i].textContent = "";
                        break;
                    }
                }
                // reset message
                document.getElementById("gameMessageBad").textContent = "";
            }else {
                // add key
                for(let i = 0; i < rowTiles.length; i++) {
                    if(rowTiles[i].textContent == "") {
                        rowTiles[i].textContent = key;
                        break;
                    }
                }
            }
        }
    }//clickKey
    ,
    checkWord:function (word, obj, index) {
        if(typeof word === "undefined") {
            return false;
        }else if (typeof obj === "undefined" || typeof index === "undefined") {
            word = word.toLowerCase();
            // validate against master list
            obj = treeAll[word[0]];
            index = 0;
        }else {
            obj = obj[word[index]];
        }
        if (typeof obj === "number") {
            return true;
        }else if (typeof obj !== "undefined") {
            return WordlJS.checkWord(word, obj, index + 1);
        }else {
            return false;
        }
    }//checkWord
    ,
    getHighlight:function(guess) {
        let highlight = [];
        if(WordlJS.answer !== "" && typeof guess !== "undefined") {
            let checked = [];
            for(var i = 0; i < guess.length; i++) {
                if(WordlJS.answer.indexOf(guess[i]) >= 0) {
                    if(WordlJS.answer[i] === guess[i]) {
                        highlight.push({letter:guess[i],color:"green"});
                        highlight.correct++;
                    }else if(checked.indexOf(guess[i]) < 0) {
                        highlight.push({letter:guess[i],color:"yellow"});
                    }else {
                        highlight.push({letter:guess[i],color:"gray"});
                    }
                }else {
                    highlight.push({letter:guess[i],color:"gray"});
                }
                checked.push(guess[i]);
            }
        }
        return highlight;
    }//getHighlight
    ,
    applyHighlight:function(highlight) {
        if(highlight.length == 0) {
            return;
        }
        let tiles = document.getElementById("gameBoard").querySelectorAll("div[data-row=\"" + WordlJS.currentRow + "\"] .tile");
        for(let i = 0; i < tiles.length; i++) {
            tiles[i].className += " " + highlight[i].color;
            let key = document.querySelector("#keyboard .tile[data-action=\"" + highlight[i].letter + "\"]");
            //if className is only "tile", append new color
            if(key.className.length == 4) {
                key.className += " " + highlight[i].color;
            //prioritize green over yellow
            }else if(key.className.indexOf("yellow") >= 0 && highlight[i].color == "green") {
                key.className = "tile green";
            }
        }
    }//applyHighlight
    ,
    validateGuess:function(guess) {
        if(WordlJS.currentRow <= WordlJS.numGuesses && WordlJS.checkWord(guess)) {
            let highlight = WordlJS.getHighlight(guess);
            WordlJS.applyHighlight(highlight);
            WordlJS.currentRow++;
            if(guess == WordlJS.answer) {
                document.getElementById("gameMessageGood").innerHTML = "You win!<br><a href=\"https://duckduckgo.com/?ia=definition&q=define+" + WordlJS.answer + "\" target=\"_blank\">Define: " + WordlJS.answer + "</a>";
            }else if(WordlJS.currentRow > WordlJS.numGuesses) {
                document.getElementById("gameMessageBad").innerHTML = "You lose!<br>The correct word was <a href=\"https://duckduckgo.com/?ia=definition&q=define+" + WordlJS.answer + "\" target=\"_blank\">" + WordlJS.answer + "</a>";
            }
        }else {
            document.getElementById("gameMessageBad").innerHTML = "Invalid guess";
        }
    }//validateGuess
    ,
    generateAnswer:function(word, obj) {
        if(typeof word === "undefined" || typeof obj === "undefined") {
            if(WordlJS.difficulty == "easy") {
                let keys = Object.keys(treeEasy);
                word = keys[Math.floor(Math.random() * keys.length)];
                obj = treeEasy[word];
            }else if(WordlJS.difficulty == "hard") {
                let keys = Object.keys(treeHard);
                word = keys[Math.floor(Math.random() * keys.length)];
                obj = treeHard[word];
            }
            return WordlJS.generateAnswer(word, obj);
        }else if(word.length === WordlJS.maxRowTiles) {
            return word;
        }else {
            var keys = Object.keys(obj);
            word += keys[Math.floor(Math.random() * keys.length)];
            obj = obj[word[word.length - 1]];
            return WordlJS.generateAnswer(word, obj);
        }
    }//generateAnswer
    ,
    resetGame:function() {
        WordlJS.currentRow = 1;
        // clear keyboard highlighting
        var keyboardKeys = document.querySelectorAll("#keyboard .tile");
        keyboardKeys.forEach(function(k) {
            k.className = "tile";
        });
        // clear board
        var boardTiles = document.querySelectorAll("#gameBoard .tile");
        boardTiles.forEach(function(b) {
            b.textContent = "";
            b.className = "tile";
        });
        // reset messages
        document.getElementById("gameMessageBad").innerHTML = "";
        document.getElementById("gameMessageGood").innerHTML = "";
        // generate answer
        WordlJS.answer = WordlJS.generateAnswer();
        // clear active element
        document.activeElement.blur();
    }//resetGame
    ,
    changeDifficulty:function(level) {
        if(level === "easy" || level === "hard") {
            WordlJS.difficulty = level;
            document.getElementById("level").textContent = level;
            WordlJS.resetGame();
        }
    }//changeDifficulty
};