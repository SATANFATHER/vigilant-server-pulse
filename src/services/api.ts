const API_BASE_URL = '/api';

export interface ServerCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SystemInfo {
  architecture: string;
  ram: string;
  cpuModel: string;
  cpuCores: number;
  gpu: string;
  storage: string;
  uptime: string;
  loadAverage: string;
}

export interface ServerStatus {
  id: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline' | 'connecting' | 'error';
  lastChecked: string;
  responseTime?: number;
  error?: string;
  systemInfo?: SystemInfo;
}

export class ServerAPI {
  static async testConnection(credentials: ServerCredentials): Promise<{
    success: boolean;
    responseTime?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  static async getSystemInfo(credentials: ServerCredentials): Promise<SystemInfo> {
    const response = await fetch(`${API_BASE_URL}/system-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Failed to get system info: ${response.statusText}`);
    }

    return await response.json();
  }

  static async checkMultipleServers(serverList: ServerCredentials[]): Promise<ServerStatus[]> {
    const response = await fetch(`${API_BASE_URL}/check-servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ servers: serverList }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check servers: ${response.statusText}`);
    }

    return await response.json();
  }

  static async refreshServer(serverId: string): Promise<ServerStatus> {
    const response = await fetch(`${API_BASE_URL}/refresh-server/${serverId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh server: ${response.statusText}`);
    }

    return await response.json();
  }
}