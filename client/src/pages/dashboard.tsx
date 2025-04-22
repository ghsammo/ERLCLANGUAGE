import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ChannelSidebar from "@/components/channel-sidebar";
import LoggingCommand from "@/components/commands/logging-command";
import WelcomerCommand from "@/components/commands/welcomer-command";

enum Section {
  Commands = 'commands',
  Events = 'events',
  Permissions = 'permissions',
  CustomResponses = 'custom-responses'
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>(Section.Commands);
  
  return (
    <div className="flex h-screen overflow-hidden bg-[#36393F] text-white">
      {/* Server Sidebar */}
      <Sidebar />
      
      {/* Channel Sidebar */}
      <ChannelSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[#36393F] overflow-hidden">
        {/* Top Navigation */}
        <div className="h-12 border-b border-gray-800 flex items-center px-4">
          <div className="flex items-center">
            <span className="text-gray-300 mr-2">#</span>
            <span className="font-bold">{activeSection}</span>
          </div>
          <div className="ml-4 text-gray-400 text-sm">
            Configure commands for your Discord Bot
          </div>
          <div className="ml-auto flex items-center space-x-4 text-gray-400">
            <div className="w-48 relative">
              <input type="text" placeholder="Search" className="w-full bg-gray-900 text-gray-200 text-sm px-2 py-1 rounded" />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        
        {/* Command Configuration Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Introduction Card */}
            <div className="bg-[#2F3136] rounded-lg p-4 mb-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-2">Command Configuration</h2>
              <p className="text-gray-300">
                Configure commands for your Discord bot. Commands can be enabled or disabled, and some commands have additional configuration options.
              </p>
            </div>
            
            {activeSection === Section.Commands && (
              <>
                <LoggingCommand />
                <WelcomerCommand />
              </>
            )}
            
            {activeSection === Section.Events && (
              <div className="bg-[#2F3136] rounded-lg p-6 mb-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-2">Event Configuration</h2>
                <p className="text-gray-300">
                  Configure how the bot responds to different Discord events. Coming soon.
                </p>
              </div>
            )}
            
            {activeSection === Section.Permissions && (
              <div className="bg-[#2F3136] rounded-lg p-6 mb-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-2">Permission Configuration</h2>
                <p className="text-gray-300">
                  Configure permissions for bot commands and features. Coming soon.
                </p>
              </div>
            )}
            
            {activeSection === Section.CustomResponses && (
              <div className="bg-[#2F3136] rounded-lg p-6 mb-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-2">Custom Responses</h2>
                <p className="text-gray-300">
                  Configure custom responses for specific triggers. Coming soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
