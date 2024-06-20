import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const createUser = async (userData: { name: string; email: string }): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/api/user`, userData);
  return response.data.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/user`);
  return response.data.data;
};
