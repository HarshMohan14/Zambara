import { GameRoom } from './game.js';
export class RoomManager {
    rooms = new Map();
    socketToRoomCode = new Map(); // socket.id -> roomCode
    constructor() { }
    /**
     * Generates a unique 4-character room code.
     */
    generateRoomCode() {
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
    createRoom(io) {
        const code = this.generateRoomCode();
        const newRoom = new GameRoom(code, io);
        this.rooms.set(code, newRoom);
        return code;
    }
    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }
    getRoomBySocket(socketId) {
        const code = this.socketToRoomCode.get(socketId);
        if (!code)
            return undefined;
        return this.getRoom(code);
    }
    joinRoom(code, playerId, displayName, socket, io) {
        const upperCode = code.toUpperCase();
        const room = this.rooms.get(upperCode);
        if (!room)
            return null;
        // Check if player name is sanitized and fits constraints
        const sanitizedName = displayName.replace(/[^\w\s-]/g, '').trim().slice(0, 15);
        const finalName = sanitizedName || `Player_${playerId.slice(0, 4)}`;
        room.addPlayer(playerId, finalName, socket);
        this.socketToRoomCode.set(socket.id, upperCode);
        return room;
    }
    handleDisconnect(socketId, playerId) {
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
