import { ui, createInfoModal } from "./ui.js";
import { LevelManager } from "./levels.js";
import * as gameplay from "./gameplay.js";
import { GameplayEvents } from "./gameplay.js";

// Estados del juego
const GameStates = {
  INTRO: "intro",
  LEVEL_SELECT: "levelSelect",
  PLAYING: "playing",
  PAUSED: "paused",
  LEVEL_COMPLETE: "levelComplete",
  LEVEL_FAIL: "levelFail",
};

// Eventos que pueden provocar transiciones
const GameEvents = {
  START_GAME: "startGame",
  LEVEL_SELECTED: "levelSelected",
  PAUSE_GAME: "pauseGame",
  RESUME_GAME: "resumeGame",
  LEVEL_COMPLETED: "levelCompleted",
  LEVEL_FAILED: "levelFailed",
  //no necesito estos eventos (repetidos), pero mejoran legibilidad:
  RETRY_LEVEL: "retryLevel",
  SELECT_NEXT_LEVEL: "selectNextLevel",
  BACK_TO_MENU: "backToMenu",
};

// MARK: ESTADOS

// INTRO STATE ----------------------------------------------------------
// INTRO STATE ----------------------------------------------------------
// INTRO STATE ----------------------------------------------------------
// MARK: Intro
class IntroState {
  constructor(fsm) {
    this.fsm = fsm;
    this.boundHandlers = {}; // Para mantener referencias a los handlers
  }

  enter() {
    console.log("Mostrando pantalla de presentación");

    ui("IntroState");

    // Configurar listeners (guardando referencias para poder limpiarlos)
    this.boundHandlers.startGame = () => {
      this.fsm.handleEvent(GameEvents.START_GAME);
    };

    document
      .querySelector("#play")
      .addEventListener("click", this.boundHandlers.startGame);

    document
      .querySelector("#how-to-play")
      .addEventListener("click", () => this.showAbout());
  }

  showAbout() {
    let divModal = document.createElement("div");

    const infoModal = createInfoModal(divModal);
    // helpModal.style.display = "none";
    // helpModal.style.display = "flex";
    document.body.appendChild(infoModal);
    document
      .querySelector(".exit-btn")
      ?.addEventListener("click", () => this.closeAbout());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAbout();
      }
    });
  }

  closeAbout() {
    const helpModal = document.querySelector(".modal-overlay");
    if (helpModal) {
      helpModal.remove();
    }
  }

  update() {
    // Para DOM, esto puede estar vacío o manejar animaciones
  }

  handleInput(event) {
    if (event === GameEvents.START_GAME) {
      return GameStates.LEVEL_SELECT;
    }
    return null;
  }

  exit() {
    console.log("Saliendo de la pantalla de presentación");

    // IMPORTANTE: Limpiar listeners
    document
      .querySelector("#play")
      .removeEventListener("click", this.boundHandlers.startGame);

    document
      .querySelector("#how-to-play")
      .removeEventListener("click", () => this.showAbout());
    document
      .querySelector(".exit-btn")
      ?.removeEventListener("click", () => this.closeAbout());

    // Limpiar referencias
    this.boundHandlers = {};

    // Limpiar el contenedor del juego
    const gameContainer = document.getElementById("game-container");
    while (gameContainer.firstChild) {
      gameContainer.removeChild(gameContainer.firstChild);
    }
  }
}

// LEVEL SELECT STATE -----------------------------------------------------
// LEVEL SELECT STATE -----------------------------------------------------
// LEVEL SELECT STATE -----------------------------------------------------
// MARK: Level
class LevelSelectState {
  constructor(fsm) {
    this.fsm = fsm;
    this.boundHandlers = {}; // Para mantener referencias a los handlers
    this.levelSelectDOM = null; // Referencia al selector de niveles
  }
  enter() {
    console.log("Mostrando selección de niveles");
    // Delega a UI para mostrar niveles disponibles

    ui("LevelSelectState");

    this.drawLevelSelection();

    this.boundHandlers.levelSelect = () => {
      const selectedLevel = parseInt(this.levelSelectDOM.value);
      console.log(`Nivel seleccionado: ${selectedLevel}`);

      this.fsm.handleEvent(GameEvents.LEVEL_SELECTED, { level: selectedLevel });
    };

    document
      .querySelector("#play-selected")
      .addEventListener("click", this.boundHandlers.levelSelect);
    document
      .querySelector("#menu-icon")
      .addEventListener("click", () => this.showAbout());
  }

