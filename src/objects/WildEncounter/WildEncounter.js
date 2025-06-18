import { GameObject } from '../../GameObject.js';
import { Vector2 } from '../../Vector2.js';
import { events } from '../../Events.js';
import { createCreature } from '../../battle/CreatureDatabase.js';

export class WildEncounter extends GameObject {
  constructor(x, y, config = {}) {
    super({
      position: new Vector2(x, y)
    });

    this.encounterRate = config.encounterRate || 0.1; // 10% chance per step
    this.possibleEncounters = config.encounters || ['wildRat', 'wildBird'];
    this.drawLayer = "FLOOR";
    this.isInGrass = false;
  }

  ready() {
    events.on("HERO_POSITION", this, (heroPos) => {
      this.checkForEncounter(heroPos);
    });
  }

  checkForEncounter(heroPos) {
    const distance = Math.sqrt(
      Math.pow(heroPos.x - this.position.x, 2) + 
      Math.pow(heroPos.y - this.position.y, 2)
    );

    const wasInGrass = this.isInGrass;
    this.isInGrass = distance < 16; // Within one tile

    // Only trigger on entering grass, not while walking through it
    if (this.isInGrass && !wasInGrass) {
      if (Math.random() < this.encounterRate) {
        this.triggerEncounter();
      }
    }
  }

  triggerEncounter() {
    const randomEncounter = this.possibleEncounters[
      Math.floor(Math.random() * this.possibleEncounters.length)
    ];
    
    const wildCreature = createCreature(randomEncounter);
    
    events.emit("WILD_ENCOUNTER", {
      creature: wildCreature,
      location: this.position
    });
  }
}