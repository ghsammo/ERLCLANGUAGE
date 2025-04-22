import { useState } from "react";

export enum Section {
  Commands = 'commands',
  Events = 'events',
  Permissions = 'permissions',
  CustomResponses = 'custom-responses'
}

interface ChannelSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export default function ChannelSidebar({ activeSection, onSectionChange }: ChannelSidebarProps) {
  return (
    <div className="w-60 bg-[#2F3136] flex-shrink-0 flex flex-col">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="font-bold text-white">Discord Bot Manager</h1>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Channels List */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <div className="mb-2">
          <div className="text-xs text-gray-400 uppercase font-semibold px-2 mb-1 flex items-center justify-between">
            <span>Bot Configuration</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 hover:text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          {/* Command Categories */}
          <div 
            className={`text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer ${activeSection === Section.Commands ? 'bg-gray-700 text-white' : ''}`}
            onClick={() => onSectionChange(Section.Commands)}
          >
            <span className="mr-1 text-gray-400">#</span>
            <span>commands</span>
          </div>
          <div 
            className={`text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer ${activeSection === Section.Events ? 'bg-gray-700 text-white' : ''}`}
            onClick={() => onSectionChange(Section.Events)}
          >
            <span className="mr-1 text-gray-400">#</span>
            <span>events</span>
          </div>
          <div 
            className={`text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer ${activeSection === Section.Permissions ? 'bg-gray-700 text-white' : ''}`}
            onClick={() => onSectionChange(Section.Permissions)}
          >
            <span className="mr-1 text-gray-400">#</span>
            <span>permissions</span>
          </div>
          <div 
            className={`text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer ${activeSection === Section.CustomResponses ? 'bg-gray-700 text-white' : ''}`}
            onClick={() => onSectionChange(Section.CustomResponses)}
          >
            <span className="mr-1 text-gray-400">#</span>
            <span>custom-responses</span>
          </div>
        </div>
        
        <div className="mb-2 mt-6">
          <div className="text-xs text-gray-400 uppercase font-semibold px-2 mb-1">
            <span>Documentation</span>
          </div>
          
          {/* Documentation Channels */}
          <div className="text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer">
            <span className="mr-1 text-gray-400">#</span>
            <span>getting-started</span>
          </div>
          <div className="text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer">
            <span className="mr-1 text-gray-400">#</span>
            <span>api-reference</span>
          </div>
          <div className="text-gray-400 rounded flex items-center px-2 py-1 mb-1 hover:bg-gray-700 cursor-pointer">
            <span className="mr-1 text-gray-400">#</span>
            <span>faq</span>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-2 bg-[#292B2F] mt-auto border-t border-gray-800">
        <div className="flex items-center p-2">
          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold">U</span>
          </div>
          <div className="ml-2 flex-1">
            <div className="text-sm font-semibold">User</div>
            <div className="text-xs text-gray-400">#1234</div>
          </div>
          <div className="flex space-x-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.042 7.935M8.414 9.465a9 9 0 00-2.828 12.728" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
