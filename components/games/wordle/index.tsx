import classNames from 'classnames';
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import styles from './index.module.css';
import {OnChatHandler, OnCommandHandler} from 'comfy.js';

enum GAME_STATE {
  LOAD,
  PLAY,
  WIN,
}

enum WORDLE_COMMANDS {
  RESET = 'reset',
  HINT = 'hint',
  FORFEIT = 'forfeit',
}

export interface WordleProps {
  words: Array<string>;
}

export interface WordleRef {
  onCommand: OnCommandHandler;
  onChat: OnChatHandler;
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

const Win = ({word, winner}: { word: string, winner: string }) => (
  <>
    <Row row={word} word={word}/>
  </>
)


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

const Wordle = forwardRef<WordleRef, WordleProps>(({words}, ref) => {

  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.LOAD);
  const [gameBoard, setGameBoard] = useState<Grid>([]);
  const [word, setWord] = useState<string>('tropes');
  const [winner, setWinner] = useState<string>('');

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

  const doGuess = useCallback((guess: string, player: string) => {

    if (guess.length !== word.length) {
      return;
    }

    if (!words.includes(guess)) {
      return;
    }

    if (guess === word) {
      setGameState(GAME_STATE.WIN);
      setWinner(player);
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

  const doHint = useCallback(() => {

    const getRandomWord = () => {
      const random = Math.floor(Math.random() * words.length);
      return words[random];
    }

    let hint = '';
    let letters = new Set();

    do {
      letters = new Set();
      hint = getRandomWord();

      hint
        .split('')
        .filter(letter => word.includes(letter))
        .forEach(letter => letters.add(letter));

    } while (letters.size < 2 && hint !== word);

    doGuess(hint, 'Hint');

  }, [word, words, doGuess]);
  const doForfeit = useCallback(() => doGuess(word, 'Forfeit'), [word, doGuess]);

  useEffect(() => {
    doNewGame();
  }, [doNewGame]);

  const onCommand: OnCommandHandler = useCallback((user, command, message, flags) => {
    switch (command) {
      case WORDLE_COMMANDS.RESET:
        flags.broadcaster && doNewGame();
        break;
      case WORDLE_COMMANDS.HINT:
        flags.broadcaster && doHint();
        break;
      case WORDLE_COMMANDS.FORFEIT:
        flags.broadcaster && doForfeit();
        break;
    }
  }, [doNewGame, doHint, doForfeit])

  const onChat: OnChatHandler = useCallback((user, message) => {
    doGuess(message, user);
  }, [doGuess])

  useImperativeHandle(ref, () => ({
    onCommand,
    onChat,
  }));

  return (
    <>
      <div className={styles['gameboard']}>
        <div className={styles['gameboard__container']}>
          <h1 className={styles['gameboard__title']}>Not Wordle</h1>
          {(gameState === GAME_STATE.PLAY) && (<Play word={word} gameboard={gameBoard}/>)}
          {(gameState === GAME_STATE.WIN) && (<Win word={word} winner={winner}/>)}
        </div>
      </div>
    </>

  )
})
Wordle.displayName = 'Wordle'

export default Wordle;
