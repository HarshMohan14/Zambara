import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './room.js';

const app = express();
app.use(cors());

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).send('Zambara Game Server is healthy.');
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for prototype testing
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();

// Track playerId associated with socket connection
const socketToPlayerId: Map<string, string> = new Map();

io.on('connection', (socket: Socket) => {
  // Generate a client-specific player ID or accept client-provided one
  const playerId = socket.handshake.query.playerId as string || socket.id;
  socketToPlayerId.set(socket.id, playerId);

  // 1. Lobby events
  socket.on('create-room', () => {
    const code = roomManager.createRoom(io);
    socket.emit('room-created', { code });
  });

  socket.on('join-room', (data: { code: string; displayName: string }) => {
    const room = roomManager.joinRoom(data.code, playerId, data.displayName, socket, io);
    if (!room) {
      socket.emit('error-message', { message: 'Room not found or invalid code.' });
    }
  });

  socket.on('player-ready', (data: { isReady: boolean }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.setPlayerReady(playerId, data.isReady);
    }
  });

  socket.on('set-role-preference', (data: { role: string }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.setPlayerPreference(playerId, data.role);
    }
  });

  socket.on('start-match', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.startMatch(playerId);
    }
  });

  // 2. Movement & Interactions
  socket.on('player-move', (data: { position: { x: number; y: number; z: number }; rotationY: number; speedMode: 'walk' | 'sprint' | 'crouch'; dt: number }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room && data.position) {
      // Validate time step to prevent divisions by zero or negative times
      const dt = Math.max(0.001, Math.min(0.2, data.dt || 0.05));
      room.handlePlayerMove(playerId, data.position, data.rotationY, data.speedMode, dt);
    }
  });

  socket.on('start-interaction', (data: { type: 'capture' | 'revive' | 'search' | 'lock' | 'break' | 'breach'; targetId: string }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.handleStartInteraction(playerId, data.type, data.targetId);
    }
  });

  socket.on('cancel-interaction', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.handleCancelInteraction(playerId);
    }
  });

  socket.on('door-toggle', (data: { id: string }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.handleDoorToggle(playerId, data.id);
    }
  });

  socket.on('hiding-spot-interact', (data: { id: string }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) {
      room.handleHidingSpotInteract(playerId, data.id);
    }
  });

  socket.on('pulse-attack', (data: { direction: { x: number; y: number; z: number } }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room && data.direction) {
      room.handlePulseAttack(playerId, data.direction);
    }
  });

  // 3. Admin Debug actions (Active only in dev mode, server validates admin status)
  socket.on('admin-skip-phase', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) room.skipPhase(playerId);
  });

  socket.on('admin-add-time', (data: { seconds: number }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) room.addTime(playerId, data.seconds);
  });

  socket.on('admin-reset-doors', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room) room.resetDoors(playerId);
  });

  socket.on('admin-teleport', (data: { position: { x: number; y: number; z: number } }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (room && data.position) room.teleportPlayer(playerId, data.position);
  });

  // 4. Disconnect events
  socket.on('disconnect', () => {
    roomManager.handleDisconnect(socket.id, playerId);
    socketToPlayerId.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Zambara Game Server is running on port ${PORT}`);
});
