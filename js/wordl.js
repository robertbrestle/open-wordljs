WordlJS = {
    answer: "",
    currentRow: 1,
    maxRowTiles: 5,
    numGuesses: 6,
    difficulty: "easy", // easy, hard, girl6, girl8
    init:function() {
        var keyboardKeys = document.querySelectorAll("#keyboard .tile");
        keyboardKeys.forEach(function(k) {
            if(typeof k.dataset.action !== "undefined") {
                k.addEventListener("mousedown", function(e) {
                    WordlJS.clickKey(k.dataset.action);
                });
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
                // submit, else show error highlighting
                if(WordlJS.validate(guess)) {
                    WordlJS.highlight(guess);
                    WordlJS.submit(guess);
                }else if(guess.length == WordlJS.maxRowTiles) {
                    WordlJS.errorHighlight(true);
                    document.getElementById("gameMessageBad").innerHTML = "Invalid guess";
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
                // remove error highlight
                WordlJS.errorHighlight(false);
            }else {
                // add key
                let guess = "";
                rowTiles.forEach(function(t) {
                    guess += t.textContent.toLowerCase();
                });
                // if trying to enter more than 5 characters, return
                if(guess.length == WordlJS.maxRowTiles) {
                    return;
                }
                // append character to the end
                for(let i = 0; i < rowTiles.length; i++) {
                    if(rowTiles[i].textContent == "") {
                        rowTiles[i].textContent = key;
                        guess += rowTiles[i].textContent;
                        break;
                    }
                }
                // if invalid, show error highlight
                if(guess.length == WordlJS.maxRowTiles && !WordlJS.validate(guess)) {
                    WordlJS.errorHighlight(true);
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
            if(WordlJS.difficulty === "girl6") {
                obj = treeGirl6[word[0]];
            }else if(WordlJS.difficulty === "girl8") {
                obj = treeGirl8[word[0]];
            }else {
                obj = treeAll[word[0]];
            }
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
    validate:function(guess) {
        if(/^[a-z]+$/.test(guess) && guess.length == WordlJS.maxRowTiles && WordlJS.currentRow <= WordlJS.numGuesses) {
            return WordlJS.checkWord(guess);
        }
        return false;
    }//validate
    ,
    highlight:function(guess) {
        let highlight = [];
        // construct highlight
        if(WordlJS.answer !== "" && typeof guess !== "undefined") {
            let checked = [];
            let greens = [];
            // find correct characters first
            for(var i = 0; i < guess.length; i++) {
                if(WordlJS.answer[i] === guess[i]) {
                    greens.push(guess[i]);
                }
            }
            // push highlight
            for(var i = 0; i < guess.length; i++) {
                if(WordlJS.answer.indexOf(guess[i]) >= 0) {
                    if(WordlJS.answer[i] === guess[i]) {
                        highlight.push({letter:guess[i],color:"green"});
                    // validate to ensure duplicate characters don't get highlighted yellow
                    }else if(checked.indexOf(guess[i]) < 0 && greens.indexOf(guess[i]) < 0) {
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
        // render highlight
        if(highlight.length > 0) {
            let tiles = document.getElementById("gameBoard").querySelectorAll("div[data-row=\"" + WordlJS.currentRow + "\"] .tile");
            for(let i = 0; i < tiles.length; i++) {
                tiles[i].className += " " + highlight[i].color;
                let key = document.querySelector("#keyboard .tile[data-action=\"" + highlight[i].letter + "\"]");
                // if no classes added
                if(key.classList.length == 1) {
                    key.classList.add(highlight[i].color);
                }else if(highlight[i].color == "green" && !key.classList.contains("green")) {
                    key.className = "tile green";
                }else if(highlight[i].color == "yellow" && key.classList.contains("gray")) {
                    key.className = "tile yellow";
                }
            }
        }
        return highlight;
    }//highlight
    ,
    errorHighlight:function(enable) {
        let rowTiles = document.querySelector("#gameBoard > div[data-row=\"" + WordlJS.currentRow + "\"]");
        if(enable) {
            rowTiles.classList.add("error");
        }else {
            rowTiles.classList.remove("error");
        }
    }//errorHighlight
    ,
    submit:function(guess) {
        // remove error highlight
        WordlJS.errorHighlight(false);
        WordlJS.currentRow++;
        if(guess == WordlJS.answer) {
            WordlJS.end(true);
        }else if(WordlJS.currentRow > WordlJS.numGuesses) {
            WordlJS.end(false);
        }
    }//submit
    ,
    end:function(correct) {
        // prevent additional guesses
        WordlJS.currentRow = WordlJS.numGuesses + 1;
        // reset messages
        document.getElementById("gameMessageBad").innerHTML = "";
        document.getElementById("gameMessageGood").innerHTML = "";
        // display message based on boolean
        if(correct) {
            document.getElementById("gameMessageGood").innerHTML = "You win!<br><a href=\"https://duckduckgo.com/?ia=definition&q=define+" + WordlJS.answer + "\" target=\"_blank\">Define: " + WordlJS.answer + "</a>";
        }else {
            document.getElementById("gameMessageBad").innerHTML = "You lose!<br>The correct word was <a href=\"https://duckduckgo.com/?ia=definition&q=define+" + WordlJS.answer + "\" target=\"_blank\">" + WordlJS.answer + "</a>";
        }
    }//giveUp
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
            }else if(WordlJS.difficulty == "girl6") {
                let keys = Object.keys(treeGirl6);
                word = keys[Math.floor(Math.random() * keys.length)];
                obj = treeGirl6[word];
            }else if(WordlJS.difficulty == "girl8") {
                let keys = Object.keys(treeGirl8);
                word = keys[Math.floor(Math.random() * keys.length)];
                obj = treeGirl8[word];
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
            WordlJS.maxRowTiles = 5,
            WordlJS.numGuesses = 6;
            document.getElementById("level").textContent = level;
            document.getElementById("newWordButton").textContent = "New Word";
            document.getElementById("gameBoard").innerHTML = document.getElementById("gameBoard5").innerHTML;
            WordlJS.resetGame();
        }else if(level === "girl6") {
            WordlJS.difficulty = level;
            WordlJS.maxRowTiles = 6,
            WordlJS.numGuesses = 7;
            document.getElementById("level").textContent = level;
            document.getElementById("newWordButton").textContent = "New Name";
            document.getElementById("gameBoard").innerHTML = document.getElementById("gameBoard6").innerHTML;
            WordlJS.resetGame();
        }else if(level === "girl8") {
            WordlJS.difficulty = level;
            WordlJS.maxRowTiles = 8,
            WordlJS.numGuesses = 9;
            document.getElementById("level").textContent = level;
            document.getElementById("newWordButton").textContent = "New Name";
            document.getElementById("gameBoard").innerHTML = document.getElementById("gameBoard8").innerHTML;
            WordlJS.resetGame();
        }
    }//changeDifficulty
};