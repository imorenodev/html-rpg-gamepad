import { BattleMove } from '../BattleMove.js';

export const MOVES = {
  tackle: new BattleMove({
    name: "Tackle",
    power: 40,
    accuracy: 100,
    type: "normal",
    category: "physical",
    pp: 15,
    description: "A physical attack in which the user charges and slams into the target."
  }),

  scratch: new BattleMove({
    name: "Scratch",
    power: 40,
    accuracy: 100,
    type: "normal",
    category: "physical",
    pp: 15,
    description: "Hard, pointed, sharp claws rake the target to inflict damage."
  }),

  heal: new BattleMove({
    name: "Heal",
    power: 0,
    accuracy: 100,
    type: "normal",
    category: "status",
    pp: 5,
    description: "Restores HP.",
    effect: (user, target) => {
      const healAmount = Math.floor(user.stats.maxHp * 0.5);
      user.stats.heal(healAmount);
      return { message: `${user.name} restored ${healAmount} HP!` };
    }
  }),

  ember: new BattleMove({
    name: "Ember",
    power: 60,
    accuracy: 90,
    type: "fire",
    category: "special",
    pp: 10,
    description: "The target is attacked with small flames."
  }),

  waterGun: new BattleMove({
    name: "Water Gun",
    power: 55,
    accuracy: 95,
    type: "water",
    category: "special",
    pp: 12,
    description: "The target is blasted with a forceful shot of water."
  }),

  thunderShock: new BattleMove({
    name: "Thunder Shock",
    power: 50,
    accuracy: 95,
    type: "electric",
    category: "special",
    pp: 12,
    description: "A jolt of electricity crashes down to inflict damage."
  })
};

// Helper function to create move instances
export function createMove(moveKey) {
  const moveTemplate = MOVES[moveKey];
  if (!moveTemplate) {
    throw new Error(`Move ${moveKey} not found in database`);
  }
  
  // Create a new instance with the same properties
  return new BattleMove({
    name: moveTemplate.name,
    power: moveTemplate.power,
    accuracy: moveTemplate.accuracy,
    type: moveTemplate.type,
    category: moveTemplate.category,
    pp: moveTemplate.pp,
    description: moveTemplate.description,
    effect: moveTemplate.effect
  });
}