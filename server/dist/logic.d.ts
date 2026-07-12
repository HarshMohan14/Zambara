import { PlayerRole, NetworkPlayer, WinResult, MatchPhase } from 'shared';
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
export declare function assignRoles(playersInput: string[] | {
    id: string;
    preferredRole?: PlayerRole;
}[]): Record<string, PlayerRole>;
/**
 * Evaluates the game state to check if a side has won.
 * Returns a WinResult if won, or null if match continues.
 */
export declare function evaluateWinConditions(players: NetworkPlayer[], phase: MatchPhase, phaseTimer: number, attackerHealth: number): WinResult | null;
