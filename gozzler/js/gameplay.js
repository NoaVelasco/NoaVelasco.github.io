// MARK:BOARD
class Board {
  constructor(levelManager) {
    this.lvlMng = levelManager;
    this.level = levelManager.currentLevel;
    this.cell = levelManager.levelData["size"]["cell"];
    this.grid_x = levelManager.levelData["size"]["grid_x"];
    this.grid_y = levelManager.levelData["size"]["grid_y"];
    this.map = levelManager.levelData["map"];
    // this.playerPosition = { ...levelManager.levelData["player"] };
    this.goalPosition = { ...levelManager.levelData["goal"] };
    this.goalDOM = null;
    this.gemDOM = null;
  }
  draw() {
    // game-container
    // -- playground
    // ---- entities
    // ---- board

    const playground = document.querySelector(".playground");

    const entities = document.createElement("div");
    entities.id = "entities";
    entities.style.width = `${this.grid_x * this.cell}px`;
    entities.style.height = `${this.grid_y * this.cell}px`;

    this.boardDOM = document.createElement("div");
    this.boardDOM.id = "board";
    this.boardDOM.style.gridTemplateColumns = `repeat(${this.grid_x}, ${this.cell}px)`;
    this.boardDOM.style.gridTemplateRows = `repeat(${this.grid_y}, ${this.cell}px)`;

    for (let y = 0; y < this.grid_y; y++) {
      for (let x = 0; x < this.grid_x; x++) {
        const cellType = this.map[y][x];
        const cell = new Cell(cellType, { x, y });
        const cellElement = document.createElement("div");
        cellElement.className = this.lvlMng.symbols[cell.type];
        cellElement.style.width = `${this.cell}px`;
        cellElement.style.height = `${this.cell}px`;
        this.boardDOM.appendChild(cellElement);
      }
    }

    this.goalDOM = document.createElement("div");
    this.goalDOM.className = "goal";
    this.goalDOM.style.width = `${this.cell}px`;
    this.goalDOM.style.height = `${this.cell}px`;
    this.goalDOM.style.left = `${this.goalPosition.x * this.cell}px`;
    this.goalDOM.style.top = `${this.goalPosition.y * this.cell}px`;
    this.gemDOM = document.createElement("div");
    this.gemDOM.className = "gem";
    this.gemDOM.style.width = `${this.cell}px`;
    this.gemDOM.style.height = `${this.cell}px`;
    this.gemDOM.style.left = `${this.goalPosition.x * this.cell}px`;
    this.gemDOM.style.top = `${this.goalPosition.y * this.cell}px`;

    this.goalDOM.appendChild(this.gemDOM);
    entities.appendChild(this.goalDOM);
    playground.appendChild(entities);
    playground.appendChild(this.boardDOM);
  }

  getCellType(x, y) {
    if (x < 0 || x >= this.grid_x || y < 0 || y >= this.grid_y) {
      return null; // Fuera de los límites del tablero
    }
    const cellType = this.map[y][x];
    if (cellType === undefined) {
      return null; // Celda no definida
    }
    return this.lvlMng.symbols[cellType];
  }

  checkCollision(position) {
    const cellType = this.getCellType(position.x, position.y);
    if (cellType === null) {
      return false; // Fuera de los límites del tablero
    }
    switch (cellType) {
      case "floor":
      case "floor-player":
        return false;
      case "wall":
      case "box": // Depende de lo que haga con las cajas
      default:
        return true; // hay colisión
    }
  }
}

// MARK: PLAYER
class Player {
  constructor(levelData) {
    this.levelData = levelData;
    this.initPosX = levelData.player.x;
    this.initPosY = levelData.player.y;
    this.initFlipX = levelData.player.flipX;
    this.x = levelData.player.x;
    this.y = levelData.player.y;
    this.flipX = levelData.player.flipX; // true for left, false for right
    this.size = levelData.size.cell; // Tamaño de la celda
    this.container = null; // Contenedor del jugador en el DOM

    this.direction = { x: 0, y: 0 }; // Dirección de movimiento
  }

