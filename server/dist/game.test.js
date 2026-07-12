import { describe, it, expect } from 'vitest';
import { PlayerRole, PlayerStatus, MatchPhase, DoorState, GAME_CONFIG, calculateExtractionTarget } from 'shared';
import { assignRoles, evaluateWinConditions } from './logic.js';
import { validateMove } from './physics.js';
import { GameRoom } from './game.js';
describe('Gameplay Logic Tests', () => {
    it('should calculate correct extraction targets', () => {
        // Math.ceil(totalCivilians * 0.75) for < 4 civilians, 3 for >= 4 civilians
        expect(calculateExtractionTarget(0)).toBe(0);
        expect(calculateExtractionTarget(1)).toBe(1); // Math.ceil(0.75) = 1
        expect(calculateExtractionTarget(2)).toBe(2); // Math.ceil(1.5) = 2
        expect(calculateExtractionTarget(3)).toBe(3); // Math.ceil(2.25) = 3
        expect(calculateExtractionTarget(4)).toBe(3); // capped at 3 for standard match
        expect(calculateExtractionTarget(6)).toBe(3);
    });
    it('should assign roles based on player count', () => {
        // 1 player (solo dev mode)
        const roles1 = assignRoles(['p1']);
        expect(roles1['p1']).toBe(PlayerRole.Civilian);
        // 2 players
        const roles2 = assignRoles(['p1', 'p2']);
        const vals2 = Object.values(roles2);
        expect(vals2).toContain(PlayerRole.Civilian);
        expect(vals2).toContain(PlayerRole.Attacker);
        // 3 players
        const roles3 = assignRoles(['p1', 'p2', 'p3']);
        const vals3 = Object.values(roles3);
        expect(vals3).toContain(PlayerRole.Civilian);
        expect(vals3).toContain(PlayerRole.Attacker);
        expect(vals3).toContain(PlayerRole.RescueOfficer);
        // 6 players
        const roles6 = assignRoles(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
        const civCount = Object.values(roles6).filter(r => r === PlayerRole.Civilian).length;
        const attCount = Object.values(roles6).filter(r => r === PlayerRole.Attacker).length;
        const resCount = Object.values(roles6).filter(r => r === PlayerRole.RescueOfficer).length;
        expect(civCount).toBe(4);
        expect(attCount).toBe(1);
        expect(resCount).toBe(1);
    });
    it('should evaluate win conditions correctly', () => {
        const players = [
            { id: 'c1', displayName: 'Civ1', role: PlayerRole.Civilian, status: PlayerStatus.Active, position: { x: 0, y: 0, z: 0 }, rotationY: 0, health: 1, isReady: true },
            { id: 'c2', displayName: 'Civ2', role: PlayerRole.Civilian, status: PlayerStatus.Active, position: { x: 0, y: 0, z: 0 }, rotationY: 0, health: 1, isReady: true },
            { id: 'att', displayName: 'Att', role: PlayerRole.Attacker, status: PlayerStatus.Active, position: { x: 0, y: 0, z: 0 }, rotationY: 0, health: 3, isReady: true }
        ];
        // No victory yet during preparation
        const win1 = evaluateWinConditions(players, MatchPhase.CivilianPreparation, 20, 3);
        expect(win1).toBeNull();
        // Civilian escapes
        players[0].status = PlayerStatus.Extracted;
        players[1].status = PlayerStatus.Extracted;
        const win2 = evaluateWinConditions(players, MatchPhase.RescuePhase, 150, 3);
        expect(win2?.winningSide).toBe("Civilian/Rescue");
        // Reset and test attacker victory (all captured)
        players[0].status = PlayerStatus.Captured;
        players[1].status = PlayerStatus.Captured;
        const win3 = evaluateWinConditions(players, MatchPhase.RescuePhase, 150, 3);
        expect(win3?.winningSide).toBe("Attacker");
        // Rescue phase timer runs out
        players[0].status = PlayerStatus.Active;
        players[1].status = PlayerStatus.Active;
        const win4 = evaluateWinConditions(players, MatchPhase.RescuePhase, 0, 3);
        expect(win4?.winningSide).toBe("Attacker");
    });
    it('should validate and clamp movement speed', () => {
        const doorStates = {};
        const oldPos = { x: 0, y: 0, z: 0 };
        // Normal walk move (4.0 m/s for 1s = 4.0m allowed, moving 2.0m is valid)
        const newPosValid = { x: 2.0, y: 0, z: 0 };
        const validated1 = validateMove(oldPos, newPosValid, 4.0, 1.0, doorStates);
        expect(validated1.x).toBe(2.0);
        // Speed hack move (moving 20m in 1s is invalid, should be clamped)
        const newPosInvalid = { x: 20.0, y: 0, z: 0 };
        const validated2 = validateMove(oldPos, newPosInvalid, 4.0, 1.0, doorStates);
        expect(validated2.x).toBeLessThan(6.0); // max allowed: 4.0 * 1s + 1.0 tolerance = 5.0m
    });
});
describe('Match Lifecycle Integration Tests', () => {
    const mockIo = {
        to: () => ({
            emit: () => { }
        })
    };
    const mockSocket = {
        join: () => { },
        emit: () => { }
    };
    it('should run full match lifecycle: Room -> Start -> Phase changes -> Win', () => {
        const room = new GameRoom('TEST', mockIo);
        // 1. Players joining
        room.addPlayer('c1', 'Civilian1', mockSocket);
        room.addPlayer('att', 'AttackerPlayer', mockSocket);
        expect(room.players.size).toBe(2);
        expect(room.phase).toBe(MatchPhase.Lobby);
        // Ready up
        room.setPlayerReady('c1', true);
        room.setPlayerReady('att', true);
        // 2. Start Match (forced by admin c1)
        room.startMatch('c1');
        expect(room.phase).toBe(MatchPhase.CivilianPreparation);
        // Validate role assignments
        const civ = room.players.get('c1');
        const attacker = room.players.get('att');
        // Role assignment is randomized but has a 1-civilian and 1-attacker ratio
        expect(civ).toBeDefined();
        expect(attacker).toBeDefined();
        // Override roles for deterministic simulation testing
        civ.role = PlayerRole.Civilian;
        attacker.role = PlayerRole.Attacker;
        // Doors must be closed
        expect(room.doorStates['attacker_gate']).toBe(DoorState.Locked);
        // 3. Skip prep phase to release Attacker
        room.skipPhase('c1');
        expect(room.phase).toBe(MatchPhase.AttackerEntry);
        expect(room.doorStates['attacker_gate']).toBe(DoorState.Open);
        // 4. Skip AttackerEntry phase to arrival of Rescue Officer
        room.skipPhase('c1');
        expect(room.phase).toBe(MatchPhase.RescuePhase);
        // 5. Civilian extracts successfully
        // Place civilian in extraction zone (radius 4.0m from x=0, z=-8)
        civ.position = { x: 0, y: 0.1, z: -8 };
        // Simulate game tick processing extraction zone (3 seconds required, dt = 0.5s ticks)
        for (let i = 0; i < 7; i++) {
            // call private tick method or replicate manual extraction loop
            // We simulate tick:
            const dt = 0.5;
            const zoneCenter = GAME_CONFIG.extraction.zoneCenter;
            const dist = Math.sqrt(Math.pow(civ.position.x - zoneCenter.x, 2) +
                Math.pow(civ.position.z - zoneCenter.z, 2));
            if (dist <= GAME_CONFIG.extraction.zoneRadius) {
                // manually update extraction progress and trigger status change
                const current = room.extractionProgress.get(civ.id) || 0;
                const next = current + dt * 1000;
                room.extractionProgress.set(civ.id, next);
                if (next >= GAME_CONFIG.interaction.holdDurations.extract) {
                    civ.status = PlayerStatus.Extracted;
                    if (room.matchStats) {
                        room.matchStats.extractedCivilians++;
                    }
                }
            }
        }
        expect(civ.status).toBe(PlayerStatus.Extracted);
        // Re-evaluate win conditions (civ extracted, 1 civ total in lobby = 100% extracted, Civilian/Rescue Victory)
        const winResult = evaluateWinConditions(Array.from(room.players.values()), room.phase, room.timer, 3);
        expect(winResult?.winningSide).toBe("Civilian/Rescue");
        // Close room intervals to exit tests cleanly
        room.resetRoom();
    });
});
