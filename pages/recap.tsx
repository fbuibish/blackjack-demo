// pages/recap.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getRound, Round } from './utils/api';

const Recap = () => {
  const [roundDetails, setRoundDetails] = useState<Round | null>(null);
  const router = useRouter();
  const { roundId } = router.query;

  useEffect(() => {
    if (roundId) {
      getRound(parseInt(roundId as string))
        .then((data) => setRoundDetails(data))
        .catch((error) => console.error('Error fetching round details:', error));
    }
  }, [roundId]);

  if (!roundDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Round Recap</h1>
      <div>Final Stack: {roundDetails.finalStack}</div>
      <h2>Hands</h2>
      <table>
        <thead>
          <tr>
            <th>Hand</th>
            <th>Outcome</th>
            <th>Player's Final Hand</th>
            <th>Dealer's Final Hand</th>
          </tr>
        </thead>
        <tbody>
          {roundDetails.hands.map((hand, index) => (
            <tr key={hand.id}>
              <td>{index + 1}</td>
              <td>{hand.outcome}</td>
              <td>{hand.cardGroups.filter(group => !group.isSplit).map(group => JSON.parse(group.cards).map((card: any) => `${card.value}${card.suit}`)).join(', ')}</td>
              <td>{hand.cardGroups.filter(group => group.isSplit).map(group => JSON.parse(group.cards).map((card: any) => `${card.value}${card.suit}`)).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recap;
