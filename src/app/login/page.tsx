"use client";
import { useState } from "react";
import Image from "next/image";


import logo from "../../public/logo.png";
import nameLogo from "../../public/nameLogo.png";
import RegisterForm from "@/components/ui/register-form";
import LoginForm from "@/components/ui/login-form";


export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    
    <div className="flex h-screen">
      {/* Lado esquerdo */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <Image src={logo} alt="Logo" width={120} height={120} className="mb-6" />

        <div className="w-80">
          {isRegistering ? (
            <RegisterForm switchToLogin={() => setIsRegistering(false)} />
          ) : (
            <LoginForm switchToRegister={() => setIsRegistering(true)} />
          )}
        </div>
      </div>

      {/* Lado direito */}
      <div className="w-1/2 flex justify-center items-center bg-blue-700 text-white">
        <Image src={nameLogo} alt="Logo" width={280} height={120} className="mb-6" />
      </div>
    </div>
    
  );
}
