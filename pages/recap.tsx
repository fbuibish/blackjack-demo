// pages/recap.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getRounds, Round } from '../utils/api';

const Recap = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({
    statsFetched: false,
    aiAvgHands: 0,
    aiAvgStack: 0,
    playerAvgHands: 0,
    playerAvgStack: 0,
  });
  const router = useRouter();
  const { roundId } = router.query;

  useEffect(() => {
    if (roundId) {
      getRounds()
        .then((data) => {
          console.log('Setting round details', data)
          setRounds(data.rounds)
          setStats({
            ...data.stats,
            statsFetched: true,
          });
        })
        .catch((error) => console.error('Error fetching round details:', error));
    }
  }, [roundId]);

  const calculatePercentChange = (base: number, result: number) => {
    return Math.round(((result - base) / base) * 100);
  }

  const renderPercentChangeRow = () => {
    const { aiAvgHands, aiAvgStack, playerAvgHands, playerAvgStack } = stats;
    const aiHandDiff = calculatePercentChange(playerAvgHands, aiAvgHands);
    const aiStackDiff = calculatePercentChange(playerAvgStack, aiAvgStack);
    
    return (
      <tr>
        <td>Difference</td>
        <td className={`${aiHandDiff > 0 ? 'good-stat' : 'bad-stat'}`}>{ aiHandDiff > 0 ? `+${aiHandDiff}` : aiHandDiff }%</td>
        <td className={`${aiStackDiff > 0 ? 'good-stat' : 'bad-stat'}`}>{ aiStackDiff > 0 ? `+${aiStackDiff}` : aiStackDiff }%</td>
      </tr>
    )
  }

  if (!rounds.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className='leaderboard-page'>
      <div className='ai-stats-section'>
        <h1 style={{fontSize: '48px'}}>Player vs AI</h1>
        { stats &&
        <table>
          <thead>
            <tr>
              <th>Average</th>
              <th>hands per round</th>
              <th>final stack</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Without AI</td>
              <td>{ stats.playerAvgHands }</td>
              <td>{ stats.playerAvgStack }</td>
            </tr>
            <tr>
              <td>AI Assist</td>
              <td>{ stats.aiAvgHands }</td>
              <td>{ stats.aiAvgStack }</td>
            </tr>
            { renderPercentChangeRow() }
          </tbody>
        </table>
      }
      </div>
      <div className='leaderboard-table-section'>
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
    </div>
  );
};

export default Recap;
