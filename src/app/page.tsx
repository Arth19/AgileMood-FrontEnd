// src/app/page.tsx (Página inicial)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import nameLogo from "../public/nameLogo.png";


export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center bg-blue-700">
      <div className="text-center">
      <Image src={nameLogo} alt="Logo" width={320} height={120} className="mb-6" />
        <Button asChild className="bg-white text-blue-700 px-6 py-3 text-lg hover:bg-gray-200">
            <Link href="/login">
            <strong>Acessar Login</strong>
            </Link>
        </Button>
      </div>
    </div>
  );
}
