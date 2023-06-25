/*
 * React Wordle
 * Game specs
 * Create 6x5 grid for all letters
 * Get List of valid 5 letter words on app load
 * Randomly select a word from the list which will be the word to guess
 * When the user types a letter, if invalid letter then skip
 * if valid letter then add it to the box
 * If user presses backspace, remove the last letter from the box
 * On finishing the word, if user presses enter, check if word is a complete match then show success message
 * If word is a partial match, then for letters in correct position show them in green box and for letters that matched but in wrong position show them in yellow box
 * If word is not a match, show error message
 * If user is on 5th column and presses return, move to next row
 * If user is on 6th row and 5th column and presses return, then show lost message and show the correct word
 * On game over, show a button to start a new game
 * Bonus!
 * Show keyboard at the bottom with green letters for correct letters
 */
import './App.css'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [guessedLetters, setGuessedLetters] = useState<string[][]>(
    Array(6).fill(Array(5).fill(''))
  )
  const [wordleSolution, setWordleSolution] = useState('')
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [userSolution, setUserSolution] = useState<string[]>(Array(6).fill(''))
  const [gameWon, setGameWon] = useState(false)
  const [gameLost, setGameLost] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  // Load the list of all 5 letter words
  useEffect(() => {
    const fetchWords = async () => {
      const response = await fetch('/words.json')
      const words = await response.json()
      const randomIndex = Math.floor(Math.random() * words.length)
      const randomWord = words[randomIndex] as string
      setWordleSolution(randomWord.toUpperCase())
    }

    fetchWords().catch((error) => {
      console.error(error)
    })
  }, [])

  // On user solution submission
  useEffect(() => {
    if (!userSolution[currentRowIndex] || !wordleSolution) return
    if (userSolution[currentRowIndex] === wordleSolution) {
      setGameWon(true)
      setGameOver(true)
    } else if (currentRowIndex === 5) {
      setGameLost(true)
      setGameOver(true)
    } else {
      setCurrentRowIndex((old) => old + 1)
    }
  }, [currentRowIndex, userSolution, wordleSolution])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event
      const lettersInCurrentRow = guessedLetters[currentRowIndex].filter(
        (letter) => letter
      ).length
      if (key === 'Enter' && lettersInCurrentRow === 5) {
        const newGuessedLetters = JSON.parse(
          JSON.stringify(guessedLetters)
        ) as typeof guessedLetters
        const currentRow = newGuessedLetters[currentRowIndex]
        // DONE: Check if current row submission already exists in previous row submissions and don't accept if true
        // TODO: Check if current row submission is not in the list of words and throw invalid word error if true

        const newUserSolution = [...userSolution]
        newUserSolution[currentRowIndex] = currentRow.join('')
        if (
          userSolution.some(
            (solution) => solution === newUserSolution[currentRowIndex]
          )
        ) {
          alert('Word already submitted!')
          setUserSolution([...userSolution])

          return
        }
        setUserSolution(newUserSolution)
      } else if (key === 'Backspace') {
        // if backspace pressed then delete last letter
        const newGuessedLetters = JSON.parse(
          JSON.stringify(guessedLetters)
        ) as typeof guessedLetters
        const currentRow = newGuessedLetters[currentRowIndex]
        const lastLetterIndex = currentRow.findIndex(
          (letter: string) => letter === ''
        )
        const indexToDelete = lastLetterIndex === -1 ? 4 : lastLetterIndex - 1
        currentRow[indexToDelete] = ''
        setGuessedLetters(newGuessedLetters)
      } else if (!key.match(/^[A-Za-z]$/)) {
        // if not valid letter then skip
        return
      } else {
        // if valid letter then insert at the right position
        const newGuessedLetters = JSON.parse(
          JSON.stringify(guessedLetters)
        ) as typeof guessedLetters
        const currentRow = newGuessedLetters[currentRowIndex]
        const lastLetterIndex = currentRow.findIndex(
          (letter: string) => letter === ''
        )
        if (lastLetterIndex !== -1) {
          currentRow[lastLetterIndex] = key.toUpperCase()
        }
        setGuessedLetters(newGuessedLetters)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [guessedLetters, wordleSolution, currentRowIndex, userSolution])

  const resetGame = () => {
    setGuessedLetters(Array(6).fill(Array(5).fill('')))
    setWordleSolution('')
    setCurrentRowIndex(0)
    setUserSolution(Array(6).fill(''))
    setGameWon(false)
    setGameLost(false)
    setGameOver(false)
  }

  return (
    <div className="board">
      {guessedLetters.map((row, rowIndex) => {
        return (
          <div className="row" key={uuidv4()}>
            {row.map((letter, letterIndex) => {
              const letterIdxInWordleSolution = wordleSolution.indexOf(letter)
              let className = ''
              // TODO: Handle multiple letters scenario: ex: hello, spoon
              // const letterHandled =
              //   userSolution[rowIndex].split('').filter((l) => l === letter)
              //     .length >
              //   wordleSolution.split('').filter((l) => l === letter).length
              if (
                wordleSolution === '' ||
                letter === '' ||
                userSolution[rowIndex] === ''
              ) {
                className = ''
              } else if (letterIdxInWordleSolution === -1) {
                className = 'incorrect'
              } else if (letterIdxInWordleSolution === letterIndex) {
                className = 'correct'
              } else {
                className = 'nearby'
              }
              return (
                <div className={`letter ${className}`} key={uuidv4()}>
                  {letter}
                </div>
              )
            })}
          </div>
        )
      })}
      {gameLost && <p style={{ marginTop: 10 }}>Oops! You lost!</p>}
      {gameWon && <p style={{ marginTop: 10 }}>Congratulations! You Won!</p>}
      {gameOver && (
        <button onClick={resetGame} style={{ marginTop: 10 }}>
          Play Again
        </button>
      )}
    </div>
  )
}

export default App
