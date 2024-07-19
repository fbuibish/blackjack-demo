// pages/game.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { initializeSocket, startNewRound, playerAction, endRound, Card, GameState } from '../utils/socket';

const Game = () => {
  const [timer, setTimer] = useState<number>(60);
  const [gameState, setGameState] = useState<GameState>({
    roundId: null,
    playerHands: [],
    dealerHand: null,
    stack: 1000,
    availableActions: ['placeWager'],
    activePlayerHandId: null,
    aiSuggestions: [],
    finishedHands: [],
    aiAssisted: false,
  });
  const [wager, setWager] = useState<number>(0);
  const router = useRouter();
  const { aiAssisted } = router.query;
  let timerInterval: any;

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      startGame(parseInt(userId, 10), aiAssisted === 'true');
    }

    return () => clearInterval(timerInterval);
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
    timerInterval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer < 1) {
          clearInterval(timerInterval);
          handleEndRound();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
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
      router.push(`/recap?roundId=${gameState.roundId}`);
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

  const clearBet = () => {
    setWager(0);
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

  const renderSVGCard = (card: Card, hidden: boolean) => {
    const suitName = card.suit.toLowerCase();
    let cardName = `${suitName}_${card.value}`;
    if (hidden) {
      cardName = `back-black`;
    }
    else if (card.value === 1) {
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

  const renderCard = (card: Card, hidden = false) => {
    return (
      <div key={`${card.value}-${card.suit}`} className="card">
        {renderSVGCard(card, hidden)}
      </div>
    );
  }

  const renderCards = (cards: Card[], hiddenIndex = -1, size: 'sm' | 'lg' = 'lg') => (
    <div className={`flex cards-in-play cards-${size}`}>
      {
        cards.map((card, index) => {
          const shouldHide = index === hiddenIndex;
          return renderCard(card, shouldHide)
        })
      }
    </div>
  );

  const getPlayerHand = () => {
    const playerCardGroup = gameState.playerHands.length > 0
      ? gameState.playerHands.find(ph => ph.id === gameState.activePlayerHandId)
      : null;
    return playerCardGroup ? playerCardGroup.cards : [];
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
                {
                  timer > 0 ?
                  <button onClick={() => handlePlayerReady() }  className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 deal-btn">Deal</button>
                  : <button onClick={() => handleEndRound() }  className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 done-btn">End Round</button>
                }
              </div>
            </div>
              <div className="text-2xl mb-4">Wager: {wager}</div>
              <div>
                <button onClick={() => clearBet()} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-white">0</button>
                <button onClick={() => incrementBet(50)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-yellow">50</button>
                <button onClick={() => incrementBet(100)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-blue">100</button>
                <button onClick={() => incrementBet(200)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-black">200</button>
                <button onClick={() => incrementBet(500)} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2 chips-btn chip-purple">500</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4 game-board" id="game-board">
              { gameState.dealerHand && gameState.dealerHand.cards &&
                <div className="p-4">
                  <h2 className="font-bold">Dealer Hand</h2>
                  {renderCards(gameState.dealerHand.cards, 1)} {/* Hide the second card */}
                </div>
              }
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
                let chipResult = 'push';
                let handText = '0'
                if (playerHand.stackDiff > 0) {
                  handText = `+${playerHand.stackDiff}`;
                  chipResult = 'gain';
                } else if (playerHand.stackDiff < 0) {
                  handText = `${playerHand.stackDiff}`;
                  chipResult = 'loss';
                };

                return (
                  <tr key={playerHand.id}>
                    <td className={`border px-4 py-2 chip-${chipResult}`}>{handText}</td>
                    <td className="border px-4 py-2">{renderCards(playerHand.cards, -1, 'sm')}</td>
                    <td className="border px-4 py-2">{renderCards(playerHand.dealerHand.cards, -1, 'sm')}</td>
                  </tr>)
              })}
            </tbody>
          </table>
        </div>
      </div>
        <div className="text-2xl mb-4 timer-header">Time Left: {timer}</div>
      {
        gameState.aiAssisted &&
        <div className="text-xl strategy-recs">
          <div>AI Strategies</div>
          <table style={{width: '100%'}}>
            <tbody>
              {
                gameState.aiSuggestions.map((ai) => (
                  <tr style={{ margin: '8px 0'}} key={ai.aiName}>
                    <td>{ai.aiName}:</td>
                    <td className='rec'><b>{ai.reccommendation}</b></td>
                  </tr>
                ))
              }
           </tbody>
          </table>
        </div>
      }
    </>
  );
};

export default Game;
