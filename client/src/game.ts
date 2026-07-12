import { 
  Engine, 
  Scene, 
  Vector3, 
  Mesh, 
  MeshBuilder, 
  StandardMaterial, 
  Color3, 
  Scalar, 
  Matrix, 
  ArcRotateCamera, 
  HemisphericLight, 
  DirectionalLight,
  AbstractMesh
} from '@babylonjs/core';

// Namespace and constant merging to mimic legacy BABYLON usage
namespace BABYLON {
  export type Engine = import('@babylonjs/core').Engine;
  export type Scene = import('@babylonjs/core').Scene;
  export type Vector3 = import('@babylonjs/core').Vector3;
  export type Mesh = import('@babylonjs/core').Mesh;
  export type StandardMaterial = import('@babylonjs/core').StandardMaterial;
  export type Color3 = import('@babylonjs/core').Color3;
  export type Matrix = import('@babylonjs/core').Matrix;
  export type ArcRotateCamera = import('@babylonjs/core').ArcRotateCamera;
  export type AbstractMesh = import('@babylonjs/core').AbstractMesh;
}

const BABYLON = {
  Engine,
  Scene,
  Vector3,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Scalar,
  Matrix,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  AbstractMesh
};
import { 
  RoomState, 
  NetworkPlayer, 
  PlayerRole, 
  PlayerStatus, 
  DoorState, 
  Vector3Data, 
  GAME_CONFIG,
  MatchPhase
} from 'shared';
import { network } from './network.js';
import { ui } from './ui.js';
import { GameMap } from './map.js';
import { PlayerController } from './controller.js';
import { debug } from './debug.js';

interface RemotePlayerMesh {
  id: string;
  mesh: BABYLON.Mesh;
  head: BABYLON.Mesh;
  pointer: BABYLON.Mesh;
  targetPos: BABYLON.Vector3;
  targetRotY: number;
  role: PlayerRole;
  status: PlayerStatus;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private map: GameMap | null = null;
  private controller: PlayerController | null = null;

  // Local player
  private localMesh: BABYLON.Mesh | null = null;
  private localPlayerRole: PlayerRole = PlayerRole.Civilian;
  private localPlayerStatus: PlayerStatus = PlayerStatus.Active;
  private lastMoveSendTime: number = 0;

  // Hiding state
  public isHidden: boolean = false;
  public currentHidingSpotId: string | null = null;

  // Spectating state
  public isSpectating: boolean = false;
  private spectatorTargets: string[] = [];
  private spectatorIndex: number = 0;

  // Replication
  private remotePlayers: Map<string, RemotePlayerMesh> = new Map();
  private floatingTags: Map<string, HTMLElement> = new Map();

  // Current interactable target
  private closestInteractable: { type: string; id: string; label: string } | null = null;
  private activeInteraction: { type: string; targetId: string; duration: number; startTime: number } | null = null;
  private isHoldingE: boolean = false;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    // Initialize Babylon Engine
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    
    this.scene = new BABYLON.Scene(this.engine);
    
    // Enable Collisions
    this.scene.collisionsEnabled = true;

