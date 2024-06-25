// pages/game.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { initializeSocket, startNewRound, playerAction, playerReady, Card, HandResult } from './utils/socket';

const Game = () => {
  const [timer, setTimer] = useState<number>(60);
  const [gameState, setGameState] = useState<any>({
    playerHand: [],
    dealerHand: [],
    outcome: null,
  });
  const [roundId, setRoundId] = useState<number | null>(null);
  const [handResults, setHandResults] = useState<HandResult[]>([]);
  const [wager, setWager] = useState<number>(0);
  const [stack, setStack] = useState<number | null>(null);
  const [isBetting, setIsBetting] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      startGame(parseInt(userId, 10), false);
    }

    // const interval = setInterval(() => {
    //   setTimer((prevTimer) => {
    //     if (prevTimer === 1) {
    //       clearInterval(interval);
    //       endGame();
    //       return 0;
    //     }
    //     return prevTimer - 1;
    //   });
    // }, 1000);
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    initializeSocket((state) => {
      console.log('Socket message received:', state);
      setGameState(state);
    }, (handResult) => {
      console.log('Hand Result received:', handResult);
      updateHandResults(handResult);
    });
  }, []);

  useEffect(() => {
    if (gameState.roundId) {
      setRoundId(gameState.roundId);
    }
    if (gameState.outcome) {
      setWager(0);
      incrementBet(50);
      setIsBetting(true);
    }
    if (gameState.stack !== undefined) {
      setStack(gameState.stack);
    }
    console.log('Game state updated:', gameState);
  }, [gameState]);

  const startGame = async (userId: number, aiAssisted: boolean) => {
    startNewRound(userId, aiAssisted);
  };

  const handlePlayerAction = (action: string) => {
    if (roundId) {
      playerAction(roundId, action);
      console.log('Player action sent:', { roundId, action });
    }
  };

  const handlePlayerReady = () => {
    if (roundId) {
      playerReady(roundId, wager);
      console.log('Next hand requested:', { roundId });
    }
  };

  const updateHandResults = (handResult: HandResult) => {
    setHandResults((prevResults) => [
      handResult,
      ...prevResults,
    ]);
  };

  const endGame = () => {
    alert(gameState.outcome ? `Game over: You ${gameState.outcome}` : 'Time is up!');
    router.push('/recap');
  };

  const renderSVGCard = (card: Card, hidden = false) => {
    const suitName = card.suit.toLowerCase();
    let cardName = hidden ? `back-black` : `${suitName}_${card.value}`;
    if (card.value === 1) {
      cardName = `${suitName}_1`;
    } else if (card.value === 11) {
      cardName = `${suitName}_jack`;
    } else if (card.value === 12) {
      cardName = `${suitName}_queen`;
    } else if (card.value === 13) {
      cardName = `${suitName}_king`;
    }
    const href = `/card_assets/${cardName}.png`;
    return <img width="169" src={href} alt="" />;
  };

  const renderCard = (card: Card, index: number, hidden = false) => (
    <div key={`${card.value}-${card.suit}-${index}`} className="card">
      {renderSVGCard(card, hidden)}
    </div>
  );

  const renderCards = (cards: Card[], hiddenIndex = -1, size: 'sm' | 'lg' = 'lg') => (
    <div className={`flex cards-in-play cards-${size}`}>
      {cards.map((card, index) => renderCard(card, index, index === hiddenIndex))}
    </div>
  );

  const startHand = () => {
    if (wager < 50) {
      alert('Wager must be greater than 50');
      return;
    }
    setIsBetting(false);
    handlePlayerReady();
  };

  const incrementBet = (amount: number) => {
    if (!stack) return;

    if (stack >= amount) {
      setWager(wager + amount);
      setStack(stack - amount);
    } else {
      alert('Insufficient funds for this bet.');
    }
  };

  return (
    <>
      <div className="page-header">
        <img src="/warroom_logo.svg" width='200' />
      </div>
      <div className="flex md:flex-row items-center items-start justify-center bg-green-900 text-white min-h-screen p-6">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-2xl mb-4 timer-header">Timer: {timer}</div>
            {isBetting ? (
              <button onClick={() => startHand()} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">
              Deal Cards
            </button>
          ) : (gameState.playerHand && gameState.dealerHand &&
            <div className="mb-4 game-board" id="game-board">
              <div className="p-4">
                <h2 className="font-bold">Dealer's Hand</h2>
                {renderCards(gameState.dealerHand, 1)} {/* Hide the second card */}
              </div>
              <div className="p-4">
                <h2 className="font-bold">Player's Hand</h2>
                {renderCards(gameState.playerHand)}
              </div>
            </div>
          )}
          {!isBetting && gameState.playerHand && gameState.dealerHand ? (
            <div className='horizontal-button-row'>
              <button onClick={() => handlePlayerAction('hit')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">
                Hit
              </button>
              <button onClick={() => handlePlayerAction('stand')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">
                Stand
              </button>
              <button onClick={() => handlePlayerAction('double')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2"
                disabled={!stack || wager > stack}>
                Double Down
              </button>
              {gameState.playerHand[0]?.value === gameState.playerHand[1]?.value && (
                <button onClick={() => handlePlayerAction('split')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2"
                  disabled={!stack || wager > stack}>
                  Split
                </button>
              )}
            </div>
          ) : 
          <div>
            <h2 className="text-xl font-bold mb-4">Place Your Bet</h2>
            <button onClick={() => incrementBet(50)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">50</button>
            <button onClick={() => incrementBet(100)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">100</button>
            <button onClick={() => incrementBet(200)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">200</button>
            <button onClick={() => incrementBet(500)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">500</button>
          </div>}
          <div className='mb-4'>Wager: {wager}</div>
          <div className="mb-4">Stack: {stack}</div>
        </div>
        <div className="flex-1 md:ml-6 mt-6 md:mt-0 overflow-auto text-center">
          <h2 className="text-xl font-bold mb-4">Hand Results</h2>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Player's Final Hand</th>
                <th className="px-4 py-2">Dealer's Final Hand</th>
              </tr>
            </thead>
            <tbody>
              {handResults.map((result) => (
                <tr key={result.handId}>
                  <td className="border px-4 py-2">{result.stackDifference > 0 ? `+${result.stackDifference}` : result.stackDifference}</td>
                  <td className="border px-4 py-2">{renderCards(result.playerHand, -1, 'sm')}</td>
                  <td className="border px-4 py-2">{renderCards(result.dealerHand, -1, 'sm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Game;
