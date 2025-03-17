import { Metadata } from "next";
import MessagesPageClient from "./messages-page-client";

export const metadata: Metadata = {
  title: "Mensagens do Time | AgileMood",
  description: "Visualize as mensagens do seu time",
};

interface MessagesPageProps {
  params: {
    id: string;
  };
}

export default function MessagesPage({ params }: MessagesPageProps) {
  return (
    <div>
      <MessagesPageClient teamId={parseInt(params.id, 10)} />
    </div>
  );
} 