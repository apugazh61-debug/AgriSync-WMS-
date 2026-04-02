import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useWebSocket = (onInventoryUpdate, onLowStockAlert) => {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        client.subscribe('/topic/inventory-update', (msg) => {
          const data = JSON.parse(msg.body);
          onInventoryUpdate && onInventoryUpdate(data);
        });
        client.subscribe('/topic/low-stock-alert', (msg) => {
          const data = JSON.parse(msg.body);
          onLowStockAlert && onLowStockAlert(data);
        });
      },
      onDisconnect: () => console.log('WebSocket disconnected'),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) clientRef.current.deactivate();
    };
  }, []);

  return clientRef;
};

export default useWebSocket;
