export const LEFT = "LEFT";
export const RIGHT = "RIGHT";
export const UP = "UP";
export const DOWN = "DOWN";

export class Input {
  constructor() {
    this.heldDirections = [];
    this.keys = {};
    this.lastKeys = {};
    this.virtualGamepad = null;

    this.setupKeyboardInput();
    this.setupVirtualGamepad();
  }

  setupKeyboardInput() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      this.handleDirectionInput(e.code, true);
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      this.handleDirectionInput(e.code, false);
    });
  }

  setupVirtualGamepad() {
    this.virtualGamepad = document.getElementById("virtual-gamepad");
    if (!this.virtualGamepad) return;

    // Handle D-pad buttons
    const dpadButtons = this.virtualGamepad.querySelectorAll(
      ".dpad-button[data-direction]"
    );
    dpadButtons.forEach((button) => {
      const direction = button.dataset.direction;

      // Touch events for mobile
      button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.onVirtualDirectionPressed(direction);
        button.classList.add("pressed");
      });

      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.onVirtualDirectionReleased(direction);
        button.classList.remove("pressed");
      });

      // Mouse events for desktop testing
      button.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.onVirtualDirectionPressed(direction);
        button.classList.add("pressed");
      });

      button.addEventListener("mouseup", (e) => {
        e.preventDefault();
        this.onVirtualDirectionReleased(direction);
        button.classList.remove("pressed");
      });

      button.addEventListener("mouseleave", (e) => {
        this.onVirtualDirectionReleased(direction);
        button.classList.remove("pressed");
      });
    });

    // Handle action buttons
    const actionButtons = this.virtualGamepad.querySelectorAll(
      ".action-button[data-key]"
    );
    actionButtons.forEach((button) => {
      const keyCode = button.dataset.key;

      // Touch events
      button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.keys[keyCode] = true;
        button.classList.add("pressed");
      });

      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.keys[keyCode] = false;
        button.classList.remove("pressed");
      });

      // Mouse events
      button.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.keys[keyCode] = true;
        button.classList.add("pressed");
      });

      button.addEventListener("mouseup", (e) => {
        e.preventDefault();
        this.keys[keyCode] = false;
        button.classList.remove("pressed");
      });

      button.addEventListener("mouseleave", (e) => {
        this.keys[keyCode] = false;
        button.classList.remove("pressed");
      });
    });
  }

  handleDirectionInput(keyCode, isPressed) {
    const directionMap = {
      ArrowUp: UP,
      KeyW: UP,
      ArrowDown: DOWN,
      KeyS: DOWN,
      ArrowLeft: LEFT,
      KeyA: LEFT,
      ArrowRight: RIGHT,
      KeyD: RIGHT,
    };

    const direction = directionMap[keyCode];
    if (direction) {
      if (isPressed) {
        this.onArrowPressed(direction);
      } else {
        this.onArrowReleased(direction);
      }
    }
  }

  onVirtualDirectionPressed(direction) {
    this.onArrowPressed(direction);
  }

  onVirtualDirectionReleased(direction) {
    this.onArrowReleased(direction);
  }

  get direction() {
    return this.heldDirections[0];
  }

  update() {
    this.lastKeys = { ...this.keys };
  }

  getActionJustPressed(keyCode) {
    return this.keys[keyCode] && !this.lastKeys[keyCode];
  }

  onArrowPressed(direction) {
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction);
    }
  }

  onArrowReleased(direction) {
    const index = this.heldDirections.indexOf(direction);
    if (index !== -1) {
      this.heldDirections.splice(index, 1);
    }
  }
}
