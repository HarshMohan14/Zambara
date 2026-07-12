import { Server, Socket } from 'socket.io';
import { GameRoom } from './game.js';
export declare class RoomManager {
    private rooms;
    private socketToRoomCode;
    constructor();
    /**
     * Generates a unique 4-character room code.
     */
    private generateRoomCode;
    createRoom(io: Server): string;
    getRoom(code: string): GameRoom | undefined;
    getRoomBySocket(socketId: string): GameRoom | undefined;
    joinRoom(code: string, playerId: string, displayName: string, socket: Socket, io: Server): GameRoom | null;
    handleDisconnect(socketId: string, playerId: string): void;
}
