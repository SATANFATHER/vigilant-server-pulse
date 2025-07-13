import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ServerTable, ServerData } from "@/components/ServerTable";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeItem, setActiveItem] = useState("ssh");
  const [servers, setServers] = useState<ServerData[]>([]);
  const { toast } = useToast();

  const handleFileProcessed = (newServers: ServerData[]) => {
    setServers(newServers);
  };

  const handleConnect = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      toast({
        title: "SSH Connection",
        description: `Connecting to ${server.host}:${server.port}...`,
      });
      
      // Simulate connection attempt
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        if (success) {
          toast({
            title: "Connection Successful",
            description: `Connected to ${server.username}@${server.host}`,
          });
          // Update server status
          setServers(prev => prev.map(s => 
            s.id === serverId ? { ...s, status: "online" as const } : s
          ));
        } else {
          toast({
            title: "Connection Failed",
            description: `Failed to connect to ${server.host}. Check credentials.`,
            variant: "destructive",
          });
          setServers(prev => prev.map(s => 
            s.id === serverId ? { ...s, status: "offline" as const } : s
          ));
        }
      }, 2000);
    }
  };

  const handleRefresh = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      toast({
        title: "Refreshing Server Data",
        description: `Updating ${server.host}...`,
      });
      
      // Simulate refresh
      setTimeout(() => {
        setServers(prev => prev.map(s => 
          s.id === serverId 
            ? { 
                ...s, 
                lastSeen: "Just now",
                status: Math.random() > 0.2 ? "online" as const : "offline" as const
              } 
            : s
        ));
        toast({
          title: "Server Data Updated",
          description: `${server.host} information refreshed`,
        });
      }, 1500);
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
