import { network } from './network.js';
import { ui } from './ui.js';
import { GameEngine } from './game.js';
import { debug } from './debug.js';

window.addEventListener('DOMContentLoaded', () => {
  // Determine Server Connection URL
  // Default to localhost:3000 in dev environments
  const hostname = window.location.hostname;
  const serverUrl = hostname === 'localhost' || hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : window.location.origin;

  console.log(`Connecting to Zambara Server at: ${serverUrl}`);

  // 1. Establish network socket connection
  network.connect(serverUrl);

  // 2. Launch 3D engine viewport
  const game = new GameEngine();
  game.start();

  // 3. Initialize HUD and lobby overlay states
  ui.init(() => {
    // Start game callback if needed
  });

  // 4. Run developer auto-join/start shortcuts
  debug.autoLobbyFlow(ui.localDisplayName);
});
