export const GAME_CONFIG = {
  // Movement Speeds (m/s)
  speeds: {
    walk: 4.0,
    sprint: 6.0,
    crouch: 2.0,
  },

  // Match Phase Durations (seconds)
  phaseDurations: {
    CivilianPreparation: 20,
    AttackerEntry: 40,
    RescuePhase: 180,
    MatchEnd: 15
  },
  
  // Interaction parameters
  interaction: {
    range: 3.0, // Max distance for interacting
    holdDurations: {
      capture: 2000,           // 2 seconds in ms
      revive: 3000,            // 3 seconds in ms
      searchHidingSpot: 1500,  // 1.5 seconds in ms
      lockDoor: 1000,          // 1 second in ms
      breakLock: 2000,         // 2 seconds in ms
      breach: 1000,            // 1 second in ms
      extract: 3000,           // 3 seconds in ms
    }
  },

  // Extraction parameters
  extraction: {
    zoneRadius: 4.0, // Radius of the circular extraction zone
    zoneCenter: { x: 0, y: 0.1, z: -8 } // Ground floor extraction zone coordinates
  },

  // Combat parameters
  combat: {
    attackerMaxHealth: 3,
    pulseRange: 12.0,
    pulseCooldown: 1500, // 1.5 seconds in ms
  },

  // Noise indicator parameters
  noise: {
    duration: 2000, // 2 seconds in ms
    cooldown: 1000, // 1 second in ms
  },

  // Map configuration (2-floor building)
  map: {
    width: 40,  // X from -20 to 20
    depth: 20,  // Z from -10 to 10
    height: 8,  // Y from 0 to 8 (Ground floor Y=0..4, First floor Y=4..8)
    
    // Spawn Rooms definitions
    spawns: {
      civilian: { x: 5, y: 4, z: 6 },
      attacker: { x: -18, y: 0, z: 8 },
      rescue: { x: 18, y: 4, z: 8 }
    },

    // Bounding boxes of visual/collidable walls
    // Format: { minX, maxX, minY, maxY, minZ, maxZ, color?, name? }
    walls: [
      // --- EXTERIOR WALLS ---
      { id: "ext_north_gf", min: { x: -20, y: 0, z: 9.8 }, max: { x: 20, y: 4, z: 10 } },
      { id: "ext_south_gf", min: { x: -20, y: 0, z: -10 }, max: { x: 20, y: 4, z: -9.8 } },
      { id: "ext_west_gf",  min: { x: -20, y: 0, z: -10 }, max: { x: -19.8, y: 4, z: 10 } },
      { id: "ext_east_gf",  min: { x: 19.8, y: 0, z: -10 }, max: { x: 20, y: 4, z: 10 } },

      { id: "ext_north_ff", min: { x: -20, y: 4, z: 9.8 }, max: { x: 20, y: 8, z: 10 } },
      { id: "ext_south_ff", min: { x: -20, y: 4, z: -10 }, max: { x: 20, y: 8, z: -9.8 } },
      { id: "ext_west_ff",  min: { x: -20, y: 4, z: -10 }, max: { x: -19.8, y: 8, z: 10 } },
      { id: "ext_east_ff",  min: { x: 19.8, y: 4, z: -10 }, max: { x: 20, y: 8, z: 10 } },

      // --- FLOORS / CEILINGS ---
      // Ground floor ground is Y=0
      // First floor floor is Y=4
      { id: "mid_floor_south", min: { x: -20, y: 3.8, z: -10 }, max: { x: 20, y: 4, z: -2 } },
      { id: "mid_floor_north", min: { x: -20, y: 3.8, z: 1 }, max: { x: 20, y: 4, z: 10 } },
      { id: "mid_floor_west_edge", min: { x: -20, y: 3.8, z: -2 }, max: { x: -18, y: 4, z: 1 } },
      { id: "mid_floor_center", min: { x: -15, y: 3.8, z: -2 }, max: { x: 15, y: 4, z: 1 } },
      { id: "mid_floor_east_edge", min: { x: 18, y: 3.8, z: -2 }, max: { x: 20, y: 4, z: 1 } },

      // --- GROUND FLOOR INTERNAL WALLS ---
      // Security Room partition (West)
      { id: "gf_sec_east", min: { x: -10.2, y: 0, z: -10 }, max: { x: -10, y: 4, z: 2 } },
      { id: "gf_sec_north", min: { x: -20, y: 0, z: 1.8 }, max: { x: -10, y: 4, z: 2 } },
      
      // Lobby / Kitchen partition
      { id: "gf_lobby_kitchen", min: { x: -0.1, y: 0, z: -10 }, max: { x: 0.1, y: 0, z: 2 } }, // Door in Z=-4
      
      // Storage Room partition (East)
      { id: "gf_storage_west", min: { x: 10, y: 0, z: -10 }, max: { x: 10.2, y: 0, z: 2 } },
      { id: "gf_storage_north", min: { x: 10, y: 0, z: 1.8 }, max: { x: 20, y: 4, z: 2 } },

      // Corridor walls
      { id: "gf_corridor_south", min: { x: -10, y: 0, z: 1.8 }, max: { x: 10, y: 4, z: 2 } },

      // Attacker Spawn Room (Locked initially)
      { id: "gf_att_spawn_east", min: { x: -14.2, y: 0, z: 4 }, max: { x: -14, y: 4, z: 10 } },
      { id: "gf_att_spawn_south", min: { x: -20, y: 0, z: 3.8 }, max: { x: -14, y: 4, z: 4 } }, // Gate at X=-14, Z=7 (door ID "attacker_gate")

      // --- FIRST FLOOR INTERNAL WALLS ---
      // Central corridor is Z = -2 to 2, X = -20 to 20
      { id: "ff_corridor_north_left", min: { x: -20, y: 4, z: 1.8 }, max: { x: 1.5, y: 8, z: 2 } },
      { id: "ff_corridor_north_right", min: { x: 3.5, y: 4, z: 1.8 }, max: { x: 20, y: 8, z: 2 } },
      { id: "ff_corridor_south", min: { x: -20, y: 4, z: -2.2 }, max: { x: 20, y: 8, z: -2 } },

      // Utility Room (North-West)
      { id: "ff_util_east", min: { x: -5.2, y: 4, z: 2 }, max: { x: -5, y: 8, z: 10 } },
      
      // Civilian Spawn Area (North-Center)
      { id: "ff_civ_spawn_east", min: { x: 10, y: 4, z: 2 }, max: { x: 10.2, y: 8, z: 10 } },

      // Rescue Officer Spawn Room (Locked initially)
      { id: "ff_rescue_spawn_west", min: { x: 14, y: 4, z: 2 }, max: { x: 14.2, y: 8, z: 10 } }, // Gate at Z=5 (door ID "rescue_gate")

      // 6 Small Rooms partitions (South side of Central Corridor, Z = -10 to -2)
      // Room 1: X = -20 to -13.3
      { id: "ff_r1_r2", min: { x: -13.4, y: 4, z: -10 }, max: { x: -13.2, y: 8, z: -2 } },
      // Room 2: X = -13.3 to -6.6
      { id: "ff_r2_r3", min: { x: -6.7, y: 4, z: -10 }, max: { x: -6.5, y: 8, z: -2 } },
      // Room 3: X = -6.6 to 0
      { id: "ff_r3_r4", min: { x: -0.1, y: 4, z: -10 }, max: { x: 0.1, y: 8, z: -2 } },
      // Room 4: X = 0 to 6.6
      { id: "ff_r4_r5", min: { x: 6.5, y: 4, z: -10 }, max: { x: 6.7, y: 8, z: -2 } },
      // Room 5: X = 6.6 to 13.3
      { id: "ff_r5_r6", min: { x: 13.2, y: 4, z: -10 }, max: { x: 13.4, y: 8, z: -2 } }
      // Room 6: X = 13.3 to 20
    ],

    // Staircase zones for floor changes
    staircases: [
      {
        id: "staircase_west",
        min: { x: -18, y: 0, z: -2 },
        max: { x: -15, y: 4, z: 1 },
        direction: { x: 0, y: 1, z: 0 } // simple vertical teleport trigger or ramp
      },
      {
        id: "staircase_east",
        min: { x: 15, y: 0, z: -2 },
        max: { x: 18, y: 4, z: 1 },
        direction: { x: 0, y: 1, z: 0 }
      }
    ],

    // Interactive Doors configuration
    doors: [
      // Ground floor doors
      { id: "door_security", label: "Security Room", position: { x: -10, y: 2, z: -4 }, rotationY: Math.PI / 2, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_kitchen", label: "Kitchen", position: { x: 0, y: 2, z: -4 }, rotationY: Math.PI / 2, width: 2.0, height: 4.0, isLockable: false, spawnLocked: false },
      { id: "door_storage", label: "Storage Room", position: { x: 10, y: 2, z: -4 }, rotationY: Math.PI / 2, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      
      // Spawn gates (locked until released)
      { id: "attacker_gate", label: "Attacker Gate", position: { x: -14, y: 2, z: 6 }, rotationY: Math.PI / 2, width: 2.0, height: 4.0, isLockable: true, spawnLocked: true },
      { id: "rescue_gate", label: "Rescue Gate", position: { x: 14, y: 6, z: 5 }, rotationY: Math.PI / 2, width: 2.0, height: 4.0, isLockable: true, spawnLocked: true },

      // First floor room doors
      { id: "door_civ_spawn", label: "Civilian Spawn", position: { x: 2.5, y: 6, z: 2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_room1", label: "Room 1", position: { x: -16.5, y: 6, z: -2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_room2", label: "Room 2", position: { x: -10, y: 6, z: -2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_room3", label: "Room 3", position: { x: -3.5, y: 6, z: -2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_room4", label: "Room 4", position: { x: 3.5, y: 6, z: -2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_room5", label: "Room 5", position: { x: 10, y: 6, z: -2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false },
      { id: "door_room6", label: "Room 6", position: { x: 16.5, y: 6, z: -2 }, rotationY: 0, width: 2.0, height: 4.0, isLockable: true, spawnLocked: false }
    ],

    // 10 Hiding Spots
    hidingSpots: [
      { id: "hide_wardrobe_r1", label: "Wardrobe (R1)", position: { x: -18, y: 5, z: -8 } },
      { id: "hide_cupboard_r2", label: "Utility Box (R2)", position: { x: -11, y: 5, z: -8 } },
      { id: "hide_box_r3", label: "Storage Crates (R3)", position: { x: -5, y: 5, z: -8 } },
      { id: "hide_wardrobe_r4", label: "Wardrobe (R4)", position: { x: 5, y: 5, z: -8 } },
      { id: "hide_cupboard_r5", label: "Utility Box (R5)", position: { x: 11, y: 5, z: -8 } },
      { id: "hide_box_r6", label: "Storage Crates (R6)", position: { x: 18, y: 5, z: -8 } },
      
      { id: "hide_security_locker", label: "Security Safe (GF)", position: { x: -18, y: 1, z: -8 } },
      { id: "hide_kitchen_pantry", label: "Pantry (GF)", position: { x: 5, y: 1, z: -6 } },
      { id: "hide_storage_crate1", label: "Crate Alpha (GF)", position: { x: 14, y: 1, z: -8 } },
      { id: "hide_storage_crate2", label: "Crate Beta (GF)", position: { x: 17, y: 1, z: -3 } }
    ]
  }
};
