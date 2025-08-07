// MARK: EVENT
export class EventSystem {
  static #instance = null;
  #eventListeners = new Map();

  // Singleton pattern
  static getInstance() {
    if (!EventSystem.#instance) {
      EventSystem.#instance = new EventSystem();
    }
    return EventSystem.#instance;
  }

  // Registrar listener para un evento
  subscribe(eventType, listener) {
    if (!this.#eventListeners.has(eventType)) {
      this.#eventListeners.set(eventType, []);
    }

    this.#eventListeners.get(eventType).push(listener);

    // Devolver función para desuscribirse
    return () => {
      const listeners = this.#eventListeners.get(eventType);
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Emitir un evento
  emit(eventType, data) {
    // console.log(`Evento emitido: ${eventType}`, data);

    if (!this.#eventListeners.has(eventType)) {
      return;
    }

    // Copia para evitar problemas si se modifica durante iteración
    const listeners = [...this.#eventListeners.get(eventType)];

    for (const listener of listeners) {
      listener(data);
    }
  }
}

// Eventos predefinidos del juego
export const EntityEvents = {
  ENTITY_ACTIVATED: "entityActivated",
  ENTITY_DEACTIVATED: "entityDeactivated",
  ENTITY_MOVED: "entityMoved",
  ENTITY_COLLIDED: "entityCollided",
  ENTITY_DESTROYED: "entityDestroyed",
  ENTITY_TELEPORTED: "entityTeleported",
  ENTITY_PUSHED: "entityPushed",
  ENTITY_START_MOVING: "entityStartMoving",
  ENTITY_STOP_MOVING: "entityStopMoving",
  PLAYER_MOVED: "playerMoved",
  PLAYER_STOPPED: "playerStopped",
  LOOP_ENDED: "loopEnded",
  LOOP_CYCLE: "loopCycle",
  // PLAYER_MOVE_ATTEMPT: "playerMoveAttempt",
  // GOAL_ACHIEVED: "goalAchieved",
};

// MARK: MOVEMENT
export class MovementSystem {
  #board;
  #events;
  #player;
  #isLoopRunning = false;
  // #loopStopped = false;
  MOVE_TIME = 300;
  activeEntities = [];

  constructor(board) {
    this.#board = board;
    this.#player = board.player;
    this.#events = EventSystem.getInstance();
    this.movesDisplay = document.getElementById("moves-display");
  }

  async loop(movesCopy) {
    if (!this.#player) {
      console.error("Error: player no está definido en MovementSystem");
      return;
    }

    let playableComponent = this.#player.getComponent("Playable");
    playableComponent.setMoveQueue(movesCopy);
    playableComponent.getNextMove();

    this.#player.activate();

    if (this.movesDisplay && this.movesDisplay.children[0]) {
      this.movesDisplay.children[0].classList.add("current");
    }
    // Inicializar estado del bucle
    this.#isLoopRunning = true;

    const unsubscribeLoop = this.#events.subscribe(
      EntityEvents.LOOP_ENDED,
      () => {
        console.log("Evento LOOP_ENDED recibido, deteniendo bucle");
        this.#isLoopRunning = false;
      }
    );

    const unsubscribeActivated = this.#events.subscribe(
      EntityEvents.ENTITY_ACTIVATED,
      (data) => {
        // console.log("Entidad activada:", data.entity.id);
        this.activeEntities.push(data.entity);
      }
    );

    const unsubscribeDeactivated = this.#events.subscribe(
      EntityEvents.ENTITY_DEACTIVATED,
      (data) => {
        // console.log("Entidad desactivada:", data.entity.id);
        const index = this.activeEntities.indexOf(data.entity);
        if (index !== -1) {
          this.activeEntities.splice(index, 1);
        }
      }
    );

    const unsubscribePlayerMoves = this.#events.subscribe(
      EntityEvents.PLAYER_STOPPED,
      () => {
        console.warn(
          "Evento PLAYER_STOPPED recibido, pasando a siguiente movimiento"
        );
        if (this.movesDisplay && this.movesDisplay.children[0]) {
          this.movesDisplay.children[0].classList.remove("current");
          this.movesDisplay.children[0].remove();

          // Si hay más movimientos, resaltar el siguiente
          if (this.movesDisplay.children[0]) {
            this.movesDisplay.children[0].classList.add("current");
          }
/*           else {
            this.#events.emit(EntityEvents.LOOP_ENDED);
            console.log("No hay más movimientos, finalizando bucle");
          } */
        }
      }
    );

    try {
      console.log("Iniciando bucle de simulación");

      while (this.#isLoopRunning) {
        await this.#player.update();

        this.activeEntities = this.#board.getActiveEntities();
        for (const entity of this.activeEntities) {
          await entity.update();

          // Si el bucle se detiene durante la actualización, salir
          // if (!this.#isLoopRunning) break;
        }

        this.#events.emit(EntityEvents.LOOP_CYCLE, {
          activeEntities: this.activeEntities,
        });
        await new Promise((resolve) => setTimeout(resolve, this.MOVE_TIME)); // ~60fps
/*         if (!this.#player.isActive()) {
          console.warn("El jugador ya no está activo, saliendo del bucle");
          break;
        } */
          
      }
      this.#events.emit(EntityEvents.LOOP_CYCLE, {
        activeEntities: this.activeEntities,
      });
      console.log("Bucle de simulación finalizado");
    } catch (error) {
      console.error("Error en el bucle de simulación:", error);
    } finally {
      // Limpiar el estado y la suscripción al finalizar
      this.#isLoopRunning = false;
      unsubscribeLoop();
      unsubscribePlayerMoves();
      unsubscribeActivated();
      unsubscribeDeactivated();

      this.#player.deactivate();
      this.#board.getActiveEntities()?.forEach((entity) => entity.deactivate());

      console.log("Bucle detenido y suscripciones limpiadas");
    }
  }

  // Método para detener manualmente el bucle
  stopLoop() {
    if (this.#isLoopRunning) {
      this.#isLoopRunning = false;
    }
  }
}
