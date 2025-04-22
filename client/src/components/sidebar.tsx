import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  return (
    <div className="w-16 bg-[#202225] flex-shrink-0 flex flex-col items-center py-4 overflow-y-auto">
      {/* Server Icon with indicator */}
      <div className="relative mb-4">
        <Link href="/dashboard">
          <div className={`w-12 h-12 rounded-2xl ${location === "/dashboard" ? "bg-[#5865F2]" : "bg-[#36393F] hover:bg-[#5865F2]"} flex items-center justify-center hover:rounded-xl transition-all duration-200 cursor-pointer`}>
            <span className="text-xl font-bold">DB</span>
          </div>
        </Link>
        {location === "/dashboard" && (
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-white rounded-r-full"></div>
        )}
      </div>
      
      {/* Other server icons (placeholders) */}
      <div className="w-12 h-12 rounded-full bg-[#36393F] flex items-center justify-center mb-4 hover:rounded-xl transition-all duration-200 cursor-pointer">
        <span className="text-xl">T</span>
      </div>
      <div className="w-12 h-12 rounded-full bg-[#36393F] flex items-center justify-center mb-4 hover:rounded-xl transition-all duration-200 cursor-pointer">
        <span className="text-xl">G</span>
      </div>
      
      {/* Add server button */}
      <Link href="/">
        <div className={`w-12 h-12 rounded-full ${location === "/" ? "bg-[#5865F2]" : "bg-[#36393F]"} flex items-center justify-center mb-4 hover:rounded-xl transition-all duration-200 cursor-pointer text-[#57F287]`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
