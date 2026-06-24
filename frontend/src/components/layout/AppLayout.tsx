"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Header title={title} />
      <main className="md:ml-64 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
