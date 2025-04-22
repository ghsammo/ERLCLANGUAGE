import { useState, useEffect } from "react";

interface WelcomePreviewProps {
  message: string;
  serverName: string;
  username: string;
  includeImage: boolean;
  backgroundImage: string;
  textColor: string;
  customBackgroundUrl?: string | null;
}

export default function WelcomePreview({
  message,
  serverName,
  username,
  includeImage,
  backgroundImage,
  textColor,
  customBackgroundUrl
}: WelcomePreviewProps) {
  const [formattedMessage, setFormattedMessage] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  
  // Format the message with the server name and username
  useEffect(() => {
    const formatted = message
      .replace(/@server/g, `<span class="text-[#5865F2]">${serverName}</span>`)
      .replace(/@username/g, `<span class="font-medium">${username}</span>`);
    
    setFormattedMessage(formatted);
  }, [message, serverName, username]);
  
  // In a real app, we would fetch the preview image from the server
  // Here we're just using a placeholder
  const backgroundImages = {
    default: "https://i.imgur.com/qNxO3gR.png",
    forest: "https://i.imgur.com/2JXI37J.jpg",
    city: "https://i.imgur.com/3Dy7tJv.jpg",
    abstract: "https://i.imgur.com/0udsGMg.jpg"
  };
  
  // Get the background image URL
  const getBackgroundImageUrl = () => {
    if (backgroundImage === 'custom' && customBackgroundUrl) {
      return customBackgroundUrl;
    } 
    return backgroundImages[backgroundImage as keyof typeof backgroundImages] || backgroundImages.default;
  };
  
  return (
    <div>
      <div className="bg-gray-800 p-3 rounded-t border border-gray-700">
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <div className="w-4 h-4 rounded-full bg-[#57F287] mr-1"></div>
          <span className="font-medium text-white">BOT</span>
          <span className="ml-2">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        <div className="text-white mb-3" dangerouslySetInnerHTML={{ __html: formattedMessage }} />
        
        {includeImage && (
          <div 
            className="relative w-full h-48 bg-cover bg-center rounded border border-gray-700"
            style={{ backgroundImage: `url('${backgroundImages[backgroundImage as keyof typeof backgroundImages]}')` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
              <div className="text-3xl font-bold mb-2" style={{ color: textColor }}>WELCOME</div>
              <div className="text-xl font-medium" style={{ color: textColor }}>{username}</div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-700 p-2 rounded-b border border-t-0 border-gray-700 flex">
        <input type="text" className="bg-gray-600 text-sm text-gray-300 rounded p-1 flex-1" placeholder="Message #welcome" />
        <button className="ml-2 text-gray-400 hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
