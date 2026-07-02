import json
from typing import List
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "Connected to ZenTra Store Real-time Notification System"
        }))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message_dict: dict):
        """Broadcasts a JSON message to all connected clients."""
        message_str = json.dumps(message_dict)
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception:
                # Handle dead connections gracefully
                pass

# Global instance to be used across routers
manager = ConnectionManager()
