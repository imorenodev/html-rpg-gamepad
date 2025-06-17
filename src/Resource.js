// Import all of your image assets at the top of the file
import heroSrc from "/sprites/hero-sheet.png";
import shadowSrc from "/sprites/shadow.png";
import rodSrc from "/sprites/rod.png";
import exitSrc from "/sprites/exit.png";
import skySrc from "/sprites/sky.png";
import groundSrc from "/sprites/ground.png";
import caveSrc from "/sprites/cave-long.png";
import caveGroundSrc from "/sprites/cave-ground.png";
import knightSrc from "/sprites/knight-sheet-1.png";
import textBoxSrc from "/sprites/text-box.png";
import fontWhiteSrc from "/sprites/sprite-font-white.png";
import portraitsSrc from "/sprites/portraits-sheet.png";

class Resources {
  constructor() {
    // Everything we plan to download
    // Use the imported variables here instead of string paths
    this.toLoad = {
      hero: heroSrc,
      shadow: shadowSrc,
      rod: rodSrc,
      exit: exitSrc,
      // Outdoor
      sky: skySrc,
      ground: groundSrc,
      // Cave
      cave: caveSrc,
      caveGround: caveGroundSrc,
      // NPCs
      knight: knightSrc,
      // HUD
      textBox: textBoxSrc,
      fontWhite: fontWhiteSrc,
      portraits: portraitsSrc,
    };

    // A bucket to keep all of our images
    this.images = {};

    // Load each image
    Object.keys(this.toLoad).forEach(key => {
      const img = new Image();
      img.src = this.toLoad[key];
      this.images[key] = {
        image: img,
        isLoaded: false
      }
      img.onload = () => {
        this.images[key].isLoaded = true;
      }
    })
  }
}

// Create one instance for the whole app to use
export const resources = new Resources();
