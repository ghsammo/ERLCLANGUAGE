
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid-background min-h-screen bg-black p-4">
      <div className="flex flex-col items-center justify-center">
        <img 
          src="/Untitled design.png" 
          alt="ERLC LANGUAGE Logo" 
          className="w-48 h-48 mb-8"
        />
        <h1 className="text-4xl font-bold text-red-500 mb-4">Welcome to ERLC LANGUAGE</h1>
        <a 
          href="https://discord.gg/mCruysGsNT" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Join our Discord
        </a>
      </div>
    </div>
  );
}
