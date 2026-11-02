import AdminUserClient from './AdminUserClient';
import liveCompanions from '../../../data/liveCompanions.json';

export function generateStaticParams() {
  const ids = (liveCompanions || []).map(c => ({ id: String(c.id || c._id) }));
  ids.push(
    { id: 'default' },
    { id: '6aacc4d68241b9efea0e7049' }
  );
  return ids;
}

export default function Page() {
  return <AdminUserClient />;
}
