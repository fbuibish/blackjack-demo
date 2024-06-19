// pages/index.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name && email) {
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      router.push('/game');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Blackjack Demo</h1>
      <form onSubmit={handleSubmit} className="flex flex-col w-80">
        <label htmlFor="name" className="mb-2">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-2 mb-4 border rounded"
        />
        <label htmlFor="email" className="mb-2">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 mb-4 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">Start Game</button>
      </form>
    </div>
  );
};

export default Home;
