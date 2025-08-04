import { EventSystem, EntityEvents } from "./systems.js";

// MARK: ENTITY
export class Entity {
  static #nextId = 1;
  static #usedIds = new Set();
  #id;
  #components = new Map();
  #active = false;

  constructor(id) {
    if (id) {
      if (id === "player" || id === "goal") {
        this.#id = id;
      } else {
        let newId = this.#generateUniqueId(id);
        if (Entity.#usedIds.has(newId)) {
          console.warn(`ID "${newId}" ya está en uso. Generando un nuevo ID.`);
          newId = this.#generateUniqueId();
          this.#id = newId;
          Entity.#usedIds.add(newId);
        } else {
          this.#id = newId;
          Entity.#usedIds.add(newId);
        }
      }
    } else {
      let newId = this.#generateUniqueId();
      this.#id = newId;
      Entity.#usedIds.add(newId);
    }
  }

  #generateUniqueId(id = "entity") {
    const newId = `${id}_${Entity.#nextId}`;
    Entity.#nextId++;
    // Entity.#usedIds.add(newId);
    return newId;
  }

  get id() {
    return this.#id;
  }

  isActive() {
    return this.#active;
  }

  activate() {
    this.#active = true;
    EventSystem.getInstance().emit(EntityEvents.ENTITY_ACTIVATED, {
      entity: this,
    });
    console.log(`Entidad ${this.#id} activada`);
  }

  deactivate() {
    this.#active = false;
    EventSystem.getInstance().emit(EntityEvents.ENTITY_DEACTIVATED, {
      entity: this,
    });
    console.log(`Entidad ${this.#id} desactivada`);
  }

  // Añadir un componente
  addComponent(component) {
    component.setEntity(this);
    this.#components.set(component.constructor.name, component);
    return this; // Para encadenamiento
  }

  // Obtener un componente específico
  getComponent(componentType) {
    return this.#components.get(componentType);
  }

  // Comprobar si tiene un componente
  hasComponent(componentType) {
    return this.#components.has(componentType);
  }

  // Inicializar todos los componentes
  init() {
    this.#components.forEach((component) => {
      if (component.init) {
        component.init();
      }
    });
  }

  // Actualizar todos los componentes
  update() {
    if (!this.#active) return;

    this.#components.forEach((component) => {
      // console.log(`Actualizando componente ${component.constructor.name} de la entidad ${this.#id}`);

      if (component.update) {
        component.update();
      }
    });
  }

  // Destruir la entidad y sus componentes
  destroy() {
    Entity.#usedIds.delete(this.#id);
    EventSystem.getInstance().emit(EntityEvents.ENTITY_DESTROYED, {
      entity: this,
    });
    this.#components.forEach((component) => {
      if (component.onDestroy) {
        component.onDestroy();
      }
    });
    this.#components.clear();
  }
}

// MARK: ENTFactory
export class EntityFactory {
  static createEntityType(type, x, y, cellSize, board) {
    switch (type) {
      case "wall":
        return EntityFactory.createWall(type, x, y, cellSize, board);
      case "brick_2":
        return EntityFactory.createBrick2(type, x, y, cellSize, board, 2);
      case "brick_1":
        return EntityFactory.createBrick1(type, x, y, cellSize, board, 1);
      case "box":
        return EntityFactory.createBox(type, x, y, cellSize, board);
      case "floor":
        return EntityFactory.createFloor(type, x, y, cellSize, board);
      case "floor_player":
        return EntityFactory.createFloorPlayer(type, x, y, cellSize, board);
      default:
        console.warn(`Tipo de entidad desconocido: ${type}`);
        return null;
    }
  }
  static createWall(type, x, y, cellSize, board) {
    return new Entity("wall")
      .addComponent(new Position(x, y, board))
      .addComponent(new Renderer("wall", cellSize))
      .addComponent(new Collider({ solid: true }));
  }

  static createBrick2(type, x, y, cellSize, board, hitsToBreak) {
    return new Entity("brick_2")
      .addComponent(new Position(x, y, board))
      .addComponent(new Renderer("brick_2", cellSize))
      .addComponent(new Collider({ solid: true, breakable: true }))
      .addComponent(new Breakable(hitsToBreak));
  }
  static createBrick1(type, x, y, cellSize, board, hitsToBreak) {
    return new Entity("brick_1")
      .addComponent(new Position(x, y, board))
      .addComponent(new Renderer("brick_1", cellSize))
      .addComponent(new Collider({ solid: true, breakable: true }))
      .addComponent(new Breakable(hitsToBreak));
  }

