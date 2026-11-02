import CompanionDetailClient from './CompanionDetailClient';

export function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function Page() {
  return <CompanionDetailClient />;
}