  // Implemento movimiento del jugador en Game, que maneja las colisiones
  move(direction) {
    if (direction.x > 0) {
      this.flipX = false; // derecha
    } else if (direction.x < 0) {
      this.flipX = true; // izquierda
    }
    this.container.className = this.flipX ? "left" : "right";
    this.x += direction.x;
    this.y += direction.y;
    this.container.style.left = `${this.x * this.size}px`;
    this.container.style.top = `${this.y * this.size}px`;
    console.log(`(PLAYER) Jugador movido a: (${this.x}, ${this.y})`);
  }

  placeOnBoard() {
    const existingPlayer = document.getElementById("player");
    if (existingPlayer) {
      existingPlayer.remove();
    }
    const entities = document.getElementById("entities");

    this.container = document.createElement("div");
    this.container.id = "player";

    this.x = this.initPosX;
    this.y = this.initPosY;

    this.initFlipX
      ? this.container.classList.add("left")
      : this.container.classList.add("right");

    this.container.style.width = `${this.size}px`;
    this.container.style.height = `${this.size}px`;
    this.container.style.left = `${this.initPosX * this.size}px`; // Posición X
    this.container.style.top = `${this.initPosY * this.size}px`;
    // this.container.style.transform = `translate(${this.x * this.size}px, ${this.y * this.size}px)`;
    entities.appendChild(this.container);
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }
}

// MARK: CELL
class Cell {
  constructor(type, position) {
    this.type = type;
    this.position = position; // { x: number, y: number }
    this.hasFixedPos = (() => {
      switch (type) {
        case "floor":
        case "wall":
          return true;
        case "box": // Ejemplo. Puede ser otro tipo de celda
        default:
          return false;
      }
    })(); // Immediately invoked function to evaluate the switch

    // Implementar patrón de diseño Factory para crear celdas
  }
}

// MARK: MOVES
class MovesManager {
  constructor(infoMoves) {
    this.moveQueue = [];
    this.minMoves = infoMoves.min || 5;
    this.medMoves = infoMoves.med || 10;
    this.maxMoves = infoMoves.max || 15; // Número máximo de movimientos permitidos
    this.usedMoves = 0;
    console.log(
      `Configuración de movimientos: min=${this.minMoves}, med=${this.medMoves}, max=${this.maxMoves}`
    );
  }

  addMove(move) {
    this.moveQueue.push(move);
    this.usedMoves++;
    console.log(`Movimiento añadido: ${JSON.stringify(move)}`);
  }

  clearQueue(full = true) {
    this.moveQueue = [];
    if (full) {
      this.usedMoves = 0;
    }
  }
  getNextMove() {
    return this.moveQueue.shift();
  }

  hasMoves() {
    return this.moveQueue.length > 0;
  }

  getMoveQueue() {
    return this.moveQueue;
  }
  getQueueLength() {
    return this.moveQueue.length;
  }

  /*   getDirFromIndex(index) {
    if (index < 0 || index >= this.moveQueue.length) {
      console.error("Índice fuera de rango");
      return null;
    }
    return this.moveQueue[index];
  } */

  // Ya veré si lo necesito
  /*   getCurrentMove() {
    return this.currentMove;
  } */
}

// MARK: ESTADOS

// Estados de gameplay interno
const GameplayStates = {
  WAITING_INPUT: "waitingInput",
  ANIMATION: "animation",
  CHECKING: "checking",
  LEVEL_CLEARED: "levelCleared",
  LEVEL_FAILED: "levelFailed",
};

const GameplayEvents = {
  INPUT_RECEIVED: "inputReceived",
  ANIMATION_COMPLETE: "animationComplete",
  GOAL_ACHIEVED: "goalAchieved",
  FAILED: "failed",
};

// MARK: FSM GAME

