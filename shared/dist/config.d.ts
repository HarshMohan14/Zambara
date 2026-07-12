export declare const GAME_CONFIG: {
    speeds: {
        walk: number;
        sprint: number;
        crouch: number;
    };
    phaseDurations: {
        CivilianPreparation: number;
        AttackerEntry: number;
        RescuePhase: number;
        MatchEnd: number;
    };
    interaction: {
        range: number;
        holdDurations: {
            capture: number;
            revive: number;
            searchHidingSpot: number;
            lockDoor: number;
            breakLock: number;
            breach: number;
            extract: number;
        };
    };
    extraction: {
        zoneRadius: number;
        zoneCenter: {
            x: number;
            y: number;
            z: number;
        };
    };
    combat: {
        attackerMaxHealth: number;
        pulseRange: number;
        pulseCooldown: number;
    };
    noise: {
        duration: number;
        cooldown: number;
    };
    map: {
        width: number;
        depth: number;
        height: number;
        spawns: {
            civilian: {
                x: number;
                y: number;
                z: number;
            };
            attacker: {
                x: number;
                y: number;
                z: number;
            };
            rescue: {
                x: number;
                y: number;
                z: number;
            };
        };
        walls: {
            id: string;
            min: {
                x: number;
                y: number;
                z: number;
            };
            max: {
                x: number;
                y: number;
                z: number;
            };
        }[];
        staircases: {
            id: string;
            min: {
                x: number;
                y: number;
                z: number;
            };
            max: {
                x: number;
                y: number;
                z: number;
            };
            direction: {
                x: number;
                y: number;
                z: number;
            };
        }[];
        doors: {
            id: string;
            label: string;
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotationY: number;
            width: number;
            height: number;
            isLockable: boolean;
            spawnLocked: boolean;
        }[];
        hidingSpots: {
            id: string;
            label: string;
            position: {
                x: number;
                y: number;
                z: number;
            };
        }[];
    };
};
