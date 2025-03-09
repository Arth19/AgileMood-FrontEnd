import { Suspense } from 'react';
import DashboardClient from './dashboard-client';

export default function DashboardPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardClient teamId={parseInt(params.id)} />
    </Suspense>
  );
} 