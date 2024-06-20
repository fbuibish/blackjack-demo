// pages/game.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { simulateGame, handlePlayerAction, Card } from './utils/game';

interface HandResult {
  handNumber: number;
  result: string;
  playerHand: Card[];
  dealerHand: Card[];
}

const Game = () => {
  const [timer, setTimer] = useState<number>(60);
  const [gameId, setGameId] = useState<number | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [handResults, setHandResults] = useState<HandResult[]>([]);
  const router = useRouter();
  let handNumber = 1;

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      startGame(parseInt(userId, 10));
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startGame = async (userId: number) => {
    const response = await simulateGame(userId);
    setGameId(response.gameId);
    setPlayerHand(response.playerHand);
    setDealerHand(response.dealerHand);
  };

  const handleHit = async () => {
    if (gameId) {
      const response = await handlePlayerAction({
        gameId,
        action: 'hit',
        currentPlayerHand: playerHand,
        dealerHand,
      });
      if (response.outcome) {
        updateHandResults(response.outcome, response.playerHand, response.dealerHand);
        setPlayerHand(response.newPlayerHand);
        setDealerHand(response.newDealerHand);
      } else {
        setPlayerHand(response.playerHand);
      }
    }
  };

  const handleStand = async () => {
    if (gameId) {
      const response = await handlePlayerAction({
        gameId,
        action: 'stand',
        currentPlayerHand: playerHand,
        dealerHand,
      });
      updateHandResults(response.outcome, response.playerHand, response.dealerHand);
      setPlayerHand(response.newPlayerHand);
      setDealerHand(response.newDealerHand);
    }
  };

  const updateHandResults = (result: string, playerHand: Card[], dealerHand: Card[]) => {
    setHandResults((prevResults) => [
      { handNumber: handNumber++, result, playerHand, dealerHand },
      ...prevResults,
    ]);
  };

  const endGame = () => {
    alert(outcome ? `Game over: You ${outcome}` : 'Time is up!');
    router.push('/recap');
  };

  const renderSVGCard = (card: Card) => {
    const suitName = card.suit.toLowerCase();
    let cardName = '';
    if (card.value === 1) {
      cardName = `${suitName}_1`;
    } else if (card.value === 0) {
      cardName = `back-black`;
    } else if (card.value === 11) {
      cardName = `${suitName}_jack`;
    } else if (card.value === 12) {
      cardName = `${suitName}_queen`;
    } else if (card.value === 13) {
      cardName = `${suitName}_king`;
    } else {
      cardName = `${suitName}_${card.value}`;
    }
    const href = `/card_assets/${cardName}.png`;
    return <img width="169" src={href} alt="" />;
  };

  const renderCard = (card: Card) => (
    <div key={`${card.value}-${card.suit}`} className="card">
      {renderSVGCard(card)}
    </div>
  );

  const renderCards = (cards: Card[]) => (
    <div className="flex cards-in-play">
      {cards.map(renderCard)}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6">Blackjack Game</h1>
      <div className="text-2xl mb-4">{timer}</div>
      <div className="flex justify-center mb-4" id="game-board">
        <div className="p-4">
          <h2 className="font-bold">Players Hand</h2>
          {renderCards(playerHand)}
        </div>
        <div className="p-4">
          <h2 className="font-bold">Dealers Hand</h2>
          {renderCards(dealerHand)}
        </div>
      </div>
      {outcome ? (
        <div className="text-xl font-bold">{`You ${outcome}`}</div>
      ) : (
        <>
          <button onClick={handleHit} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">
            Hit
          </button>
          <button onClick={handleStand} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">
            Stand
          </button>
        </>
      )}
      <table className="table-auto mt-4 table">
        <thead>
          <tr>
            <th className="px-4 py-2">Hand</th>
            <th className="px-4 py-2">Result</th>
            <th className="px-4 py-2">Players Final Hand</th>
            <th className="px-4 py-2">Dealers Final Hand</th>
          </tr>
        </thead>
        <tbody>
          {handResults.map((result) => (
            <tr key={result.handNumber}>
              <td className="border px-4 py-2">{result.handNumber}</td>
              <td className="border px-4 py-2">{result.result}</td>
              <td className="border px-4 py-2">{renderCards(result.playerHand)}</td>
              <td className="border px-4 py-2">{renderCards(result.dealerHand)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Game;
