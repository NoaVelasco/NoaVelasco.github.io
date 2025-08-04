import { EventSystem, EntityEvents, MovementSystem } from "./systems.js";
import { EntityFactory } from "./entities.js";

// MARK:BOARD

class Board {
  #levelManager;
  #entities = new Map(); // Mapa de entidades por ID
  #grid1 = []; // Grid para acceso rápido por posición
  #grid2 = []; // Grid para acceso rápido por posición
  #movementSystem;
  #events;
  player;

  constructor(levelManager) {
    this.#levelManager = levelManager;
    this.#events = EventSystem.getInstance();

    this.cellSize = levelManager.levelData.size.cell;
    this.width = levelManager.levelData.size.grid_x;
    this.height = levelManager.levelData.size.grid_y;
    this.lvlFloorGrid = levelManager.levelData.floor_grid;
    this.lvlEntitiesGrid = levelManager.levelData.entities_grid;
    this.goalPosition = { ...levelManager.levelData.goal };

    // Inicializar grid para búsqueda rápida de entidades
    for (let y = 0; y < this.height; y++) {
      this.#grid1[y] = [];
      this.#grid2[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.#grid1[y][x] = null;
        this.#grid2[y][x] = null;
      }
    }
  }

  draw() {
    const entitiesDOM = document.getElementById("entities_grid");
    entitiesDOM.style.width = `${this.width * this.cellSize}px`;
    entitiesDOM.style.height = `${this.height * this.cellSize}px`;

    const boardDOM = document.getElementById("floor_grid");
    boardDOM.style.gridTemplateColumns = `repeat(${this.width}, ${this.cellSize}px)`;
    boardDOM.style.gridTemplateRows = `repeat(${this.height}, ${this.cellSize}px)`;

    // Crear entidades según el mapa
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const floorType = this.getCellType(x, y, 1);

        if (floorType) {
          const floorEntity = EntityFactory.createEntityType(
            floorType,
            x,
            y,
            this.cellSize
          );
          if (floorEntity) {
            this.addEntity(floorEntity, 1);
          }
        }

        // Crear entidad según el tipo de celda
        const entityType = this.getCellType(x, y, 2);
        if (entityType) {
          const topEntity = EntityFactory.createEntityType(
            entityType,
            x,
            y,
            this.cellSize,
            this
          );

          if (topEntity) {
            this.addEntity(topEntity);
          }
        }
      }
    }

    // console.log(Entity.usedIds);

    // Crear meta/objetivo
    const goal = EntityFactory.createGoal(
      this.goalPosition.x,
      this.goalPosition.y,
      this.cellSize,
      this
    );
    this.addEntity(goal);

    // Crear jugador
    this.player = EntityFactory.createPlayer(
      this.#levelManager.levelData.player.x,
      this.#levelManager.levelData.player.y,
      this.cellSize,
      this.#levelManager.levelData.player.flipX,
      this
    );
    this.addEntity(this.player);
    console.log("Jugador creado:", this.player);
    console.log(typeof this.player);

    // const counter = EntityFactory.createCounter();
    // this.addEntity(counter);

    // Inicializar todas las entidades
    this.#entities.forEach((entity) => entity.init());
    this.#movementSystem = new MovementSystem(this);
  }

  addEntity(entity, level = 2) {
    // Guardar en el mapa de entidades
    this.#entities.set(entity.id, entity);

    // Si tiene posición, también guardarlo en el grid
    if (entity.hasComponent("Position")) {
      const pos = entity.getComponent("Position");
      if (level === 1) {
        this.#grid1[pos.y][pos.x] = entity;
      } else {
        this.#grid2[pos.y][pos.x] = entity;

        // Suscribirse a los cambios de posición para actualizar el grid
        this.#events.subscribe(EntityEvents.ENTITY_MOVED, (data) => {
          if (data.entity === entity) {
            // Actualizar grid
            this.#grid2[data.prevPosition.y][data.prevPosition.x] = null;
            this.#grid2[data.position.y][data.position.x] = entity;
          }
        });

        // Suscribirse a la destrucción de la entidad para limpiar el grid
        this.#events.subscribe(EntityEvents.ENTITY_DESTROYED, (data) => {
          if (data.entity === entity && entity.hasComponent("Position")) {
            const position = entity.getComponent("Position");
            // Limpiar la posición en el grid
            this.#grid2[position.y][position.x] = null;
            console.log(`Entidad ${entity.id} eliminada del grid en (${position.x}, ${position.y})`);
          }
        });
      }
    }
  }


  getEntityAt(x, y, level = 2) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    switch (level) {
      case 1:
        return this.#grid1[y][x];
      case 2:
        return this.#grid2[y][x];
      default:
        return null;
    }
  }

  getCellType(x, y, level) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }

    let cellType = null;
    switch (level) {
      case 1:
        cellType = this.lvlFloorGrid[y][x];
        if (cellType === undefined) {
          return null;
        }

        return this.#levelManager.floorSymbols[cellType];
      case 2:
        cellType = this.lvlEntitiesGrid[y][x];
        if (cellType === undefined) {
          return null;
        }

        return this.#levelManager.entitySymbols[cellType];
      default:
        break;
    }

    return null;
  }

  getActiveEntities() {
    return (Array.from(this.#entities.values()).filter(
      (entity) => entity.isActive() && entity.id !== "player"
    ));
  }



  isGoalAchieved() {
    if (!this.player || !this.player.hasComponent("Position")) {
      return false;
    }

    const playerPos = this.player.getComponent("Position");

    if (
      playerPos.x === this.goalPosition.x &&
      playerPos.y === this.goalPosition.y
    ) {
      return true;
    }
    return false;
  }

  async startMovementSystem(moves) {
    console.log(typeof this.player);

    await this.#movementSystem.loop(moves);
  }

  reset() {
    console.warn("Reiniciando el tablero...");
    
    // Eliminar todas las entidades
    this.#entities.forEach((entity) => entity.destroy());
    this.#entities.clear();

    // Reiniciar grid
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.#grid1[y][x] = null;
        this.#grid2[y][x] = null;
      }
    }

    // Redibujar el tablero
    // this.draw();
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

    switch (this.currentStateName) {
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
  MovesManager,
  GameplayStateMachine,
  GameplayStates,
  GameplayEvents,
};
