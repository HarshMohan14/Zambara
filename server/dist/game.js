import { PlayerRole, PlayerStatus, MatchPhase, DoorState, GAME_CONFIG } from 'shared';
import { assignRoles, evaluateWinConditions } from './logic.js';
import { getDistance, validateMove, isInsideStaircase } from './physics.js';
export class GameRoom {
    code;
    phase = MatchPhase.Lobby;
    timer = 0; // seconds remaining in current phase
    players = new Map();
    doorStates = {};
    hidingSpots = {}; // spotId -> occupantPlayerId or null
    adminId = "";
    // Interaction tracking
    activeInteractions = new Map(); // playerId -> interaction
    // Extraction progress tracking
    extractionProgress = new Map(); // playerId -> time in ms
    // Match stats
    matchStats = null;
    matchStartTime = 0;
    matchEndTimer = null;
    gameLoopInterval = null;
    // Combat cooldowns
    pulseCooldowns = new Map(); // playerId -> lastPulseTimestamp
    // Noise event tracking
    noiseEvents = [];
    noiseCooldowns = new Map(); // playerId -> lastNoiseTimestamp
    io;
    constructor(code, io) {
        this.code = code;
        this.io = io;
        this.resetRoom();
    }
    resetRoom() {
        this.phase = MatchPhase.Lobby;
        this.timer = 0;
        this.activeInteractions.clear();
        this.extractionProgress.clear();
        this.pulseCooldowns.clear();
        this.noiseEvents = [];
        this.noiseCooldowns.clear();
        this.matchStats = null;
        // Remove playtest bots
        for (const key of this.players.keys()) {
            if (key.startsWith("bot_")) {
                this.players.delete(key);
            }
        }
        // Initialize door states
        GAME_CONFIG.map.doors.forEach(door => {
            this.doorStates[door.id] = door.spawnLocked ? DoorState.Locked : DoorState.Closed;
        });
        // Initialize hiding spots
        GAME_CONFIG.map.hidingSpots.forEach(spot => {
            this.hidingSpots[spot.id] = null;
        });
    }
    addPlayer(id, displayName, socket) {
        const isReady = false;
        const newPlayer = {
            id,
            displayName: displayName.slice(0, 15), // sanitize and limit name length
            role: PlayerRole.Civilian,
            status: PlayerStatus.Active,
            position: { x: 0, y: 0, z: 0 },
            rotationY: 0,
            health: 1,
            isReady
        };
        this.players.set(id, newPlayer);
        if (this.players.size === 1) {
            this.adminId = id;
        }
        // Join socket.io room
        socket.join(this.code);
        // Send initial join success
        socket.emit('room-joined', {
            code: this.code,
            adminId: this.adminId,
            players: Array.from(this.players.values())
        });
        this.broadcastState();
    }
    removePlayer(id) {
        const player = this.players.get(id);
        if (!player)
            return;
        // Handle occupant ejecting if they were in a hiding spot
        if (player.status === PlayerStatus.Hidden && player.currentHidingSpotId) {
            this.hidingSpots[player.currentHidingSpotId] = null;
        }
        this.players.delete(id);
        this.activeInteractions.delete(id);
        this.extractionProgress.delete(id);
        // Transfer admin status
        if (this.adminId === id && this.players.size > 0) {
            this.adminId = this.players.keys().next().value || "";
        }
        // Check game logic if match is running
        if (this.phase !== MatchPhase.Lobby && this.phase !== MatchPhase.MatchEnd) {
            // 1. If Attacker disconnects, end match in favor of Civilians
            if (player.role === PlayerRole.Attacker) {
                this.endMatch({
                    winningSide: "Civilian/Rescue",
                    reason: "The Attacker disconnected from the match."
                });
                return;
            }
            // 2. If Rescue Officer disconnects, match continues but warn clients (handled via client HUD)
            // 3. If all civilians disconnect, end match
            const civiliansLeft = Array.from(this.players.values()).filter(p => p.role === PlayerRole.Civilian).length;
            if (civiliansLeft === 0) {
                this.endMatch({
                    winningSide: "Attacker",
                    reason: "All Civilians disconnected from the match."
                });
                return;
            }
            // Re-evaluate win conditions (e.g. if a civilian disconnected, the extraction target changes)
            this.checkWinConditions();
        }
        this.broadcastState();
    }
    setPlayerReady(id, isReady) {
        const player = this.players.get(id);
        if (player && this.phase === MatchPhase.Lobby) {
            player.isReady = isReady;
            this.broadcastState();
        }
    }
    setPlayerPreference(id, preferredRole) {
        const player = this.players.get(id);
        if (player && this.phase === MatchPhase.Lobby) {
            if (preferredRole === PlayerRole.Civilian || preferredRole === PlayerRole.Attacker || preferredRole === PlayerRole.RescueOfficer) {
                player.preferredRole = preferredRole;
            }
            else {
                delete player.preferredRole;
            }
            this.broadcastState();
        }
    }
    startMatch(requestingPlayerId) {
        if (this.phase !== MatchPhase.Lobby)
            return;
        if (requestingPlayerId !== this.adminId)
            return; // Only admin can start
        const playersList = Array.from(this.players.values());
        if (playersList.length < 1)
            return; // Need at least 1 player for solo dev mode
        this.resetRoom();
        // Fill remaining slots up to 6 players with playtest bots
        if (process.env.NODE_ENV !== 'test') {
            let botIndex = 1;
            while (this.players.size < 6) {
                const botId = `bot_${botIndex}`;
                const botPlayer = {
                    id: botId,
                    displayName: `Bot_${botIndex}`,
                    role: PlayerRole.Civilian, // temporary, will be assigned below
                    status: PlayerStatus.Active,
                    position: { x: 0, y: 0, z: 0 },
                    rotationY: 0,
                    health: 1,
                    isReady: true
                };
                this.players.set(botId, botPlayer);
                botIndex++;
            }
        }
        // Assign Roles respecting preferences
        const roles = assignRoles(Array.from(this.players.values()));
        // Assign starting locations and configurations
        this.players.forEach((player, id) => {
            player.role = roles[id];
            player.status = PlayerStatus.Active;
            player.currentHidingSpotId = undefined;
            if (player.role === PlayerRole.Civilian) {
                player.position = { ...GAME_CONFIG.map.spawns.civilian };
                player.health = 1;
            }
            else if (player.role === PlayerRole.Attacker) {
                player.position = { ...GAME_CONFIG.map.spawns.attacker };
                player.health = GAME_CONFIG.combat.attackerMaxHealth;
            }
            else if (player.role === PlayerRole.RescueOfficer) {
                player.position = { ...GAME_CONFIG.map.spawns.rescue };
                player.health = 1;
            }
        });
        // Initialize Match Stats
        this.matchStartTime = Date.now();
        const playerStats = {};
        const rolesMap = {};
        const displayNamesMap = {};
        this.players.forEach((player, id) => {
            rolesMap[id] = player.role;
            displayNamesMap[id] = player.displayName;
            playerStats[id] = {
                captures: 0,
                revives: 0,
                extractions: 0,
                hidingSpotsSearched: 0,
                timeHiddenSeconds: 0,
                pulseHits: 0
            };
        });
        this.matchStats = {
            durationSeconds: 0,
            totalCivilians: playersList.filter(p => p.role === PlayerRole.Civilian).length,
            extractedCivilians: 0,
            capturedAtEnd: 0,
            revivedCivilians: 0,
            attackerHealth: GAME_CONFIG.combat.attackerMaxHealth,
            attackerNeutralized: false,
            playerStats,
            roles: rolesMap,
            displayNames: displayNamesMap
        };
        // Transition to civilian preparation
        this.transitionToPhase(MatchPhase.CivilianPreparation);
        // Start game loop (20 ticks per second / 50ms interval)
        if (this.gameLoopInterval)
            clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = setInterval(() => this.gameTick(0.05), 50);
    }
    transitionToPhase(newPhase) {
        this.phase = newPhase;
        // Clear interactions
        this.activeInteractions.clear();
        if (newPhase === MatchPhase.CivilianPreparation) {
            this.timer = GAME_CONFIG.phaseDurations.CivilianPreparation;
            // Close gates
            this.doorStates["attacker_gate"] = DoorState.Locked;
            this.doorStates["rescue_gate"] = DoorState.Locked;
        }
        else if (newPhase === MatchPhase.AttackerEntry) {
            this.timer = GAME_CONFIG.phaseDurations.AttackerEntry;
            // Release Attacker
            this.doorStates["attacker_gate"] = DoorState.Open;
            this.addNoiseEvent(GAME_CONFIG.map.spawns.attacker);
        }
        else if (newPhase === MatchPhase.RescuePhase) {
            this.timer = GAME_CONFIG.phaseDurations.RescuePhase;
            // Release Rescue Officer
            this.doorStates["rescue_gate"] = DoorState.Open;
            this.addNoiseEvent(GAME_CONFIG.map.spawns.rescue);
        }
        else if (newPhase === MatchPhase.MatchEnd) {
            this.timer = GAME_CONFIG.phaseDurations.MatchEnd;
            if (this.gameLoopInterval) {
                clearInterval(this.gameLoopInterval);
                this.gameLoopInterval = null;
            }
            // Populate end stats
            if (this.matchStats) {
                this.matchStats.durationSeconds = Math.floor((Date.now() - this.matchStartTime) / 1000);
                this.matchStats.capturedAtEnd = Array.from(this.players.values()).filter(p => p.role === PlayerRole.Civilian && p.status === PlayerStatus.Captured).length;
                const attacker = Array.from(this.players.values()).find(p => p.role === PlayerRole.Attacker);
                if (attacker) {
                    this.matchStats.attackerHealth = attacker.health;
                    this.matchStats.attackerNeutralized = attacker.status === PlayerStatus.Neutralised;
                }
            }
            // Automatic return to lobby after end timer
            if (this.matchEndTimer)
                clearTimeout(this.matchEndTimer);
            this.matchEndTimer = setTimeout(() => {
                this.resetRoom();
                this.broadcastState();
            }, GAME_CONFIG.phaseDurations.MatchEnd * 1000);
        }
        this.io.to(this.code).emit('phase-changed', {
            phase: this.phase,
            timer: this.timer,
            doorStates: this.doorStates
        });
        this.broadcastState();
    }
    gameTick(dt) {
        if (this.phase === MatchPhase.Lobby || this.phase === MatchPhase.MatchEnd)
            return;
        // 1. Update Timer
        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = 0;
            if (this.phase === MatchPhase.CivilianPreparation) {
                this.transitionToPhase(MatchPhase.AttackerEntry);
            }
            else if (this.phase === MatchPhase.AttackerEntry) {
                this.transitionToPhase(MatchPhase.RescuePhase);
            }
            else if (this.phase === MatchPhase.RescuePhase) {
                // Attacker wins if timer hits 0 before rescue criteria met
                this.endMatch({
                    winningSide: "Attacker",
                    reason: "Time expired! The Civilians failed to escape."
                });
            }
            return;
        }
        // 2. Update player hiding times (stats)
        if (this.matchStats) {
            this.players.forEach(p => {
                if (p.role === PlayerRole.Civilian && p.status === PlayerStatus.Hidden) {
                    const stats = this.matchStats.playerStats[p.id];
                    if (stats) {
                        stats.timeHiddenSeconds += dt;
                    }
                }
            });
        }
        // 3. Process Extraction Zone (Only during RescuePhase)
        if (this.phase === MatchPhase.RescuePhase) {
            this.processExtraction(dt);
        }
        // 4. Process ongoing hold-interactions
        this.processInteractions();
        // 5. Clean up old noise events (noise is temporary)
        const now = Date.now();
        this.noiseEvents = this.noiseEvents.filter(event => now - event.timestamp < GAME_CONFIG.noise.duration);
        // Run playtest bots update tick
        this.processBots(dt);
        // 6. Broadcast state snapshots
        this.broadcastState();
    }
    processExtraction(dt) {
        const zoneCenter = GAME_CONFIG.extraction.zoneCenter;
        const zoneRadius = GAME_CONFIG.extraction.zoneRadius;
        // Check if the Attacker is inside the extraction zone (to contest)
        let isAttackerInZone = false;
        this.players.forEach(player => {
            if (player.role === PlayerRole.Attacker && player.status === PlayerStatus.Active) {
                // Only count if on Ground Floor
                if (player.position.y < 2.0 && getDistance(player.position, zoneCenter) <= zoneRadius) {
                    isAttackerInZone = true;
                }
            }
        });
        // Check Civilians in zone
        this.players.forEach(player => {
            if (player.role === PlayerRole.Civilian && player.status === PlayerStatus.Active) {
                const inZone = player.position.y < 2.0 && getDistance(player.position, zoneCenter) <= zoneRadius;
                if (inZone) {
                    if (isAttackerInZone) {
                        // Contested: progress pauses, don't increment. Notify client
                        this.io.to(player.id).emit('extraction-contested');
                    }
                    else {
                        // Uncontested: progress goes up
                        const currentProgress = this.extractionProgress.get(player.id) || 0;
                        const newProgress = currentProgress + dt * 1000;
                        this.extractionProgress.set(player.id, newProgress);
                        // Send extraction progress update
                        this.io.to(player.id).emit('extraction-progress', {
                            progress: Math.min(1.0, newProgress / GAME_CONFIG.interaction.holdDurations.extract)
                        });
                        if (newProgress >= GAME_CONFIG.interaction.holdDurations.extract) {
                            // Civilian escape success!
                            player.status = PlayerStatus.Extracted;
                            player.position = { x: 999, y: 999, z: 999 }; // remove from physical map
                            this.extractionProgress.delete(player.id);
                            if (this.matchStats) {
                                this.matchStats.extractedCivilians++;
                                const stats = this.matchStats.playerStats[player.id];
                                if (stats)
                                    stats.extractions = 1;
                            }
                            this.io.to(this.code).emit('announcement', {
                                message: `${player.displayName} has successfully escaped!`
                            });
                            this.checkWinConditions();
                        }
                    }
                }
                else {
                    // If they left the zone, reset progress
                    if (this.extractionProgress.has(player.id)) {
                        this.extractionProgress.delete(player.id);
                        this.io.to(player.id).emit('extraction-progress', { progress: 0 });
                    }
                }
            }
        });
    }
    processInteractions() {
        const now = Date.now();
        this.activeInteractions.forEach((inter, playerId) => {
            const player = this.players.get(playerId);
            if (!player) {
                this.activeInteractions.delete(playerId);
                return;
            }
            // Check if player status became invalid (e.g. captured during interaction)
            if (player.status === PlayerStatus.Captured || player.status === PlayerStatus.Neutralised || player.status === PlayerStatus.Extracted) {
                this.cancelInteraction(playerId, "You are no longer able to interact.");
                return;
            }
            // Check distance to target
            let targetPos = null;
            if (inter.type === 'capture' || inter.type === 'revive') {
                const targetPlayer = this.players.get(inter.targetId);
                if (targetPlayer)
                    targetPos = targetPlayer.position;
            }
            else if (inter.type === 'lock' || inter.type === 'break' || inter.type === 'breach') {
                const door = GAME_CONFIG.map.doors.find(d => d.id === inter.targetId);
                if (door)
                    targetPos = door.position;
            }
            else if (inter.type === 'search') {
                const spot = GAME_CONFIG.map.hidingSpots.find(s => s.id === inter.targetId);
                if (spot)
                    targetPos = spot.position;
            }
            if (!targetPos || getDistance(player.position, targetPos) > GAME_CONFIG.interaction.range) {
                this.cancelInteraction(playerId, "Target is too far away.");
                return;
            }
            // Check if hold duration met
            if (now - inter.startTime >= inter.duration) {
                this.completeInteraction(playerId, inter);
            }
        });
    }
    cancelInteraction(playerId, reason) {
        this.activeInteractions.delete(playerId);
        this.io.to(playerId).emit('interaction-cancelled', { reason });
    }
    completeInteraction(playerId, inter) {
        this.activeInteractions.delete(playerId);
        const player = this.players.get(playerId);
        if (!player)
            return;
        const targetId = inter.targetId;
        switch (inter.type) {
            case 'capture': {
                const target = this.players.get(targetId);
                if (target && target.role === PlayerRole.Civilian && target.status === PlayerStatus.Active) {
                    target.status = PlayerStatus.Captured;
                    if (this.matchStats) {
                        const stats = this.matchStats.playerStats[playerId];
                        if (stats)
                            stats.captures++;
                    }
                    this.io.to(this.code).emit('announcement', {
                        message: `${target.displayName} has been captured by the Attacker!`
                    });
                    this.checkWinConditions();
                }
                break;
            }
            case 'revive': {
                const target = this.players.get(targetId);
                if (target && target.role === PlayerRole.Civilian && target.status === PlayerStatus.Captured) {
                    target.status = PlayerStatus.Active;
                    if (this.matchStats) {
                        this.matchStats.revivedCivilians++;
                        const stats = this.matchStats.playerStats[playerId];
                        if (stats)
                            stats.revives++;
                    }
                    this.io.to(this.code).emit('announcement', {
                        message: `${target.displayName} has been revived by the Rescue Officer!`
                    });
                    this.checkWinConditions();
                }
                break;
            }
            case 'search': {
                const occupantId = this.hidingSpots[targetId];
                if (this.matchStats) {
                    const stats = this.matchStats.playerStats[playerId];
                    if (stats)
                        stats.hidingSpotsSearched++;
                }
                this.addNoiseEvent(player.position);
                if (occupantId) {
                    const occupant = this.players.get(occupantId);
                    if (occupant) {
                        occupant.status = PlayerStatus.Active;
                        occupant.currentHidingSpotId = undefined;
                        this.hidingSpots[targetId] = null;
                        this.io.to(occupantId).emit('hiding-spot-ejected', { spotId: targetId });
                        this.io.to(playerId).emit('interaction-result', { success: true, message: `Found ${occupant.displayName}!` });
                        this.io.to(this.code).emit('announcement', {
                            message: `The Attacker searched a hiding spot and found ${occupant.displayName}!`
                        });
                    }
                }
                else {
                    this.io.to(playerId).emit('interaction-result', { success: false, message: "Hiding spot is empty." });
                }
                break;
            }
            case 'lock': {
                if (this.doorStates[targetId] === DoorState.Closed) {
                    this.doorStates[targetId] = DoorState.Locked;
                    this.io.to(this.code).emit('door-updated', { id: targetId, state: DoorState.Locked });
                }
                break;
            }
            case 'break': {
                if (this.doorStates[targetId] === DoorState.Locked) {
                    this.doorStates[targetId] = DoorState.Broken;
                    this.addNoiseEvent(player.position);
                    this.io.to(this.code).emit('door-updated', { id: targetId, state: DoorState.Broken });
                }
                break;
            }
            case 'breach': {
                if (this.doorStates[targetId] === DoorState.Locked) {
                    this.doorStates[targetId] = DoorState.Broken; // Breached door stays broken
                    this.addNoiseEvent(player.position);
                    this.io.to(this.code).emit('door-updated', { id: targetId, state: DoorState.Broken });
                }
                break;
            }
        }
        this.io.to(playerId).emit('interaction-success', { type: inter.type });
    }
    handlePlayerMove(playerId, pos, rotY, currentSpeedMode, dt) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        // Prevent movements if player status restricts it or phase hasn't released them
        if (this.phase === MatchPhase.Lobby || this.phase === MatchPhase.MatchEnd)
            return;
        if (player.status === PlayerStatus.Captured || player.status === PlayerStatus.Extracted || player.status === PlayerStatus.Neutralised || player.status === PlayerStatus.Hidden) {
            return;
        }
        // Role timing locks:
        // Attacker locked until AttackerEntry phase
        if (player.role === PlayerRole.Attacker && this.phase === MatchPhase.CivilianPreparation)
            return;
        // Rescue Officer locked until RescuePhase
        if (player.role === PlayerRole.RescueOfficer && this.phase !== MatchPhase.RescuePhase)
            return;
        // Movement speed allowance configuration
        const maxSpeed = GAME_CONFIG.speeds[currentSpeedMode] || GAME_CONFIG.speeds.walk;
        // Server-authoritative physics validation
        const validatedPos = validateMove(player.position, pos, maxSpeed, dt, this.doorStates);
        player.position = validatedPos;
        player.rotationY = rotY;
        // Handle noise generation on sprint
        if (currentSpeedMode === 'sprint' && player.role === PlayerRole.Civilian) {
            const now = Date.now();
            const lastNoise = this.noiseCooldowns.get(playerId) || 0;
            if (now - lastNoise > GAME_CONFIG.noise.cooldown) {
                this.noiseCooldowns.set(playerId, now);
                this.addNoiseEvent(player.position);
            }
        }
    }
    addNoiseEvent(pos) {
        const eventId = Math.random().toString(36).substr(2, 9);
        const newEvent = { id: eventId, position: { ...pos }, timestamp: Date.now() };
        this.noiseEvents.push(newEvent);
        // Send only to the Attacker
        this.players.forEach((p, id) => {
            if (p.role === PlayerRole.Attacker) {
                this.io.to(id).emit('noise-event', newEvent);
            }
        });
    }
    handleStartInteraction(playerId, type, targetId) {
        const player = this.players.get(playerId);
        if (!player || this.phase === MatchPhase.Lobby || this.phase === MatchPhase.MatchEnd)
            return;
        // Basic role/status checks
        if (player.status === PlayerStatus.Captured || player.status === PlayerStatus.Extracted || player.status === PlayerStatus.Neutralised || player.status === PlayerStatus.Hidden) {
            return;
        }
        let duration = 0;
        if (type === 'capture') {
            if (player.role !== PlayerRole.Attacker)
                return;
            const target = this.players.get(targetId);
            if (!target || target.role !== PlayerRole.Civilian || target.status !== PlayerStatus.Active)
                return;
            duration = GAME_CONFIG.interaction.holdDurations.capture;
        }
        else if (type === 'revive') {
            if (player.role !== PlayerRole.RescueOfficer)
                return;
            const target = this.players.get(targetId);
            if (!target || target.role !== PlayerRole.Civilian || target.status !== PlayerStatus.Captured)
                return;
            duration = GAME_CONFIG.interaction.holdDurations.revive;
        }
        else if (type === 'search') {
            if (player.role !== PlayerRole.Attacker)
                return;
            const spot = GAME_CONFIG.map.hidingSpots.find(s => s.id === targetId);
            if (!spot)
                return;
            duration = GAME_CONFIG.interaction.holdDurations.searchHidingSpot;
        }
        else if (type === 'lock') {
            if (player.role !== PlayerRole.Civilian)
                return;
            const door = GAME_CONFIG.map.doors.find(d => d.id === targetId);
            if (!door || !door.isLockable || this.doorStates[targetId] !== DoorState.Closed)
                return;
            duration = GAME_CONFIG.interaction.holdDurations.lockDoor;
        }
        else if (type === 'break') {
            if (player.role !== PlayerRole.Attacker)
                return;
            const door = GAME_CONFIG.map.doors.find(d => d.id === targetId);
            if (!door || this.doorStates[targetId] !== DoorState.Locked)
                return;
            duration = GAME_CONFIG.interaction.holdDurations.breakLock;
        }
        else if (type === 'breach') {
            if (player.role !== PlayerRole.RescueOfficer)
                return;
            const door = GAME_CONFIG.map.doors.find(d => d.id === targetId);
            if (!door || this.doorStates[targetId] !== DoorState.Locked)
                return;
            duration = GAME_CONFIG.interaction.holdDurations.breach;
        }
        // Save interaction
        this.activeInteractions.set(playerId, {
            type,
            targetId,
            startTime: Date.now(),
            duration
        });
        this.io.to(playerId).emit('interaction-started', { type, targetId, duration });
    }
    handleCancelInteraction(playerId) {
        this.activeInteractions.delete(playerId);
        this.io.to(playerId).emit('interaction-cancelled', { reason: "Released key." });
    }
    handleDoorToggle(playerId, doorId) {
        const player = this.players.get(playerId);
        if (!player || player.status !== PlayerStatus.Active)
            return;
        const door = GAME_CONFIG.map.doors.find(d => d.id === doorId);
        if (!door)
            return;
        if (getDistance(player.position, door.position) > GAME_CONFIG.interaction.range)
            return;
        const currentState = this.doorStates[doorId] || DoorState.Closed;
        // Toggle logic (only works if closed or open)
        if (currentState === DoorState.Closed) {
            this.doorStates[doorId] = DoorState.Open;
            this.io.to(this.code).emit('door-updated', { id: doorId, state: DoorState.Open });
        }
        else if (currentState === DoorState.Open) {
            this.doorStates[doorId] = DoorState.Closed;
            this.io.to(this.code).emit('door-updated', { id: doorId, state: DoorState.Closed });
        }
    }
    handleHidingSpotInteract(playerId, spotId) {
        const player = this.players.get(playerId);
        if (!player)
            return;
        const spot = GAME_CONFIG.map.hidingSpots.find(s => s.id === spotId);
        if (!spot)
            return;
        if (getDistance(player.position, spot.position) > GAME_CONFIG.interaction.range)
            return;
        if (player.role === PlayerRole.Civilian) {
            // 1. Enter hiding spot
            if (player.status === PlayerStatus.Active) {
                if (this.hidingSpots[spotId] === null) {
                    this.hidingSpots[spotId] = playerId;
                    player.status = PlayerStatus.Hidden;
                    player.currentHidingSpotId = spotId;
                    this.io.to(playerId).emit('hiding-spot-entered', { spotId });
                }
                else {
                    this.io.to(playerId).emit('announcement', { message: "Hiding spot is occupied!" });
                }
            }
            // 2. Leave hiding spot
            else if (player.status === PlayerStatus.Hidden && player.currentHidingSpotId === spotId) {
                this.hidingSpots[spotId] = null;
                player.status = PlayerStatus.Active;
                player.currentHidingSpotId = undefined;
                this.io.to(playerId).emit('hiding-spot-exited');
            }
        }
        // Rescue Officer checks hiding spot (displays occupant information)
        else if (player.role === PlayerRole.RescueOfficer) {
            const occupantId = this.hidingSpots[spotId];
            if (occupantId) {
                const occupant = this.players.get(occupantId);
                if (occupant) {
                    this.io.to(playerId).emit('announcement', {
                        message: `Checked ${spot.label}: Civilian ${occupant.displayName} is inside.`
                    });
                }
            }
            else {
                this.io.to(playerId).emit('announcement', {
                    message: `Checked ${spot.label}: Empty.`
                });
            }
        }
    }
    handlePulseAttack(playerId, direction) {
        const player = this.players.get(playerId);
        if (!player || player.role !== PlayerRole.RescueOfficer || player.status !== PlayerStatus.Active)
            return;
        if (this.phase !== MatchPhase.RescuePhase)
            return;
        // Cooldown check
        const now = Date.now();
        const lastPulse = this.pulseCooldowns.get(playerId) || 0;
        if (now - lastPulse < GAME_CONFIG.combat.pulseCooldown)
            return;
        this.pulseCooldowns.set(playerId, now);
        // Compute raycast and find if Attacker is hit
        const attacker = Array.from(this.players.values()).find(p => p.role === PlayerRole.Attacker && p.status === PlayerStatus.Active);
        let hit = false;
        if (attacker) {
            const dist = getDistance(player.position, attacker.position);
            if (dist <= GAME_CONFIG.combat.pulseRange) {
                // Check alignment direction vs target direction
                // vector target = attacker - player
                const vTarget = {
                    x: attacker.position.x - player.position.x,
                    y: attacker.position.y - player.position.y,
                    z: attacker.position.z - player.position.z
                };
                const len = Math.sqrt(vTarget.x * vTarget.x + vTarget.y * vTarget.y + vTarget.z * vTarget.z);
                const normTarget = { x: vTarget.x / len, y: vTarget.y / len, z: vTarget.z / len };
                // dot product
                const dot = normTarget.x * direction.x + normTarget.y * direction.y + normTarget.z * direction.z;
                // Accept a wide angle (say, cos 30 degrees ~ 0.86, or cos 45 deg ~ 0.70)
                // Let's accept dot > 0.8 (approx 36 degrees cone)
                if (dot > 0.8) {
                    hit = true;
                    attacker.health -= 1;
                    if (this.matchStats) {
                        const stats = this.matchStats.playerStats[playerId];
                        if (stats)
                            stats.pulseHits++;
                    }
                    this.io.to(this.code).emit('announcement', {
                        message: `The Rescue Officer hit the Attacker! Health remaining: ${attacker.health}/3`
                    });
                    if (attacker.health <= 0) {
                        attacker.status = PlayerStatus.Neutralised;
                        attacker.health = 0;
                        this.io.to(this.code).emit('announcement', {
                            message: "The Attacker has been NEUTRALISED! Civilians should head to extraction."
                        });
                        this.checkWinConditions();
                    }
                }
            }
        }
        // Broadcast the visible pulse effect to all clients
        this.io.to(this.code).emit('pulse-effect', {
            origin: player.position,
            direction,
            hit,
            attackerPos: attacker ? attacker.position : null
        });
    }
    // Developer Debug functions
    skipPhase(playerId) {
        if (playerId !== this.adminId)
            return;
        if (this.phase === MatchPhase.Lobby || this.phase === MatchPhase.MatchEnd)
            return;
        if (this.phase === MatchPhase.CivilianPreparation) {
            this.transitionToPhase(MatchPhase.AttackerEntry);
        }
        else if (this.phase === MatchPhase.AttackerEntry) {
            this.transitionToPhase(MatchPhase.RescuePhase);
        }
        else if (this.phase === MatchPhase.RescuePhase) {
            this.endMatch({
                winningSide: "Attacker",
                reason: "Phase skipped by Administrator."
            });
        }
    }
    addTime(playerId, seconds) {
        if (playerId !== this.adminId)
            return;
        if (this.phase === MatchPhase.Lobby || this.phase === MatchPhase.MatchEnd)
            return;
        this.timer += seconds;
        this.broadcastState();
    }
    forceReleaseRole(playerId, role) {
        if (playerId !== this.adminId)
            return;
        if (this.phase === MatchPhase.Lobby || this.phase === MatchPhase.MatchEnd)
            return;
        if (role === PlayerRole.Attacker && this.phase === MatchPhase.CivilianPreparation) {
            this.transitionToPhase(MatchPhase.AttackerEntry);
        }
        else if (role === PlayerRole.RescueOfficer && (this.phase === MatchPhase.CivilianPreparation || this.phase === MatchPhase.AttackerEntry)) {
            this.transitionToPhase(MatchPhase.RescuePhase);
        }
    }
    resetDoors(playerId) {
        if (playerId !== this.adminId)
            return;
        GAME_CONFIG.map.doors.forEach(door => {
            this.doorStates[door.id] = door.spawnLocked ? DoorState.Locked : DoorState.Closed;
        });
        this.io.to(this.code).emit('doors-reset', this.doorStates);
        this.broadcastState();
    }
    teleportPlayer(playerId, pos) {
        if (playerId !== this.adminId)
            return;
        const player = this.players.get(playerId);
        if (player) {
            player.position = { ...pos };
            this.broadcastState();
        }
    }
    checkWinConditions() {
        const playersList = Array.from(this.players.values());
        const winResult = evaluateWinConditions(playersList, this.phase, this.timer, 3 // not used inside directly
        );
        if (winResult) {
            this.endMatch(winResult);
        }
    }
    endMatch(result) {
        if (this.phase === MatchPhase.MatchEnd)
            return;
        if (this.matchEndTimer)
            clearTimeout(this.matchEndTimer);
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        this.phase = MatchPhase.MatchEnd;
        // Package stats
        if (this.matchStats) {
            this.matchStats.durationSeconds = Math.floor((Date.now() - this.matchStartTime) / 1000);
            this.matchStats.capturedAtEnd = Array.from(this.players.values()).filter(p => p.role === PlayerRole.Civilian && p.status === PlayerStatus.Captured).length;
            const attacker = Array.from(this.players.values()).find(p => p.role === PlayerRole.Attacker);
            if (attacker) {
                this.matchStats.attackerHealth = attacker.health;
                this.matchStats.attackerNeutralized = attacker.status === PlayerStatus.Neutralised;
            }
        }
        this.io.to(this.code).emit('match-ended', {
            winResult: result,
            stats: this.matchStats
        });
        this.transitionToPhase(MatchPhase.MatchEnd);
    }
    broadcastState() {
        const state = {
            code: this.code,
            phase: this.phase,
            timer: Math.ceil(this.timer),
            players: Array.from(this.players.values()),
            doors: this.doorStates,
            hidingSpots: this.hidingSpots,
            adminId: this.adminId,
            winResult: undefined // populated when ended
        };
        this.io.to(this.code).emit('room-state', state);
    }
    processBots(dt) {
        this.players.forEach((bot) => {
            if (!bot.id.startsWith("bot_"))
                return; // Only process bots
            if (bot.status === PlayerStatus.Extracted || bot.status === PlayerStatus.Neutralised)
                return;
            if (bot.role === PlayerRole.Civilian) {
                this.updateCivilianBot(bot, dt);
            }
            else if (bot.role === PlayerRole.Attacker) {
                this.updateAttackerBot(bot, dt);
            }
            else if (bot.role === PlayerRole.RescueOfficer) {
                this.updateRescueBot(bot, dt);
            }
        });
    }
    getNavigationTarget(bot, finalTarget) {
        const botOnFirst = bot.position.y >= 2.0;
        const targetOnFirst = finalTarget.y >= 2.0;
        if (botOnFirst !== targetOnFirst) {
            const distWest = getDistance(bot.position, { x: -16.5, y: bot.position.y, z: -0.5 });
            const distEast = getDistance(bot.position, { x: 16.5, y: bot.position.y, z: -0.5 });
            const stairX = distWest < distEast ? -16.5 : 16.5;
            const insideStair = isInsideStaircase(bot.position);
            if (insideStair) {
                return { x: stairX, y: targetOnFirst ? 4.0 : 0.1, z: -0.5 };
            }
            else {
                return { x: stairX, y: botOnFirst ? 4.0 : 0.0, z: -0.5 };
            }
        }
        return finalTarget;
    }
    updateCivilianBot(bot, dt) {
        if (bot.status !== PlayerStatus.Active)
            return;
        const attacker = Array.from(this.players.values()).find(p => p.role === PlayerRole.Attacker && p.status === PlayerStatus.Active);
        let isFleeing = false;
        let target = null;
        if (attacker && this.phase !== MatchPhase.CivilianPreparation) {
            const dist = getDistance(bot.position, attacker.position);
            if (dist < 10.0) {
                isFleeing = true;
                const dirX = bot.position.x - attacker.position.x;
                const dirZ = bot.position.z - attacker.position.z;
                const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
                target = {
                    x: bot.position.x + (dirX / len) * 5.0,
                    y: bot.position.y,
                    z: bot.position.z + (dirZ / len) * 5.0,
                };
            }
        }
        if (!target) {
            if (this.phase === MatchPhase.RescuePhase) {
                const extractionCenter = GAME_CONFIG.extraction.zoneCenter;
                target = this.getNavigationTarget(bot, { x: extractionCenter.x, y: 0.1, z: extractionCenter.z });
            }
            else {
                let closestSpot = null;
                let minDist = Infinity;
                GAME_CONFIG.map.hidingSpots.forEach(spot => {
                    if (this.hidingSpots[spot.id] === null) {
                        const d = getDistance(bot.position, spot.position);
                        if (d < minDist) {
                            minDist = d;
                            closestSpot = spot;
                        }
                    }
                });
                if (closestSpot) {
                    const spot = closestSpot;
                    if (minDist <= GAME_CONFIG.interaction.range) {
                        this.hidingSpots[spot.id] = bot.id;
                        bot.status = PlayerStatus.Hidden;
                        bot.currentHidingSpotId = spot.id;
                        return;
                    }
                    else {
                        target = this.getNavigationTarget(bot, spot.position);
                    }
                }
                else {
                    if (!bot.wanderTarget || getDistance(bot.position, bot.wanderTarget) < 1.0) {
                        bot.wanderTarget = {
                            x: bot.position.x + (Math.random() - 0.5) * 10,
                            y: bot.position.y,
                            z: bot.position.z + (Math.random() - 0.5) * 10
                        };
                    }
                    target = this.getNavigationTarget(bot, bot.wanderTarget);
                }
            }
        }
        if (target) {
            this.moveBotTowards(bot, target, isFleeing, dt);
        }
    }
    updateAttackerBot(bot, dt) {
        if (this.phase === MatchPhase.CivilianPreparation)
            return;
        if (bot.status !== PlayerStatus.Active)
            return;
        if (this.activeInteractions.has(bot.id))
            return;
        let closestCiv = null;
        let minDist = Infinity;
        this.players.forEach((p) => {
            if (p.role === PlayerRole.Civilian && p.status === PlayerStatus.Active) {
                const dist = getDistance(bot.position, p.position);
                if (dist < minDist) {
                    minDist = dist;
                    closestCiv = p;
                }
            }
        });
        if (closestCiv) {
            const civ = closestCiv;
            if (minDist <= GAME_CONFIG.interaction.range) {
                this.handleStartInteraction(bot.id, 'capture', civ.id);
                return;
            }
            else {
                const target = this.getNavigationTarget(bot, civ.position);
                this.moveBotTowards(bot, target, true, dt);
            }
        }
        else {
            let closestSpot = null;
            let minDistSpot = Infinity;
            GAME_CONFIG.map.hidingSpots.forEach(spot => {
                const d = getDistance(bot.position, spot.position);
                if (d < minDistSpot) {
                    minDistSpot = d;
                    closestSpot = spot;
                }
            });
            if (closestSpot) {
                const spot = closestSpot;
                if (minDistSpot <= GAME_CONFIG.interaction.range) {
                    this.handleStartInteraction(bot.id, 'search', spot.id);
                }
                else {
                    const target = this.getNavigationTarget(bot, spot.position);
                    this.moveBotTowards(bot, target, false, dt);
                }
            }
        }
    }
    updateRescueBot(bot, dt) {
        if (this.phase !== MatchPhase.RescuePhase)
            return;
        if (bot.status !== PlayerStatus.Active)
            return;
        if (this.activeInteractions.has(bot.id))
            return;
        const attacker = Array.from(this.players.values()).find(p => p.role === PlayerRole.Attacker && p.status === PlayerStatus.Active);
        if (attacker) {
            const distToAttacker = getDistance(bot.position, attacker.position);
            if (distToAttacker <= GAME_CONFIG.combat.pulseRange) {
                const dir = {
                    x: attacker.position.x - bot.position.x,
                    y: attacker.position.y - bot.position.y,
                    z: attacker.position.z - bot.position.z,
                };
                const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z) || 1;
                const normDir = { x: dir.x / len, y: dir.y / len, z: dir.z / len };
                this.handlePulseAttack(bot.id, normDir);
            }
        }
        let closestCaptured = null;
        let minDist = Infinity;
        this.players.forEach((p) => {
            if (p.role === PlayerRole.Civilian && p.status === PlayerStatus.Captured) {
                const dist = getDistance(bot.position, p.position);
                if (dist < minDist) {
                    minDist = dist;
                    closestCaptured = p;
                }
            }
        });
        if (closestCaptured) {
            const civ = closestCaptured;
            if (minDist <= GAME_CONFIG.interaction.range) {
                this.handleStartInteraction(bot.id, 'revive', civ.id);
                return;
            }
            else {
                const target = this.getNavigationTarget(bot, civ.position);
                this.moveBotTowards(bot, target, true, dt);
            }
        }
        else {
            const extractionCenter = GAME_CONFIG.extraction.zoneCenter;
            const target = this.getNavigationTarget(bot, { x: extractionCenter.x, y: 0.1, z: extractionCenter.z });
            this.moveBotTowards(bot, target, false, dt);
        }
    }
    moveBotTowards(bot, target, fast, dt) {
        if (this.activeInteractions.has(bot.id))
            return;
        this.handleNearbyClosedDoors(bot);
        this.handleNearbyLockedDoors(bot);
        const dir = {
            x: target.x - bot.position.x,
            y: target.y - bot.position.y,
            z: target.z - bot.position.z,
        };
        const insideStair = isInsideStaircase(bot.position);
        if (!insideStair) {
            dir.y = 0;
        }
        const dist = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
        if (dist > 0.2) {
            const speed = fast ? GAME_CONFIG.speeds.sprint : GAME_CONFIG.speeds.walk;
            const step = speed * dt;
            const ratio = Math.min(1, step / dist);
            const proposedPos = {
                x: bot.position.x + dir.x * ratio,
                y: bot.position.y + dir.y * ratio,
                z: bot.position.z + dir.z * ratio,
            };
            bot.rotationY = Math.atan2(dir.x, dir.z);
            bot.position = validateMove(bot.position, proposedPos, speed, dt, this.doorStates);
        }
    }
    handleNearbyClosedDoors(bot) {
        GAME_CONFIG.map.doors.forEach((door) => {
            if (this.doorStates[door.id] === DoorState.Closed) {
                const dist = getDistance(bot.position, door.position);
                if (dist <= GAME_CONFIG.interaction.range) {
                    this.doorStates[door.id] = DoorState.Open;
                    this.io.to(this.code).emit('door-updated', { id: door.id, state: DoorState.Open });
                }
            }
        });
    }
    handleNearbyLockedDoors(bot) {
        GAME_CONFIG.map.doors.forEach((door) => {
            if (this.doorStates[door.id] === DoorState.Locked) {
                const dist = getDistance(bot.position, door.position);
                if (dist <= GAME_CONFIG.interaction.range) {
                    if (bot.role === PlayerRole.Attacker) {
                        this.handleStartInteraction(bot.id, 'break', door.id);
                    }
                    else if (bot.role === PlayerRole.RescueOfficer) {
                        this.handleStartInteraction(bot.id, 'breach', door.id);
                    }
                }
            }
        });
    }
}