  static createBox(type, x, y, cellSize, board) {
    return new Entity("box")
      .addComponent(new Position(x, y, board))
      .addComponent(new Renderer("box", cellSize))
      .addComponent(new Collider({ solid: true, pushable: true }));
  }

  static createFloor(type, x, y, cellSize) {
    return new Entity("floor")
      .addComponent(new Position(x, y))
      .addComponent(new Renderer("floor", cellSize));
  }

  static createFloorPlayer(type, x, y, cellSize) {
    return new Entity(type)
      .addComponent(new Position(x, y))
      .addComponent(new Renderer("floor_player", cellSize));
  }

  static createGoal(x, y, cellSize, board) {
    const entity = new Entity("goal")
      .addComponent(new Position(x, y, board))
      .addComponent(new Renderer("goal", cellSize));

    // Añadir gema como hijo visual
    const gemElement = document.createElement("div");
    gemElement.className = "gem";
    gemElement.style.width = `${cellSize}px`;
    gemElement.style.height = `${cellSize}px`;
    entity.getComponent("Renderer").element.appendChild(gemElement);

    return entity;
  }

  static createPlayer(x, y, cellSize, isFacingRight, board) {
    return new Entity("player")
      .addComponent(new Position(x, y, board, true))
      .addComponent(new Playable(true))
      .addComponent(new Collider({ solid: false }))
      .addComponent(new DirectionalRenderer("player", cellSize, isFacingRight));
  }
  static createCounter(initialCount = 0) {
    return new Entity("counter").addComponent(new Contador(initialCount));
  }
}

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// MARK: COMPONENTS
export class Component {
  entity = null;

  constructor() {
    this.events = EventSystem.getInstance();
  }

  setEntity(entity) {
    this.entity = entity;
  }

  // Método opcional para inicializar
  init() {}

  // Método opcional para actualizar
  update() {}

  // Método para limpiar recursos
  onDestroy() {}
}

// MARK: Position
export class Position extends Component {
  #x = 0;
  #y = 0;
  #prevX = 0;
  #prevY = 0;
  #direction = { x: 0, y: 0 };

  #moving = false;
  #board = null;

  constructor(x = 0, y = 0, board, moving = false) {
    super();
    this.#x = x;
    this.#y = y;
    this.#prevX = x;
    this.#prevY = y;
    this.#board = board;
    this.#moving = moving;
  }

  init() {
    this.unsubscribeStartMoving = this.events.subscribe(
      EntityEvents.ENTITY_START_MOVING,
      (data) => {
        if (data.entity === this.entity) {
          if (!this.entity.isActive()) {
            this.#moving.activate();
          }
          this.#moving = true;
          this.#direction = data.direction;
        }
      }
    );
    this.unsubscribeStopMoving = this.events.subscribe(
      EntityEvents.ENTITY_STOP_MOVING,
      (data) => {
        if (data.entity === this.entity) {
          this.#moving = false;
          this.#direction = { x: 0, y: 0 };

          if (!this.entity.ip === "player") this.entity.deactivate();
        }
      }
    );
  }
  // Getters y setters
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get prevX() {
    return this.#prevX;
  }
  get prevY() {
    return this.#prevY;
  }
  get direction() {
    return this.#direction;
  }
  set direction(value) {
    this.#direction = value;
  }