    // Resize listener
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  public start(): void {
    // 1. Lights
    const hemiLight = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.55;
    hemiLight.groundColor = new BABYLON.Color3(0.15, 0.15, 0.2);

    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 0.45;

    // 2. Build Map Visuals
    this.map = new GameMap(this.scene);
    this.map.build();

    // Enable collisions for all map components
    this.updateCollisions();

    // 3. Initialize Controller
    this.controller = new PlayerController(this.scene, this.canvas);

    // 4. Setup Local Player Mesh (Temporary position, will move on match start)
    this.createLocalPlayerMesh();

    // 5. Connect Socket Network Listeners
    this.setupNetworkCallbacks();

    // 6. Setup Mouse Click for Pulse Attack
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && document.pointerLockElement === this.canvas) {
        this.triggerPulseAttack();
      }
    });

    // 7. Setup Interaction key listeners
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this.handleEPressed();
      }
      // Cycle spectators
      if (this.isSpectating) {
        if (e.code === 'ArrowRight' || e.code === 'Space') {
          this.cycleSpectatorTarget(1);
        } else if (e.code === 'ArrowLeft') {
          this.cycleSpectatorTarget(-1);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyE') {
        this.handleEReleased();
      }
    });

    // 8. Start Render Loop
    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      
      // Update local player movement & camera
      this.updateLocalPlayer(dt);

      // Replicate remote players
      this.updateRemotePlayers(dt);

      // Check client-side interactions
      this.updateInteractions();

      // Render tags overlay
      this.updateFloatingTags();

      this.scene.render();
    });
  }

  private updateCollisions(): void {
    if (!this.map) return;
    this.map.getCollidables().forEach(mesh => {
      mesh.checkCollisions = true;
    });
  }

  private createLocalPlayerMesh(): void {
    // Local player capsule representation
    this.localMesh = BABYLON.MeshBuilder.CreateCylinder("localPlayer", {
      height: 1.8,
      diameter: 0.8
    }, this.scene);
    
    // Add visual head
    const head = BABYLON.MeshBuilder.CreateSphere("localHead", { diameter: 0.6 }, this.scene);
    head.position = new BABYLON.Vector3(0, 1.1, 0);
    head.parent = this.localMesh;

    // Add direction indicator pointing forward
    const pointer = BABYLON.MeshBuilder.CreateCylinder("localPointer", {
      height: 0.4,
      diameterTop: 0,
      diameterBottom: 0.2
    }, this.scene);
    pointer.position = new BABYLON.Vector3(0, 1.1, 0.4);
    pointer.rotation.x = Math.PI / 2;
    pointer.parent = this.localMesh;

    // Hide initially until match starts (we only show it in-game)
    this.localMesh.setEnabled(false);

    // Apply collision bounds to the local player capsule
    this.localMesh.ellipsoid = new BABYLON.Vector3(0.4, 0.9, 0.4);
    this.localMesh.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0);
    this.localMesh.checkCollisions = true;

    // Apply color styling
    const mat = new BABYLON.StandardMaterial("localMat", this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    this.localMesh.material = mat;
  }

  private updateLocalPlayer(dt: number): void {
    if (!this.localMesh || !this.localMesh.isEnabled() || !this.controller) return;

    // If spectator, we don't move physical mesh, camera floats
    if (this.isSpectating) {
      this.updateSpectatorCamera(dt);
      return;
    }

    // If hidden, mesh is invisible, player cannot move
    if (this.isHidden) {
      if (this.currentHidingSpotId) {
        const spotMesh = this.map?.hidingSpotMeshes.get(this.currentHidingSpotId);
        if (spotMesh) {
          // Lock player position to hiding spot
          this.localMesh.position.copyFrom(spotMesh.position);
        }
      }
      
      // Rate limit network transmissions to 30Hz (every 33ms)
      const now = Date.now();
      if (now - this.lastMoveSendTime >= 33) {
        const elapsedSeconds = this.lastMoveSendTime === 0 ? dt : (now - this.lastMoveSendTime) / 1000;
        this.lastMoveSendTime = now;
        network.sendMove(
          { x: this.localMesh.position.x, y: this.localMesh.position.y, z: this.localMesh.position.z },
          this.localMesh.rotation.y,
          'walk',
          elapsedSeconds
        );
      }
      return;
    }

    // Run WASD movement
    const moveReport = this.controller.update(this.localMesh, dt);
    
    // Rate limit network transmissions to 30Hz (every 33ms)
    const now = Date.now();
    if (now - this.lastMoveSendTime >= 33) {
      const elapsedSeconds = this.lastMoveSendTime === 0 ? dt : (now - this.lastMoveSendTime) / 1000;
      this.lastMoveSendTime = now;
      network.sendMove(
        moveReport.position,
        moveReport.rotationY,
        moveReport.speedMode,
        elapsedSeconds
      );
    }
  }

  private updateSpectatorCamera(dt: number): void {
    if (!this.controller) return;

    const currentTargetId = this.spectatorTargets[this.spectatorIndex];
    if (!currentTargetId) return;

    const targetVector = BABYLON.Vector3.Zero();

    if (currentTargetId === network.playerId && this.localMesh) {
      targetVector.copyFrom(this.localMesh.position);
    } else {
      const remote = this.remotePlayers.get(currentTargetId);
      if (remote) {
        targetVector.copyFrom(remote.mesh.position);
      }
    }

    // Lock camera target to target player position
    const camera = this.controller.getCamera();
    camera.target = targetVector.add(new BABYLON.Vector3(0, 1.2, 0));

    // Force rotation angles to interpolate
    camera.alpha = BABYLON.Scalar.Lerp(camera.alpha, camera.alpha, 0.2);
    camera.beta = BABYLON.Scalar.Lerp(camera.beta, camera.beta, 0.2);
  }

  private updateRemotePlayers(dt: number): void {
    this.remotePlayers.forEach(p => {
      // Lerp remote position and rotation smoothly
      p.mesh.position = BABYLON.Vector3.Lerp(p.mesh.position, p.targetPos, 0.25);
      
      // Interpolate rotation smoothly (handle modular wrap around)
      let diff = p.targetRotY - p.mesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      p.mesh.rotation.y += diff * 0.25;

      // Color styling update based on current state
      const mat = p.mesh.material as BABYLON.StandardMaterial;
      if (mat) {
        if (p.status === PlayerStatus.Captured) {
          mat.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.25); // Dark grey
        } else if (p.status === PlayerStatus.Neutralised) {
          mat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Charcoal
        } else if (p.role === PlayerRole.Civilian) {
          mat.diffuseColor = new BABYLON.Color3(0.96, 0.62, 0.04); // Yellow
        } else if (p.role === PlayerRole.Attacker) {
          mat.diffuseColor = new BABYLON.Color3(0.94, 0.27, 0.27); // Red
        } else if (p.role === PlayerRole.RescueOfficer) {
          mat.diffuseColor = new BABYLON.Color3(0.23, 0.51, 0.96); // Blue
        }
      }

      // Hide representation if remote player is hidden or extracted
      if (p.status === PlayerStatus.Hidden || p.status === PlayerStatus.Extracted) {
        p.mesh.setEnabled(false);
      } else {
        p.mesh.setEnabled(true);
      }
    });
  }

  private updateInteractions(): void {
    if (!this.localMesh || !this.localMesh.isEnabled() || this.isSpectating || this.isHidden) {
      ui.clearInteractionPrompt();
      this.closestInteractable = null;
      return;
    }

    // Scan nearby targets within interaction range
    const range = GAME_CONFIG.interaction.range;
    let closestTarget: { type: string; id: string; label: string; dist: number } | null = null;

    const localPos = this.localMesh.position;

    // 1. Check door meshes
    GAME_CONFIG.map.doors.forEach(door => {
      const dist = BABYLON.Vector3.Distance(localPos, new BABYLON.Vector3(door.position.x, door.position.y, door.position.z));
      if (dist <= range) {
        // Door details depend on current state
        const state = network.socket?.io ? (network as any).lastState?.doors[door.id] || DoorState.Closed : DoorState.Closed;
        
        let label = '';
        if (state === DoorState.Open) label = "Close Door";
        else if (state === DoorState.Closed) {
          label = this.localPlayerRole === PlayerRole.Civilian ? "Open Door / Hold: Lock Door" : "Open Door";
        } else if (state === DoorState.Locked) {
          if (this.localPlayerRole === PlayerRole.Attacker) label = "Hold: Break Door Lock";
          else if (this.localPlayerRole === PlayerRole.RescueOfficer) label = "Hold: Breach Door Lock";
          else label = "Locked Door";
        } else if (state === DoorState.Broken) {
          label = ""; // Non-interactive
        }

        if (label && (!closestTarget || dist < closestTarget.dist)) {
          closestTarget = { type: 'door', id: door.id, label, dist };
        }
      }
    });

    // 2. Check hiding spots
    GAME_CONFIG.map.hidingSpots.forEach(spot => {
      const dist = BABYLON.Vector3.Distance(localPos, new BABYLON.Vector3(spot.position.x, spot.position.y, spot.position.z));
      if (dist <= range) {
        let label = '';
        if (this.localPlayerRole === PlayerRole.Civilian) {
          label = "Hide";
        } else if (this.localPlayerRole === PlayerRole.Attacker) {
          label = "Hold: Search Hiding Spot";
        } else if (this.localPlayerRole === PlayerRole.RescueOfficer) {
          label = "Check Hiding Spot";
        }

        if (label && (!closestTarget || dist < closestTarget.dist)) {
          closestTarget = { type: 'hiding_spot', id: spot.id, label, dist };
        }
      }
    });

    // 3. Check other players
    this.remotePlayers.forEach(p => {
      const dist = BABYLON.Vector3.Distance(localPos, p.mesh.position);
      if (dist <= range) {
        let label = '';
        if (this.localPlayerRole === PlayerRole.Attacker && p.role === PlayerRole.Civilian && p.status === PlayerStatus.Active) {
          label = `Hold: Capture ${network.socket?.io ? (network as any).lastState?.players.find((pl: any) => pl.id === p.id)?.displayName || 'Civilian' : 'Civilian'}`;
        } else if (this.localPlayerRole === PlayerRole.RescueOfficer && p.role === PlayerRole.Civilian && p.status === PlayerStatus.Captured) {
          label = "Hold: Revive Civilian";
        }

        if (label && (!closestTarget || dist < closestTarget.dist)) {
          closestTarget = { type: 'player', id: p.id, label, dist };
        }
      }
    });

    // Update prompt on HUD
    if (closestTarget) {
      const target = closestTarget as any;
      
      // If we already had this closest target, handle hold interactions updates
      if (this.closestInteractable?.id === target.id) {
        if (this.activeInteraction) {
          const elapsed = Date.now() - this.activeInteraction.startTime;
          ui.showInteractionProgress("E", this.activeInteraction.type.toUpperCase(), elapsed, this.activeInteraction.duration);
        } else {
          ui.showInteractionPrompt("E", target.label);
        }
      } else {
        // Clear old holds and show new prompt
        this.cancelHoldInteraction();
        this.closestInteractable = { type: target.type, id: target.id, label: target.label };
        ui.showInteractionPrompt("E", target.label);
      }
    } else {
      this.cancelHoldInteraction();
      this.closestInteractable = null;
      ui.clearInteractionPrompt();
    }
  }

  private handleEPressed(): void {
    if (!this.closestInteractable || this.isSpectating) {
      // If currently hidden, press E to unhide
      if (this.isHidden && this.currentHidingSpotId) {
        network.interactHidingSpot(this.currentHidingSpotId);
      }
      return;
    }

    const target = this.closestInteractable;
    this.isHoldingE = true;

    // 1. Direct Click Interactions
    if (target.type === 'door') {
      const state = (network as any).lastState?.doors[target.id] || DoorState.Closed;
      
      if (state === DoorState.Closed || state === DoorState.Open) {
        // Instant click open/close door
        network.toggleDoor(target.id);
      } else if (state === DoorState.Locked) {
        // Locked door: Hold actions
        if (this.localPlayerRole === PlayerRole.Attacker) {
          this.startHoldInteraction('break', target.id, GAME_CONFIG.interaction.holdDurations.breakLock);
        } else if (this.localPlayerRole === PlayerRole.RescueOfficer) {
          this.startHoldInteraction('breach', target.id, GAME_CONFIG.interaction.holdDurations.breach);
        }
      }
    } else if (target.type === 'hiding_spot') {
      if (this.localPlayerRole === PlayerRole.Civilian) {
        // Instant hide click
        network.interactHidingSpot(target.id);
      } else if (this.localPlayerRole === PlayerRole.Attacker) {
        // Hold to search
        this.startHoldInteraction('search', target.id, GAME_CONFIG.interaction.holdDurations.searchHidingSpot);
      } else if (this.localPlayerRole === PlayerRole.RescueOfficer) {
        // Instant check click
        network.interactHidingSpot(target.id);
      }
    } else if (target.type === 'player') {
      // Hold interactions: Revives & Captures
      if (this.localPlayerRole === PlayerRole.Attacker) {
        this.startHoldInteraction('capture', target.id, GAME_CONFIG.interaction.holdDurations.capture);
      } else if (this.localPlayerRole === PlayerRole.RescueOfficer) {
        this.startHoldInteraction('revive', target.id, GAME_CONFIG.interaction.holdDurations.revive);
      }
    }
  }

  private handleEReleased(): void {
    this.isHoldingE = false;
    this.cancelHoldInteraction();
  }

  private startHoldInteraction(type: 'capture' | 'revive' | 'search' | 'lock' | 'break' | 'breach', targetId: string, duration: number) {
    this.activeInteraction = {
      type,
      targetId,
      duration,
      startTime: Date.now()
    };
    network.startInteraction(type, targetId);
  }

  private cancelHoldInteraction() {
    if (this.activeInteraction) {
      this.activeInteraction = null;
      network.cancelInteraction();
      if (this.closestInteractable) {
        ui.showInteractionPrompt("E", this.closestInteractable.label);
      }
    }
  }

  private triggerPulseAttack(): void {
    if (this.localPlayerRole !== PlayerRole.RescueOfficer || this.localPlayerStatus !== PlayerStatus.Active) return;
    if (!this.controller) return;

    const camera = this.controller.getCamera();
    // Ray direction goes from camera forward
    const forward = camera.getForwardRay().direction;
    forward.y = 0; // horizontal pulse plane
    forward.normalize();

    network.triggerPulse({ x: forward.x, y: forward.y, z: forward.z });
  }

  private setupNetworkCallbacks(): void {
    // Make last room state available locally for checks
    (network as any).lastState = null;

    network.onStateUpdate = (state: RoomState) => {
      (network as any).lastState = state;

      if (state.phase === MatchPhase.Lobby) {
        // Reset local game configurations
        this.localMesh?.setEnabled(false);
        this.isHidden = false;
        this.currentHidingSpotId = null;
        this.isSpectating = false;
        ui.renderRoomScreen(state);
        this.clearRemotePlayers();
        return;
      }

      // Match Running: Enable local capsule mesh
      this.localMesh?.setEnabled(true);

      // Replicate Player Lists
      const serverPlayerIds = new Set<string>();

      state.players.forEach(p => {
        serverPlayerIds.add(p.id);

        if (p.id === network.playerId) {
          // Sync local status
          this.localPlayerRole = p.role;
          this.localPlayerStatus = p.status;
          
          // Reconcile coordinates if drifting too far from server validated position (>4.5m)
          if (this.localMesh && !this.isSpectating && p.status !== PlayerStatus.Hidden) {
            const dist = BABYLON.Vector3.Distance(this.localMesh.position, new BABYLON.Vector3(p.position.x, p.position.y, p.position.z));
            if (dist > 4.5) {
              console.log(`Reconciling position drift: ${dist.toFixed(2)}m`);
              this.localMesh.position.copyFrom(new BABYLON.Vector3(p.position.x, p.position.y, p.position.z));
            }
          }

          // Check if local player state changes to spectator
          const shouldSpectate = p.status === PlayerStatus.Extracted || p.status === PlayerStatus.Neutralised;
          if (shouldSpectate && !this.isSpectating) {
            this.enterSpectatorMode(state);
          }
        } else {
          // Replicate remote players
          let remote = this.remotePlayers.get(p.id);
          
          if (!remote) {
            // Spawn remote player capsule
            const mesh = BABYLON.MeshBuilder.CreateCylinder(`remote_${p.id}`, { height: 1.8, diameter: 0.8 }, this.scene);
            const head = BABYLON.MeshBuilder.CreateSphere(`remote_head_${p.id}`, { diameter: 0.6 }, this.scene);
            head.position = new BABYLON.Vector3(0, 1.1, 0);
            head.parent = mesh;

            const pointer = BABYLON.MeshBuilder.CreateCylinder(`remote_ptr_${p.id}`, { height: 0.4, diameterTop: 0, diameterBottom: 0.2 }, this.scene);
            pointer.position = new BABYLON.Vector3(0, 1.1, 0.4);
            pointer.rotation.x = Math.PI / 2;
            pointer.parent = mesh;

            const mat = new BABYLON.StandardMaterial(`remote_mat_${p.id}`, this.scene);
            mesh.material = mat;

            remote = {
              id: p.id,
              mesh,
              head,
              pointer,
              targetPos: new BABYLON.Vector3(p.position.x, p.position.y, p.position.z),
              targetRotY: p.rotationY,
              role: p.role,
              status: p.status
            };
            this.remotePlayers.set(p.id, remote);
          } else {
            // Update interpolation coordinates
            remote.targetPos.copyFrom(new BABYLON.Vector3(p.position.x, p.position.y, p.position.z));
            remote.targetRotY = p.rotationY;
            remote.role = p.role;
            remote.status = p.status;
          }
        }
      });

      // Clear disconnected player models
      this.remotePlayers.forEach((p, id) => {
        if (!serverPlayerIds.has(id)) {
          p.mesh.dispose();
          this.remotePlayers.delete(id);
          
          const tag = this.floatingTags.get(id);
          if (tag) {
            tag.remove();
            this.floatingTags.delete(id);
          }
        }
      });

      // Sync visual Door States
      this.map?.updateDoors(state.doors);

      // Render HUD overlays
      ui.renderGameHUD(state);

      // Update spectator list
      if (this.isSpectating) {
        this.updateSpectatorTargets(state);
      }
    };

    network.onPhaseChange = (data) => {
      // Announce phase releases
      let announcement = '';
      if (data.phase === MatchPhase.AttackerEntry) {
        announcement = "⚠️ The ATTACKER has been released!";
      } else if (data.phase === MatchPhase.RescuePhase) {
        announcement = "⚡ The RESCUE OFFICER has arrived! Extraction is now active.";
      }
      if (announcement) {
        ui.showAnnouncement(announcement);
      }
    };

    network.onAnnouncement = (msg) => {
      ui.showAnnouncement(msg);
    };

    network.onHidingSpotEntered = (spotId) => {
      this.isHidden = true;
      this.currentHidingSpotId = spotId;
      ui.showAnnouncement(`You are hiding in ${GAME_CONFIG.map.hidingSpots.find(h => h.id === spotId)?.label || 'hiding spot'}`);
    };

    network.onHidingSpotExited = () => {
      this.isHidden = false;
      this.currentHidingSpotId = null;
      ui.showAnnouncement("You left the hiding spot.");
    };

    network.onHidingSpotEjected = (spotId) => {
      this.isHidden = false;
      this.currentHidingSpotId = null;
      ui.showAnnouncement("🚨 EJECTED! The Attacker searched your hiding spot!");
    };

    network.onInteractionStarted = (data) => {
      this.activeInteraction = {
        type: data.type,
        targetId: data.targetId,
        duration: data.duration,
        startTime: Date.now()
      };
    };

    network.onInteractionSuccess = (data) => {
      this.activeInteraction = null;
    };

    network.onInteractionCancelled = (data) => {
      this.activeInteraction = null;
    };

    network.onInteractionResult = (data) => {
      ui.showAnnouncement(data.message);
    };

    network.onExtractionProgress = (progress) => {
      const fill = document.getElementById('hud-interaction-fill');
      const container = document.getElementById('hud-interaction-zone');
      
      if (container) {
        if (progress > 0) {
          const pct = Math.floor(progress * 100);
          container.innerHTML = `
            <div class="glass-panel" style="padding:12px 20px; font-weight:800; display:flex; flex-direction:column; align-items:center; gap:6px;">
              <span style="color:var(--extracted); text-transform:uppercase; letter-spacing:1px; font-size:0.9rem;">Extracting... Stay inside</span>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background: var(--extracted)"></div>
              </div>
            </div>
          `;
        } else {
          container.innerHTML = '';
        }
      }
    };

    network.onExtractionContested = () => {
      const container = document.getElementById('hud-interaction-zone');
      if (container) {
        container.innerHTML = `
          <div class="glass-panel" style="padding:12px 20px; font-weight:800; border-color:var(--attacker)">
            <span class="text-contested">🚨 EXTRACTION CONTESTED! Attacker in zone!</span>
          </div>
        `;
      }
    };

    // Draw blue pulse lines
    network.onPulseEffect = (data) => {
      // Find end position of pulse ray
      const maxRange = GAME_CONFIG.combat.pulseRange;
      const endPos = {
        x: data.origin.x + data.direction.x * maxRange,
        y: data.origin.y + data.direction.y * maxRange,
        z: data.origin.z + data.direction.z * maxRange
      };

      // Draw blue debug ray
      const beamColor = data.hit ? new BABYLON.Color3(0.1, 0.8, 0.9) : new BABYLON.Color3(0.2, 0.4, 0.9);
      debug.drawDebugRay(this.scene, 'pulse_attack_' + Math.random(), data.origin, data.attackerPos || endPos, beamColor);
    };

    // Attacker receives noise visual notifications
    network.onNoiseEvent = (data) => {
      if (this.localPlayerRole !== PlayerRole.Attacker) return;
      this.triggerNoiseIndicator(data.position);
    };

    network.onMatchEnd = (data) => {
      this.isSpectating = false;
      this.localMesh?.setEnabled(false);
      this.clearRemotePlayers();
      ui.renderMatchEndScreen(data.winResult, data.stats);
    };

    network.onError = (msg) => {
      ui.showError(msg);
    };
  }

  private triggerNoiseIndicator(noisePos: Vector3Data): void {
    if (!this.localMesh) return;
    
    // Create an overlay arrow pointing towards the noise position
    const hud = document.getElementById('ui-container');
    if (!hud) return;

    const arrow = document.createElement('div');
    arrow.className = 'noise-indicator';
    arrow.style.opacity = '1';
    hud.appendChild(arrow);

    const updateArrow = () => {
      if (!this.localMesh) {
        arrow.remove();
        return;
      }
      
      const localPos = this.localMesh.position;
      
      // Calculate angle between player camera forward direction and the target noise
      // using simple 2D angle differences
      const dirToNoise = Math.atan2(noisePos.x - localPos.x, noisePos.z - localPos.z);
      
      const camera = this.scene.activeCamera as BABYLON.ArcRotateCamera;
      if (!camera) return;
      // camera direction angle is alpha (horizontal tilt)
      // alpha runs counterclockwise around Y
      const camAngle = -camera.alpha - Math.PI / 2;
      
      const relativeAngle = dirToNoise - camAngle;

      arrow.style.left = '50%';
      arrow.style.top = '25%';
      arrow.style.transform = `translate(-50%, -50%) rotate(${relativeAngle}rad)`;
    };

    // Run tick animation
    const interval = setInterval(updateArrow, 16);
    setTimeout(() => {
      clearInterval(interval);
      arrow.style.opacity = '0';
      setTimeout(() => arrow.remove(), 200);
    }, GAME_CONFIG.noise.duration);
  }

  private enterSpectatorMode(state: RoomState): void {
    this.isSpectating = true;
    this.localMesh?.setEnabled(false); // Hide physical mesh
    
    this.updateSpectatorTargets(state);
    
    this.spectatorIndex = 0;
    ui.showAnnouncement("You are now spectating. Press Arrow Keys / Space to cycle teammates.");

    // Create spectator HUD overlay
    let overlay = document.getElementById('spectator-hud');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'spectator-hud';
      overlay.className = 'spectator-overlay glass-panel ui-interactive';
      document.body.appendChild(overlay);
    }
    
    this.updateSpectatorOverlayHtml();
  }

  private updateSpectatorTargets(state: RoomState): void {
    // Find eligible teammates to spectate
    // In asymmetrical design, we can only spectate teammates (Civilians & Rescue Officers)
    // and exclude opponents (Attacker)
    const isLocalRescue = this.localPlayerRole === PlayerRole.RescueOfficer;
    
    const targets = state.players.filter(p => {
      // Exclude self, and exclude Attacker if local is Rescue/Civilian
      if (p.id === network.playerId) return false;
      
      if (this.localPlayerRole === PlayerRole.Attacker) {
        return true; // Attacker specates anyone
      } else {
        // Civilians and Rescue Officers can only spectate Civilians/Rescue
        return p.role === PlayerRole.Civilian || p.role === PlayerRole.RescueOfficer;
      }
    }).filter(p => p.status === PlayerStatus.Active || p.status === PlayerStatus.Hidden || p.status === PlayerStatus.Captured);

    this.spectatorTargets = targets.map(p => p.id);
    
    // Add self to the list if list is empty
    if (this.spectatorTargets.length === 0) {
      this.spectatorTargets.push(network.playerId);
    }

    if (this.spectatorIndex >= this.spectatorTargets.length) {
      this.spectatorIndex = 0;
    }

    this.updateSpectatorOverlayHtml();
  }

  private cycleSpectatorTarget(direction: number): void {
    if (this.spectatorTargets.length === 0) return;
    this.spectatorIndex = (this.spectatorIndex + direction + this.spectatorTargets.length) % this.spectatorTargets.length;
    this.updateSpectatorOverlayHtml();
  }

  private updateSpectatorOverlayHtml() {
    const overlay = document.getElementById('spectator-hud');
    if (!overlay) return;

    const targetId = this.spectatorTargets[this.spectatorIndex];
    let name = 'Yourself';
    let role = this.localPlayerRole;

    if (targetId && targetId !== network.playerId) {
      const state = (network as any).lastState as RoomState;
      const target = state?.players.find(p => p.id === targetId);
      if (target) {
        name = target.displayName;
        role = target.role;
      }
    }

    overlay.innerHTML = `
      <div style="font-size:0.8rem; color:#9ca3af; text-transform:uppercase;">Spectating</div>
      <div style="font-weight:800; font-size:1.1rem; color:var(--primary)">${name} (${role})</div>
      <div style="font-size:0.7rem; color:#6b7280;">Press Space or Arrows to cycle</div>
    `;
  }

  private updateFloatingTags(): void {
    if (!this.localMesh || !this.localMesh.isEnabled() || !this.controller) {
      this.clearFloatingTags();
      return;
    }

    const state = (network as any).lastState as RoomState;
    if (!state) return;

    const activeCamera = this.scene.activeCamera;
    if (!activeCamera) return;

    const engine = this.engine;
    const viewport = activeCamera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());

    const uiContainer = document.getElementById('ui-container')!;
    const processedIds = new Set<string>();

    state.players.forEach(p => {
      // Don't show tag for local player unless they are spectating
      if (p.id === network.playerId && !this.isSpectating) return;
      
      // Determine if tag should be visible
      // Opponents tags are hidden (e.g. Civilians can't see Attacker tag, Attacker can see Civilian tags)
      let visible = true;
      
      if (p.status === PlayerStatus.Extracted || p.status === PlayerStatus.Neutralised || p.status === PlayerStatus.Hidden) {
        visible = false;
      }

      if (this.localPlayerRole !== PlayerRole.Attacker && p.role === PlayerRole.Attacker && state.phase !== MatchPhase.MatchEnd) {
        visible = false; // Hide attacker tags from rescue/civilians during gameplay
      }

      if (!visible) {
        const tag = this.floatingTags.get(p.id);
        if (tag) tag.style.display = 'none';
        return;
      }

      processedIds.add(p.id);

      // Find remote player mesh to project position
      let tagPos3D: BABYLON.Vector3;
      
      if (p.id === network.playerId && this.localMesh) {
        tagPos3D = this.localMesh.position.add(new BABYLON.Vector3(0, 2.2, 0));
      } else {
        const remote = this.remotePlayers.get(p.id);
        if (!remote) return;
        tagPos3D = remote.mesh.position.add(new BABYLON.Vector3(0, 2.2, 0));
      }

      // Project 3D vector to 2D screen coordinate
      const screenPos = BABYLON.Vector3.Project(
        tagPos3D,
        BABYLON.Matrix.Identity(),
        this.scene.getTransformMatrix(),
        viewport
      );

      // Verify coordinate is inside camera view frustum (behind check)
      const isBehind = screenPos.z < 0 || screenPos.z > 1;

      let tagElement = this.floatingTags.get(p.id);
      if (!tagElement) {
        tagElement = document.createElement('div');
        tagElement.className = 'floating-label';
        uiContainer.appendChild(tagElement);
        this.floatingTags.set(p.id, tagElement);
      }

      if (isBehind) {
        tagElement.style.display = 'none';
      } else {
        tagElement.style.display = 'flex';
        tagElement.style.left = `${screenPos.x}px`;
        tagElement.style.top = `${screenPos.y}px`;

        const statusText = p.status === PlayerStatus.Captured ? 'Captured' : p.role;
        let colorVar = 'var(--civilian)';
        if (p.role === PlayerRole.Attacker) colorVar = 'var(--attacker)';
        if (p.role === PlayerRole.RescueOfficer) colorVar = 'var(--rescue)';
        if (p.status === PlayerStatus.Captured) colorVar = 'var(--captured)';

        // Attacker displays HP bar for testing
        let hpBarHtml = '';
        if (p.role === PlayerRole.Attacker) {
          const hpPct = (p.health / 3) * 100;
          hpBarHtml = `
            <div class="floating-health">
              <div class="floating-health-fill" style="width: ${hpPct}%"></div>
            </div>
          `;
        }

        tagElement.innerHTML = `
          <span>${p.displayName}</span>
          <span class="floating-sub" style="color: ${colorVar}">${statusText}</span>
          ${hpBarHtml}
        `;
      }
    });

    // Clean up tags for players no longer in room state
    this.floatingTags.forEach((element, id) => {
      if (!processedIds.has(id)) {
        element.remove();
        this.floatingTags.delete(id);
      }
    });
  }

  private clearFloatingTags() {
    this.floatingTags.forEach(t => t.remove());
    this.floatingTags.clear();
  }

  private clearRemotePlayers() {
    this.remotePlayers.forEach(p => {
      p.mesh.dispose();
    });
    this.remotePlayers.clear();
    this.clearFloatingTags();
    
    const spec = document.getElementById('spectator-hud');
    if (spec) spec.remove();
  }
}
