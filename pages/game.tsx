// pages/game.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { initializeSocket, startNewRound, playerAction, endRound, Card, GameState } from './utils/socket';

const Game = () => {
  const [timer, setTimer] = useState<number>(60);
  const [gameState, setGameState] = useState<GameState>({
    roundId: null,
    playerHands: [],
    dealerHand: null,
    stack: 1000,
    availableActions: ['placeWager'],
    activePlayerHandId: null,
    finishedHands: [],
  });
  const [wager, setWager] = useState<number>(0);
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
    //       handleEndRound();
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
    });
  }, []);

  useEffect(() => {
    if (!gameState.activePlayerHandId) {
      setWager(0);
    }
  }, [gameState]);

  const startGame = async (userId: number, aiAssisted: boolean) => {
    startNewRound(userId, aiAssisted);
  };

  const handlePlayerAction = (action: string) => {
    if (gameState.roundId) {
      playerAction(gameState.roundId, action, wager);
      console.log('Player action sent:', { roundId: gameState.roundId, action, wager });
    }
  };

  const handleEndRound = () => {
    if (gameState.roundId) {
      endRound(gameState.roundId);
      router.push(`/recap/${gameState.roundId}`);
    }
  };

  const incrementBet = (amount: number) => {
    if (!gameState.stack) return;

    if (gameState.stack >= amount) {
      setWager(wager + amount);
    } else {
      alert('Insufficient funds for this bet.');
    }
  };

  const handlePlayerReady = () => {
    if (wager < 1) {
      alert('Place wager to deal cards');
      return;
    }

    if (gameState.stack >= wager) {
      handlePlayerAction('placeWager');
    } else {
      alert('Insufficient funds for this bet.');
    }
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

  const renderCard = (card: Card, hidden = false) => (
    <div key={`${card.value}-${card.suit}`} className="card">
      {renderSVGCard(card, hidden)}
    </div>
  );

  const renderCards = (cards: Card[], hiddenIndex = -1, size: 'sm' | 'lg' = 'lg') => (
    <div className={`flex cards-in-play cards-${size}`}>
      {cards.map((card, index) => renderCard(card, index === hiddenIndex))}
    </div>
  );

  const getPlayerHand = () => {
    const playerCardGroup = gameState.playerHands.length > 0
      ? gameState.playerHands.find(ph => ph.id === gameState.activePlayerHandId)
      : null;
    return playerCardGroup ? playerCardGroup.cards : [];
  };

  const getDealerHand = () => {
    return (gameState.dealerHand && gameState.dealerHand.cards) || [];
  };

  return (
    <>
      <div className="page-header s">
        <img style={{margin: 'auto'}} src="/warroom_logo.svg" width='200' />
      </div>
      <div className="flex md:flex-row items-center items-start justify-center bg-green-900 min-h-screen p-6">
        <div className="flex flex-col items-center justify-center flex-1 text-center felt-panel">
          {gameState.availableActions.includes('placeWager') ? (
            <div>
            <div className="flex justify-center game-board">
              <div>
                <button onClick={() => handlePlayerReady() }  className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 deal-btn">Deal</button>
              </div>
            </div>
              <div className="text-2xl mb-4">Wager: {wager}</div>
              <div>
                <button onClick={() => incrementBet(50)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-yellow">50</button>
                <button onClick={() => incrementBet(100)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-blue">100</button>
                <button onClick={() => incrementBet(200)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-black">200</button>
                <button onClick={() => incrementBet(500)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-purple">500</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4 game-board" id="game-board">
              <div className="p-4">
                <h2 className="font-bold">Dealer Hand</h2>
                {renderCards(getDealerHand(), 1)} {/* Hide the second card */}
              </div>
              <div className="p-4">
                <h2 className="font-bold">Player Hand</h2>
                {renderCards(getPlayerHand())}
                <div className="text-2xl mb-4" style={{marginTop: 12}}>Wager: {wager}</div>
              </div>
            </div>
          )}
          {
            !gameState.availableActions.includes('placeWager') && (
              <div>
                {gameState.availableActions.includes('hit') && (
                  <button onClick={() => handlePlayerAction('hit')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 action-btn">
                    Hit
                  </button>
                )}
                {gameState.availableActions.includes('stand') && (
                  <button onClick={() => handlePlayerAction('stand')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 action-btn">
                    Stand
                  </button>
                )}
                {gameState.availableActions.includes('double') && (
                  <button onClick={() => handlePlayerAction('double')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 action-btn">
                    Double Down
                  </button>
                )}
                {gameState.availableActions.includes('split') && (
                  <button onClick={() => handlePlayerAction('split')} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 action-btn">
                    Split
                  </button>
                )}
              </div>
            )
          }
          <div className="mb-4 stack-count">Stack: <b>{gameState.stack}</b></div>
        </div>
        <div className="flex-1 md:ml-6 mt-6 md:mt-0 overflow-auto text-center">
          <h1 className="text-xl font-bold mb-4">Hand Results</h1>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Player Final Hand</th>
                <th className="px-4 py-2">Dealer Final Hand</th>
              </tr>
            </thead>
            <tbody>
              {gameState.finishedHands.map((playerHand, index) => {
                return (
                  <tr key={playerHand.id}>
                    <td className="border px-4 py-2">{playerHand.stackDiff > 0 ? `+${playerHand.stackDiff}` : playerHand.stackDiff}</td>
                    <td className="border px-4 py-2">{renderCards(playerHand.cards, -1, 'sm')}</td>
                    <td className="border px-4 py-2">{renderCards(playerHand.dealerHand.cards, -1, 'sm')}</td>
                  </tr>)
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-2xl mb-4 timer-header">Time Left: {timer}</div>
    </>
  );
};

export default Game;
