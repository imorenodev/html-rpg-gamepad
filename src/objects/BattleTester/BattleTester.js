import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {Sprite} from "../../Sprite.js";
import {resources} from "../../Resource.js";
import {events} from "../../Events.js";
import {createCreature} from "../../battle/CreatureDatabase.js";

export class BattleTester extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y)
    });

    // Visual indicator - use rod sprite for now
    this.addChild(new Sprite({
      resource: resources.images.rod,
      position: new Vector2(0, -5)
    }));

    this.drawLayer = "FLOOR";
  }

  ready() {
    events.on("HERO_POSITION", this, pos => {
      // Check if hero stepped on this tile
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      if (roundedHeroX === this.position.x && roundedHeroY === this.position.y) {
        this.triggerTestBattle();
      }
    });
  }

  triggerTestBattle() {
    // Remove this tester so it only triggers once
    this.destroy();

    // Create a test wild creature
    const testCreature = createCreature('wildRat', 4);
    
    events.emit("WILD_ENCOUNTER", {
      creature: testCreature,
      location: this.position
    });
  }
}