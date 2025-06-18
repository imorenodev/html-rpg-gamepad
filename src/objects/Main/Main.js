import {GameObject} from "../../GameObject.js";
import {Input} from "../../Input.js";
import {Camera} from "../../Camera.js";
import {Inventory} from "../Inventory/Inventory.js";
import {events} from "../../Events.js";
import {SpriteTextString} from "../SpriteTextString/SpriteTextString.js";
import {storyFlags} from "../../StoryFlags.js";
import { BattleScene } from '../../battle/BattleScene.js';
import { PlayerParty } from '../PlayerParty/PlayerParty.js';

export class Main extends GameObject {
  constructor() {
    super({});
    this.level = null;
    this.input = new Input()
    this.camera = new Camera()
    this.playerParty = new PlayerParty();
    this.inBattle = false;
  }

  ready() {
    // Initialize player party
    this.playerParty = new PlayerParty();
    this.inBattle = false;

    const inventory = new Inventory()
    this.addChild(inventory);

    // Change Level handler
    events.on("CHANGE_LEVEL", this, newLevelInstance => {
      this.setLevel(newLevelInstance)
    })

    // Wild Encounter handler
    events.on("WILD_ENCOUNTER", this, (encounterData) => {
      if (this.inBattle) return;
      
      const playerCreature = this.playerParty.getActiveCreature();
      if (!playerCreature) {
        console.warn("No active creature to battle with!");
        return;
      }
      
      this.startBattle(playerCreature, encounterData.creature);
    });

    // Trainer Battle handler
    events.on("TRAINER_BATTLE", this, (battleData) => {
      if (this.inBattle) return;
      
      const playerCreature = this.playerParty.getActiveCreature();
      if (!playerCreature) {
        console.warn("No active creature to battle with!");
        return;
      }
      
      this.startBattle(playerCreature, battleData.creature);
    });

    // Battle End handler
    events.on("BATTLE_END", this, (result) => {
      this.endBattle(result);
    });

    // Launch Text Box handler (your existing code)
    events.on("HERO_REQUESTS_ACTION", this, (withObject) => {
      // Handle trainer battles first
      if (withObject.isTrainer && withObject.trainerCreature) {
        events.emit("TRAINER_BATTLE", {
          trainer: withObject,
          creature: withObject.trainerCreature
        });
        return;
      }

      // Existing text box code...
      if (typeof withObject.getContent === "function") {
        const content = withObject.getContent();

        if (!content) {
          return;
        }

        if (content.addsFlag) {
          storyFlags.add(content.addsFlag);
        }

        const textbox = new SpriteTextString({
          portraitFrame: content.portraitFrame,
          string: content.string
        });
        this.addChild(textbox);
        events.emit("START_TEXT_BOX");

        const endingSub = events.on("END_TEXT_BOX", this, () => {
          textbox.destroy();
          events.off(endingSub)
        })
      }
    });
  }

  setLevel(newLevelInstance) {
    if (this.level) {
      this.level.destroy();
    }
    this.level = newLevelInstance;
    this.addChild(this.level);
  }

  drawBackground(ctx) {
    this.level?.background.drawImage(ctx,0,0);
  }

  drawObjects(ctx) {
    // Don't draw level objects if in battle
    if (this.inBattle) {
      // Only draw battle scene
      this.children.forEach(child => {
        if (child.constructor.name === 'BattleScene') {
          child.draw(ctx, 0, 0);
        }
      });
    } else {
      // Normal drawing
      this.children.forEach(child => {
        if (child.drawLayer !== "HUD") {
          child.draw(ctx, 0, 0);
        }
      });
    }
  }

  drawForeground(ctx) {
    this.children.forEach(child => {
      if (child.drawLayer === "HUD") {
        child.draw(ctx, 0, 0);
      }
    })
  }

  startBattle(playerCreature, enemyCreature) {
    this.inBattle = true;
    
    // Create and show battle scene
    this.battleScene = new BattleScene(playerCreature, enemyCreature);
    this.addChild(this.battleScene);
    
    // The battle scene will handle its own rendering and input
  }

  endBattle(result) {
    this.inBattle = false;
    
    // Remove battle scene
    if (this.battleScene) {
      this.battleScene.destroy();
      this.battleScene = null;
    }
    
    // Handle battle results
    switch (result.result) {
      case "VICTORY":
        console.log("Battle won!");
        // Could add experience, items, etc.
        break;
      case "DEFEAT":
        console.log("Battle lost!");
        // Heal party and maybe return to safe location
        this.playerParty.healAllCreatures();
        break;
      case "ESCAPED":
        console.log("Escaped from battle!");
        break;
    }
  }

}