class GameplayStateMachine {
  constructor(parentFSM) {
    this.parentFSM = parentFSM;
    // Por emular la lógica de la FSM Global, antes había un currentState
    // que se usaba igual que currentStateName.
    this.currentStateName = null;
    this.isActive = false; // IMPORTANTE: Controla si la FSM está activa
  }

  start() {
    this.isActive = true;
    this.changeState(GameplayStates.WAITING_INPUT);
  }

  // Pausar sin cambiar el estado interno
  pause() {
    console.log(`  Gameplay pausado en estado: ${this.currentStateName}`);
    this.isActive = false;
    // El estado se mantiene, solo se desactiva el procesamiento
  }

  // Reanudar desde el mismo estado
  resume() {
    console.log(`  Gameplay reanudado en estado: ${this.currentStateName}`);
    this.isActive = true;
    // Reactivar el estado actual sin cambiarlo
    this.handleGameplayState();
  }

  // Terminar completamente la FSM
  stop() {
    console.log(`  Gameplay terminado desde estado: ${this.currentStateName}`);
    this.isActive = false;
    this.currentStateName = null;
  }

  changeState(newStateName) {
    if (!this.isActive) return;

    console.log(
      `  Gameplay: ${this.currentStateName || "null"} → ${newStateName}`
    );
    this.currentStateName = newStateName;

    this.handleGameplayState();
  }

  handleGameplayState() {
    if (!this.isActive) return;

    switch (this.currentStateName) { // Usar currentStateName en vez de currentState
      case GameplayStates.WAITING_INPUT:
        console.log("    Esperando input del jugador...");
        break;
      case GameplayStates.ANIMATION:
        console.log("    Procesando turno del jugador...");
        break;
      case GameplayStates.CHECKING:
        console.log("    Comprobando condiciones de victoria...");
        // console.log(this.parentFSM.states[GameStates.PLAYING]);
        this.parentFSM.states["playing"].checkWinCondition();
        break;
      case GameplayStates.LEVEL_CLEARED:
        console.log("    Nivel completado!");
        // const movesManager = this.parentFSM.states[GameStates.PLAYING].movesManager;
        // this.parentFSM.handleEvent(GameEvents.LEVEL_COMPLETED, {movesManager: movesManager});
        // this.parentFSM.handleEvent(GameEvents.LEVEL_COMPLETED);
        this.notifyParent("levelCompleted");
        this.stop(); // Terminar la FSM al completar el nivel
        break;
      case GameplayStates.LEVEL_FAILED:
        console.log("    Nivel fallido!");
        // this.parentFSM.handleEvent("levelFailed");
        this.notifyParent("levelFailed");
        this.stop(); // Terminar la FSM al fallar el nivel
        break;
    }
  }

  handleEvent(event) {
    if (!this.isActive) return; // No procesar eventos si está pausada

    // Lógica de transiciones del gameplay
    switch (this.currentStateName) {
      case GameplayStates.WAITING_INPUT:
        if (event === GameplayEvents.INPUT_RECEIVED) {
          this.changeState(GameplayStates.ANIMATION);
        }
        break;
      case GameplayStates.ANIMATION:
        if (event === GameplayEvents.ANIMATION_COMPLETE) {
          this.changeState(GameplayStates.CHECKING);
        }
        break;
      case GameplayStates.CHECKING:
        if (event === GameplayEvents.GOAL_ACHIEVED) {
          this.changeState(GameplayStates.LEVEL_CLEARED);
        } else if (event === GameplayEvents.FAILED) {
          this.changeState(GameplayStates.LEVEL_FAILED);
        }
        break;
    }
  }

  // Método para comunicarse con la FSM padre
  notifyParent(event) {
    if (this.isActive) {
      // Solo notificar si está activa
      this.parentFSM.handleEvent(event);
    }
  }

  // Getter para saber el estado actual
  getCurrentState() {
    return this.currentStateName;
  }
}

export {
  Board,
  Player,
  Cell,
  MovesManager,
  GameplayStateMachine,
  GameplayStates,
  GameplayEvents,
};
