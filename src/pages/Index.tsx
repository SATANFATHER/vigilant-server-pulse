import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ServerTable, ServerData } from "@/components/ServerTable";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { ServerAPI } from "@/services/api";

const Index = () => {
  const [activeItem, setActiveItem] = useState("ssh");
  const [servers, setServers] = useState<ServerData[]>([]);
  const { toast } = useToast();

  const handleFileProcessed = (newServers: ServerData[]) => {
    setServers(newServers);
  };

  const handleConnect = async (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    // Update status to connecting
    setServers(prev => prev.map(s => 
      s.id === serverId 
        ? { ...s, status: "connecting" }
        : s
    ));

    toast({
      title: "SSH Connection",
      description: `Connecting to ${server.host}:${server.port}...`,
    });

    try {
      const connectionResult = await ServerAPI.testConnection({
        host: server.host,
        port: server.port,
        username: server.username,
        password: server.password || ''
      });

      if (connectionResult.success) {
        // Get system information
        const systemInfo = await ServerAPI.getSystemInfo({
          host: server.host,
          port: server.port,
          username: server.username,
          password: server.password || ''
        });

        setServers(prev => prev.map(s => 
          s.id === serverId 
            ? { 
                ...s, 
                status: "online", 
                lastChecked: new Date().toLocaleString(),
                responseTime: connectionResult.responseTime,
                systemInfo
              }
            : s
        ));
        
        toast({
          title: "Connection successful",
          description: `Connected to ${server.host}:${server.port} (${connectionResult.responseTime}ms)`,
        });
      } else {
        throw new Error(connectionResult.error || 'Connection failed');
      }
    } catch (error) {
      // Fallback to simulation if backend not available
      console.warn('API not available, using simulation:', error);
      
      const success = Math.random() > 0.2; // 80% success rate
      
      setServers(prev => prev.map(s => 
        s.id === serverId 
          ? { 
              ...s, 
              status: success ? "online" : "offline", 
              lastChecked: new Date().toLocaleString(),
              responseTime: success ? Math.floor(Math.random() * 200 + 50) : undefined,
              error: success ? undefined : 'Connection timeout'
            }
          : s
      ));
      
      if (success) {
        toast({
          title: "Connection Successful (Mock)",
          description: `Connected to ${server.username}@${server.host} - Deploy backend for real connections`,
        });
      } else {
        toast({
          title: "Connection Failed (Mock)",
          description: `Failed to connect to ${server.host}. Deploy backend for real SSH.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = async (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    toast({
      title: "Refreshing Server Data",
      description: `Updating ${server.host}...`,
    });

    try {
      const refreshedServer = await ServerAPI.refreshServer(serverId);
      
      setServers(prev => prev.map(s => 
        s.id === serverId ? refreshedServer : s
      ));
      
      toast({
        title: "Server refreshed",
        description: `Updated data for ${server.host}`,
      });
    } catch (error) {
      // Fallback to simulation
      console.warn('API not available, using simulation:', error);
      
      setServers(prev => prev.map(s => 
        s.id === serverId 
          ? { 
              ...s, 
              lastChecked: new Date().toLocaleString(),
              status: Math.random() > 0.2 ? "online" : "offline"
            } 
          : s
      ));
      
      toast({
        title: "Server Data Updated (Mock)",
        description: `${server.host} information refreshed - Deploy backend for real data`,
      });
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card/50 border border-border/50 rounded-lg p-6">
                <h3 className="font-semibold text-primary">Total Servers</h3>
                <p className="text-3xl font-bold mt-2">{servers.length}</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-lg p-6">
                <h3 className="font-semibold text-success">Online</h3>
                <p className="text-3xl font-bold mt-2 text-success">
                  {servers.filter(s => s.status === "online").length}
                </p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-lg p-6">
                <h3 className="font-semibold text-danger">Offline</h3>
                <p className="text-3xl font-bold mt-2 text-danger">
                  {servers.filter(s => s.status === "offline").length}
                </p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-lg p-6">
                <h3 className="font-semibold text-warning">Total Cores</h3>
                <p className="text-3xl font-bold mt-2 text-warning">
                  {servers.reduce((sum, s) => sum + s.cores, 0)}
                </p>
              </div>
            </div>
          </div>
        );
      case "results":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Results & Logs</h1>
            <div className="bg-card/50 border border-border/50 rounded-lg p-6">
              <p className="text-muted-foreground">Connection logs and system reports will appear here.</p>
            </div>
          </div>
        );
      case "ssh":
      default:
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">SSH Server Management</h1>
            <FileUpload onFileProcessed={handleFileProcessed} />
            {servers.length > 0 && (
              <ServerTable
                servers={servers}
                onConnect={handleConnect}
                onRefresh={handleRefresh}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
