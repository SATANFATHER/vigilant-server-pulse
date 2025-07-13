import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ServerAPI, ServerCredentials } from "@/services/api";

interface FileUploadProps {
  onFileProcessed: (servers: any[]) => void;
}

export const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
      setUploadStatus("error");
      return;
    }

    setIsProcessing(true);
    setUploadStatus("idle");

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const serverCredentials: ServerCredentials[] = [];

      // Parse and validate credentials
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line.includes('@') || !line.includes(':')) {
          throw new Error(`Invalid format on line ${i + 1}. Expected format: host:port@username:password`);
        }
        
        const [hostPortPart, credentialsPart] = line.split('@');
        
        if (!credentialsPart || !hostPortPart) {
          throw new Error(`Invalid format on line ${i + 1}. Expected format: host:port@username:password`);
        }
        
        const hostPortMatch = hostPortPart.match(/^(.+):(\d+)$/);
        if (!hostPortMatch) {
          throw new Error(`Invalid host:port format on line ${i + 1}. Expected: host:port`);
        }
        
        const host = hostPortMatch[1];
        const port = parseInt(hostPortMatch[2]);
        
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`Invalid port number on line ${i + 1}: ${hostPortMatch[2]}`);
        }
        
        const colonIndex = credentialsPart.indexOf(':');
        if (colonIndex === -1) {
          throw new Error(`Invalid credentials format on line ${i + 1}. Expected: username:password`);
        }
        
        const username = credentialsPart.substring(0, colonIndex);
        const password = credentialsPart.substring(colonIndex + 1);
        
        if (!username || !password) {
          throw new Error(`Username or password cannot be empty on line ${i + 1}`);
        }

        serverCredentials.push({ host: host.trim(), port, username: username.trim(), password: password.trim() });
      }

      // Test connections and get server status
      toast({
        title: "Testing connections...",
        description: `Checking ${serverCredentials.length} servers`,
      });

      try {
        const serverStatuses = await ServerAPI.checkMultipleServers(serverCredentials);
        
        setUploadStatus("success");
        onFileProcessed(serverStatuses);
        
        const onlineCount = serverStatuses.filter(s => s.status === 'online').length;
        
        toast({
          title: "Success!",
          description: `${onlineCount}/${serverStatuses.length} servers are online`,
        });
      } catch (apiError) {
        // Fallback to mock data if backend is not available
        console.warn('Backend not available, using mock data:', apiError);
        
        const mockServers = serverCredentials.map((cred, i) => ({
          id: `${cred.host.trim()}-${Date.now()}-${i}`,
          host: cred.host.trim(),
          port: cred.port,
          username: cred.username.trim(),
          status: Math.random() > 0.3 ? "online" as const : "offline" as const,
          lastChecked: new Date().toLocaleString(),
          responseTime: Math.floor(Math.random() * 200 + 50),
          systemInfo: {
            architecture: "x86_64",
            ram: `${(Math.random() * 32 + 1).toFixed(1)}Gi`,
            cpuModel: generateRandomCPU(),
            cpuCores: Math.floor(Math.random() * 24) + 1,
            gpu: Math.random() > 0.5 ? "No discrete GPU detected" : "NVIDIA GeForce RTX 3080",
            storage: `${Math.floor(Math.random() * 500 + 100)}GB`,
            uptime: generateRandomTime(),
            loadAverage: `${(Math.random() * 2).toFixed(2)}, ${(Math.random() * 2).toFixed(2)}, ${(Math.random() * 2).toFixed(2)}`
          }
        }));

        setUploadStatus("success");
        onFileProcessed(mockServers);
        
        toast({
          title: "Using mock data",
          description: `Deploy with Python backend for real SSH connections. Loaded ${mockServers.length} servers.`,
          variant: "default",
        });
      }

    } catch (error) {
      setUploadStatus("error");
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRandomSystem = () => {
    const systems = [
      "Ubuntu 20.04.6 LTS x86_64",
      "CentOS Linux 8 x86_64", 
      "Debian GNU/Linux 11 x86_64",
      "Red Hat Enterprise Linux 8.7",
      "SUSE Linux Enterprise Server 15 SP4",
      "Fedora Linux 37 x86_64",
    ];
    return systems[Math.floor(Math.random() * systems.length)];
  };

  const generateRandomCPU = () => {
    const cpus = [
      "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz",
      "AMD Ryzen 7 3700X 8-Core Processor", 
      "Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz",
      "AMD EPYC 7502P 32-Core Processor",
      "Intel(R) Core(TM) i9-11900K CPU @ 3.50GHz",
    ];
    return cpus[Math.floor(Math.random() * cpus.length)];
  };

  const generateRandomTime = () => {
    const times = ["11h ago", "12h ago", "13h ago", "14h ago", "15h ago", "20h ago"];
    return times[Math.floor(Math.random() * times.length)];
  };

  return (
    <Card className="mb-6 bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Upload Server Credentials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging && "border-primary bg-primary/10",
            uploadStatus === "success" && "border-success bg-success/10",
            uploadStatus === "error" && "border-danger bg-danger/10"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="sr-only"
          />
          
          <div className="flex flex-col items-center gap-4">
            {uploadStatus === "success" ? (
              <CheckCircle className="w-12 h-12 text-success" />
            ) : uploadStatus === "error" ? (
              <AlertCircle className="w-12 h-12 text-danger" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
            
            <div>
              <h3 className="font-semibold mb-2">
                {isProcessing ? "Processing file..." : "Drop your input.txt file here"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Format: Each line should contain "host:port@username:password"
              </p>
              
              <Button 
                variant="outline" 
                disabled={isProcessing}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {isProcessing ? "Processing..." : "Choose File"}
              </Button>
            </div>
          </div>
        </div>
        
        {uploadStatus === "success" && (
          <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success font-medium">
              ✓ File uploaded and processed successfully
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};