// utils/api/game.ts
import axios from 'axios';
import { PlayerHand } from './socket';

export interface Game {
  id: number;
  userId: number;
  score: number;
  aiAssisted: boolean;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Round {
  id: number;
  user: { name: string };
  aiAssisted: boolean;
  stack: number;
  hands: PlayerHand[];
}

const API_BASE_URL = process.env.API_URL;

export const createGame = async (gameData: { userId: number; score: number; aiAssisted: boolean }): Promise<Game> => {
  const response = await axios.post(`${API_BASE_URL}/api/game`, gameData);
  return response.data.data;
};

export const getGames = async (): Promise<Game[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/game`);
  return response.data.data;
};

export const createUser = async (userData: { name: string; email: string }): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/api/user`, userData);
  return response.data.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/user`);
  return response.data.data;
};

export const getRounds = async (): Promise<Round[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/rounds/`);
  return response.data.rounds;
}

