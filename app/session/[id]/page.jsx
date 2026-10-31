import SessionClient from './SessionClient';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <SessionClient />;
}
