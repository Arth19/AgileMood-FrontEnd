"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, User, Settings, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import logo from "@/public/nameLogo.png";

interface NavItemProps {
  href: string;
  Icon: React.ComponentType<{ size: number }>;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, Icon, label }) => (
  <Link href={href} className="flex items-center space-x-2 hover:bg-blue-600 p-2 rounded">
    <Icon size={20} /> <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* Botão de Menu para abrir a Sidebar no mobile */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-none">
          <Button variant="ghost" className="p-2 lg:hidden w-12 h-12">
            <Menu size={32} />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 bg-blue-700 text-white p-5">
          <Image className="mb-6" src={logo} alt="Logo" width={150} height={150} />
          <nav className="flex flex-col space-y-4">
            <NavItem href="/home" Icon={Home} label="Home" />
            <NavItem href="/profile" Icon={User} label="Perfil" />
            <NavItem href="/settings" Icon={Settings} label="Configurações" />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Sidebar fixa em telas grandes */}
      <div className="hidden lg:flex flex-col w-64 h-screen bg-blue-700 text-white p-5">
      <Image className="mb-6" src={logo} alt="Logo" width={150} height={150} />
        <nav className="flex flex-col space-y-4">
          <NavItem href="/home" Icon={Home} label="Home" />
          <NavItem href="/profile" Icon={User} label="Perfil" />
          <NavItem href="/settings" Icon={Settings} label="Configurações" />
        </nav>
      </div>
    </div>
  );
}
