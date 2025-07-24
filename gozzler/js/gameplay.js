// MARK:BOARD
class Board {
  constructor(levelManager) {
    this.lvlMng = levelManager;
    this.level = levelManager.currentLevel;
    this.cellSize = levelManager.levelData["size"]["cell"];
    this.grid_x = levelManager.levelData["size"]["grid_x"];
    this.grid_y = levelManager.levelData["size"]["grid_y"];
    this.map = levelManager.levelData["map"];
    this.entitiesMap = levelManager.levelData["entities"];
    // this.playerPosition = { ...levelManager.levelData["player"] };
    this.goalPosition = { ...levelManager.levelData["goal"] };
    this.goalDOM = null;
    this.gemDOM = null;

    this.entityManager = null;
    // this.entityList = [];
    // this.movingEntityList = [];
  }
  draw() {
    // game-container
    // -- gameboard
    // ---- playground
    // ------ entities
    // ------ board

    this.entityManager = new EntityManager();
    // this.entityList = [];
    const playground = document.querySelector(".playground");

    const entities = document.createElement("div");
    entities.id = "entities";
    entities.style.width = `${this.grid_x * this.cellSize}px`;
    entities.style.height = `${this.grid_y * this.cellSize}px`;

    this.boardDOM = document.createElement("div");
    this.boardDOM.id = "board";
    this.boardDOM.style.gridTemplateColumns = `repeat(${this.grid_x}, ${this.cellSize}px)`;
    this.boardDOM.style.gridTemplateRows = `repeat(${this.grid_y}, ${this.cellSize}px)`;

    for (let y = 0; y < this.grid_y; y++) {
      for (let x = 0; x < this.grid_x; x++) {
        const cellBrdNum = this.map[y][x];
        const cellBrdType = this.lvlMng.boardSymbols[cellBrdNum];
        const cellBrd = CellFactory.createCell(cellBrdType, { x, y });
        const cellBrdElement = cellBrd.createDOMElement();
        cellBrdElement.style.width = `${this.cellSize}px`;
        cellBrdElement.style.height = `${this.cellSize}px`;
        this.boardDOM.appendChild(cellBrdElement);

        if (this.entitiesMap[y] && this.entitiesMap[y][x] !== 0) {
          const cellEntNum = this.entitiesMap[y][x];
          const cellEntType = this.lvlMng.entitySymbols[cellEntNum];
          const cellEntity = CellFactory.createCell(cellEntType, { x, y });
          const cellEntElement = cellEntity.createDOMElement();
          cellEntElement.style.width = `${this.cellSize}px`;
          cellEntElement.style.height = `${this.cellSize}px`;
          cellEntElement.style.left = `${x * this.cellSize}px`;
          cellEntElement.style.top = `${y * this.cellSize}px`;
          entities.appendChild(cellEntElement);

          // this.entityList.push(cellEntity);

          this.entityManager.addEntity(cellEntity);
          // Guardar referencia al DOM en la entidad para actualizaciones futuras
          cellEntity.domElement = cellEntElement;
        }
      }
    }

    this.goalDOM = document.createElement("div");
    this.goalDOM.className = "goal";
    this.goalDOM.style.width = `${this.cellSize}px`;
    this.goalDOM.style.height = `${this.cellSize}px`;
    this.goalDOM.style.left = `${this.goalPosition.x * this.cellSize}px`;
    this.goalDOM.style.top = `${this.goalPosition.y * this.cellSize}px`;
    this.gemDOM = document.createElement("div");
    this.gemDOM.className = "gem";
    this.gemDOM.style.width = `${this.cellSize}px`;
    this.gemDOM.style.height = `${this.cellSize}px`;
    this.gemDOM.style.left = `${this.goalPosition.x * this.cellSize}px`;
    this.gemDOM.style.top = `${this.goalPosition.y * this.cellSize}px`;

    this.goalDOM.appendChild(this.gemDOM);
    entities.appendChild(this.goalDOM);
    playground.appendChild(entities);
    playground.appendChild(this.boardDOM);
  }
  reset() {
    // Limpiar el tablero y las entidades
    this.boardDOM.innerHTML = "";
    // this.entityList = [];
    this.entityManager = new EntityManager();
    this.draw();
  }

