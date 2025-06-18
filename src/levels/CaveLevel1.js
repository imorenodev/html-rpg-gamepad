import {Sprite} from "../Sprite.js";
import {Vector2} from "../Vector2.js";
import {resources} from "../Resource.js";
import {Level} from "../objects/Level/Level.js";
import {gridCells} from "../helpers/grid.js";
import {Exit } from "../objects/Exit/Exit.js";
import {Hero} from "../objects/Hero/Hero.js";
import {Rod} from "../objects/Rod/Rod.js";
import {events} from "../Events.js";
import {OutdoorLevel1} from "./OutdoorLevel1.js";
import {Npc} from "../objects/Npc/Npc.js";
import {TALKED_TO_A, TALKED_TO_B} from "../StoryFlags.js";
import {WildEncounter} from "../objects/WildEncounter/WildEncounter.js";
import {createCreature} from "../battle/CreatureDatabase.js";

const DEFAULT_HERO_POSITION = new Vector2(gridCells(6), gridCells(5))

export class CaveLevel1 extends Level {
  constructor(params={}) {
    super({});

    this.background = new Sprite({
      resource: resources.images.cave,
      frameSize: new Vector2(320, 360)
    })

    const ground = new Sprite({
      resource: resources.images.caveGround,
      frameSize: new Vector2(320, 180)
    })
    this.addChild(ground)

    const exit = new Exit(gridCells(3), gridCells(5))
    this.addChild(exit);

    this.heroStartPosition = params.heroPosition ?? DEFAULT_HERO_POSITION;
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    const rod = new Rod(gridCells(9), gridCells(6))
    this.addChild(rod)

    // Add wild encounter areas
    const wildArea1 = new WildEncounter(gridCells(4), gridCells(6), {
      encounterRate: 0.2, // 20% chance
      encounters: ['wildRat']
    });
    this.addChild(wildArea1);

    const wildArea2 = new WildEncounter(gridCells(7), gridCells(4), {
      encounterRate: 0.15, // 15% chance  
      encounters: ['wildRat', 'wildBird']
    });
    this.addChild(wildArea2);

    // Modified NPC to be a trainer
    const trainerNpc = new Npc(gridCells(5), gridCells(5), {
      content: [
        {
          string: "I challenge you to a battle!",
          requires: [],
          addsFlag: TALKED_TO_A,
        },
        {
          string: "Good battle! You're getting stronger.",
          requires: [TALKED_TO_A],
        }
      ],
      portraitFrame: 1,
      isTrainer: true,
      trainerCreature: createCreature('electricStarter', 6)
    })
    this.addChild(trainerNpc);

    // Regular NPC
    const npc2 = new Npc(gridCells(8), gridCells(5), {
      content: [
        {
          string: "Be careful in the wild areas! Strange creatures roam there.",
          requires: [],
          addsFlag: TALKED_TO_B
        }
      ],
      portraitFrame: 0
    })
    this.addChild(npc2);

    this.walls = new Set();
  }

  ready() {
    events.on("HERO_EXITS", this, () => {
      events.emit("CHANGE_LEVEL", new OutdoorLevel1({
        heroPosition: new Vector2(gridCells(16), gridCells(4))
      }))
    })

    // Handle trainer battles
    events.on("TRAINER_BATTLE", this, (battleData) => {
      // This would be handled by the Main scene
      console.log("Trainer battle triggered!", battleData);
    });
  }
}