import { BattleCreature } from './BattleCreature.js';
import { createMove } from './moves/MoveDatabase.js';

export const CREATURE_TEMPLATES = {
  fireStarter: {
    name: "Flameling",
    stats: {
      hp: 80,
      attack: 60,
      defense: 45,
      speed: 55,
      level: 5
    },
    moves: ["tackle", "ember", "heal"],
    sprite: null // You would add sprite references here
  },

  waterStarter: {
    name: "Aqualing",
    stats: {
      hp: 85,
      attack: 50,
      defense: 60,
      speed: 45,
      level: 5
    },
    moves: ["tackle", "waterGun", "heal"],
    sprite: null
  },

  electricStarter: {
    name: "Sparkle",
    stats: {
      hp: 75,
      attack: 55,
      defense: 40,
      speed: 70,
      level: 5
    },
    moves: ["tackle", "thunderShock", "heal"],
    sprite: null
  },

  wildRat: {
    name: "Ratling",
    stats: {
      hp: 50,
      attack: 45,
      defense: 35,
      speed: 60,
      level: 3
    },
    moves: ["tackle", "scratch"],
    sprite: null,
    isWild: true
  },

  wildBird: {
    name: "Chirpling",
    stats: {
      hp: 60,
      attack: 50,
      defense: 30,
      speed: 80,
      level: 4
    },
    moves: ["tackle", "scratch"],
    sprite: null,
    isWild: true
  }
};

export function createCreature(templateKey, level = null) {
  const template = CREATURE_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Creature template ${templateKey} not found`);
  }

  // Create moves from the template
  const moves = template.moves.map(moveKey => createMove(moveKey));

  // Adjust stats if level is different
  const stats = { ...template.stats };
  if (level && level !== stats.level) {
    const levelDiff = level - stats.level;
    const growthRate = 5; // HP/stats gain per level
    
    stats.level = level;
    stats.hp += levelDiff * growthRate;
    stats.attack += levelDiff * 3;
    stats.defense += levelDiff * 3;
    stats.speed += levelDiff * 3;
  }

  return new BattleCreature({
    name: template.name,
    stats: stats,
    moves: moves,
    sprite: template.sprite,
    isWild: template.isWild || false
  });
}