  checkInteractions(position, direction) {
    const x = position.x + direction.x;
    const y = position.y + direction.y;
    if (x < 0 || x >= this.grid_x || y < 0 || y >= this.grid_y) {
      return true; // Fuera de los límites del tablero
    }

    console.log("buscando entidad en: x: " + x + ", y: " + y);
    
    // Obtener entidad en esa posición
    const entity = this.entityManager.getEntityAt(x, y);

    // Si no hay entidad, no hay colisión
    if (!entity) {
      console.log("No hay entidad en la posición: x: " + x + ", y: " + y);
      return false;
    }
    // Si hay una entidad, verificar si es caminable
    if (entity.isWalkable()) return false;

    if (entity.isBreakable()) {
      entity.activate();
      this.entityManager.entityActivated(entity);
    } else if (entity.isMovable()) {
      entity.activate(direction);
    }
    return true;
  }

  getCellType(x, y) {
    if (x < 0 || x >= this.grid_x || y < 0 || y >= this.grid_y) {
      return null; // Fuera de los límites del tablero
    }
    const cellType = this.entitiesMap[y][x];
    if (cellType === undefined) {
      return null; // Celda no definida
    }
    return this.lvlMng.symbols[cellType];
  }

  getCell(x, y) {
    if (x < 0 || x >= this.grid_x || y < 0 || y >= this.grid_y) {
      return null; // Fuera de los límites del tablero
    }

    const findCell = this.entityList.find(
      (cell) => cell.position.x === x && cell.position.y === y
    );
    return findCell || null; // Retorna la celda si existe, o null si no
  }

  checkCollision(position) {
    const cell = this.getCell(position.x, position.y);
    if (cell === null) {
      return false;
    }

    console.log("Se puede romper? " + cell.isBreakable());
    console.log("Cuál es su ID? " + cell.id);

    if (cell.isBreakable()) {
      // Si la celda es rompible, no hay colisión

      // Find and remove the cell from entityList
      const index = this.entityList.findIndex(
        (entity) => entity.id === cell.id
      );
      if (index !== -1) {
        this.entityList.splice(index, 1);
      }

      // Remove the cell's DOM element
      const cellElement = document.getElementById(cell.id);
      if (cellElement) {
        cellElement.remove();
      }
    }

    switch (cell.type) {
      case "brick":
      case "wall":
      case "box": // Depende de lo que haga con las cajas
      default:
        return true; // hay colisión
    }
  }
}

// MARK: ENTITIES
class EntityManager {
  constructor() {
    // Mapa de entidades usando coordenadas como clave: "x,y" -> entidad
    this.entities = new Map();
    // Lista separada de entidades para iterar fácilmente
    this.activeEntities = [];
  }

  // Añadir una entidad al gestor
  addEntity(entity) {
    console.log("entidad activa? "+ entity.isActive());
    
    const key = `${entity.position.x},${entity.position.y}`;
    this.entities.set(key, entity);
    if (entity.isActive()) {
      this.activeEntities.push(entity);
    }
    return entity;
  }

  entityActivated(entity) {
    this.activeEntities.push(entity);
  }

  entityDeactivated(entity) {
    const index = this.activeEntities.indexOf(entity);
    if (index !== -1) {
      this.activeEntities.splice(index, 1);
    }
  }

  updateActiveEntities() {
    this.activeEntities.forEach((entity) => {
      if (entity.toRemove) {
        // Si la entidad está marcada para eliminar, la quitamos
        this.removeEntity(entity);
      }
    });
  }


  // @TODO Actualizar la posición de una entidad
  updateEntityPosition(entity, oldPosition) {
    // Eliminar la entidad de la posición antigua
    const oldKey = `${oldPosition.x},${oldPosition.y}`;
    this.entities.delete(oldKey);

    // Añadir la entidad en la nueva posición
    const newKey = `${entity.position.x},${entity.position.y}`;
    this.entities.set(newKey, entity);
  }

  // Obtener entidad en una posición específica
  getEntityAt(x, y) {
    const key = `${x},${y}`;
    return this.entities.get(key) || null;
  }

