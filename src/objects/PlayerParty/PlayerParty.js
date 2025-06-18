import { createCreature } from '../../battle/CreatureDatabase.js';

export class PlayerParty {
  constructor() {
    this.creatures = [];
    this.activeCreature = 0;
    
    // Start with a basic creature
    this.addCreature(createCreature('fireStarter', 5));
  }

  addCreature(creature) {
    if (this.creatures.length < 6) { // Max party size
      this.creatures.push(creature);
    }
  }

  getActiveCreature() {
    return this.creatures[this.activeCreature] || null;
  }

  hasAnyAliveCreatures() {
    return this.creatures.some(creature => creature.isAlive());
  }

  switchActiveCreature(index) {
    if (index >= 0 && index < this.creatures.length && this.creatures[index].isAlive()) {
      this.activeCreature = index;
      return true;
    }
    return false;
  }

  healAllCreatures() {
    this.creatures.forEach(creature => {
      creature.stats.hp = creature.stats.maxHp;
      creature.moves.forEach(move => {
        move.pp = move.maxPp;
      });
    });
  }
}