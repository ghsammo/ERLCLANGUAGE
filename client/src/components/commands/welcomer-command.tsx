import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import WelcomePreview from "@/components/preview/welcome-preview";
import { Upload, CircleCheck, AlertCircle } from "lucide-react";

export default function WelcomerCommand() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default server ID - in a real app, you'd get this from user selection
  const serverId = "123456789";
  
  // States to manage form values
  const [enabled, setEnabled] = useState(false);
  const [welcomeChannel, setWelcomeChannel] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("Welcome to @server, @username!");
  const [includeImage, setIncludeImage] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("default");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Colors available for selection
  const availableColors = [
    { value: "#FFFFFF", label: "White" },
    { value: "#FEE75C", label: "Yellow" },
    { value: "#5865F2", label: "Blue" },
    { value: "#57F287", label: "Green" }
  ];
  
  // Background options
  const backgroundOptions = [
    { value: "default", label: "Default (Discord theme)" },
    { value: "forest", label: "Forest" },
    { value: "city", label: "City" },
    { value: "abstract", label: "Abstract" },
    { value: "custom", label: "Custom (Upload)" }
  ];
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setUploadError(null);
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/servers/${serverId}/welcome/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Update state with the new custom background
      setBackgroundImage('custom');
      setCustomBackgroundUrl(data.config.customBackgroundUrl);
      
      toast({
        title: "Upload Successful",
        description: "Custom background has been uploaded",
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
      toast({
        title: "Upload Failed",
        description: "Failed to upload custom background",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: [`/api/servers/${serverId}/channels`],
    retry: false
  });
  
  // Fetch current welcome config
  const { data: config, isLoading } = useQuery({
    queryKey: [`/api/servers/${serverId}/welcome`],
    retry: false
  });
  
  // Update form values when config is loaded
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setWelcomeChannel(config.welcomeChannelId || "");
      setWelcomeMessage(config.welcomeMessage);
      setIncludeImage(config.includeImage);
      setBackgroundImage(config.backgroundImage);
      setTextColor(config.textColor);
      if (config.customBackgroundUrl) {
        setCustomBackgroundUrl(config.customBackgroundUrl);
      }
    }
  }, [config]);
  
  // Open file dialog when user selects "Custom" background
  useEffect(() => {
    if (backgroundImage === 'custom' && !customBackgroundUrl && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [backgroundImage, customBackgroundUrl]);
  
  // Update config mutation
  const updateConfig = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        "POST",
        `/api/servers/${serverId}/welcome`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}/welcome`] });
      toast({
        title: "Settings Saved",
        description: "Welcome configuration has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save welcome settings",
        variant: "destructive",
      });
      console.error("Failed to save welcome settings:", error);
    }
  });
  
  // Handle save settings
  const handleSaveSettings = () => {
    updateConfig.mutate({
      enabled,
      welcomeChannelId: welcomeChannel,
      welcomeMessage,
      includeImage,
      backgroundImage,
      textColor,
      customBackgroundUrl: backgroundImage === 'custom' ? customBackgroundUrl : null
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-[#2F3136] rounded-lg p-6 mb-6 border border-gray-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <span className="text-[#5865F2]">&gt;</span>welcomer
            </h3>
            <p className="text-gray-300 mt-1">Send welcome messages to new members</p>
          </div>
          <div className="h-6 w-12 bg-gray-700 animate-pulse rounded-full"></div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 bg-gray-700 animate-pulse rounded"></div>
            <div className="h-72 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#2F3136] rounded-lg p-6 mb-6 border border-gray-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <span className="text-[#5865F2]">&gt;</span>welcomer
          </h3>
          <p className="text-gray-300 mt-1">Send welcome messages to new members</p>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={setEnabled}
          aria-label="Toggle welcomer"
        />
      </div>
      
      <div className="border-t border-gray-700 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Welcome Message</h4>
            <div className="mb-4">
              <Label htmlFor="welcome-message" className="block text-sm font-medium text-gray-300 mb-1">
                Message Template
              </Label>
              <Textarea 
                id="welcome-message" 
                rows={3} 
                className="bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded block w-full p-2.5" 
                placeholder="Welcome message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-400">
                Use @server for server name and @username for the new member's name.
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="welcome-channel" className="block text-sm font-medium text-gray-300 mb-1">Welcome Channel</Label>
              <Select
                value={welcomeChannel}
                onValueChange={setWelcomeChannel}
              >
                <SelectTrigger className="bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded">
                  <SelectValue placeholder="#select-channel" />
                </SelectTrigger>
                <SelectContent>
                  {(channels?.length > 0 ? channels.map((channel: any) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      #{channel.name}
                    </SelectItem>
                  )) : (
                    <>
                      <SelectItem value="welcome">#welcome</SelectItem>
                      <SelectItem value="general">#general</SelectItem>
                      <SelectItem value="introductions">#introductions</SelectItem>
                    </>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Welcome Image</h4>
              
              <div className="flex items-center mb-4">
                <Checkbox 
                  id="include-image" 
                  checked={includeImage}
                  onCheckedChange={(checked) => setIncludeImage(!!checked)}
                  className="text-[#5865F2] bg-gray-700 border-gray-600 rounded"
                />
                <Label htmlFor="include-image" className="ml-2 text-sm font-medium text-gray-300">
                  Include welcome image
                </Label>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="background-image" className="block text-sm font-medium text-gray-300 mb-1">Background Image</Label>
                <Select
                  value={backgroundImage}
                  onValueChange={setBackgroundImage}
                  disabled={!includeImage}
                >
                  <SelectTrigger className="bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Hidden file input for custom background upload */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Show upload button when "Custom" is selected */}
                {backgroundImage === 'custom' && (
                  <div className="mt-2">
                    <div className={`flex items-center p-2 rounded-md ${uploadError ? 'bg-red-900/20 border border-red-700' : customBackgroundUrl ? 'bg-green-900/20 border border-green-700' : 'bg-gray-800 border border-gray-700'}`}>
                      {isUploading ? (
                        <div className="flex items-center text-gray-300 text-sm">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full mr-2"></div>
                          Uploading...
                        </div>
                      ) : uploadError ? (
                        <div className="flex items-center text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {uploadError}
                        </div>
                      ) : customBackgroundUrl ? (
                        <div className="flex items-center text-green-400 text-sm">
                          <CircleCheck className="h-4 w-4 mr-2" />
                          Custom background uploaded
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-300 text-sm">No custom background selected</span>
                          <Button 
                            type="button" 
                            size="sm" 
                            className="bg-[#5865F2] hover:bg-blue-600 text-white font-medium text-xs rounded"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-300 mb-1">Text Color</Label>
                <div className="flex space-x-2">
                  {availableColors.map((color) => (
                    <div 
                      key={color.value}
                      className={`w-8 h-8 rounded-full cursor-pointer ${textColor === color.value ? 'ring-2 ring-[#5865F2]' : ''}`}
                      style={{ backgroundColor: color.value, border: '2px solid #2f3136' }}
                      onClick={() => setTextColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Preview</h4>
            <WelcomePreview 
              message={welcomeMessage}
              serverName="Discord Server"
              username="NewUser"
              includeImage={includeImage}
              backgroundImage={backgroundImage}
              textColor={textColor}
              customBackgroundUrl={customBackgroundUrl}
            />
            
            <div className="mt-6 text-right">
              <Button 
                className="bg-[#5865F2] hover:bg-blue-600 text-white font-medium rounded-md px-4 py-2 text-sm transition-colors"
                onClick={handleSaveSettings}
                disabled={updateConfig.isPending}
              >
                {updateConfig.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
