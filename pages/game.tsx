// pages/game.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Game = () => {
  const [timer, setTimer] = useState<number>(60);
  const router = useRouter();

  useEffect(() => {
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

  const endGame = () => {
    alert('Time is up!');
    router.push('/recap');
  };

  const handleHit = () => {
    // Logic for hit action
  };

  const handleStand = () => {
    // Logic for stand action
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6">Blackjack Game</h1>
      <div className="text-2xl mb-4">{timer}</div>
      <div className="flex justify-center mb-4" id="game-board">
        {/* Blackjack game elements will go here */}
      </div>
      <button onClick={handleHit} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">Hit</button>
      <button onClick={handleStand} className="p-2 bg-green-500 text-white rounded hover:bg-green-700 m-2">Stand</button>
    </div>
  );
};

export default Game;
