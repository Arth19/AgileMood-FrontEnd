import { Suspense } from 'react';
import DashboardClient from './dashboard-client';

// Make the dynamic route param <id> typed and compliant with Next.js 15 PageProps

export default function DashboardPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardClient teamId={parseInt(params.id, 10)} />
    </Suspense>
  );
}