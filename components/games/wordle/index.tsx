import classNames from 'classnames';
import {useCallback, useEffect, useRef, useState} from 'react';
import styles from './index.module.css';

enum GAME_STATE {
  LOAD,
  PLAY,
  WIN,
}

type Row = string

type Grid = Array<Row>;

const Row = ({row, word}: { row: Row, word: string }) => (
  <div className={styles['gameboard__row']}>
    {row.split('').map((cell, index) => (
      <div key={`cell-${index}`}
           className={classNames({
             [styles['gameboard__letter']]: true,
             [styles['gameboard__letter--entered']]: cell,
             [styles['gameboard__letter--in-word']]: cell && word.includes(cell),
             [styles['gameboard__letter--correct']]: cell && word[index] === cell,
           })}>
        {cell}
      </div>
    ))}
  </div>
);


const Play = ({gameboard, word}: { gameboard: Grid, word: string }) => {

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) {
      return;
    }
    gridRef.current.scrollTo({top: gridRef.current.scrollHeight, behavior: 'smooth'});
  }, [gameboard]);

  return (
    <div className={styles['gameboard__grid']} ref={gridRef}>
      {!!gameboard.length && gameboard.map((row, index) => (
        <Row key={index}
             row={row}
             word={word}/>
      ))}
      {!gameboard.length && (
        <Row
          row={' '.repeat(word.length)}
          word={word}/>
      )}
    </div>
  )
}

export interface WordleProps {
  words: Array<string>;
}

const Wordle = ({words}: WordleProps) => {

  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.LOAD);
  const [gameBoard, setGameBoard] = useState<Grid>([]);
  const [word, setWord] = useState<string>('tropes');

  const doLoading = useCallback(() => {
    setGameState(GAME_STATE.LOAD);
  }, []);
  //
  // const doWin = useCallback(() => {
  //   setGameState(GAME_STATE.WIN);
  // }, []);
  //
  // const doLose = useCallback(() => {
  //   setGameState(GAME_STATE.LOSE);
  // }, []);

  const doPlay = useCallback(() => {
    setGameState(GAME_STATE.PLAY);
  }, []);

  const doGuess = useCallback((guess: string) => {

    if (guess.length !== word.length) {
      return;
    }

    if (!words.includes(guess)) {
      return;
    }

    if (guess === word) {
      setGameState(GAME_STATE.WIN);
      return;
    }

    setGameBoard((board) => [...board, guess]);

  }, [word, words, setGameBoard]);

  const resetBoard = useCallback(() => {
    setGameBoard([]);
  }, []);

  const selectWord = useCallback(() => {
    const random = Math.floor(Math.random() * words.length);
    setWord(words[random]);
  }, [words])

  const doNewGame = useCallback(() => {
    doLoading();
    resetBoard();
    selectWord();
    doPlay();
  }, [doLoading, resetBoard, selectWord, doPlay])

  useEffect(() => {
    doNewGame();
  }, [doNewGame]);

  useEffect(() => {
    const listener = ({detail}: CustomEvent) => doGuess(detail);
    document.addEventListener('guess', listener as (event: Event) => void);
    return () => {
      document.removeEventListener('guess', listener as (event: Event) => void);
    }
  }, [doGuess])

  const doRandomGuess = useCallback(() => {
    const random = Math.floor(Math.random() * words.length);
    doGuess(words[random]);
  }, [words, doGuess]);

  const doAutoPlay = useCallback((index = 0) => {

    const guess = words[index];
    if (index === 50) {
      // This makes sure autoplay doesnt run for too long
      doGuess(word);
      return;
    }

    if (index < words.length - 1 && gameState === GAME_STATE.PLAY) {
      doGuess(guess);
      setTimeout(() => doAutoPlay(index + 1), 50)
    }
  }, [word, words, doGuess, gameState]);

  return (
    <>
      <div className={styles['gameboard']}>
        <div className={styles['gameboard__container']}>
          <h1 className={styles['gameboard__title']}>Not Wordle</h1>
          <h1 className={styles['gameboard__title']}>{word}</h1>

          <button onClick={() => doAutoPlay(0)}>Autoplay</button>
          {(gameState === GAME_STATE.PLAY) && (
            <Play word={word} gameboard={gameBoard}/>
          )}
        </div>
      </div>
    </>

  )

}

export default Wordle;
