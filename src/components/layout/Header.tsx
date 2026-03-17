"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Home className="h-5 w-5 text-blue-600" />
          <span>AI住宅コンシェルジュ</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/search" className="hover:text-blue-600 transition-colors">
            物件を探す
          </Link>
        </nav>
      </div>
    </header>
  );
}
