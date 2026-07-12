import { PlayerRole, PlayerStatus, NetworkPlayer, WinResult, MatchPhase, calculateExtractionTarget } from 'shared';

/**
 * Assigns roles to players based on the player count and game rules.
 * Rules:
 * For 6 players: Players 1-4: Civilian, Player 5: Attacker, Player 6: Rescue Officer.
 * For fewer players:
 * - Always assign at least one Civilian.
 * - Assign one Attacker when there are at least two players.
 * - Assign one Rescue Officer when there are at least three players.
 * - Additional players become Civilians.
 * Randomize assignments between matches.
 */
export function assignRoles(
  playersInput: string[] | { id: string; preferredRole?: PlayerRole }[]
): Record<string, PlayerRole> {
  const players = playersInput.map(p => typeof p === 'string' ? { id: p, preferredRole: undefined } : p);
  const count = players.length;
  if (count === 0) return {};

  // Determine roles list
  const rolesPool: PlayerRole[] = [];
  
  if (count >= 6) {
    // 6 or more players
    rolesPool.push(PlayerRole.Attacker);
    rolesPool.push(PlayerRole.RescueOfficer);
    while (rolesPool.length < count) {
      rolesPool.push(PlayerRole.Civilian);
    }
  } else {
    // 1 to 5 players
    // Always at least one Civilian
    rolesPool.push(PlayerRole.Civilian);
    
    // Attacker if at least 2 players
    if (count >= 2) {
      rolesPool.push(PlayerRole.Attacker);
    }
    
    // Rescue Officer if at least 3 players
    if (count >= 3) {
      rolesPool.push(PlayerRole.RescueOfficer);
    }
    
    // Any remaining are Civilians
    while (rolesPool.length < count) {
      rolesPool.push(PlayerRole.Civilian);
    }
  }

  // Shuffle player order to be fair with preferences
  const shuffledPlayers = [...players];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
  }

  const roleMap: Record<string, PlayerRole> = {};

  // First pass: assign preferred roles if they are in the pool
  shuffledPlayers.forEach(player => {
    if (player.preferredRole) {
      const poolIndex = rolesPool.indexOf(player.preferredRole);
      if (poolIndex !== -1) {
        roleMap[player.id] = player.preferredRole;
        rolesPool.splice(poolIndex, 1);
      }
    }
  });

  // Shuffle remaining roles pool
  for (let i = rolesPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]];
  }

  // Second pass: assign remaining roles to players who didn't get one yet
  shuffledPlayers.forEach(player => {
    if (!roleMap[player.id]) {
      const role = rolesPool.pop();
      if (role) {
        roleMap[player.id] = role;
      }
    }
  });

  return roleMap;
}



/**
 * Evaluates the game state to check if a side has won.
 * Returns a WinResult if won, or null if match continues.
 */
export function evaluateWinConditions(
  players: NetworkPlayer[],
  phase: MatchPhase,
  phaseTimer: number,
  attackerHealth: number
): WinResult | null {
  if (phase === MatchPhase.Lobby || phase === MatchPhase.MatchEnd) {
    return null;
  }

  const civilians = players.filter(p => p.role === PlayerRole.Civilian);
  const totalCivilians = civilians.length;
  
  if (totalCivilians === 0) {
    // If no civilians, just end or skip
    return null;
  }

  const extractedCount = civilians.filter(p => p.status === PlayerStatus.Extracted).length;
  const capturedCount = civilians.filter(p => p.status === PlayerStatus.Captured).length;
  const activeOrHiddenCount = civilians.filter(
    p => p.status === PlayerStatus.Active || p.status === PlayerStatus.Hidden
  ).length;

  const targetExtracts = calculateExtractionTarget(totalCivilians);

  // 1. Civilian and Rescue side wins when:
  // At least targetExtracts successfully extract
  if (extractedCount >= targetExtracts) {
    return {
      winningSide: "Civilian/Rescue",
      reason: `${extractedCount} Civilians successfully extracted!`
    };
  }

  // 2. Attacker wins when:
  // - Three Civilians are simultaneously captured and not revived (for 4+ Civilians)
  // - Or the majority of Civilians are captured (for < 4 Civilians)
  // - Or the Rescue phase timer reaches zero before targetExtracts Civilians extract.
  const targetCaptures = totalCivilians >= 4 ? 3 : calculateExtractionTarget(totalCivilians);
  if (capturedCount >= targetCaptures) {
    return {
      winningSide: "Attacker",
      reason: `${capturedCount} Civilians are captured simultaneously!`
    };
  }

  // Also if activeOrHiddenCount is 0 and extractedCount < targetExtracts, Civilians can't win anymore.
  // Wait, if all remaining unextracted civilians are captured (i.e. activeOrHidden = 0), and they can't be revived
  // (e.g. if the Rescue Officer is Neutralised).
  // Wait, let's see: if the Attacker is NOT Neutralised, but activeOrHidden is 0 and capturedCount > 0,
  // can they be revived? The Rescue Officer can revive them. So we only auto-win if the Rescue Officer is also unable,
  // or if capturedCount reaches the target.
  
  // Timer expires during RescuePhase
  if (phase === MatchPhase.RescuePhase && phaseTimer <= 0) {
    return {
      winningSide: "Attacker",
      reason: "Rescue phase time expired!"
    };
  }

  return null;
}
