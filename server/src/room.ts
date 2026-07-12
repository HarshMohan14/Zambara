import { Server, Socket } from 'socket.io';
import { GameRoom } from './game.js';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private socketToRoomCode: Map<string, string> = new Map(); // socket.id -> roomCode

  constructor() {}

  /**
   * Generates a unique 4-character room code.
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!this.rooms.has(code)) {
        isUnique = true;
      }
    }
    return code;
  }

  public createRoom(io: Server): string {
    const code = this.generateRoomCode();
    const newRoom = new GameRoom(code, io);
    this.rooms.set(code, newRoom);
    return code;
  }

  public getRoom(code: string): GameRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getRoomBySocket(socketId: string): GameRoom | undefined {
    const code = this.socketToRoomCode.get(socketId);
    if (!code) return undefined;
    return this.getRoom(code);
  }

  public joinRoom(
    code: string,
    playerId: string,
    displayName: string,
    socket: Socket,
    io: Server
  ): GameRoom | null {
    const upperCode = code.toUpperCase();
    const room = this.rooms.get(upperCode);
    if (!room) return null;

    // Check if player name is sanitized and fits constraints
    const sanitizedName = displayName.replace(/[^\w\s-]/g, '').trim().slice(0, 15);
    const finalName = sanitizedName || `Player_${playerId.slice(0, 4)}`;

    room.addPlayer(playerId, finalName, socket);
    this.socketToRoomCode.set(socket.id, upperCode);

    return room;
  }

  public handleDisconnect(socketId: string, playerId: string): void {
    const code = this.socketToRoomCode.get(socketId);
    if (code) {
      const room = this.rooms.get(code);
      if (room) {
        room.removePlayer(playerId);
        
        // Clean up empty rooms
        if (room.players.size === 0) {
          this.rooms.delete(code);
        }
      }
      this.socketToRoomCode.delete(socketId);
    }
  }
}
