import { network } from './network.js';
import { PlayerRole, PlayerStatus, MatchPhase, RoomState, GAME_CONFIG, MatchStats, calculateExtractionTarget } from 'shared';

export class UIManager {
  private container: HTMLElement;
  private currentScreen: 'lobby' | 'room' | 'game' = 'lobby';
  public localDisplayName: string = '';
  private isLocalReady: boolean = false;

  // Interaction UI state
  private holdingProgress: boolean = false;
  private holdingTimer: number = 0;
  private holdingDuration: number = 0;

  constructor() {
    this.container = document.getElementById('ui-container')!;
    
    // Set default name
    this.localDisplayName = localStorage.getItem('zambara_name') || 'Agent_' + Math.floor(Math.random() * 900 + 100);
  }

  public init(onStartGame: () => void): void {
    this.renderLobbyScreen();
    
    // Copy Room Code trigger
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('room-code-display')) {
        const code = target.dataset.code;
        if (code) {
          navigator.clipboard.writeText(code);
          this.showAnnouncement('Room code copied to clipboard!');
        }
      }
    });

    // Handle backquote key to toggle debug panel
    window.addEventListener('keydown', (e) => {
      if (e.key === '`') {
        const debug = document.getElementById('debug-panel');
        if (debug) {
          debug.style.display = debug.style.display === 'none' ? 'block' : 'none';
        }
      }
    });
  }

  public showAnnouncement(message: string): void {
    let container = document.getElementById('announcements-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'announcements-container';
      container.style.position = 'absolute';
      container.style.top = '100px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.zIndex = '9999';
      container.style.pointerEvents = 'none';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '8px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-panel ui-interactive';
    toast.style.padding = '12px 24px';
    toast.style.borderLeft = '4px solid var(--primary)';
    toast.style.fontWeight = '600';
    toast.style.animation = 'fadeIn 0.2s ease-out';
    toast.style.fontSize = '0.95rem';
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  public showError(message: string): void {
    this.showAnnouncement('❌ ' + message);
  }

  public renderLobbyScreen(): void {
    this.currentScreen = 'lobby';
    this.container.innerHTML = `
      <div class="screen-wrapper">
        <div class="lobby-container glass-panel glow-hover ui-interactive">
          <h1 class="title-main">Zambara</h1>
          <p class="subtitle">Asymmetrical 3D Rescue Game Prototype</p>
          
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input type="text" id="display-name" class="input-field" value="${this.localDisplayName}" maxlength="15">
          </div>

          <div class="actions-row">
            <button id="btn-create" class="btn">Create Room</button>
            <button id="btn-join-toggle" class="btn btn-secondary">Join Room</button>
          </div>

          <div id="join-form" style="display: none; margin-top: 24px; animation: fadeIn 0.2s ease;">
            <div class="divider">Enter Code</div>
            <div class="form-group">
              <input type="text" id="room-code" class="input-field" placeholder="ROOM CODE" style="text-transform: uppercase; text-align: center; font-size: 1.5rem; letter-spacing: 4px;">
            </div>
            <button id="btn-join" class="btn" style="width: 100%">Join Lobby</button>
          </div>
        </div>
      </div>
    `;

    // Listeners
    const nameInput = document.getElementById('display-name') as HTMLInputElement;
    nameInput.addEventListener('change', () => {
      this.localDisplayName = nameInput.value.trim() || 'Agent';
      localStorage.setItem('zambara_name', this.localDisplayName);
    });

    document.getElementById('btn-create')?.addEventListener('click', () => {
      network.createRoom();
    });

    const joinToggle = document.getElementById('btn-join-toggle');
    const joinForm = document.getElementById('join-form');
    joinToggle?.addEventListener('click', () => {
      if (joinForm) {
        joinForm.style.display = joinForm.style.display === 'none' ? 'block' : 'none';
      }
    });

    document.getElementById('btn-join')?.addEventListener('click', () => {
      const codeInput = document.getElementById('room-code') as HTMLInputElement;
      const code = codeInput.value.trim().toUpperCase();
      if (!code) {
        this.showError('Please enter a room code');
        return;
      }
      network.joinRoom(code, this.localDisplayName);
    });
  }

  public renderRoomScreen(state: RoomState): void {
    this.currentScreen = 'room';
    
    const localPlayer = state.players.find(p => p.id === network.playerId);
    const localPlayerPref = localPlayer?.preferredRole || '';
    const isAdmin = state.adminId === network.playerId;

    const playersList = state.players.map(p => {
      const isSelf = p.id === network.playerId;
      const readyBadge = p.isReady 
        ? `<span class="player-status-badge status-ready">Ready</span>`
        : `<span class="player-status-badge status-waiting">Waiting</span>`;
      const prefText = p.preferredRole ? ` <span style="font-size: 0.8rem; color: #a78bfa;">[Pref: ${p.preferredRole}]</span>` : '';
      return `
        <div class="player-item">
          <div class="player-info">
            <div class="player-avatar" style="background: ${isSelf ? 'var(--primary)' : '#4b5563'}">
              ${p.displayName.charAt(0).toUpperCase()}
            </div>
            <span>${p.displayName} ${isSelf ? '<b>(You)</b>' : ''}${prefText} ${state.adminId === p.id ? '👑' : ''}</span>
          </div>
          ${readyBadge}
        </div>
      `;
    }).join('');

    const adminActions = isAdmin 
      ? `<button id="btn-start" class="btn" style="width: 100%; margin-top: 16px;">Start Match</button>`
      : `<p class="subtitle" style="margin-top: 16px; font-style: italic;">Waiting for room owner to start...</p>`;

    this.container.innerHTML = `
      <div class="screen-wrapper">
        <div class="room-container glass-panel ui-interactive">
          <div class="room-header">
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 800;">Lobby Room</h2>
              <p style="color: #9ca3af; font-size: 0.85rem;">Players connected: ${state.players.length}</p>
            </div>
            <div class="room-code-display" data-code="${state.code}" title="Click to copy">
              Code: ${state.code}
            </div>
          </div>

          <div class="player-list">
            ${playersList}
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label">Preferred Role</label>
            <select id="select-role-pref" class="input-field" style="background-color: #1f2937; color: white;">
              <option value="" ${!localPlayerPref ? 'selected' : ''}>No Preference</option>
              <option value="Civilian" ${localPlayerPref === 'Civilian' ? 'selected' : ''}>Civilian</option>
              <option value="Attacker" ${localPlayerPref === 'Attacker' ? 'selected' : ''}>Attacker</option>
              <option value="RescueOfficer" ${localPlayerPref === 'RescueOfficer' ? 'selected' : ''}>Rescue Officer</option>
            </select>
          </div>

          <div style="display: flex; gap: 16px; margin-top: 16px;">
            <button id="btn-ready" class="btn btn-secondary" style="flex: 1;">
              ${this.isLocalReady ? 'Cancel Ready' : 'Mark Ready'}
            </button>
            <button id="btn-leave" class="btn btn-danger btn-secondary" style="padding: 12px 16px;">
              Leave
            </button>
          </div>
          
          ${adminActions}
        </div>
      </div>
    `;

    // Listeners
    document.getElementById('btn-ready')?.addEventListener('click', () => {
      this.isLocalReady = !this.isLocalReady;
      network.setReady(this.isLocalReady);
    });

    document.getElementById('btn-leave')?.addEventListener('click', () => {
      window.location.reload(); // Hard reset is simple and clean for prototype leaving
    });

    const selectRole = document.getElementById('select-role-pref') as HTMLSelectElement;
    selectRole?.addEventListener('change', () => {
      const preferredRole = selectRole.value;
      network.setRolePreference(preferredRole);
    });

    if (isAdmin) {
      document.getElementById('btn-start')?.addEventListener('click', () => {
        network.startMatch();
      });
    }
  }

  public renderGameHUD(state: RoomState): void {
    this.currentScreen = 'game';

    const localPlayer = state.players.find(p => p.id === network.playerId);
    if (!localPlayer) return;

    // Check if we should render Role Card overlay at start
    const justStarted = state.phase === MatchPhase.CivilianPreparation && state.timer > 17;
    let roleCardHtml = '';
    
    if (justStarted) {
      let roleTitle = '';
      let roleDesc = '';
      let roleClass = '';

      if (localPlayer.role === PlayerRole.Civilian) {
        roleTitle = 'Civilian';
        roleDesc = 'Hide, survive and reach extraction after the Rescue Officer arrives.';
        roleClass = 'civilian';
      } else if (localPlayer.role === PlayerRole.Attacker) {
        roleTitle = 'Attacker';
        roleDesc = 'Find and capture Civilians. Prevent three Civilians from escaping.';
        roleClass = 'attacker';
      } else if (localPlayer.role === PlayerRole.RescueOfficer) {
        roleTitle = 'Rescue Officer';
        roleDesc = 'Revive Civilians, neutralise the Attacker and secure their escape.';
        roleClass = 'rescue';
      }

      roleCardHtml = `
        <div class="role-card-overlay">
          <div class="role-card ${roleClass} glass-panel">
            <h2 class="role-card-title">${roleTitle}</h2>
            <p class="role-card-desc">${roleDesc}</p>
          </div>
        </div>
      `;
    }

    // Role display strings
    const civilians = state.players.filter(p => p.role === PlayerRole.Civilian);
    const activeCivs = civilians.filter(p => p.status === PlayerStatus.Active || p.status === PlayerStatus.Hidden).length;
    const capturedCivs = civilians.filter(p => p.status === PlayerStatus.Captured).length;
    const extractedCivs = civilians.filter(p => p.status === PlayerStatus.Extracted).length;
    const targetExtracts = calculateExtractionTarget(civilians.length);

    // Contextual objective text
    let objectiveText = '';
    if (localPlayer.role === PlayerRole.Civilian) {
      if (state.phase === MatchPhase.CivilianPreparation) {
        objectiveText = 'Find a hiding spot or lock doors!';
      } else if (state.phase === MatchPhase.AttackerEntry) {
        objectiveText = 'Avoid the Attacker! Hiding spots are active.';
      } else if (state.phase === MatchPhase.RescuePhase) {
        objectiveText = `Head to the Ground Floor green extraction zone! (Target: ${targetExtracts})`;
      }
    } else if (localPlayer.role === PlayerRole.Attacker) {
      if (state.phase === MatchPhase.CivilianPreparation) {
        objectiveText = 'Waiting inside spawn room... Planning search route.';
      } else {
        objectiveText = `Capture Civilians! Prevent ${targetExtracts} from escaping.`;
      }
    } else if (localPlayer.role === PlayerRole.RescueOfficer) {
      if (state.phase !== MatchPhase.RescuePhase) {
        objectiveText = 'Waiting inside spawn room... Readying rescue equipment.';
      } else {
        objectiveText = 'Revive Captured Civilians and shoot the Attacker (LMB)!';
      }
    }

    // Timer layout
    const formattedTimer = `${Math.floor(state.timer / 60)}:${(state.timer % 60).toString().padStart(2, '0')}`;
    let phaseName = 'Match';
    if (state.phase === MatchPhase.CivilianPreparation) phaseName = 'Civilian Prep';
    if (state.phase === MatchPhase.AttackerEntry) phaseName = 'Attacker Hunt';
    if (state.phase === MatchPhase.RescuePhase) phaseName = 'Rescue Phase';
    if (state.phase === MatchPhase.MatchEnd) phaseName = 'Match Ended';

    // Combat indicators
    const attacker = state.players.find(p => p.role === PlayerRole.Attacker);
    let attackerHealthHtml = '';
    if (attacker && (localPlayer.role === PlayerRole.RescueOfficer || localPlayer.role === PlayerRole.Attacker)) {
      attackerHealthHtml = `
        <div class="hud-stat-row">
          <span>Attacker HP:</span>
          <span class="hud-stat-value" style="color: var(--attacker)">${attacker.health}/3</span>
        </div>
      `;
    }

    // Local status layout
    let localStatusHtml = '';
    if (localPlayer.status === PlayerStatus.Hidden) {
      localStatusHtml = `<div class="role-badge" style="background: rgba(0,0,0,0.5); border-color:#fff; color:#fff">HIDDEN</div>`;
    } else if (localPlayer.status === PlayerStatus.Captured) {
      localStatusHtml = `<div class="role-badge" style="background: var(--captured); color:#fff">CAPTURED</div>`;
    } else if (localPlayer.status === PlayerStatus.Extracted) {
      localStatusHtml = `<div class="role-badge" style="background: var(--extracted); color:#fff">EXTRACTED (Spectating)</div>`;
    } else if (localPlayer.status === PlayerStatus.Neutralised) {
      localStatusHtml = `<div class="role-badge" style="background: #111; color:#fff">NEUTRALISED</div>`;
    }

    // Compile entire HUD HTML
    this.container.innerHTML = `
      ${roleCardHtml}
      
      <div class="hud-container">
        <!-- HUD TOP -->
        <div class="hud-top">
          <div class="hud-phase-panel glass-panel">
            <div class="hud-phase-label">${phaseName}</div>
            <div class="hud-timer">${formattedTimer}</div>
            <div style="font-size: 0.75rem; margin-top: 4px; color: #a5b4fc; font-weight: 600;">
              ${objectiveText}
            </div>
          </div>

          <div class="hud-stats-panel glass-panel">
            <div class="hud-stat-row">
              <span>Civilians Active:</span>
              <span class="hud-stat-value" style="color: var(--civilian)">${activeCivs}</span>
            </div>
            <div class="hud-stat-row">
              <span>Civilians Captured:</span>
              <span class="hud-stat-value" style="color: var(--captured)">${capturedCivs}</span>
            </div>
            <div class="hud-stat-row">
              <span>Civilians Escaped:</span>
              <span class="hud-stat-value" style="color: var(--extracted)">${extractedCivs} / ${targetExtracts}</span>
            </div>
            ${attackerHealthHtml}
          </div>
        </div>

        <!-- HUD CENTER (Interaction prompt & holds) -->
        <div class="hud-center" id="hud-interaction-zone">
          <!-- Populated dynamically via interaction events -->
        </div>

        <!-- HUD BOTTOM -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; width:100%;">
          <div class="hud-local-player-panel glass-panel">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #9ca3af; letter-spacing:1px;">You are playing as</div>
            <div style="font-size: 1.25rem; font-weight: 800;">${localPlayer.displayName}</div>
            <div class="role-badge role-${localPlayer.role.toLowerCase()}">${localPlayer.role}</div>
            ${localStatusHtml}
          </div>
          
          <div style="color: #6b7280; font-size: 0.75rem; text-align: right;">
            Press [ \` ] for Dev Panel<br>
            WASD: Move | Shift: Sprint | Ctrl/C: Crouch<br>
            E: Interact | LMB: Pulse Attack (Rescue Officer)
          </div>
        </div>
      </div>

      <!-- Developer Debug Panel -->
      ${this.renderDebugPanelHtml(state, localPlayer)}
    `;

    this.setupDebugPanelListeners(state);
  }

  private renderDebugPanelHtml(state: RoomState, localPlayer: any): string {
    const isAdmin = state.adminId === network.playerId;
    const adminTag = isAdmin ? '<span style="color: #10b981;">(ADMIN)</span>' : '<span style="color: #ef4444;">(VIEWER)</span>';
    
    // List door states
    const doorsList = Object.entries(state.doors).map(([id, s]) => {
      return `<div>${id}: <span style="font-weight:bold">${s}</span></div>`;
    }).join('');

    return `
      <div id="debug-panel" class="debug-panel glass-panel ui-interactive">
        <div class="debug-title">DEBUG BOARD ${adminTag}</div>
        <div class="debug-row"><span>Room Code:</span> <span>${state.code}</span></div>
        <div class="debug-row"><span>Server Phase:</span> <span>${state.phase}</span></div>
        <div class="debug-row"><span>Time Left:</span> <span>${state.timer}s</span></div>
        <div class="debug-row"><span>Your Role:</span> <span>${localPlayer.role}</span></div>
        <div class="debug-row"><span>Your Status:</span> <span>${localPlayer.status}</span></div>
        <div class="debug-row"><span>Your Pos:</span> <span>X: ${localPlayer.position.x.toFixed(1)}, Y: ${localPlayer.position.y.toFixed(1)}, Z: ${localPlayer.position.z.toFixed(1)}</span></div>
        
        <div class="debug-title" style="margin-top:8px;">Interactive Doors</div>
        <div style="max-height:80px; overflow-y:auto; font-size:0.7rem; border:1px solid rgba(255,255,255,0.05); padding:4px; background:rgba(0,0,0,0.2);">
          ${doorsList}
        </div>

        <div class="debug-actions">
          <button class="btn-debug" id="dbg-skip" ${!isAdmin ? 'disabled' : ''}>Skip Phase</button>
          <button class="btn-debug" id="dbg-addtime" ${!isAdmin ? 'disabled' : ''}>Add 30s</button>
          <button class="btn-debug" id="dbg-release-att" ${!isAdmin ? 'disabled' : ''}>Release Attacker</button>
          <button class="btn-debug" id="dbg-release-res" ${!isAdmin ? 'disabled' : ''}>Release Rescue</button>
          <button class="btn-debug" id="dbg-tp-gf">Teleport Ground</button>
          <button class="btn-debug" id="dbg-reset-doors" ${!isAdmin ? 'disabled' : ''}>Reset Doors</button>
        </div>
      </div>
    `;
  }

  private setupDebugPanelListeners(state: RoomState): void {
    const isAdmin = state.adminId === network.playerId;

    if (isAdmin) {
      document.getElementById('dbg-skip')?.addEventListener('click', () => network.adminSkipPhase());
      document.getElementById('dbg-addtime')?.addEventListener('click', () => network.adminAddTime(30));
      document.getElementById('dbg-release-att')?.addEventListener('click', () => network.adminSkipPhase()); // CivilianPrep -> AttackerEntry
      document.getElementById('dbg-release-res')?.addEventListener('click', () => {
        // If in Prep, skip twice. If in AttackerEntry, skip once.
        if (state.phase === MatchPhase.CivilianPreparation) {
          network.adminSkipPhase();
          setTimeout(() => network.adminSkipPhase(), 100);
        } else if (state.phase === MatchPhase.AttackerEntry) {
          network.adminSkipPhase();
        }
      });
      document.getElementById('dbg-reset-doors')?.addEventListener('click', () => network.adminResetDoors());
    }

    // Teleport local player to ground floor (works for everyone for testing)
    document.getElementById('dbg-tp-gf')?.addEventListener('click', () => {
      if (isAdmin) {
        network.adminTeleport({ x: 0, y: 0.1, z: 0 });
      } else {
        // Non-admin can't force server teleport directly, but we let them trigger it if the server supports it
        network.adminTeleport({ x: 0, y: 0.1, z: 0 });
      }
    });
  }

  public showInteractionPrompt(key: string, label: string): void {
    const zone = document.getElementById('hud-interaction-zone');
    if (!zone) return;

    zone.innerHTML = `
      <div class="interaction-prompt">
        <span class="interaction-key">${key}</span>
        <span>${label}</span>
      </div>
    `;
  }

  public showInteractionProgress(key: string, label: string, currentMs: number, totalMs: number): void {
    const zone = document.getElementById('hud-interaction-zone');
    if (!zone) return;

    const pct = Math.min(100, (currentMs / totalMs) * 100);
    zone.innerHTML = `
      <div class="interaction-prompt" style="flex-direction: column; align-items: center; gap: 8px;">
        <div style="display:flex; align-items:center; gap: 8px;">
          <span class="interaction-key">${key}</span>
          <span>${label}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }

  public clearInteractionPrompt(): void {
    const zone = document.getElementById('hud-interaction-zone');
    if (zone) zone.innerHTML = '';
  }

  public renderMatchEndScreen(winResult: { winningSide: string; reason: string }, stats: MatchStats | null): void {
    this.currentScreen = 'lobby';
    
    let statsGridHtml = '';
    let playerRowsHtml = '';

    if (stats) {
      statsGridHtml = `
        <div class="stat-card">
          <h4>Duration</h4>
          <div class="val">${stats.durationSeconds}s</div>
        </div>
        <div class="stat-card">
          <h4>Civilians Extracted</h4>
          <div class="val" style="color: var(--extracted)">${stats.extractedCivilians} / ${stats.totalCivilians}</div>
        </div>
        <div class="stat-card">
          <h4>Captured at End</h4>
          <div class="val" style="color: var(--captured)">${stats.capturedAtEnd}</div>
        </div>
        <div class="stat-card">
          <h4>Attacker Status</h4>
          <div class="val" style="color: ${stats.attackerNeutralized ? 'var(--extracted)' : 'var(--attacker)'}">
            ${stats.attackerNeutralized ? 'NEUTRALISED' : `Active (HP: ${stats.attackerHealth}/3)`}
          </div>
        </div>
      `;

      playerRowsHtml = Object.entries(stats.playerStats).map(([id, pStats]) => {
        const name = stats.displayNames[id] || 'Unknown';
        const role = stats.roles[id] || 'Civilian';
        
        let roleStyle = 'color: var(--civilian)';
        if (role === PlayerRole.Attacker) roleStyle = 'color: var(--attacker)';
        if (role === PlayerRole.RescueOfficer) roleStyle = 'color: var(--rescue)';

        return `
          <tr>
            <td><b>${name}</b></td>
            <td style="${roleStyle}; font-weight:bold">${role}</td>
            <td>${pStats.captures}</td>
            <td>${pStats.revives}</td>
            <td>${pStats.extractions}</td>
            <td>${pStats.pulseHits}</td>
            <td>${pStats.hidingSpotsSearched}</td>
            <td>${pStats.timeHiddenSeconds.toFixed(1)}s</td>
          </tr>
        `;
      }).join('');
    }

    const isAdmin = stats ? (stats.displayNames[network.playerId] !== undefined) : false; // simple check
    
    // Admin restart button
    // Let's check: does the client know who the admin is? We can just expose a button, the server will reject if they are not the admin.
    const actionButtons = `
      <div style="display:flex; gap:16px; margin-top:24px;">
        <button id="btn-end-restart" class="btn" style="flex:1;">Restart Match</button>
        <button id="btn-end-lobby" class="btn btn-secondary" style="flex:1;">Return to Lobby</button>
      </div>
    `;

    this.container.innerHTML = `
      <div class="screen-wrapper end-screen-overlay">
        <div class="end-container glass-panel ui-interactive" style="text-align: center;">
          <h2 class="end-title" style="color: ${winResult.winningSide === 'Attacker' ? 'var(--attacker)' : 'var(--extracted)'}">
            ${winResult.winningSide === 'Attacker' ? 'Attacker Victory' : 'Rescue Side Victory'}
          </h2>
          <p class="end-reason">${winResult.reason}</p>

          <h3 style="margin-bottom:12px; font-weight:800; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">Match Statistics</h3>
          <div class="stats-grid">
            ${statsGridHtml}
          </div>

          <h3 style="margin-bottom:12px; font-weight:800; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">Leaderboard</h3>
          <div style="max-height: 200px; overflow-y:auto; margin-bottom:16px;">
            <table class="player-summary-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Role</th>
                  <th>Caps</th>
                  <th>Revs</th>
                  <th>Escs</th>
                  <th>Hits</th>
                  <th>Srcs</th>
                  <th>Hidden</th>
                </tr>
              </thead>
              <tbody>
                ${playerRowsHtml}
              </tbody>
            </table>
          </div>

          ${actionButtons}
        </div>
      </div>
    `;

    // Listeners
    document.getElementById('btn-end-restart')?.addEventListener('click', () => {
      // Trigger match start from admin (if admin)
      network.startMatch();
    });

    document.getElementById('btn-end-lobby')?.addEventListener('click', () => {
      window.location.reload(); // Reload hard-resets back to lobby
    });
  }
}
export const ui = new UIManager();
