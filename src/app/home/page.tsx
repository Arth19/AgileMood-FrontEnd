"use client";

import EmployeeHome from "@/components/home/employee-home";
import ManagerHome from "@/components/home/manager-home";
import NoTeamAlert from "@/components/home/no-team-alert";
import ProtectedRoute from "@/components/ui/protected-route";
import Sidebar from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/auth-context";

export default function HomePage() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <p className="text-center mt-10">Carregando informações do usuário...</p>;
  }
console.log('USER IN HOME: ', user)
  return (
    <ProtectedRoute>
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold">Olá, {user?.name}!</h1>
        <p className="mt-2 text-gray-600 mb-10">
          Cargo: {user?.role === "manager" ? "Gerente" : "Colaborador"} | Email: {user?.email}
        </p>
        

        {user?.role === "manager" ? (
          <ManagerHome />
        ) : user?.team_id === null ? (
          <NoTeamAlert />
        ) : (
          <EmployeeHome />
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
