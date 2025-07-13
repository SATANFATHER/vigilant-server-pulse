import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  RotateCcw, 
  Download, 
  Trash2, 
  ExternalLink,
  Clock,
  Cpu,
  HardDrive,
  Monitor as MonitorIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServerData {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  status: "online" | "offline";
  system: string;
  cpu: string;
  cores: number;
  gpu: string;
  ram: string;
  storage: string;
  lastSeen: string;
}

interface ServerTableProps {
  servers: ServerData[];
  onConnect: (serverId: string) => void;
  onRefresh: (serverId: string) => void;
}

export const ServerTable = ({ servers, onConnect, onRefresh }: ServerTableProps) => {
  const [sortBy, setSortBy] = useState<keyof ServerData>("lastSeen");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const sortedServers = [...servers].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof ServerData) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Servers</p>
                <p className="text-3xl font-bold text-primary">{servers.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <MonitorIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Alive Servers</p>
                <p className="text-3xl font-bold text-success">
                  {servers.filter(s => s.status === "online").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Header */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg">SSH ({servers.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                00:32
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-success hover:bg-success/90 text-success-foreground border-success">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-danger hover:bg-danger/90 text-danger-foreground border-danger">
                <Trash2 className="w-4 h-4" />
                Delete All
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("host")}>
                    HOST
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("port")}>
                    PORT
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("username")}>
                    USERNAME
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    PASSWORD
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("system")}>
                    SYSTEM
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("cores")}>
                    CPU
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("gpu")}>
                    GPU
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("lastSeen")}>
                    TIME
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedServers.map((server) => (
                  <tr key={server.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          server.status === "online" ? "bg-success" : "bg-danger"
                        )} />
                        <span className="font-mono text-sm">{server.host}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{server.port}</td>
                    <td className="p-4 font-mono text-sm">{server.username}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{"●".repeat(server.password.length)}</span>
                        <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                          👁️
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground max-w-xs">
                        {server.system}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="gap-1">
                        <Cpu className="w-3 h-3" />
                        {server.cores} cores
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-success border-success/50">
                        {server.gpu}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {server.lastSeen}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1"
                          onClick={() => onRefresh(server.id)}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-1 bg-primary hover:bg-primary-dark"
                          onClick={() => onConnect(server.id)}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Connect
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};