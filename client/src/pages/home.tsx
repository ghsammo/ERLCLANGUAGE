import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#36393F] text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl mx-auto bg-[#2F3136] border-gray-800 shadow-lg text-white">
        <CardHeader className="text-center border-b border-gray-800 pb-6">
          <CardTitle className="text-3xl font-bold text-[#5865F2]">Discord Bot Manager</CardTitle>
          <CardDescription className="text-gray-300 mt-2">
            Logging and Welcome Message functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-[#202225] p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-[#5865F2] mr-2">&gt;</span>set logs
              </h3>
              <p className="text-gray-300 mb-4">
                Enable logging for message deletions, edits, role changes, user bans, and more.
              </p>
              <ul className="text-gray-300 space-y-1 mb-4 list-disc list-inside">
                <li>Message deletions</li>
                <li>Message edits</li>
                <li>Roles added to users</li>
                <li>User bans</li>
                <li>User leaves</li>
              </ul>
            </div>
            
            <div className="bg-[#202225] p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-[#5865F2] mr-2">&gt;</span>welcomer
              </h3>
              <p className="text-gray-300 mb-4">
                Send customized welcome messages to new server members.
              </p>
              <div className="text-gray-300 mb-4">
                <p className="mb-2"><strong>Features:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Customizable welcome message</li>
                  <li>Server and username variables</li>
                  <li>Generated welcome images</li>
                  <li>Customizable backgrounds</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-800 pt-6">
          <Link href="/dashboard">
            <Button className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-medium px-6">
              Configure Bot
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
