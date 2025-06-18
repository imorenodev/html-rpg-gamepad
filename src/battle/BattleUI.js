import { GameObject } from '../GameObject.js';
import { Vector2 } from '../Vector2.js';
import { Sprite } from '../Sprite.js';
import { resources } from '../Resource.js';
import { events } from '../Events.js';
import { UP, DOWN, LEFT, RIGHT } from '../Input.js';

export class BattleUI extends GameObject {
  constructor(playerCreature, enemyCreature) {
    super({});
    
    this.playerCreature = playerCreature;
    this.enemyCreature = enemyCreature;
    this.selectedIndex = 0;
    this.currentMenu = null; // "ACTION" or "MOVE"
    this.drawLayer = "HUD";

    this.setupHealthBars();
    this.setupCreatureSprites();
  }

  setupHealthBars() {
    // Player health bar (bottom right)
    this.playerHealthBar = {
      position: new Vector2(160, 120),
      width: 120,
      height: 8
    };

    // Enemy health bar (top left)
    this.enemyHealthBar = {
      position: new Vector2(40, 20),
      width: 120,
      height: 8
    };
  }

  setupCreatureSprites() {
    // For now, use placeholder positions
    // In a real implementation, you'd have proper battle sprites
    this.playerSpritePos = new Vector2(60, 100);
    this.enemySpritePos = new Vector2(220, 40);
  }

  showActionMenu() {
    this.currentMenu = "ACTION";
    this.selectedIndex = 0;
    this.actionOptions = ["FIGHT", "BAG", "POKEMON", "RUN"];
  }

  showMoveMenu(moves) {
    this.currentMenu = "MOVE";
    this.selectedIndex = 0;
    this.moveOptions = moves;
  }

  hideMenus() {
    this.currentMenu = null;
  }

  handleInput(input) {
    if (!this.currentMenu || !input) return;

    const maxIndex = this.currentMenu === "ACTION" 
      ? this.actionOptions.length - 1 
      : this.moveOptions.length - 1;

    // Handle navigation
    if (input.getActionJustPressed("ArrowUp") || input.getActionJustPressed("KeyW")) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    }
    if (input.getActionJustPressed("ArrowDown") || input.getActionJustPressed("KeyS")) {
      this.selectedIndex = Math.min(maxIndex, this.selectedIndex + 1);
    }
    if (input.getActionJustPressed("ArrowLeft") || input.getActionJustPressed("KeyA")) {
      if (this.currentMenu === "ACTION") {
        this.selectedIndex = this.selectedIndex < 2 ? this.selectedIndex : this.selectedIndex - 2;
      }
    }
    if (input.getActionJustPressed("ArrowRight") || input.getActionJustPressed("KeyD")) {
      if (this.currentMenu === "ACTION") {
        this.selectedIndex = this.selectedIndex < 2 ? this.selectedIndex + 2 : this.selectedIndex;
        this.selectedIndex = Math.min(maxIndex, this.selectedIndex);
      }
    }

    // Handle selection
    if (input.getActionJustPressed("Space") || input.getActionJustPressed("Enter")) {
      if (this.currentMenu === "ACTION") {
        events.emit("BATTLE_ACTION_SELECTED", this.actionOptions[this.selectedIndex]);
      } else if (this.currentMenu === "MOVE") {
        events.emit("BATTLE_MOVE_SELECTED", this.selectedIndex);
      }
    }

