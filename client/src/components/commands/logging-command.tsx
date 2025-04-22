import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function LoggingCommand() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default server ID - in a real app, you'd get this from user selection
  const serverId = "123456789";
  
  // States to manage form values
  const [enabled, setEnabled] = useState(false);
  const [logChannel, setLogChannel] = useState("");
  const [logEvents, setLogEvents] = useState({
    messageDeletions: false,
    messageEdits: false,
    rolesAdded: false,
    userBans: false,
    userLeaves: false
  });
  
  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: [`/api/servers/${serverId}/channels`],
    retry: false
  });
  
  // Fetch current logging config
  const { data: config, isLoading } = useQuery({
    queryKey: [`/api/servers/${serverId}/logging`],
    retry: false
  });
  
  // Update form values when config is loaded
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setLogChannel(config.logChannelId || "");
      setLogEvents({
        messageDeletions: config.logMessageDeletions,
        messageEdits: config.logMessageEdits,
        rolesAdded: config.logRolesAdded,
        userBans: config.logUserBans,
        userLeaves: config.logUserLeaves
      });
    }
  }, [config]);
  
  // Update config mutation
  const updateConfig = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        "POST",
        `/api/servers/${serverId}/logging`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}/logging`] });
      toast({
        title: "Settings Saved",
        description: "Logging configuration has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save logging settings",
        variant: "destructive",
      });
      console.error("Failed to save logging settings:", error);
    }
  });
  
  // Handle save settings
  const handleSaveSettings = () => {
    updateConfig.mutate({
      enabled,
      logChannelId: logChannel,
      logMessageDeletions: logEvents.messageDeletions,
      logMessageEdits: logEvents.messageEdits,
      logRolesAdded: logEvents.rolesAdded,
      logUserBans: logEvents.userBans,
      logUserLeaves: logEvents.userLeaves
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-[#2F3136] rounded-lg p-6 mb-6 border border-gray-800">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <span className="text-[#5865F2]">&gt;</span>set logs
            </h3>
            <p className="text-gray-300 mt-1">Enable logging for various Discord events</p>
          </div>
          <div className="h-6 w-12 bg-gray-700 animate-pulse rounded-full"></div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-semibold mb-3">Events to Log</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="h-4 w-4 bg-gray-700 animate-pulse rounded mr-2"></div>
                <div className="h-4 w-24 bg-gray-700 animate-pulse rounded"></div>
              </div>
            ))}
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
            <span className="text-[#5865F2]">&gt;</span>set logs
          </h3>
          <p className="text-gray-300 mt-1">Enable logging for various Discord events</p>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={setEnabled}
          aria-label="Toggle logging"
        />
      </div>
      
      <div className="border-t border-gray-700 pt-4">
        <h4 className="font-semibold mb-3">Events to Log</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center">
            <Checkbox 
              id="log-message-deletions" 
              checked={logEvents.messageDeletions}
              onCheckedChange={(checked) => 
                setLogEvents({...logEvents, messageDeletions: !!checked})
              }
              className="text-[#5865F2] bg-gray-700 border-gray-600 rounded"
            />
            <Label htmlFor="log-message-deletions" className="ml-2 text-sm font-medium text-gray-300">
              Message deletions
            </Label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="log-message-edits" 
              checked={logEvents.messageEdits}
              onCheckedChange={(checked) => 
                setLogEvents({...logEvents, messageEdits: !!checked})
              }
              className="text-[#5865F2] bg-gray-700 border-gray-600 rounded"
            />
            <Label htmlFor="log-message-edits" className="ml-2 text-sm font-medium text-gray-300">
              Message edits
            </Label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="log-roles-added" 
              checked={logEvents.rolesAdded}
              onCheckedChange={(checked) => 
                setLogEvents({...logEvents, rolesAdded: !!checked})
              }
              className="text-[#5865F2] bg-gray-700 border-gray-600 rounded"
            />
            <Label htmlFor="log-roles-added" className="ml-2 text-sm font-medium text-gray-300">
              Roles added to users
            </Label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="log-user-bans" 
              checked={logEvents.userBans}
              onCheckedChange={(checked) => 
                setLogEvents({...logEvents, userBans: !!checked})
              }
              className="text-[#5865F2] bg-gray-700 border-gray-600 rounded"
            />
            <Label htmlFor="log-user-bans" className="ml-2 text-sm font-medium text-gray-300">
              User bans
            </Label>
          </div>
          
          <div className="flex items-center">
            <Checkbox 
              id="log-user-leaves" 
              checked={logEvents.userLeaves}
              onCheckedChange={(checked) => 
                setLogEvents({...logEvents, userLeaves: !!checked})
              }
              className="text-[#5865F2] bg-gray-700 border-gray-600 rounded"
            />
            <Label htmlFor="log-user-leaves" className="ml-2 text-sm font-medium text-gray-300">
              User leaves (leave log)
            </Label>
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="log-channel" className="block text-sm font-medium text-gray-300 mb-1">
            Log Channel
          </Label>
          <Select
            value={logChannel}
            onValueChange={setLogChannel}
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
                  <SelectItem value="general">#general</SelectItem>
                  <SelectItem value="logs">#logs</SelectItem>
                  <SelectItem value="admin-logs">#admin-logs</SelectItem>
                  <SelectItem value="mod-logs">#mod-logs</SelectItem>
                </>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
  );
}
