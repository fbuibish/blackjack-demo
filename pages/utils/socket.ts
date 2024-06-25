// src/utils/socket.ts
import { io } from 'socket.io-client';
// @ts-ignore
const socket = io(process.env.WEBSOCKET_URL);

export interface GameState {
  roundId: number | null;
  playerHands: PlayerHand[];
  dealerHand: DealerHand | null;
  stack: number;
  availableActions: string[];
  activePlayerHandId: number | null;
  aiSuggestion: string;
  finishedHands: FinishedHand[];
}

interface FinishedHand extends PlayerHand {
  dealerHand: DealerHand;
}

export interface Card {
  value: number;
  suit: string;
}

export interface DealerHand {
  cards: Card[];
}

export interface PlayerHand {
  id: number;
  wager: number;
  stackDiff: number;
  outcome: string;
  cards: Card[];
}

export const initializeSocket = (updateGameState: (state: GameState) => void): void => {
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('gameState', (gameState: GameState) => {
    updateGameState(gameState);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
};

export const startNewRound = (userId: number, aiAssisted: boolean): void => {
  socket.emit('startRound', { userId, aiAssisted });
};

export const playerAction = (roundId: number, action: string, wager: number): void => {
  socket.emit('playerAction', { roundId, action, wager });
};

export const endRound = (roundId: number): void => {
  socket.emit('endRound', { roundId });
};