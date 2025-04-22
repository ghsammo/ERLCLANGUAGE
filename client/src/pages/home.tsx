import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid-background min-h-screen bg-black p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-black border border-red-600 rounded-lg p-6 hover:bg-red-950 transition-colors">
            <h3 className="text-xl font-bold text-red-500 mb-2">Grid Item {i + 1}</h3>
            <p className="text-gray-400">Sample content for grid item {i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
}