    // Handle back/cancel
    if (input.getActionJustPressed("Escape")) {
      if (this.currentMenu === "MOVE") {
        this.showActionMenu();
      }
    }
  }

  updateHealthBars() {
    // This will trigger a redraw of the health bars
    // The actual drawing happens in drawImage
  }

  drawImage(ctx, drawPosX, drawPosY) {
    // Draw creature names and levels
    this.drawCreatureInfo(ctx, drawPosX, drawPosY);
    
    // Draw health bars
    this.drawHealthBars(ctx, drawPosX, drawPosY);
    
    // Draw current menu
    if (this.currentMenu === "ACTION") {
      this.drawActionMenu(ctx, drawPosX, drawPosY);
    } else if (this.currentMenu === "MOVE") {
      this.drawMoveMenu(ctx, drawPosX, drawPosY);
    }
  }

  drawCreatureInfo(ctx, drawPosX, drawPosY) {
    ctx.fillStyle = "#fff";
    ctx.font = "8px Arial";
    
    // Enemy info (top left)
    ctx.fillText(
      `${this.enemyCreature.name} Lv.${this.enemyCreature.stats.level}`,
      drawPosX + this.enemyHealthBar.position.x,
      drawPosY + this.enemyHealthBar.position.y - 12
    );
    
    // Player info (bottom right)
    ctx.fillText(
      `${this.playerCreature.name} Lv.${this.playerCreature.stats.level}`,
      drawPosX + this.playerHealthBar.position.x,
      drawPosY + this.playerHealthBar.position.y - 12
    );
    
    // Player HP numbers
    ctx.fillText(
      `${this.playerCreature.stats.hp}/${this.playerCreature.stats.maxHp}`,
      drawPosX + this.playerHealthBar.position.x + this.playerHealthBar.width - 40,
      drawPosY + this.playerHealthBar.position.y + 12
    );
  }

  drawHealthBars(ctx, drawPosX, drawPosY) {
    this.drawHealthBar(
      ctx, 
      drawPosX + this.playerHealthBar.position.x,
      drawPosY + this.playerHealthBar.position.y,
      this.playerHealthBar.width,
      this.playerHealthBar.height,
      this.playerCreature.stats.getHpPercentage()
    );
    
    this.drawHealthBar(
      ctx,
      drawPosX + this.enemyHealthBar.position.x,
      drawPosY + this.enemyHealthBar.position.y,
      this.enemyHealthBar.width,
      this.enemyHealthBar.height,
      this.enemyCreature.stats.getHpPercentage()
    );
  }

  drawHealthBar(ctx, x, y, width, height, hpPercentage) {
    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, width, height);
    
    // Health bar color based on percentage
    let healthColor = "#4CAF50"; // Green
    if (hpPercentage < 50) healthColor = "#FF9800"; // Orange
    if (hpPercentage < 20) healthColor = "#F44336"; // Red
    
    // Health fill
    ctx.fillStyle = healthColor;
    const fillWidth = (width * hpPercentage) / 100;
    ctx.fillRect(x, y, fillWidth, height);
    
    // Border
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  drawActionMenu(ctx, drawPosX, drawPosY) {
    const menuX = drawPosX + 160;
    const menuY = drawPosY + 140;
    const menuWidth = 150;
    const menuHeight = 60;
    
    // Menu background
    ctx.fillStyle = "#222";
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Menu options
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    
    const options = this.actionOptions;
    for (let i = 0; i < options.length; i++) {
      const optionX = menuX + 10 + (i % 2) * 70;
      const optionY = menuY + 20 + Math.floor(i / 2) * 20;
      
      if (i === this.selectedIndex) {
        ctx.fillStyle = "#ffff00"; // Yellow for selected
        ctx.fillText("►", optionX - 15, optionY);
      }
      
      ctx.fillStyle = i === this.selectedIndex ? "#ffff00" : "#fff";
      ctx.fillText(options[i], optionX, optionY);
    }
  }

  drawMoveMenu(ctx, drawPosX, drawPosY) {
    const menuX = drawPosX + 20;
    const menuY = drawPosY + 140;
    const menuWidth = 280;
    const menuHeight = 80;
    
    // Menu background
    ctx.fillStyle = "#222";
    ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
    
    // Move options
    ctx.font = "10px Arial";
    
    const moves = this.moveOptions;
    for (let i = 0; i < Math.min(4, moves.length); i++) {
      const move = moves[i];
      const optionX = menuX + 10 + (i % 2) * 130;
      const optionY = menuY + 20 + Math.floor(i / 2) * 30;
      
      if (i === this.selectedIndex) {
        ctx.fillStyle = "#ffff00";
        ctx.fillText("►", optionX - 15, optionY);
      }
      
      // Move name
      ctx.fillStyle = i === this.selectedIndex ? "#ffff00" : "#fff";
      ctx.fillText(move.name, optionX, optionY);
      
      // PP count
      ctx.fillStyle = "#ccc";
      ctx.fillText(`${move.pp}/${move.maxPp}`, optionX, optionY + 12);
    }
    
    // Move description for selected move
    if (this.selectedIndex < moves.length) {
      const selectedMove = moves[this.selectedIndex];
      ctx.fillStyle = "#fff";
      ctx.font = "8px Arial";
      
      // Simple word wrap for description
      const words = selectedMove.description.split(' ');
      let line = '';
      let lineY = menuY + 65;
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > menuWidth - 20 && line !== '') {
          ctx.fillText(line, menuX + 10, lineY);
          line = word + ' ';
          lineY += 10;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, menuX + 10, lineY);
    }
  }
}