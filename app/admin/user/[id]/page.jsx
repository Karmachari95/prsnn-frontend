import AdminUserClient from './AdminUserClient';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <AdminUserClient />;
}