  get isMoving() {
    return this.#moving;
  }
  set isMoving(value) {
    this.#moving = value;
    if (value) {
      this.events.emit(EntityEvents.ENTITY_START_MOVING, {
        entity: this.entity,
        direction: this.#direction,
      });
    } else {
      this.events.emit(EntityEvents.ENTITY_STOP_MOVING, {
        entity: this.entity,
        position: { x: this.#x, y: this.#y },
      });
    }
  }

  // Para uso en operaciones temporales que no queremos emitir eventos
  setPositionSilent(x, y) {
    this.#x = x;
    this.#y = y;
  }
  setPosition(x, y) {
    this.#prevX = this.#x;
    this.#prevY = this.#y;
    this.#x = x;
    this.#y = y;

    // Emitir evento solo si la posición cambió
    if (this.#prevX !== this.#x || this.#prevY !== this.#y) {
      this.events.emit(EntityEvents.ENTITY_MOVED, {
        entity: this.entity,
        position: { x: this.#x, y: this.#y },
        prevPosition: { x: this.#prevX, y: this.#prevY },
        direction: this.#direction,
      });
    }
  }

  // Mover la entidad en una dirección
  move(nextX, nextY) {
    this.#prevX = this.#x;
    this.#prevY = this.#y;
    this.#x = nextX;
    this.#y = nextY;

    if (this.#prevX !== this.#x || this.#prevY !== this.#y) {
      this.events.emit(EntityEvents.ENTITY_MOVED, {
        entity: this.entity,
        position: { x: this.#x, y: this.#y },
        prevPosition: { x: this.#prevX, y: this.#prevY },
        direction: this.#direction,
      });

      // @nota Estoy pensando en si Pasar esto a PLAYABLE
      if (this.entity.id === "player") {
        console.warn(
          `   >>> Position: Moved player to (${this.#x}, ${this.#y})`
        );
        this.events.emit(EntityEvents.PLAYER_MOVED, {
          entity: this.entity,
          position: { x: this.#x, y: this.#y },
          prevPosition: { x: this.#prevX, y: this.#prevY },
          direction: this.#direction,
        });
      }
    }
  }

  update() {
    if (!this.isMoving) {
      if (this.entity.id === "player") {
        this.isMoving = true;
      }
      return;
    }

    const nextX = this.#x + this.#direction.x;
    const nextY = this.#y + this.#direction.y;

    console.log(`   >>> Position: Intentando mover a (${nextX}, ${nextY})`);

    const entityAtTarget = this.#board.getEntityAt(nextX, nextY);
    // Si se mueve, tiene Collider
    const collider = this.entity.getComponent("Collider");
    // Si no hay entidad en el destino o no colisiona con la entidad en el destino, mover
    if (!entityAtTarget || !collider.checkCollision(this, entityAtTarget)) {
      this.move(nextX, nextY);
    }
  }

  onDestroy() {
    if (this.unsubscribeStartMoving) {
      this.unsubscribeStartMoving();
    }
    if (this.unsubscribeStopMoving) {
      this.unsubscribeStopMoving();
    }
  }
}

// MARK: collider
export class Collider extends Component {
  // #breakable = false;
  // #movable = false;
  #solid = true;
  #pushable = false;

  constructor(options = {}) {
    super();
    this.#solid = options.solid ?? true;
    // this.#breakable = options.breakable ?? false;
    // this.#movable = options.movable ?? false;
    this.#pushable = options.pushable ?? false;
  }

  isSolid() {
    return this.#solid;
  }

  setSolid(solid) {
    this.#solid = solid;
  }

  isPushable() {
    return this.#pushable;
  }

  init() {
    // Suscribirse a colisiones
    this.unsubscribeCollided = this.events.subscribe(
      EntityEvents.ENTITY_COLLIDED,
      (data) => {
        if (data.entity === this.entity) {
          this.onCollision(data.other, data.direction);
        }
      }
    );
  }

  checkCollision(position, other) {
    if (
      other.getComponent("Collider") &&
      other.getComponent("Collider").isSolid()
    ) {
      // console.warn("   >>> Collider: Colisión detectada", this.entity.id)
      this.events.emit(EntityEvents.ENTITY_COLLIDED, {
        entity: this.entity,
        other: other,
        direction: position.direction,
      });

      if (this.entity.id === "player") {
        this.events.emit(EntityEvents.ENTITY_STOP_MOVING, {
          entity: this.entity,
          position: position,
        });
        this.events.emit(EntityEvents.PLAYER_STOPPED, {
          entity: this.entity,
          position: position,
          other: other,
          direction: position.direction,
        });
        console.warn(
          `   >>> Collider: Emitido evento PLAYER_STOPPED al chocar con ${other.id}`
        );
      }

      return true;
    }
    return false;
  }

  // Método que se llama cuando ocurre una colisión
  onCollision(other, direction) {
    console.log(
      `Colisión en Collider: ${this.entity.id} con ${other.id} dirección: ${direction.x}, ${direction.y}`
    );

    // @nota No tengo claro que sea necesario si breakable está suscrito a evento de colisión
    //  También tenemos evento de entityDestroyed que no estamos usando.
    /* if (this.entity.hasComponent("Breakable")) {
      this.entity.getComponent("Breakable").onImpact();
    } */

    if (this.#pushable && other.hasComponent("Position")) {
      this.events.emit(EntityEvents.ENTITY_PUSHED, {
        entity: this.entity,
        other: other,
        direction: direction,
      });
    }
  }
}

// MARK: renderer
export class Renderer extends Component {
  #element;
  #cellSize;

  constructor(className, cellSize = 32) {
    super();
    this.#cellSize = cellSize;

    this.#element = document.createElement("div");
    this.#element.className = className;
    this.#element.style.width = `${cellSize}px`;
    this.#element.style.height = `${cellSize}px`;
    this.#element.style.position = "absolute";
  }

  get element() {
    return this.#element;
  }

  addClass(className) {
    this.#element.classList.add(className);
  }

  removeClass(className) {
    this.#element.classList.remove(className);
  }

  replaceClass(oldClass, newClass) {
    this.#element.classList.remove(oldClass);
    this.#element.classList.add(newClass);
  }

  init() {
    // Suscribirse a los cambios de posición
    const position = this.entity.getComponent("Position");
    if (position) {
      this.updatePosition(position.x, position.y);

      this.unsubscribe = this.events.subscribe(
        EntityEvents.ENTITY_MOVED,
        (data) => {
          if (data.entity === this.entity) {
            this.updatePosition(data.position.x, data.position.y);
          }
        }
      );
    }

    // Agregar al DOM
    let entitiesContainer = null;
    if (this.#element.className.startsWith("floor")) {
      if (this.#element.className === "floor_player") {
        console.log("Agregando floor_player al contenedor de suelo");
      }
      entitiesContainer = document.getElementById("floor_grid");
    } else {
      entitiesContainer = document.getElementById("entities_grid");
    }
    if (entitiesContainer) {
      entitiesContainer.appendChild(this.#element);
    } else {
      console.error("No se encontró el contenedor en el DOM");
    }
  }

  updatePosition(x, y) {
    this.#element.style.left = `${x * this.#cellSize}px`;
    this.#element.style.top = `${y * this.#cellSize}px`;
  }

  onDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    if (this.#element && this.#element.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }
  }
}

// MARK: dirRender
export class DirectionalRenderer extends Component {
  #element;
  #cellSize;
  #facingRight = true; // Dirección por defecto
  #currentState = "idle"; // Estados: idle, rolling_x, rolling_y, wall_hit_x, wall_hit_y
  #transitionTimer = null;

  constructor(className, cellSize = 32, flipped = false) {
    super();
    this.#cellSize = cellSize;

    this.#element = document.createElement("div");
    this.#element.className = className;
    this.#element.style.width = `${cellSize}px`;
    this.#element.style.height = `${cellSize}px`;
    this.#facingRight = !flipped;
    if (!this.#facingRight) {
      this.#element.classList.add("left");
    }
  }

  get element() {
    return this.#element;
  }

  init() {
    // Actualizar posición inicial
    const position = this.entity.getComponent("Position");
    if (position) {
      this.updatePosition(position.x, position.y);
    }

    // Agregar al DOM
    const entitiesContainer = document.getElementById("entities_grid");
    if (entitiesContainer) {
      entitiesContainer.appendChild(this.#element);
    } else {
      console.error("No se encontró el contenedor 'entities_grid' en el DOM");
    }

    // Suscribirse a eventos de movimiento del jugador
    this.unsubscribePlayerMoved = this.events.subscribe(
      EntityEvents.PLAYER_MOVED,
      this.handlePlayerMoved.bind(this)
    );

    // Suscribirse a eventos de colisión
    this.unsubscribeCollision = this.events.subscribe(
      EntityEvents.ENTITY_COLLIDED,
      this.handleCollision.bind(this)
    );
  }

  handlePlayerMoved(data) {
    if (data.entity !== this.entity) return;

    // Actualizar posición
    const position = this.entity.getComponent("Position");
    if (position) {
      this.updatePosition(position.x, position.y);
    }

    // Asegurarse de que el estado rolling esté activo durante el movimiento
    if (data.direction.x !== 0) {
      this.setState("rolling_x");
      if (data.direction.x > 0) {
        this.faceRight();
      } else if (data.direction.x < 0) {
        this.faceLeft();
      }
    } else if (data.direction.y !== 0) {
      this.setState("rolling_y");
    }
  }

  handleCollision(data) {
    if (data.entity !== this.entity) return;

    console.log("Colisión detectada:", data);

    // Cancelar cualquier temporizador pendiente
    if (this.#transitionTimer) {
      clearTimeout(this.#transitionTimer);
      this.#transitionTimer = null;
    }

    // Determinar tipo de colisión
    if (data.direction && data.direction.x !== 0) {
      // console.log("Estableciendo estado wall_hit_x");
      this.setState("wall_hit_x");
    } else if (data.direction && data.direction.y !== 0) {
      // console.log("Estableciendo estado wall_hit_y");
      this.setState("wall_hit_y");
    } else {
      console.log("No se pudo determinar la dirección de colisión", data);
    }

    // Restaurar al estado idle después de un breve retraso
    this.#transitionTimer = setTimeout(() => {
      console.log("Volviendo a idle después de colisión");
      this.setState("idle");
      this.#transitionTimer = null;
    }, 200);
  }

  setState(newState) {
    // Si el estado no ha cambiado, no hacemos nada
    if (this.#currentState === newState) return;

    // Eliminar todas las clases de estado
    this.#element.classList.remove(
      "rolling_x",
      "rolling_y",
      "wall_hit_x",
      "wall_hit_y"
    );

    if (newState !== "idle") {
      // Añadir la clase del nuevo estado
      this.#element.classList.add(newState);
    }

    // Actualizar el estado actual
    this.#currentState = newState;
  }

  updatePosition(x, y) {
    this.#element.style.left = `${x * this.#cellSize}px`;
    this.#element.style.top = `${y * this.#cellSize}px`;
  }

  faceLeft() {
    if (this.#facingRight) {
      this.#element.classList.add("left");
      this.#facingRight = false;
    }
  }

  faceRight() {
    if (!this.#facingRight) {
      this.#element.classList.remove("left");
      this.#facingRight = true;
    }
  }

  onDestroy() {
    // Limpiar temporizador si existe
    if (this.#transitionTimer) {
      clearTimeout(this.#transitionTimer);
      this.#transitionTimer = null;
    }

    // Limpiar suscripciones a eventos
    if (this.unsubscribePlayerMoved) this.unsubscribePlayerMoved();
    if (this.unsubscribeCollision) this.unsubscribeCollision();

    if (this.#element && this.#element.parentNode) {
      this.#element.parentNode.removeChild(this.#element);
    }
  }
}

// MARK: breakable

export class Breakable extends Component {
  #hitsToBreak = null; // Número de golpes para romper
  #cyclesUntilDestroy = 2; // Movimientos necesarios después de ser roto
  #brickType = null; // Tipo de ladrillo

  constructor(hitsToBreak) {
    super();
    this.#hitsToBreak = hitsToBreak;
    switch (hitsToBreak) {
      case 2:
        this.#brickType = "brick_2";
        break;
      case 1:
        this.#brickType = "brick_1";
        break;
      default:
        console.warn(
          `Tipo de ladrillo desconocido: ${hitsToBreak}. Usando brick_2 por defecto.`
        );
        this.#brickType = "brick_2";
        break;
    }
  }

  init() {
    // Suscribirse a colisiones
    this.unsubscribeCollided = this.events.subscribe(
      EntityEvents.ENTITY_COLLIDED,
      (data) => {
        if (data.entity === this.entity || data.other === this.entity) {
          this.onImpact();
        }
      }
    );
  }

  onImpact() {
    this.#hitsToBreak--;
    if (this.#brickType === "brick_2" && this.#hitsToBreak === 1) {
      const renderer = this.entity.getComponent("Renderer");
      if (renderer && renderer.element) {
        renderer.element.classList.remove("brick_2");
        renderer.element.classList.add("brick_1");
      }
    }
    if (this.#hitsToBreak === 0) {
      const collider = this.entity.getComponent("Collider");
      collider.setSolid(false);
      this.breaking();
      this.unsubscribeCollided();
    }
  }

  breaking() {
    this.unsubscribeCycles = this.events.subscribe(
      EntityEvents.LOOP_CYCLE,
      () => {
        if (this.#cyclesUntilDestroy <= 0) {
          console.log(`Brick ${this.entity.id} destruyéndose completamente`);
          this.entity.destroy();
          return;
        }
        const renderer = this.entity.getComponent("Renderer");
        renderer.addClass("breaking");
        this.#cyclesUntilDestroy--;
      }
    );
  }

  onDestroy() {
    if (this.unsubscribeCycles) {
      this.unsubscribeCycles();
    }
  }
}

// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// MARK: playable
export class Playable extends Component {
  #isPlayer = true;
  // #isMoving = false;
  // #delay = 1;
  #moveQueue = [];
  #currentDirection = { x: 0, y: 0 };
  // #waitingForNextMove = false;

  constructor(isPlayer = true) {
    super();
    this.#isPlayer = isPlayer;
  }

  init() {
    this.unsubscribeCollision = this.events.subscribe(
      EntityEvents.ENTITY_COLLIDED,
      (data) => {
        if (data.entity === this.entity) {
          // this.handleCollision(data);
          this.getNextMove();
        }
      }
    );
  }

  /*   isPlayer() {
    return this.#isPlayer;
  } */
  /*   isMoving() {
    return this.#isMoving;
  } */

  get moveQueue() {
    return this.#moveQueue;
  }
  setMoveQueue(queue) {
    this.#moveQueue = Array.isArray(queue) ? [...queue] : [];
    // this.#waitingForNextMove = false;
    console.log(
      `   >>> Playable: Cola de movimientos establecida: ${
        this.#moveQueue.length
      } movimientos`
    );
  }
  getNextMove() {
    if (this.hasMoves()) {
      this.#currentDirection = this.#moveQueue.shift();
      console.log(
        `   >>> Playable: Nueva dirección: ${this.#currentDirection.x}, ${
          this.#currentDirection.y
        }`
      );
    } else {
      this.events.emit(EntityEvents.LOOP_ENDED, {
        entity: this.entity,
        reason: "queueEmpty",
      });
      this.#currentDirection = { x: 0, y: 0 };
      const position = this.entity.getComponent("Position");
      position.isMoving = false;
    }
  }

  hasMoves() {
    return this.#moveQueue && this.#moveQueue.length > 0;
  }

  update() {
    const position = this.entity.getComponent("Position");
    position.direction = this.#currentDirection;
    console.log(
      `   >>> Playable: update - Dirección actual: ${
        this.#currentDirection.x
      }, ${this.#currentDirection.y}`
    );
    // if (!position.getMoving()) return;
  }

  onDestroy() {
    if (this.unsubscribeCollision) {
      this.unsubscribeCollision();
    }
  }
}

// MARK: Contador
/* export class Contador extends Component {
  #count = 0;
  container;

  constructor(initialCount = 0) {
    super();
    this.#count = initialCount;
  }

  init() {
    this.container = document.createElement("div");
    this.container.id = "counter";
    this.container.textContent = `Contador: ${this.#count}`;
    this.container.style.position = "absolute";
    this.container.style.top = "10px";
    this.container.style.right = "10px";
    document.getElementById("entities_grid").appendChild(this.container);
    this.unsuscribeCounterAttempt = this.events.subscribe(
      EntityEvents.PLAYER_MOVE_ATTEMPT,
      () => {
        this.increment();
      }
    );
    this.unsuscribeCounterMoved = this.events.subscribe(
      EntityEvents.PLAYER_MOVED,
      () => {
        this.increment();
      }
    );
  }
  get count() {
    return this.#count;
  }

  increment() {
    this.#count++;
    this.container.textContent = `Contador: ${this.#count}`;
  }

  onDestroy() {
    this.#count = 0;
  }
} */

// @TODO Nuevos componentes para elementos:
// - Suelo resbaladizo
// - Suelo pegajoso
// - Enemigo móvil
// - Sombra (ejecuta los mismos movimientos que player, pero en dirección contraria)
// - Portal (teletransporta al jugador a otra posición)
