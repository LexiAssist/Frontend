import { useAuthStore } from '@/store/authStore';

export type WebSocketEvent =
  | { type: 'quiz_completed'; data: { quiz_id: string; score: number; user_id: string } }
  | { type: 'goal_progress'; data: { goal_id: string; progress: number; user_id: string } }
  | { type: 'material_uploaded'; data: { material_id: string; name: string; user_id: string } }
  | { type: 'sync'; data: any }
  | { type: 'update'; data: any }
  | { type: 'connection'; data: { status: 'connected' | 'disconnected' | 'error' } };

export type EventHandler = (event: WebSocketEvent) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectTimeout: NodeJS.Timeout | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  private url: string;
  private isIntentionallyClosed = false;
  private lastToken: string | null = null;
  private connectionStartTime: number = 0;

  constructor() {
    this.url = '';
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsPort = '8085';
    return `${protocol}//localhost:${wsPort}/api/v1/sync`;
  }

  connect() {
    if (typeof window === 'undefined') {
      return;
    }

    // Debounce: clear any pending connect
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }

    // Delay connect slightly to handle React StrictMode double-mount
    this.connectTimeout = setTimeout(() => {
      this.doConnect();
    }, 50);
  }

  private doConnect() {
    if (!this.url) {
      this.url = this.getWebSocketUrl();
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const token = useAuthStore.getState().accessToken;

    // Don't connect if no token
    if (!token) {
      return;
    }

    // Check if token is expired before connecting
    const { isTokenExpired } = useAuthStore.getState();
    if (isTokenExpired()) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.lastToken = token;
    this.connectionStartTime = Date.now();

    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
        this.notifyHandlers({
          type: 'connection',
          data: { status: 'connected' },
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'pong') {
            return;
          }

          this.notifyHandlers(message as WebSocketEvent);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = () => {
        // Silently handle errors - onclose will handle reconnection
        this.notifyHandlers({
          type: 'connection',
          data: { status: 'error' },
        });
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        this.ws = null;
        
        // Check if this was a quick disconnect (likely React StrictMode)
        const connectionDuration = Date.now() - this.connectionStartTime;
        const wasQuickDisconnect = connectionDuration < 500;
        
        this.notifyHandlers({
          type: 'connection',
          data: { status: 'disconnected' },
        });

        // Don't reconnect if intentionally closed
        if (this.isIntentionallyClosed) {
          return;
        }

        // Check if token is still valid before reconnecting
        const { accessToken, isTokenExpired } = useAuthStore.getState();
        if (!accessToken || isTokenExpired()) {
          return;
        }

        // If it was a quick disconnect, reconnect immediately without counting as an attempt
        if (wasQuickDisconnect && this.reconnectAttempts === 0) {
          this.scheduleReconnect(0);
        } else {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
    }
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.lastToken = null;
  }

  private scheduleReconnect(delay?: number) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    // Check if token is still valid
    const { accessToken, isTokenExpired } = useAuthStore.getState();
    if (!accessToken || isTokenExpired()) {
      return;
    }

    const reconnectDelay = delay ?? Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 8000);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, reconnectDelay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyHandlers(event: WebSocketEvent) {
    this.eventHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('[WebSocket] Error in event handler:', error);
      }
    });
  }

  subscribe(handler: EventHandler) {
    this.eventHandlers.add(handler);
    
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Not connected');
    }
  }

  // Force reconnection with new token
  reconnect() {
    this.disconnect();
    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.connect();
  }

  // Get current connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
