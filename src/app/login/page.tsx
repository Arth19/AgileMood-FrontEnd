"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import logo from "../../public/logo.png";
import nameLogo from "../../public/nameLogo.png";
import RegisterForm from "@/components/ui/register-form";
import LoginForm from "@/components/ui/login-form";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Lado esquerdo */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image 
              src={logo} 
              alt="Logo" 
              width={100} 
              height={100} 
              className="mx-auto mb-6 drop-shadow-lg hover:scale-105 transition-transform" 
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistering ? "Crie sua conta" : "Bem-vindo de volta!"}
            </h1>
            <p className="text-gray-600">
              {isRegistering 
                ? "Junte-se a nós para uma melhor gestão do bem-estar da sua equipe" 
                : "Faça login para acompanhar o clima organizacional"}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            {isRegistering ? (
              <RegisterForm switchToLogin={() => setIsRegistering(false)} />
            ) : (
              <LoginForm switchToRegister={() => setIsRegistering(true)} />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Lado direito - Visível apenas em telas grandes */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 justify-center items-center p-8"
      >
        <div className="text-center">
          <Image 
            src={nameLogo} 
            alt="Logo" 
            width={280} 
            height={120} 
            className="mb-8 drop-shadow-xl" 
          />
          <p className="text-white text-xl max-w-md mx-auto">
            Transforme a maneira como você gerencia o bem-estar da sua equipe
          </p>
        </div>
      </motion.div>
    </div>
  );
}
