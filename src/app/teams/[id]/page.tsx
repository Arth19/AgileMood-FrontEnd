import TeamPageClient from "./team-page-client";

interface TeamPageProps {
  params: {
    id: string;
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  return <TeamPageClient teamId={Number(params.id)} />;
} 