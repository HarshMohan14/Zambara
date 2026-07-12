import { network } from './network.js';
import { PlayerRole } from 'shared';
export class DebugTools {
    config = {
        isDev: false,
        preferredRole: null,
        fastPhases: false,
        soloStart: false
    };
    debugLines = new Map();
    constructor() {
        this.parseUrlParameters();
    }
    parseUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        this.config.isDev = params.get('dev') === 'true';
        this.config.fastPhases = params.get('fastPhases') === 'true';
        this.config.soloStart = params.get('soloStart') === 'true' || this.config.isDev; // Solo start is true if dev mode is on
        const roleParam = params.get('role');
        if (roleParam === 'Civilian')
            this.config.preferredRole = PlayerRole.Civilian;
        else if (roleParam === 'Attacker')
            this.config.preferredRole = PlayerRole.Attacker;
        else if (roleParam === 'RescueOfficer')
            this.config.preferredRole = PlayerRole.RescueOfficer;
        if (this.config.isDev) {
            console.log('--- DEVELOPMENT MODE ACTIVE ---');
            console.log('Preferred Role:', this.config.preferredRole);
            console.log('Fast Phases:', this.config.fastPhases);
            console.log('Solo Start Allowed:', this.config.soloStart);
        }
    }
    /**
     * Automatically executes lobby actions if dev mode is enabled.
     */
    autoLobbyFlow(displayName) {
        if (!this.config.isDev)
            return;
        // Wait slightly for socket connection, then create and auto start
        setTimeout(() => {
            console.log('Dev auto-flow: Creating room...');
            network.createRoom();
            // Listen for room creation, then auto join and start
            network.onRoomCreated = (code) => {
                console.log(`Dev auto-flow: Room created [${code}]. Joining...`);
                network.joinRoom(code, displayName);
            };
            network.onRoomJoined = (data) => {
                console.log('Dev auto-flow: Joined room. Marking ready...');
                network.setReady(true);
                if (this.config.soloStart) {
                    setTimeout(() => {
                        console.log('Dev auto-flow: Starting solo match...');
                        network.startMatch();
                    }, 800);
                }
            };
        }, 500);
    }
    /**
     * Draws a debug ray in the 3D scene (useful for visualizing pulse attack).
     */
    drawDebugRay(scene, id, start, end, color) {
        // If there is an existing line, dispose it
        const existing = this.debugLines.get(id);
        if (existing) {
            existing.dispose();
        }
        // Draw new line
        // Import dynamically or use BABYLON directly if available
        const BABYLON = window.BABYLON;
        if (BABYLON) {
            const points = [
                new BABYLON.Vector3(start.x, start.y, start.z),
                new BABYLON.Vector3(end.x, end.y, end.z)
            ];
            const line = BABYLON.MeshBuilder.CreateLines(id, { points }, scene);
            line.color = color;
            this.debugLines.set(id, line);
            // Remove after 1 second
            setTimeout(() => {
                line.dispose();
                this.debugLines.delete(id);
            }, 1000);
        }
    }
}
export const debug = new DebugTools();
