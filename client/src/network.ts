import { io, Socket } from 'socket.io-client';
import { RoomState, Vector3Data, MatchPhase, DoorState } from 'shared';

export class NetworkManager {
  public socket: Socket | null = null;
  public playerId: string;
  public roomCode: string = '';
  public onStateUpdate: (state: RoomState) => void = () => {};
  public onPhaseChange: (data: { phase: MatchPhase; timer: number; doorStates: Record<string, DoorState> }) => void = () => {};
  public onAnnouncement: (msg: string) => void = () => {};
  public onNoiseEvent: (event: { id: string; position: Vector3Data; timestamp: number }) => void = () => {};
  public onPulseEffect: (data: { origin: Vector3Data; direction: Vector3Data; hit: boolean; attackerPos: Vector3Data | null }) => void = () => {};
  public onMatchEnd: (data: { winResult: { winningSide: string; reason: string }; stats: any }) => void = () => {};
  
  // Interactive / State feedback
  public onInteractionStarted: (data: { type: string; targetId: string; duration: number }) => void = () => {};
  public onInteractionSuccess: (data: { type: string }) => void = () => {};
  public onInteractionCancelled: (data: { reason: string }) => void = () => {};
  public onInteractionResult: (data: { success: boolean; message: string }) => void = () => {};
  
  public onHidingSpotEntered: (spotId: string) => void = () => {};
  public onHidingSpotExited: () => void = () => {};
  public onHidingSpotEjected: (spotId: string) => void = () => {};

  public onExtractionProgress: (progress: number) => void = () => {};
  public onExtractionContested: () => void = () => {};
  
  public onError: (msg: string) => void = () => {};
  public onRoomJoined: (data: any) => void = () => {};
  public onRoomCreated: (code: string) => void = () => {};

  constructor() {
    // Generate a persistent random player ID for this tab session
    let savedId = sessionStorage.getItem('zambara_player_id');
    if (!savedId) {
      savedId = 'player_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('zambara_player_id', savedId);
    }
    this.playerId = savedId;
  }

  public connect(serverUrl: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(serverUrl, {
      query: { playerId: this.playerId }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server, playerId:', this.playerId);
    });

    this.socket.on('room-created', (data: { code: string }) => {
      this.roomCode = data.code;
      this.onRoomCreated(data.code);
    });

    this.socket.on('room-joined', (data: any) => {
      this.roomCode = data.code;
      this.onRoomJoined(data);
    });

    this.socket.on('room-state', (state: RoomState) => {
      this.onStateUpdate(state);
    });

    this.socket.on('phase-changed', (data: any) => {
      this.onPhaseChange(data);
    });

    this.socket.on('announcement', (data: { message: string }) => {
      this.onAnnouncement(data.message);
    });

    this.socket.on('noise-event', (data: any) => {
      this.onNoiseEvent(data);
    });

    this.socket.on('pulse-effect', (data: any) => {
      this.onPulseEffect(data);
    });

    this.socket.on('match-ended', (data: any) => {
      this.onMatchEnd(data);
    });

    this.socket.on('interaction-started', (data: any) => {
      this.onInteractionStarted(data);
    });

    this.socket.on('interaction-success', (data: any) => {
      this.onInteractionSuccess(data);
    });

    this.socket.on('interaction-cancelled', (data: any) => {
      this.onInteractionCancelled(data);
    });

    this.socket.on('interaction-result', (data: any) => {
      this.onInteractionResult(data);
    });

    this.socket.on('hiding-spot-entered', (data: { spotId: string }) => {
      this.onHidingSpotEntered(data.spotId);
    });

    this.socket.on('hiding-spot-exited', () => {
      this.onHidingSpotExited();
    });

    this.socket.on('hiding-spot-ejected', (data: { spotId: string }) => {
      this.onHidingSpotEjected(data.spotId);
    });

    this.socket.on('extraction-progress', (data: { progress: number }) => {
      this.onExtractionProgress(data.progress);
    });

    this.socket.on('extraction-contested', () => {
      this.onExtractionContested();
    });

    this.socket.on('error-message', (data: { message: string }) => {
      this.onError(data.message);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  // --- Send actions to server ---

  public createRoom(): void {
    this.socket?.emit('create-room');
  }

  public joinRoom(code: string, displayName: string): void {
    this.socket?.emit('join-room', { code, displayName });
  }

  public setReady(isReady: boolean): void {
    this.socket?.emit('player-ready', { isReady });
  }

  public setRolePreference(role: string): void {
    this.socket?.emit('set-role-preference', { role });
  }

  public startMatch(): void {
    this.socket?.emit('start-match');
  }

  public sendMove(position: Vector3Data, rotationY: number, speedMode: 'walk' | 'sprint' | 'crouch', dt: number): void {
    this.socket?.emit('player-move', { position, rotationY, speedMode, dt });
  }

  public startInteraction(type: string, targetId: string): void {
    this.socket?.emit('start-interaction', { type, targetId });
  }

  public cancelInteraction(): void {
    this.socket?.emit('cancel-interaction');
  }

  public toggleDoor(doorId: string): void {
    this.socket?.emit('door-toggle', { id: doorId });
  }

  public interactHidingSpot(spotId: string): void {
    this.socket?.emit('hiding-spot-interact', { id: spotId });
  }

  public triggerPulse(direction: Vector3Data): void {
    this.socket?.emit('pulse-attack', { direction });
  }

  // --- Admin Debug actions ---

  public adminSkipPhase(): void {
    this.socket?.emit('admin-skip-phase');
  }

  public adminAddTime(seconds: number): void {
    this.socket?.emit('admin-add-time', { seconds });
  }

  public adminResetDoors(): void {
    this.socket?.emit('admin-reset-doors');
  }

  public adminTeleport(position: Vector3Data): void {
    this.socket?.emit('admin-teleport', { position });
  }
}
export const network = new NetworkManager();
