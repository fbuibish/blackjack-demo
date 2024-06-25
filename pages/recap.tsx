// pages/recap.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getRounds, Round } from '../utils/api';

const Recap = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const router = useRouter();
  const { roundId } = router.query;

  useEffect(() => {
    if (roundId) {
      getRounds()
        .then((data) => {
          console.log('Setting round details', data)
          setRounds(data)
        })
        .catch((error) => console.error('Error fetching round details:', error));
    }
  }, [roundId]);

  if (!rounds.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className='leaderboard-page'>
      <h1 style={{fontSize: '48px'}}>Leaderboard</h1>
        <table className='leaderboard-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Stack</th>
              <th>Hands Played</th>
              <th>AI Assisted</th>
            </tr>
          </thead>
          <tbody>
          { 
            rounds.map((round) => (
              <tr key={round.id} className={`${round.id}` === roundId ? 'background-primary' : ''}>
                <td>{round.user.name}</td>
                <td>{round.stack}</td>
                <td>{round.hands.length}</td>
                <td>{round.aiAssisted ? 'Yes' : ''}</td>
              </tr>
            ))
          }
          </tbody>
        </table>
        <Link className='anchor-button new-round-btn' href="/game?aiAssisted=true">
          Try with AI
        </Link>
        <Link className='anchor-button new-player-btn' href='/'>New Player</Link>
    </div>
  );
};

export default Recap;
