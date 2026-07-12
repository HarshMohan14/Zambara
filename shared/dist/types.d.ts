export declare enum PlayerRole {
    Civilian = "Civilian",
    Attacker = "Attacker",
    RescueOfficer = "RescueOfficer"
}
export declare enum PlayerStatus {
    Active = "Active",
    Hidden = "Hidden",
    Captured = "Captured",
    Extracted = "Extracted",
    Neutralised = "Neutralised"
}
export declare enum MatchPhase {
    Lobby = "Lobby",
    CivilianPreparation = "CivilianPreparation",
    AttackerEntry = "AttackerEntry",
    RescuePhase = "RescuePhase",
    MatchEnd = "MatchEnd"
}
export declare enum DoorState {
    Open = "Open",
    Closed = "Closed",
    Locked = "Locked",
    Broken = "Broken"
}
export interface Vector3Data {
    x: number;
    y: number;
    z: number;
}
export interface PlayerStats {
    captures: number;
    revives: number;
    extractions: number;
    hidingSpotsSearched: number;
    timeHiddenSeconds: number;
    pulseHits: number;
}
export interface NetworkPlayer {
    id: string;
    displayName: string;
    role: PlayerRole;
    status: PlayerStatus;
    position: Vector3Data;
    rotationY: number;
    health: number;
    currentHidingSpotId?: string;
    isReady: boolean;
    preferredRole?: PlayerRole;
}
export interface DoorData {
    id: string;
    state: DoorState;
    position: Vector3Data;
    rotationY: number;
}
export interface HidingSpotData {
    id: string;
    position: Vector3Data;
    occupiedByPlayerId: string | null;
}
export interface NoiseEvent {
    id: string;
    position: Vector3Data;
    timestamp: number;
}
export interface WinResult {
    winningSide: "Civilian/Rescue" | "Attacker";
    reason: string;
}
export interface MatchStats {
    durationSeconds: number;
    totalCivilians: number;
    extractedCivilians: number;
    capturedAtEnd: number;
    revivedCivilians: number;
    attackerHealth: number;
    attackerNeutralized: boolean;
    playerStats: Record<string, PlayerStats>;
    roles: Record<string, PlayerRole>;
    displayNames: Record<string, string>;
}
export interface RoomState {
    code: string;
    phase: MatchPhase;
    timer: number;
    players: NetworkPlayer[];
    doors: Record<string, DoorState>;
    hidingSpots: Record<string, string | null>;
    adminId: string;
    winResult?: WinResult;
    stats?: MatchStats;
}