  // Remover una entidad completamente
  removeEntity(entity) {
    const key = `${entity.position.x},${entity.position.y}`;
    this.entities.delete(key);

    const index = this.activeEntities.indexOf(entity);
    if (index !== -1) {
      this.activeEntities.splice(index, 1);
    }
  }

  // Verificar colisión en una posición
  checkCollision(x, y) {
    const entity = this.getEntityAt(x, y);
    return entity !== null;
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
  /* 
  Cada celda tiene un ID único, un tipo (floor, wall, brick, box, etc.) y una posición.
  La posición es un objeto con coordenadas { x, y }.
  La propiedad `count` es estática y se incrementa cada vez que se crea una nueva celda.
  Si es interactiva, puede activarse o desactivarse (polimorfismo).
  Si es activa, en cada movimiento se ejecuta su interacción.
   */
  static count = 0;
  // @nota Puede terminar con cifras astronómicas después de resetear o cargar varios niveles.
  constructor(type, position) {
    this.id = `cell-${Cell.count++}`;
    this.type = type;
    this.position = position; // { x: number, y: number }

    this.domElement = null;

    this.walkable = false;
    this.breakable = false;
    this.movable = false;
    this.lethal = false;
    this.interactive = false;
    this.active = false;
    this.toRemove = false; 
  }

  createDOMElement() {
    this.cellElement = document.createElement("div");
    this.cellElement.className = this.type;
    this.cellElement.id = this.id;
    return this.cellElement;
  }

  isBreakable() {
    return this.breakable;
  }

  isMovable() {
    return this.movable;
  }

  isWalkable() {
    return this.walkable;
  }

  isLethal() {
    return this.lethal;
  }

  isInteractive() {
    return this.interactive;
  }

  isActive() {
    return this.active;
  }
}

// MARK: CellFactory
// Factory para crear diferentes tipos de celdas
class CellFactory {
  static createCell(type, position) {
    switch (type) {
      case "floor":
      case "floor-player":
        return new FloorCell(type, position);
      case "wall":
        return new WallCell(type, position);
      case "brick":
        return new BrickCell(type, position);
      case "box":
        return new BoxCell(type, position);
      default:
        return new Cell(type, position);
    }
  }
}

// Clases específicas para cada tipo de celda
class FloorCell extends Cell {
  constructor(type, position) {
    super(type, position);
    this.walkable = true;
  }
}

class WallCell extends Cell {
  constructor(type, position) {
    super(type, position);
  }
}

/* class BrickCell extends Cell {
  constructor(type, position) {
    super(type, position);
    this.breakable = true;
  }
} */

class BrickCell extends Cell {
  constructor(type, position) {
    super(type, position);
    this.breakable = true;
    this.interactive = true;
    this.state = 1; // Estado inicial de la celda (2 = intacta, 1 = rompiendose, 0 = destruida)
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  interact() {
    switch (this.state) {
      case 2:
        console.log("Interacción con celda de ladrillo: estado 2 → 1");
        break;
      case 1:
        this.breakable = false; // Dejar de ser rompible
        
        this.cellElement.classList.add("breaking");
        console.log("Interacción con celda de ladrillo: estado 1 → 0");
        break;
      case 0:
        console.log("Interacción con celda de ladrillo: estado 0 → eliminado");
        this.interactive = false;
        this.deactivate();
        this.toRemove = true; // Marcar para eliminar
        this.cellElement.remove();
        break;
      default:
        break;
    }
    this.state--;
  }
}

class BoxCell extends Cell {
  constructor(type, position) {
    super(type, position);
    this.movable = true;
    this.direction = { x: 0, y: 0 };
    this.interactive = true;
  }

  activate(direction) {
    this.direction = direction;
    this.active = true;
    this;
  }
  deactivate() {
    this.active = false;
    this.direction = { x: 0, y: 0 };
  }
  interact() {
    this.position.x += this.direction.x;
    this.position.y += this.direction.y;
    this.isMoving = false;
    return this.position;
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

    switch (
      this.currentStateName // Usar currentStateName en vez de currentState
    ) {
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
