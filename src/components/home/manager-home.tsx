"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamManagement } from "@/components/teams/team-management";

export default function ManagerHome() {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Bem-vindo, Gerente 👩‍💼</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Aqui você poderá visualizar os dados do time, acompanhar o bem-estar da equipe e tomar decisões
            estratégicas com base nas emoções registradas. 📈💙
          </p>
        </CardContent>
      </Card>

      <TeamManagement />
    </div>
  );
}
