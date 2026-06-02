import { Game } from './Game';

function main(): void {
  const app = document.getElementById('app');
  if (!app) {
    console.error('Doomloop: #app container not found');
    return;
  }

  const game = new Game(app);

  // Expose game for debugging
  (window as any).__doomloop = game;

  game.init().catch((err) => {
    console.error('Doomloop initialization error:', err);
  });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
