import { GameObject } from '../GameObject.js';
import { Vector2 } from '../Vector2.js';
import { events } from '../Events.js';
import { BattleCreature } from './BattleCreature.js';
import { BattleUI } from './BattleUI.js';
import { SpriteTextString } from '../objects/SpriteTextString/SpriteTextString.js';

export class BattleScene extends GameObject {
  constructor(playerCreature, enemyCreature) {
    super({});
    
    this.playerCreature = playerCreature;
    this.enemyCreature = enemyCreature;
    this.currentTurn = null;
    this.battlePhase = "INTRO"; // INTRO, CHOOSE_ACTION, CHOOSE_MOVE, EXECUTING, END
    this.actionQueue = [];
    this.isProcessingActions = false;
    this.currentTextBox = null;

    // Create battle UI
    this.battleUI = new BattleUI(this.playerCreature, this.enemyCreature);
    this.addChild(this.battleUI);

    this.turnOrder = [];
    this.currentTurnIndex = 0;
  }

  ready() {
    this.showIntroText();
    
    // Listen for UI interactions
    events.on("BATTLE_ACTION_SELECTED", this, (action) => {
      this.handleActionSelection(action);
    });

    events.on("BATTLE_MOVE_SELECTED", this, (moveIndex) => {
      this.handleMoveSelection(moveIndex);
    });

    events.on("END_TEXT_BOX", this, () => {
      this.onTextBoxEnd();
    });
  }

  showIntroText() {
    const message = `A wild ${this.enemyCreature.name} appeared!`;
    this.showMessage(message, () => {
      this.battlePhase = "CHOOSE_ACTION";
      this.battleUI.showActionMenu();
    });
  }

  showMessage(message, callback = null) {
    if (this.currentTextBox) {
      this.currentTextBox.destroy();
    }

    this.currentTextBox = new SpriteTextString({
      string: message,
      portraitFrame: 0
    });
    this.addChild(this.currentTextBox);
    
    this.onTextBoxEndCallback = callback;
  }

  onTextBoxEnd() {
    if (this.currentTextBox) {
      this.currentTextBox.destroy();
      this.currentTextBox = null;
    }

    if (this.onTextBoxEndCallback) {
      const callback = this.onTextBoxEndCallback;
      this.onTextBoxEndCallback = null;
      callback();
    }
  }

  handleActionSelection(action) {
    if (this.battlePhase !== "CHOOSE_ACTION") return;

    switch (action) {
      case "FIGHT":
        this.battlePhase = "CHOOSE_MOVE";
        this.battleUI.showMoveMenu(this.playerCreature.moves);
        break;
      case "RUN":
        this.attemptRun();
        break;
      default:
        // For now, other actions just show a message
        this.showMessage("That action isn't implemented yet!", () => {
          this.battlePhase = "CHOOSE_ACTION";
          this.battleUI.showActionMenu();
        });
    }
  }

  handleMoveSelection(moveIndex) {
    if (this.battlePhase !== "CHOOSE_MOVE") return;

    const playerMove = this.playerCreature.moves[moveIndex];
    if (!playerMove || !playerMove.canUse()) {
      this.showMessage("That move can't be used!", () => {
        this.battleUI.showMoveMenu(this.playerCreature.moves);
      });
      return;
    }

    // Player has chosen their move, now enemy chooses
    const enemyMoveIndex = this.chooseEnemyMove();
    
    // Determine turn order based on speed
    this.determineTurnOrder(
      { creature: this.playerCreature, moveIndex: moveIndex, isPlayer: true },
      { creature: this.enemyCreature, moveIndex: enemyMoveIndex, isPlayer: false }
    );

    this.battlePhase = "EXECUTING";
    this.battleUI.hideMenus();
    this.executeNextAction();
  }

  chooseEnemyMove() {
    const availableMoves = this.enemyCreature.getAvailableMoves();
    if (availableMoves.length === 0) {
      // If no moves available, return -1 (struggle or something)
      return 0; // For now, just use first move
    }
    
    // Simple AI: random move selection
    const randomIndex = Math.floor(Math.random() * this.enemyCreature.moves.length);
    return randomIndex;
  }

  determineTurnOrder(playerAction, enemyAction) {
    this.actionQueue = [];
    
    const playerSpeed = playerAction.creature.getEffectiveSpeed();
    const enemySpeed = enemyAction.creature.getEffectiveSpeed();
    
    if (playerSpeed >= enemySpeed) {
      this.actionQueue.push(playerAction);
      this.actionQueue.push(enemyAction);
    } else {
      this.actionQueue.push(enemyAction);
      this.actionQueue.push(playerAction);
    }
  }

  executeNextAction() {
    if (this.actionQueue.length === 0) {
      this.endTurn();
      return;
    }

    const action = this.actionQueue.shift();
    const attacker = action.creature;
    const defender = action.isPlayer ? this.enemyCreature : this.playerCreature;
    
    const result = attacker.useMove(action.moveIndex, defender);
    
    this.showMessage(result.message, () => {
      // Update UI after damage
      this.battleUI.updateHealthBars();
      
      // Check if battle should end
      if (!defender.isAlive()) {
        this.endBattle(action.isPlayer);
        return;
      }
      
      // Continue with next action
      this.executeNextAction();
    });
  }

  endTurn() {
    // Check for status effects, etc.
    this.battlePhase = "CHOOSE_ACTION";
    this.battleUI.showActionMenu();
  }

  attemptRun() {
    if (this.enemyCreature.isWild) {
      // Wild Pokemon - chance to escape
      const escapeChance = 0.5; // 50% for simplicity
      if (Math.random() < escapeChance) {
        this.showMessage("You successfully ran away!", () => {
          events.emit("BATTLE_END", { result: "ESCAPED" });
        });
      } else {
        this.showMessage("Can't escape!", () => {
          // Enemy gets a free turn
          const enemyMoveIndex = this.chooseEnemyMove();
          const result = this.enemyCreature.useMove(enemyMoveIndex, this.playerCreature);
          
          this.showMessage(result.message, () => {
            this.battleUI.updateHealthBars();
            
            if (!this.playerCreature.isAlive()) {
              this.endBattle(false);
              return;
            }
            
            this.battlePhase = "CHOOSE_ACTION";
            this.battleUI.showActionMenu();
          });
        });
      }
    } else {
      this.showMessage("Can't run from a trainer battle!", () => {
        this.battlePhase = "CHOOSE_ACTION";
        this.battleUI.showActionMenu();
      });
    }
  }

  endBattle(playerWon) {
    this.battlePhase = "END";
    this.battleUI.hideMenus();
    
    const message = playerWon 
      ? `You defeated the wild ${this.enemyCreature.name}!`
      : `${this.playerCreature.name} was defeated!`;
    
    this.showMessage(message, () => {
      events.emit("BATTLE_END", { 
        result: playerWon ? "VICTORY" : "DEFEAT",
        playerCreature: this.playerCreature,
        enemyCreature: this.enemyCreature
      });
    });
  }

  step(delta, root) {
    super.step(delta, root);
    
    // Handle input for battle UI
    if (this.battlePhase === "CHOOSE_ACTION" || this.battlePhase === "CHOOSE_MOVE") {
      this.battleUI.handleInput(root.input);
    }
  }
}