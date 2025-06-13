
// src/utils/connectionUtils.ts
/**
 * Connection status utilities
 */
export interface ConnectionStatus {
  isConnected: boolean;
  lastSeen: number;
  latency?: number;
  reconnectAttempts: number;
}

export class ConnectionMonitor {
  private status: ConnectionStatus = {
    isConnected: false,
    lastSeen: 0,
    reconnectAttempts: 0
  };

  private listeners: Array<(status: ConnectionStatus) => void> = [];
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(private heartbeatMs: number = 30000) {}

  public startMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSeen = now - this.status.lastSeen;

      if (timeSinceLastSeen > this.heartbeatMs && this.status.isConnected) {
        this.updateStatus({ ...this.status, isConnected: false });
      }
    }, this.heartbeatMs / 2);
  }

  public stopMonitoring(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  public recordActivity(): void {
    const wasConnected = this.status.isConnected;
    this.updateStatus({
      ...this.status,
      isConnected: true,
      lastSeen: Date.now(),
      reconnectAttempts: 0
    });

    if (!wasConnected) {
      console.log('Connection restored');
    }
  }

  public recordReconnectAttempt(): void {
    this.updateStatus({
      ...this.status,
      reconnectAttempts: this.status.reconnectAttempts + 1
    });
  }

  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (status: ConnectionStatus) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    this.listeners.forEach(callback => callback(newStatus));
  }
}

/**
 * WebSocket connection wrapper with auto-reconnect
 */
export class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: { [key: string]: Array<(data: any) => void> } = {};

  constructor(private url: string) {}

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('open', null);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.emit('close', null);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
}
