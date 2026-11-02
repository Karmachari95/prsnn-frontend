import AdminUserClient from './AdminUserClient';
import liveCompanions from '../../../data/liveCompanions.json';

export function generateStaticParams() {
  const ids = (liveCompanions || []).map(c => ({ id: String(c.id || c._id) }));
  ids.push(
    { id: 'default' },
    { id: 'c1' },
    { id: 'c2' },
    { id: '6ab7001a1111111111111001' },
    { id: '6ab7001a1111111111111002' },
    { id: '6ab7001a1111111111111003' },
    { id: '6ab7001a1111111111111004' },
    { id: '6ab7001a1111111111111005' },
    { id: '6aacc4d68241b9efea0e7049' }
  );
  return ids;
}

export default function Page() {
  return <AdminUserClient />;
}
