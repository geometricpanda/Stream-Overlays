import classNames from 'classnames';
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import styles from './index.module.css';
import {OnChatHandler, OnCommandHandler} from 'comfy.js';
import {useAudio} from 'react-use';

enum GAME_STATE {
  LOAD,
  PLAY,
  WIN,
}

enum WORDLE_COMMANDS {
  RESET = 'reset',
  NEW = 'new',
  HINT = 'hint',
  REVEAL = 'reveal',
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
    <div className={styles['gameboard__winner']}>Winner: {winner}</div>
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

interface LettersProps {
  letters: Array<string>;
  all: Array<string>;
  word: string;
}

const Letters = ({letters, all, word}: LettersProps) => (
  <div className={styles['lettergrid']}>
    {all.map(letter => (
      <div
        key={letter}
        className={classNames({
          [styles['lettergrid__letter']]: true,
          [styles['lettergrid__letter--used']]: letters.includes(letter),
          [styles['lettergrid__letter--valid']]: letters.includes(letter) && word.includes(letter),
        })}>{letter}</div>
    ))}
  </div>
)

interface LeaderboardProps {
  scores: Map<string, Scores>
}

interface Scores {
  player: string;
  attempts: number;
  wins: number;
}


const Leaderboard = ({scores}: LeaderboardProps) => {

  const leaderboard = Array.from(scores.values())
    .sort((a: Scores, b: Scores) => {
      return a.wins > b.wins
        ? -1
        : 1;
    })
    .slice(0, 12);


  return (
    <div className={styles['leaderboard']}>
      <table className={styles['leaderboard__table']}>
        <thead>
        <tr>
          <td width={300}>Player</td>
          <td>Wins</td>
        </tr>
        </thead>
        <tbody>
        {leaderboard.map(score => (
          <tr key={score.player}>
            <td>{score.player}</td>
            <td>{score.wins}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}

const AZ = [...Array(26)].map((a, index) => String.fromCharCode(97 + index));

const Wordle = forwardRef<WordleRef, WordleProps>(({words}, ref) => {

  const [winAudio, _, winControls] = useAudio({src: '/wordle/win.mp3', autoPlay: false});
  const [startAudio, __, startControls] = useAudio({src: '/wordle/start.mp3', autoPlay: false});
  const [guessAudio, ___, guessControls] = useAudio({src: '/wordle/guess.mp3', autoPlay: false});

  const [letters, setLetters] = useState<Array<string>>([]);
  const [scores, setScores] = useState<Map<string, Scores>>(new Map());
  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.LOAD);
  const [gameBoard, setGameBoard] = useState<Grid>([]);
  const [word, setWord] = useState<string>('tropes');
  const [winner, setWinner] = useState<string>('');

  const doLoading = useCallback(() => {
    setGameState(GAME_STATE.LOAD);
  }, [setGameState]);

  const doWin = useCallback((player) => {
    setWinner(player);
    setGameState(GAME_STATE.WIN);
    winControls.play();
  }, [setWinner, setGameState]);

  const doPlay = useCallback(() => {
    setGameState(GAME_STATE.PLAY);
  }, [setGameState]);

  const addScore = useCallback((player, win) => {

    const newRecord = {
      player,
      wins: 0,
      attempts: 0,
    }

    const record = scores.get(player) || newRecord

    record.wins = win ? record.wins + 1 : record.wins;
    record.attempts = record.attempts + 1;
    scores.set(player, record);
    setScores(scores);

  }, [scores, setScores])

  const doGuess = useCallback((guess: string, player: string | null) => {

    if (guess.length !== word.length) {
      return;
    }

    if (!words.includes(guess)) {
      return;
    }

    guess = guess.toLowerCase();
    setLetters(letters => [...letters, ...guess.split('')]);

    if (guess === word && player) {
      addScore(player, true);
      doWin(player)
      return;
    }

    setGameBoard((board) => [...board, guess]);
    guessControls.play();

  }, [addScore, word, words, setGameBoard, doWin, setLetters]);

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
    startControls.play();
    setLetters([]);
  }, [doLoading, resetBoard, selectWord, doPlay, setLetters])

  const doReset = useCallback(() => {
    setScores(new Map())
    doNewGame()
  }, [setScores, doNewGame]);

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

    doGuess(hint, null);

  }, [word, words, doGuess]);
  const doForfeit = useCallback(() => doGuess(word, null), [word, doGuess]);

  useEffect(() => {
    doNewGame();
  }, [doNewGame]);

  const onCommand: OnCommandHandler = useCallback((user, command, message, flags) => {
    switch (command) {
      case WORDLE_COMMANDS.RESET:
        flags.broadcaster && doReset();
        break;
      case WORDLE_COMMANDS.NEW:
        flags.broadcaster && doNewGame();
        break;
      case WORDLE_COMMANDS.HINT:
        flags.broadcaster && doHint();
        break;
      case WORDLE_COMMANDS.REVEAL:
        flags.broadcaster && doForfeit();
        break;
    }
  }, [doNewGame, doHint, doForfeit])

  const onChat: OnChatHandler = useCallback((user, message) => {
    doGuess(message.toLowerCase(), user);
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
      <Leaderboard scores={scores}/>
      <Letters all={AZ} letters={letters} word={word}/>
      {winAudio}
      {startAudio}
      {guessAudio}
    </>

  )
})
Wordle.displayName = 'Wordle'

export default Wordle;
