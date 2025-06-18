import { BattleStats } from './BattleStats.js';

export class BattleCreature {
  constructor(config) {
    this.name = config.name || "Unknown";
    this.stats = new BattleStats(config.stats);
    this.moves = config.moves || [];
    this.sprite = config.sprite || null;
    this.isWild = config.isWild || false;
    this.statusEffect = null; // poison, paralysis, etc.
    this.statModifiers = {
      attack: 0,
      defense: 0,
      speed: 0
    };
  }

  getAvailableMoves() {
    return this.moves.filter(move => move.canUse());
  }

  useMove(moveIndex, target) {
    const move = this.moves[moveIndex];
    if (!move || !move.canUse()) {
      return { success: false, message: `${this.name} can't use that move!` };
    }

    move.use();

    if (!move.hitCheck()) {
      return { 
        success: true, 
        hit: false, 
        message: `${this.name} used ${move.name}, but it missed!` 
      };
    }

    const damage = move.calculateDamage(this, target);
    const wasKnockedOut = target.stats.takeDamage(damage);

    let message = `${this.name} used ${move.name}!`;
    if (damage > 0) {
      message += ` It dealt ${damage} damage!`;
    }
    if (wasKnockedOut) {
      message += ` ${target.name} was knocked out!`;
    }

    // Apply move effect if it has one
    if (move.effect && typeof move.effect === 'function') {
      const effectResult = move.effect(this, target);
      if (effectResult && effectResult.message) {
        message += ` ${effectResult.message}`;
      }
    }

    return {
      success: true,
      hit: true,
      damage: damage,
      wasKnockedOut: wasKnockedOut,
      message: message
    };
  }

  isAlive() {
    return this.stats.hp > 0;
  }

  getEffectiveSpeed() {
    const modifier = this.statModifiers.speed;
    const multiplier = modifier >= 0 ? (2 + modifier) / 2 : 2 / (2 + Math.abs(modifier));
    return this.stats.speed * multiplier;
  }
}