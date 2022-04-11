const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')
const keyBoard = document.querySelector('.keyboard')
let wordle
   
const getWordle = () => {
    fetch('http://localhost:8000/word')
        .then(response => response.json())
        .then(json => {
            //console.log(json)
            wordle = json.toUpperCase()
        })
        .catch(err => console.log(err))
}

getWordle()

const keys = [
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'ENTER',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    '«',
]

const alphabet = 'abcdefghijklmnopqrstuvwxyz'

//how we keep track of guesses and correct/incorrect letters
const guessRows = [
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','','']
]

//how we keep track of where to put the next letter that's clicked
let currentRow = 0
let currentTile = 0
let isGameOver = false

//creating the game tiles where the letters will go; we do 2 foreach loops - once for the 6 rows, once for the 5 tiles
guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tileDisplay.append(rowElement)
})

keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key))
    keyboard.append(buttonElement)
})

document.addEventListener('keydown', (event) => {
    //console.log(event)
    if (!isGameOver) {
        if (event.key === 'Backspace') {
            deleteLetter()
            return
        }
        if (event.key === 'Enter') {
            checkRow()
            return
        }
        if(alphabet.includes(event.key)){
            let letter = event.key.toUpperCase()
            addLetter(letter)
        }
    }
})

const handleClick = (letter) => {
    //console.log('Clicked', letter)
    if (!isGameOver) {
        if (letter === '«') {
            deleteLetter()
            return
        }
        if (letter === 'ENTER') {
            checkRow()
            return
        }
        addLetter(letter)
    }
}


//grab letter from clicked input and place in correct spot
//don't execute if all tiles in the row are filled
//update guessRows and move the currentTile to the next spot
const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = letter
        guessRows[currentRow][currentTile] = letter
        tile.setAttribute('data', letter) //useful later for checking if letter is correct
        currentTile++
    }
}

//only execute if there's something to delete
//resetting previous tile to an empty space
//update guessRows
const deleteLetter = () => {
    if (currentTile > 0) {
        currentTile--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = ''
        guessRows[currentRow][currentTile] = ''
        tile.setAttribute('data', '')
    }
}


const checkRow = () => {
    //take the current array in guessRow (current guess) and combine into string
    const guess = guessRows[currentRow].join('')
    if (currentTile > 4) {
        fetch(`http://localhost:8000/check/?word=${guess}`)
            .then(response => response.json())
            .then(json => {
                //console.log(json)
                if (json == 'Entry word not found'){
                    showMessage('Invalid word')
                    return
                } else {
                    flipTile()
                    //case where guess was right - we want game to end after
                    if (wordle == guess) {
                        showWinningMessage('Winner!!!')
                        isGameOver = true
                        return
                    } else { //case where guess was wrong and we've reached max # of guesses - also want game to end after
                        if (currentRow >= 5){
                            isGameOver = true
                            showLosingMessage('Nice try. Word was: ', wordle)
                            return
                        } //case where guess was wrong but we have more guesses remaining
                        if (currentRow < 5){
                            currentRow++
                            currentTile = 0
                        }
                    }
                }
            }).catch(err => console.log(err))
    }
}

const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
}

const showLosingMessage = (message, word) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message + word
    messageDisplay.append(messageElement)
    //setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
}

const showWinningMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    //setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
}

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let checkWordle = wordle
    const guess = []

    //place guess in an array so we can loop through and remove correct letters from "guess" array
    //this way if the letter shows up later in the guess, it won't show as "in the wrong spot"
    //unless the letter is there again in the wordle
    //e.g. if wordle is 'CROWD' and the guess is 'CHECK', we don't want the 2nd 'C' in 'CHECK'
    //to show up as yellow
    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'}) //grabbing the useful data we stored earlier
    })
    //console.log(guess)
    guess.forEach((guess, index) => {
        if (guess.letter == wordle[index]){
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)){
            if (guess.color != 'green-overlay')
                guess.color = 'yellow-overlay'
                checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, index) => {
        //console.log('dataLetter', dataLetter)
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            addColorToKey(guess[index].letter, guess[index].color)
        }, 500 * index)
    })
}