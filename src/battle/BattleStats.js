export class BattleStats {
  constructor(config = {}) {
    this.maxHp = config.hp || 100;
    this.hp = this.maxHp;
    this.attack = config.attack || 50;
    this.defense = config.defense || 50;
    this.speed = config.speed || 50;
    this.level = config.level || 5;
  }

  takeDamage(damage) {
    this.hp = Math.max(0, this.hp - damage);
    return this.hp <= 0;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  getHpPercentage() {
    return (this.hp / this.maxHp) * 100;
  }
}