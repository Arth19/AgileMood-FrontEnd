import { Metadata } from "next";
import ManageEmotionsClient from "./manage-emotions-client";

export const metadata: Metadata = {
  title: "Gerenciar Emoções do Time | AgileMood",
  description: "Selecione as emoções que serão utilizadas pelo seu time",
};

export default function ManageEmotionsPage({ params }: { params: { id: string } }) {
  return <ManageEmotionsClient teamId={parseInt(params.id)} />;
} 