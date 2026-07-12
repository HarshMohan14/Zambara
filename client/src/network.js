import { io } from 'socket.io-client';
export class NetworkManager {
    socket = null;
    playerId;
    roomCode = '';
    onStateUpdate = () => { };
    onPhaseChange = () => { };
    onAnnouncement = () => { };
    onNoiseEvent = () => { };
    onPulseEffect = () => { };
    onMatchEnd = () => { };
    // Interactive / State feedback
    onInteractionStarted = () => { };
    onInteractionSuccess = () => { };
    onInteractionCancelled = () => { };
    onInteractionResult = () => { };
    onHidingSpotEntered = () => { };
    onHidingSpotExited = () => { };
    onHidingSpotEjected = () => { };
    onExtractionProgress = () => { };
    onExtractionContested = () => { };
    onError = () => { };
    onRoomJoined = () => { };
    onRoomCreated = () => { };
    constructor() {
        // Generate a persistent random player ID for this tab session
        let savedId = sessionStorage.getItem('zambara_player_id');
        if (!savedId) {
            savedId = 'player_' + Math.random().toString(36).substring(2, 11);
            sessionStorage.setItem('zambara_player_id', savedId);
        }
        this.playerId = savedId;
    }
    connect(serverUrl) {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.socket = io(serverUrl, {
            query: { playerId: this.playerId }
        });
        this.socket.on('connect', () => {
            console.log('Connected to server, playerId:', this.playerId);
        });
        this.socket.on('room-created', (data) => {
            this.roomCode = data.code;
            this.onRoomCreated(data.code);
        });
        this.socket.on('room-joined', (data) => {
            this.roomCode = data.code;
            this.onRoomJoined(data);
        });
        this.socket.on('room-state', (state) => {
            this.onStateUpdate(state);
        });
        this.socket.on('phase-changed', (data) => {
            this.onPhaseChange(data);
        });
        this.socket.on('announcement', (data) => {
            this.onAnnouncement(data.message);
        });
        this.socket.on('noise-event', (data) => {
            this.onNoiseEvent(data);
        });
        this.socket.on('pulse-effect', (data) => {
            this.onPulseEffect(data);
        });
        this.socket.on('match-ended', (data) => {
            this.onMatchEnd(data);
        });
        this.socket.on('interaction-started', (data) => {
            this.onInteractionStarted(data);
        });
        this.socket.on('interaction-success', (data) => {
            this.onInteractionSuccess(data);
        });
        this.socket.on('interaction-cancelled', (data) => {
            this.onInteractionCancelled(data);
        });
        this.socket.on('interaction-result', (data) => {
            this.onInteractionResult(data);
        });
        this.socket.on('hiding-spot-entered', (data) => {
            this.onHidingSpotEntered(data.spotId);
        });
        this.socket.on('hiding-spot-exited', () => {
            this.onHidingSpotExited();
        });
        this.socket.on('hiding-spot-ejected', (data) => {
            this.onHidingSpotEjected(data.spotId);
        });
        this.socket.on('extraction-progress', (data) => {
            this.onExtractionProgress(data.progress);
        });
        this.socket.on('extraction-contested', () => {
            this.onExtractionContested();
        });
        this.socket.on('error-message', (data) => {
            this.onError(data.message);
        });
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }
    // --- Send actions to server ---
    createRoom() {
        this.socket?.emit('create-room');
    }
    joinRoom(code, displayName) {
        this.socket?.emit('join-room', { code, displayName });
    }
    setReady(isReady) {
        this.socket?.emit('player-ready', { isReady });
    }
    setRolePreference(role) {
        this.socket?.emit('set-role-preference', { role });
    }
    startMatch() {
        this.socket?.emit('start-match');
    }
    sendMove(position, rotationY, speedMode, dt) {
        this.socket?.emit('player-move', { position, rotationY, speedMode, dt });
    }
    startInteraction(type, targetId) {
        this.socket?.emit('start-interaction', { type, targetId });
    }
    cancelInteraction() {
        this.socket?.emit('cancel-interaction');
    }
    toggleDoor(doorId) {
        this.socket?.emit('door-toggle', { id: doorId });
    }
    interactHidingSpot(spotId) {
        this.socket?.emit('hiding-spot-interact', { id: spotId });
    }
    triggerPulse(direction) {
        this.socket?.emit('pulse-attack', { direction });
    }
    // --- Admin Debug actions ---
    adminSkipPhase() {
        this.socket?.emit('admin-skip-phase');
    }
    adminAddTime(seconds) {
        this.socket?.emit('admin-add-time', { seconds });
    }
    adminResetDoors() {
        this.socket?.emit('admin-reset-doors');
    }
    adminTeleport(position) {
        this.socket?.emit('admin-teleport', { position });
    }
}
export const network = new NetworkManager();
