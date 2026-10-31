import CompanionDetailClient from './CompanionDetailClient';
import liveCompanions from '../../data/liveCompanions.json';

export function generateStaticParams() {
  const ids = liveCompanions.map(c => ({ id: String(c.id || c._id) }));
  // Keep legacy fallback IDs just in case
  ids.push({ id: 'c1' }, { id: 'c2' }, { id: 'default' });
  return ids;
}

export default function Page() {
  return <CompanionDetailClient />;
}
