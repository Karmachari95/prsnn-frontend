import CompanionDetailClient from './CompanionDetailClient';

export function generateStaticParams() {
  return [
    { id: '6ad09f26beba67fd024251ba' },
    { id: '6ab6afd43c48a7df5652e1de' },
    { id: '6ab67782c573bcdf725f0ff0' },
    { id: '6ab5f2abde5dbc5519c69e0d' },
    { id: '6ab57280617fab8be7bcc69b' },
    { id: '6ab567e3617fab8be7bcc696' },
    { id: '6ab3ee4d0c18b16a09199646' },
    { id: '6aacc1f9f14052a4b5eca3fb' },
    { id: '6aab4facbf1b03508c01609d' },
    { id: 'c1' },
    { id: 'c2' },
    { id: 'c3' },
    { id: 'default' }
  ];
}

export default function Page() {
  return <CompanionDetailClient />;
}
