export class BattleMove {
  constructor(config) {
    this.name = config.name;
    this.power = config.power || 0;
    this.accuracy = config.accuracy || 100;
    this.type = config.type || "normal";
    this.category = config.category || "physical"; // physical, special, status
    this.pp = config.pp || 10;
    this.maxPp = this.pp;
    this.description = config.description || "";
    this.effect = config.effect || null; // Function for special effects
  }

  canUse() {
    return this.pp > 0;
  }

  use() {
    if (this.canUse()) {
      this.pp--;
      return true;
    }
    return false;
  }

  calculateDamage(attacker, defender) {
    if (this.power === 0) return 0;

    // Pokemon damage formula (simplified)
    const attackStat = this.category === "physical" ? attacker.stats.attack : attacker.stats.attack;
    const defenseStat = this.category === "physical" ? defender.stats.defense : defender.stats.defense;
    
    const baseDamage = ((2 * attacker.stats.level + 10) / 250) * 
                      (attackStat / defenseStat) * this.power + 2;
    
    // Add some randomness (85-100%)
    const randomFactor = (Math.random() * 0.15) + 0.85;
    
    return Math.floor(baseDamage * randomFactor);
  }

  hitCheck() {
    return Math.random() * 100 < this.accuracy;
  }
}