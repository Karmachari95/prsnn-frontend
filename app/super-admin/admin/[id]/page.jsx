import SuperAdminClient from './SuperAdminClient';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <SuperAdminClient />;
}
