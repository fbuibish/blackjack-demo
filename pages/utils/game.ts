// utils/api/game.ts
import axios from 'axios';

export interface Card {
  value: number;
  suit: string;
}

interface Game {
  id: number;
  userId: number;
  score: number;
  aiAssisted: boolean;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const createGame = async (gameData: { userId: number; score: number; aiAssisted: boolean }): Promise<Game> => {
  const response = await axios.post(`${API_BASE_URL}/api/game`, gameData);
  return response.data.data;
};

export const getGames = async (): Promise<Game[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/game`);
  return response.data.data;
};

export const simulateGame = async (userId: number): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/game/simulate`, { userId });
  return response.data.data;
};

export const handlePlayerAction = async (gameData: {
  gameId: number;
  action: 'hit' | 'stand';
  currentPlayerHand: Card[];
  dealerHand: Card[];
}): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/api/game/action`, gameData);
  return response.data;
};
