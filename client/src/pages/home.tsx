
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid-background min-h-screen bg-black p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="border-4 border-red-500 rounded-xl p-2 mb-8 shadow-lg shadow-red-500/20">
          <img 
            src="https://imgur.com/IOl7QK0.png" 
            alt="ERLC LANGUAGE Logo" 
            className="w-48 h-48"
          />
        </div>
        <h1 className="text-4xl font-bold text-red-500 mb-4 border-b-2 border-red-500 pb-2">Welcome to ERLC LANGUAGE</h1>
        <div className="flex flex-col items-center gap-2 mb-4">
          <p className="text-gray-400">Bot uptime: 24/7 Online</p>
          <a 
            href="https://discord.gg/mCruysGsNT" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors border-2 border-red-400 hover:border-red-300"
          >
            Join our Discord
          </a>
          <p className="text-sm text-gray-500 mt-4">Powered by swoosh</p>
        </div>
      </div>
    </div>
  );
}
