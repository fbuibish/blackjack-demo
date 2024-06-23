// src/utils/socket.ts
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000');

export interface Card {
  value: number;
  suit: string;
}

export const initializeSocket = (setGameState: (state: any) => void) => {
  socket.on('connect', () => {
    console.log('Connected to the server');
  });

  socket.on('roundStarted', (data) => {
    setGameState(data);
  });

  socket.on('cardDealt', (data) => {
    setGameState((prevState: any) => ({
      ...prevState,
      [data.recipient + 'Hand']: [...prevState[data.recipient + 'Hand'], data.card],
    }));
  });

  socket.on('handResult', (data) => {
    setGameState((prevState: any) => ({
      ...prevState,
      outcome: data.outcome,
      stack: data.stack,
    }));
  });

  socket.on('handStarted', (data) => {
    setGameState({
      playerHand: data.playerHand,
      dealerHand: data.dealerHand,
      outcome: null,
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from the server');
  });
};

export const startNewRound = (userId: number, aiAssisted: boolean) => {
  socket.emit('startRound', { userId, aiAssisted });
};

export const playerAction = (roundId: number, action: string) => {
  socket.emit('playerAction', { roundId, action });
};

export const nextHand = (roundId: number, wager: number) => {
  socket.emit('nextHand', { roundId, wager });
};