  showAbout() {
    let divModal = document.createElement("div");
    const infoModal = createInfoModal(divModal);
    // helpModal.style.display = "none";
    // helpModal.style.display = "flex";
    document.body.appendChild(infoModal);
    document
      .querySelector(".exit-btn")
      ?.addEventListener("click", () => this.closeAbout());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAbout();
      }
    });
  }

  closeAbout() {
    const helpModal = document.querySelector(".modal-overlay");
    if (helpModal) {
      helpModal.remove();
    }
  }

  drawLevelSelection() {
    if (this.levelSelectDOM) {
      this.levelSelectDOM.innerHTML = "";
    } else {
      // UI maneja la presentación de niveles
      this.levelSelectDOM = document.createElement("select");
      this.levelSelectDOM.id = "level-select";

      for (let i = 1; i <= levelManager.getLevelCount(); i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Level ${i}`;
        this.levelSelectDOM.appendChild(option);
      }
      const uiDiv = document.getElementById("ui");
      const startLevelButton = document.createElement("button");
      startLevelButton.id = "play-selected";
      startLevelButton.textContent = "PLAY LEVEL";
      uiDiv.appendChild(this.levelSelectDOM);
      uiDiv.appendChild(startLevelButton);
    }
  }

  handleInput(event) {
    switch (event) {
      case GameEvents.LEVEL_SELECTED:
        return GameStates.PLAYING;
      case GameEvents.BACK_TO_MENU:
        return GameStates.INTRO;
      default:
        return null;
    }
  }

  exit() {
    console.log("Nivel seleccionado, iniciando juego");
    document
      .querySelector("#play-selected")
      .removeEventListener("click", this.boundHandlers.levelSelect);
    document
      .querySelector(".exit-btn")
      ?.removeEventListener("click", () => this.closeAbout());

    // Limpiar referencias
    this.boundHandlers = {};
    this.levelSelectDOM = null;
    // Limpiar el contenedor del juego
    const gameContainer = document.getElementById("game-container");
    while (gameContainer.firstChild) {
      gameContainer.removeChild(gameContainer.firstChild);
    }
  }
}

// PLAYING STATE ---------------------------------------------------------
// PLAYING STATE ---------------------------------------------------------
// PLAYING STATE ---------------------------------------------------------
// MARK: Play
// @nota Todavía ha veces que por alguna razón se queda pillado el _showingAbout en true.
class PlayingState {
  constructor(fsm) {
    this.fsm = fsm;
    this.boundHandlers = {};
    this.currentLevel = 1;
    this.board = null;
    this.player = null; // Referencia al jugador
    this.movesManager = null;
    // @nota Creo que este atributo es innecesario si manejamos el estado de Gameplay "waitingInput".
    // this._executingMovements = false; // Para controlar la ejecución de movimientos
    this._showingAbout = false; // Para controlar si se está mostrando el modal de ayuda
    this.MOVE_TIME = 200;
  }

  enter(data) {
    if (this.board && data && data.fromPause) {
      console.log("PlayingState.enter(data.fromPause): Reanudando desde pausa");
      // this.fsm.gameplayFSM.resume();
    } else {
      if (data && data.level) {
        console.log(
          `PlayingState.enter(data.level): Cargando nivel ${data.level}`
        );
        this.currentLevel = data.level;
        levelManager.loadLevel(this.currentLevel);
        this.board = new gameplay.Board(levelManager);
        this.player = new gameplay.Player(levelManager.levelData);
        this.movesManager = new gameplay.MovesManager(
          levelManager.levelData["moves"]
        );
        console.log(
          `Creado manager de movimientos con ${this.movesManager.maxMoves} movimientos máx.`
        );
      }
      // Mostrar UI de juego
      let dataUI = ui("PlayingState");
      // const statusInfo = document.getElementById("status-info");

      dataUI.levelInfo.textContent = `Level ${this.currentLevel} - ${levelManager.levelData.title}`;
      if (dataUI.statusInfo) {
        dataUI.statusInfo.innerHTML += `<span id="max-moves">[${levelManager.levelData.moves.max}]</span>`;
      }

      this.board.draw();
      this.player.placeOnBoard();

      this.movesManager.clearQueue();
      this.clearMovesDisplay();

      // Inicializar FSM de gameplay anidada
      this.fsm.gameplayFSM.start();

      if (levelManager.levelData.message) {
        let message = levelManager.levelData.message.text;
        let type = levelManager.levelData.message.type || "info";
        simpleNotification(message, type);
      }
    }

    console.log(`PlayingState.enter() with data: ${JSON.stringify(data)}`);

    // Configurar listeners específicos del gameplay
    this.boundHandlers.keydown = (e) => {
      console.log(this._showingAbout);

      // if (this._showingAbout) {
      //   if (e.key === "Escape") {
      //     e.preventDefault();
      //     this.closeAbout();
      //   }
      //   return; // Ignorar cualquier otra tecla mientras se muestra el modal
      // }

      if (
        !this._showingAbout &&
        this.fsm.gameplayFSM.getCurrentState() === "waitingInput"
      ) {
        // Solo permitir entrada cuando estamos en estado de espera
        switch (e.key) {
          case "ArrowUp":
            this.addMoveAndShow("UP");
            break;
          case "ArrowDown":
            this.addMoveAndShow("DOWN");
            break;
          case "ArrowLeft":
            this.addMoveAndShow("LEFT");
            break;
          case "ArrowRight":
            this.addMoveAndShow("RIGHT");
            break;
          case "Escape":
            this.fsm.handleEvent(GameEvents.PAUSE_GAME);
            break;
          case "Enter":
            e.preventDefault(); // Prevenir comportamiento por defecto
            // if (!this._executingMovements) {
            this.executeMovements();
            // }
            break;
          case " ": // Barra espaciadora
            this.fsm.handleEvent(GameEvents.PAUSE_GAME);
            break;
          case "r": // Reiniciar
            this.resetLevel();
            break;
          default:
            break;
        }
      }
    };

    this.boundHandlers.buttonClick = (e) => {
      if (this.fsm.gameplayFSM.getCurrentState() === "waitingInput") {
        const target = e.target;

        if (
          target.classList.contains("direction-btn") &&
          this.movesManager.getQueueLength() < this.movesManager.maxMoves
        ) {
          this.addMoveAndShow(target.id);
        } else if (target.classList.contains("execute-btn")) {
          this.executeMovements();
        } else if (target.classList.contains("reset-btn")) {
          this.resetLevel();
        }
      }
    };

    this.boundHandlers.pauseClick = () => {
      if (this.fsm.gameplayFSM.getCurrentState() === "waitingInput") {
        this.fsm.handleEvent(GameEvents.PAUSE_GAME);
      }
    };

    document.addEventListener("keydown", this.boundHandlers.keydown);
    document
      .querySelector("#controls")
      ?.addEventListener("click", this.boundHandlers.buttonClick);
    document
      .querySelector("#pause-icon")
      ?.addEventListener("click", this.boundHandlers.pauseClick);

    document.querySelector("#menu-icon").addEventListener("click", () => {
      if (
        this.fsm.gameplayFSM.getCurrentState() === "waitingInput" &&
        !this._showingAbout
      ) {
        this.showAbout();
      }
    });
  }

  showAbout() {
    let divModal = document.createElement("div");
    let infoModal = createInfoModal(divModal);
    document.body.appendChild(infoModal);
    this._showingAbout = true;

    // Handler específico para cerrar el modal
    this.boundHandlers.closeModalButton = () => {
      this.closeAbout();
    };

    this.boundHandlers.escapeModal = (e) => {
      if (e.key === "Escape" && this._showingAbout) {
        e.preventDefault(); // Prevenir comportamiento por defecto
        e.stopPropagation(); // Evitar que llegue al listener principal
        this.closeAbout();
      }
    };

    document
      .querySelector(".exit-btn")
      .addEventListener("click", this.boundHandlers.closeModalButton);

    // Agregar listener temporal para Escape solo en el modal
    document.addEventListener("keydown", this.boundHandlers.escapeModal);
  }

  closeAbout() {
    const helpModal = document.querySelector(".modal-overlay");
    if (helpModal) {
      helpModal.remove();
      this._showingAbout = false;
    }
    // Eliminar los event listeners específicos del modal
    document
      .querySelector(".exit-btn")
      ?.removeEventListener("click", this.boundHandlers.closeModalButton);

    document.removeEventListener("keydown", this.boundHandlers.escapeModal);
  }

  addMoveAndShow(direction) {
    console.log(`Intentando añadir movimiento: ${direction}`);
    if (this.movesManager.getQueueLength() >= this.movesManager.maxMoves) {
      console.warn("Máximo de movimientos alcanzado");
      return;
    }

    console.log(`Añadiendo movimiento: ${direction}`);

    switch (direction) {
      case "UP":
        this.movesManager.addMove({ x: 0, y: -1 });
        this.addArrowToUI("↑");
        break;
      case "DOWN":
        this.movesManager.addMove({ x: 0, y: 1 });
        this.addArrowToUI("↓");
        break;
      case "LEFT":
        this.movesManager.addMove({ x: -1, y: 0 });
        this.addArrowToUI("←");
        break;
      case "RIGHT":
        this.movesManager.addMove({ x: 1, y: 0 });
        this.addArrowToUI("→");
        break;
      default:
        break;
    }
  }

  addArrowToUI(arrow) {
    const moveItem = document.createElement("span");
    moveItem.className = "move-item";
    moveItem.textContent = arrow;

    const movesDisplay = document.getElementById("moves-display");
    if (movesDisplay) {
      movesDisplay.appendChild(moveItem);
    }

    // Actualizar contador de movimientos
    this.updateMovesCounter();
  }

  // Actualizar el contador de movimientos
  updateMovesCounter() {
    const counter = document.querySelector("#max-moves");
    if (counter) {
      counter.textContent = ` [${this.movesManager.getQueueLength()}/${
        this.movesManager.maxMoves
      }]`;
    }
  }

  // Limpiar el display de movimientos
  clearMovesDisplay() {
    const movesDisplay = document.getElementById("moves-display");
    if (movesDisplay) {
      movesDisplay.innerHTML = "";
    }
    this.updateMovesCounter();
  }

  // MARK: moves
  async executeMovements() {
    // Evitar múltiples ejecuciones simultáneas
    // if (this._executingMovements) {
    //   console.warn("Ya hay movimientos ejecutándose");
    //   return;
    // }

    if (!this.movesManager.hasMoves()) {
      console.warn("No hay movimientos para ejecutar");
      simpleNotification("There are no moves to execute.", "error");
      return;
    }

    try {
      // Marcar que estamos ejecutando movimientos
      // this._executingMovements = true;

      const statusInfo = document.getElementById("status-info");
      if (statusInfo) {
        statusInfo.innerHTML = `<span class="status">PHASE 2: Crashing against the walls...</span>`;
      }
      this.fsm.gameplayFSM.handleEvent(GameplayEvents.INPUT_RECEIVED);

      const movesDisplay = document.getElementById("moves-display");

      // Crear una copia de los movimientos para evitar problemas si la cola se modifica
      const movesCopy = [...this.movesManager.getMoveQueue()];

      // Limpiamos la cola original para evitar ejecuciones duplicadas
      // Pero pasamos false para mantener usedMoves
      this.movesManager.clearQueue(false);

      for (const move of movesCopy) {
        if (movesDisplay && movesDisplay.children[0]) {
          movesDisplay.children[0].classList.add("current");
        }

        if (
          !move ||
          typeof move.x === "undefined" ||
          typeof move.y === "undefined"
        ) {
          console.error("Error: Se encontró un movimiento inválido", move);
          continue;
        }

        await this.movePlayer(move);
        await new Promise((resolve) => setTimeout(resolve, this.MOVE_TIME * 2));

        if (movesDisplay && movesDisplay.children[0]) {
          movesDisplay.children[0].classList.remove("current");
          movesDisplay.children[0].remove();
        }
      }

      console.log("Secuencia de movimientos ejecutada.");
      this.fsm.gameplayFSM.handleEvent(GameplayEvents.ANIMATION_COMPLETE);
    } catch (error) {
      console.error("Error durante la ejecución de movimientos:", error);
      /* } finally {
      // Siempre limpiar el flag de ejecución al terminar
      this._executingMovements = false; */
    }
  }

  /*   async movePlayer(direction) {
    // Verificar que direction es válido
    if (
      !direction ||
      typeof direction.x === "undefined" ||
      typeof direction.y === "undefined"
    ) {
      console.error("Error: Dirección inválida en movePlayer:", direction);
      return; // Salir temprano si la dirección no es válida
    }

    let nextX = this.player.getPosition().x + direction.x;
    let nextY = this.player.getPosition().y + direction.y;

    // Seguir moviendo mientras no haya colisión
    while (!this.board.checkCollision({ x: nextX, y: nextY })) {
      await new Promise((resolve) => {
        setTimeout(() => {
          this.player.move(direction);

          // Notificación al pasar por la meta sin TERMINAR
          if (
            this.player.getPosition().x === this.board.goalPosition.x &&
            this.player.getPosition().y === this.board.goalPosition.y &&
            !this.board.checkCollision({
              x: this.player.getPosition().x + direction.x,
              y: this.player.getPosition().y + direction.y,
            })
          ) {
            simpleNotification(
              "Uh… Almost there! But you must finish your movement JUST over the goal!",
              "info"
            );
          }
          resolve();
        }, this.MOVE_TIME);
      });

      nextX = this.player.getPosition().x + direction.x;
      nextY = this.player.getPosition().y + direction.y;
    }
  } */
  async movePlayer(direction) {
    // Verificar que direction es válido
    if (
      !direction ||
      typeof direction.x === "undefined" ||
      typeof direction.y === "undefined"
    ) {
      console.error("Error: Dirección inválida en movePlayer:", direction);
      return; // Salir temprano si la dirección no es válida
    }

    // Seguir moviendo mientras no haya colisión
    while (
      !this.board.checkInteractions(this.player.getPosition(), direction)
    ) {
      await new Promise((resolve) => {
        setTimeout(() => {
          this.player.move(direction);

          resolve();
        }, this.MOVE_TIME);
      });
      if (this.board.entityManager.activeEntities.length > 0) {
        console.log(
          `Interacting with ${this.board.entityManager.activeEntities.length} entities`
        );

        this.board.entityManager.activeEntities.forEach((entity) => {
          entity.interact();
        });
        this.board.entityManager.updateActiveEntities();
      }
    }
    if (this.board.entityManager.activeEntities.length > 0) {
      console.log(
        `Interacting with ${this.board.entityManager.activeEntities.length} entities`
      );

      this.board.entityManager.activeEntities.forEach((entity) => {
        entity.interact();
      });
      this.board.entityManager.updateActiveEntities();
    }
  }

  checkWinCondition() {
    const playerPos = this.player.getPosition();
    const goalPos = this.board.goalPosition;

    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
      console.log("¡Objetivo alcanzado!");
      this.fsm.gameplayFSM.handleEvent(GameplayEvents.GOAL_ACHIEVED);
      // this.fsm.handleEvent(GameEvents.LEVEL_COMPLETED);
    } else {
      console.log("Objetivo no alcanzado, nivel fallido");
      this.fsm.gameplayFSM.handleEvent(GameplayEvents.FAILED);
      // this.fsm.handleEvent(GameEvents.LEVEL_FAILED);
    }
  }

  resetLevel() {
    console.warn("Reseteando nivel");

    this.movesManager.clearQueue();
    this.clearMovesDisplay();
    this.player.placeOnBoard();
    this.fsm.gameplayFSM.start();
    // this.board.reset();
  }

  handleInput(event) {
    switch (event) {
      case GameEvents.PAUSE_GAME:
        return GameStates.PAUSED;
      case GameEvents.LEVEL_COMPLETED:
        return GameStates.LEVEL_COMPLETE;
      case GameEvents.LEVEL_FAILED:
        return GameStates.LEVEL_FAIL;
      default:
        return null;
    }
  }

  exit() {
    console.log("Pausando o terminando gameplay");

    // Ocultar UI de juego
    // document.querySelector(".screen-playing").style.display = "none";

    // Limpiar listeners
    document.removeEventListener("keydown", this.boundHandlers.keydown);
    document
      .querySelector("#controls")
      ?.removeEventListener("click", this.boundHandlers.buttonClick);
    document
      .querySelector(".exit-btn")
      ?.removeEventListener("click", () => this.closeAbout());
    document
      .querySelector("#pause-icon")
      ?.removeEventListener("click", this.boundHandlers.pauseClick);
    this.boundHandlers = {};
  }
}

// // PAUSED STATE ---------------------------------------------------------
// // PAUSED STATE ---------------------------------------------------------
// // PAUSED STATE ---------------------------------------------------------
// MARK: Pause

class PausedState {
  constructor(fsm) {
    this.fsm = fsm;
    this.boundHandlers = {};
  }

  enter() {
    console.log("Juego pausado");
    console.log(
      `Estado de gameplay preservado: ${this.fsm.gameplayFSM.getCurrentState()}`
    );

    this.fsm.gameplayFSM.pause();

    // Mostrar menú de pausa
    ui("PausedState");

    // Configurar listeners del menú de pausa
    this.boundHandlers.resume = () => {
      console.log("Botón de reanudar pulsado");
      this.fsm.handleEvent(GameEvents.RESUME_GAME);
    };

    this.boundHandlers.backToMenu = () => {
      console.log("Botón de volver al menú pulsado");
      this.fsm.handleEvent(GameEvents.BACK_TO_MENU);
    };

    this.boundHandlers.keydown = (e) => {
      if (e.key === "Escape") {
        console.log("Tecla Escape pulsada en pausa");
        this.fsm.handleEvent(GameEvents.RESUME_GAME);
      }
    };

    document
      .querySelector(".resume-btn")
      ?.addEventListener("click", this.boundHandlers.resume);
    document
      .querySelector(".level-menu-btn")
      ?.addEventListener("click", this.boundHandlers.backToMenu);
    document.addEventListener("keydown", this.boundHandlers.keydown);
  }

  update() {
    // UI maneja el menú de pausa
  }

  handleInput(event) {
    switch (event) {
      case GameEvents.RESUME_GAME:
        this.fsm.gameplayFSM.resume();
        return { nextState: GameStates.PLAYING, data: { fromPause: true } };
      case GameEvents.BACK_TO_MENU:
        // Al volver al menú, terminar completamente el gameplay
        this.fsm.gameplayFSM.stop();
        return GameStates.LEVEL_SELECT;
      default:
        return null;
    }
  }

  exit() {
    console.log("Saliendo del menú de pausa");

    // Limpiar listeners
    document
      .querySelector(".resume-btn")
      ?.removeEventListener("click", this.boundHandlers.resume);
    document
      .querySelector(".level-menu-btn")
      ?.removeEventListener("click", this.boundHandlers.backToMenu);
    document.removeEventListener("keydown", this.boundHandlers.keydown);

    this.boundHandlers = {};

    // Eliminar la superposición modal
    const modalOverlay = document.querySelector(".modal-overlay");
    if (modalOverlay) {
      modalOverlay.remove();
    }

    const gameContainer = document.getElementById("game-container");

    if (!this.fsm.gameplayFSM.isActive) {
      while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
      }
    }
  }
}

// MARK: Complete

class LevelCompleteState {
  constructor(fsm) {
    this.fsm = fsm;
    this.boundHandlers = {};
  }
  enter() {
    console.log("¡Nivel completado!");

    const movesManager = this.fsm.states[GameStates.PLAYING].movesManager;
    const currentLevel = levelManager.getCurrentLevel();
    const totalLevels = levelManager.getLevelCount();
    let buttons = ui("LevelCompleteState", {
      currentLevel: currentLevel,
      totalLevels: totalLevels,
      movesManager: movesManager,
    });
    this.boundHandlers.retry = () => {
      console.log("Botón de retry pulsado");
      this.fsm.handleEvent(GameEvents.RETRY_LEVEL);
    };

    this.boundHandlers.toNextLevel = () => {
      console.log("Botón de jugar siguiente nivel pulsado");
      this.fsm.handleEvent(GameEvents.SELECT_NEXT_LEVEL, {
        level: currentLevel + 1,
      });
    };

    this.boundHandlers.backToMenu = () => {
      console.log("Botón de volver a inicio pulsado");
      this.fsm.handleEvent(GameEvents.BACK_TO_MENU);
    };

    buttons.retryButton?.addEventListener("click", this.boundHandlers.retry);
    buttons.nextLevelButton?.addEventListener(
      "click",
      this.boundHandlers.toNextLevel
    );
    buttons.levelMenuButton?.addEventListener(
      "click",
      this.boundHandlers.backToMenu
    );
  }

  update() {
    // UI maneja animaciones de victoria, puntuaciones, etc.
  }

  handleInput(event) {
    switch (event) {
      case GameEvents.RETRY_LEVEL:
        return GameStates.PLAYING;
      case GameEvents.SELECT_NEXT_LEVEL:
        return GameStates.PLAYING;
      case GameEvents.BACK_TO_MENU:
        return GameStates.LEVEL_SELECT;
      default:
        return null;
    }
  }

  exit() {
    console.log("Saliendo de pantalla de nivel completado");

    // Limpiar listeners
    document
      .querySelector(".retry-btn")
      ?.removeEventListener("click", this.boundHandlers.retry);
    document
      .querySelector(".next-level-btn")
      ?.removeEventListener("click", this.boundHandlers.toNextLevel);
    document
      .querySelector(".level-menu-btn")
      ?.removeEventListener("click", this.boundHandlers.backToMenu);

    this.boundHandlers = {};

    // Eliminar la superposición modal
    const modalOverlay = document.querySelector(".modal-overlay");
    if (modalOverlay) {
      modalOverlay.remove();
    }

    const gameContainer = document.getElementById("game-container");

    if (!this.fsm.gameplayFSM.isActive) {
      while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
      }
    }
  }
}

// MARK: Fail
class LevelFailState {
  constructor(fsm) {
    this.fsm = fsm;
    this.boundHandlers = {};
  }
  enter() {
    console.log("Nivel fallado");

    let buttons = ui("LevelFailState");
    // buttons == {retryButton, levelMenuButton}

    this.boundHandlers.retry = () => {
      console.log("Botón de retry pulsado");
      this.fsm.handleEvent(GameEvents.RETRY_LEVEL);
    };

    this.boundHandlers.backToMenu = () => {
      console.log("Botón de volver a inicio pulsado");
      this.fsm.handleEvent(GameEvents.BACK_TO_MENU);
    };

    buttons.retryButton?.addEventListener("click", this.boundHandlers.retry);
    buttons.levelMenuButton?.addEventListener(
      "click",
      this.boundHandlers.backToMenu
    );
  }

  update() {
    // UI maneja pantalla de derrota
  }

  handleInput(event) {
    switch (event) {
      case GameEvents.RETRY_LEVEL:
        return GameStates.PLAYING;
      case GameEvents.BACK_TO_MENU:
        return GameStates.LEVEL_SELECT;
      default:
        return null;
    }
  }

  exit() {
    console.log("Saliendo de pantalla de nivel fallado");

    // Limpiar listeners
    document
      .querySelector(".retry-btn")
      ?.removeEventListener("click", this.boundHandlers.retry);
    document
      .querySelector(".level-menu-btn")
      ?.removeEventListener("click", this.boundHandlers.backToMenu);

    this.boundHandlers = {};

    // Eliminar la superposición modal
    const modalOverlay = document.querySelector(".modal-overlay");
    if (modalOverlay) {
      modalOverlay.remove();
    }

    const gameContainer = document.getElementById("game-container");

    if (!this.fsm.gameplayFSM.isActive) {
      while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
      }
    }
  }
}

// MARK: FSM MAIN
// La máquina de estados principal -------------------------------------
class GameStateMachine {
  constructor() {
    this.states = {
      [GameStates.INTRO]: new IntroState(this),
      [GameStates.LEVEL_SELECT]: new LevelSelectState(this),
      [GameStates.PLAYING]: new PlayingState(this),
      [GameStates.PAUSED]: new PausedState(this),
      [GameStates.LEVEL_COMPLETE]: new LevelCompleteState(this),
      [GameStates.LEVEL_FAIL]: new LevelFailState(this),
    };

    this.currentState = null;
    this.currentStateName = null;

    // FSM anidada para el gameplay
    this.gameplayFSM = new gameplay.GameplayStateMachine(this);
  }

  // Inicializar la FSM
  start() {
    this.changeState(GameStates.INTRO);
  }

  // Cambiar de estado
  changeState(newStateName, data = null) {
    // Salir del estado actual
    if (this.currentState) {
      this.currentState.exit();
    }
    console.log(newStateName);

    // Cambiar al nuevo estado
    this.currentStateName = newStateName;
    this.currentState = this.states[newStateName];

    // Entrar al nuevo estado
    this.currentState.enter(data);
  }

  // Actualizar el estado actual (llamado cada frame)
  /*   update() {
    if (this.currentState) {
      this.currentState.update();
    }
  } */

  // Procesar un evento
  handleEvent(event, data = null) {
    if (!this.currentState) return;

    const result = this.currentState.handleInput(event, data);

    // Permitir que un estado retorne un objeto con nextState y data
    if (result) {
      if (typeof result === "string") {
        // Caso anterior donde solo se devuelve el nombre del estado
        console.log(`Transición: ${this.currentStateName} → ${result}`);
        this.changeState(result, data);
      } else if (typeof result === "object" && result.nextState) {
        // Nuevo caso donde se devuelve objeto con estado y datos
        console.log(
          `Transición: ${this.currentStateName} → ${result.nextState}`
        );
        this.changeState(result.nextState, result.data);
      }
    }
  }

  // Obtener el estado actual
  getCurrentState() {
    return this.currentStateName;
  }
}

// MARK: Funciones
// Función simple alternativa (más básica)
function simpleNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${
                  type === "error"
                    ? "#f44336"
                    : type === "success"
                    ? "#4CAF50"
                    : "#2196F3"
                };
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                font-size: 16px;
                max-width: 300px;
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.3s ease;
            `;

  notification.textContent = message;
  document.body.appendChild(notification);

  // Animar entrada
  requestAnimationFrame(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  });

  let duration = message.length * 70;

  // Auto-cerrar
  setTimeout(
    () => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(400px)";
      setTimeout(() => notification.remove(), 300);
    },
    duration > 3000 ? duration : 3000
  );
}

// ------------------------------------------------
const fsm = new GameStateMachine();
const levelManager = new LevelManager();

// Inicializar
fsm.start(); // → "Mostrando pantalla de presentación"

// Para empezar en un nivel concreto:
fsm.handleEvent(GameEvents.START_GAME); // → "Mostrando selección de niveles"
fsm.handleEvent(GameEvents.LEVEL_SELECTED, { level: 10 }); // → "Iniciando gameplay"
