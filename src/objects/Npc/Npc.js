import {GameObject} from "../../GameObject.js";
import {Vector2} from "../../Vector2.js";
import {resources} from "../../Resource.js";
import {Sprite} from "../../Sprite.js";
import {storyFlags} from "../../StoryFlags.js";
import {events} from "../../Events.js";

export class Npc extends GameObject {
  constructor(x, y, textConfig={}) {
    super({
      position: new Vector2(x, y)
    });

    // Opt into being solid
    this.isSolid = true;

    // Say something when talking
    this.textContent = textConfig.content;
    this.textPortraitFrame = textConfig.portraitFrame;

    // Shadow under feet
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -19),
    })
    this.addChild(shadow);

    // Body sprite
    const body = new Sprite({
      resource: resources.images.knight,
      frameSize: new Vector2(32, 32),
      hFrames: 2,
      vFrames: 1,
      position: new Vector2(-8, -20),
    })
    this.addChild(body);

    this.isTrainer = textConfig.isTrainer || false;
    this.trainerCreature = textConfig.trainerCreature || null;
  }

  ready() {
    if (this.isTrainer) {
      events.on("HERO_REQUESTS_ACTION", this, () => {
        // Check if this NPC was targeted
        // You'd need to implement proximity checking
        if (this.trainerCreature) {
          events.emit("TRAINER_BATTLE", {
            trainer: this,
            creature: this.trainerCreature
          });
        }
      });
    }
  }

  getContent() {

    // Maybe expand with story flag logic, etc
    const match = storyFlags.getRelevantScenario(this.textContent);
    if (!match) {
      console.warn("No matches found in this list!", this.textContent);
      return null;
    }

    return {
      portraitFrame: this.textPortraitFrame,
      string: match.string,
      addsFlag: match.addsFlag ?? null
    }
  }

}