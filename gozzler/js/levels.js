// MARK: MANAGER
export class LevelManager {
  lastCompleted; // Lógica para cuando se puedan guardar avances.
  // @TODO Implementar lógica para guardar el progreso del jugador.

  constructor() {
    this.currentLevel = 1; // Inicia en 1, pero cambiar al elegir nivel y cargarlo
    this.levels = { ...maps.level }; // Colección de niveles
    this.levelData = null; // Datos del nivel actual
    this.loadLevel(this.currentLevel); // Carga Datos del nivel
    this.symbols = {
      0: "floor",
      1: "wall",
      2: "floor-player",
      3: "wall-int",
    };
  }

  loadLevel(levelNumber) {
    if (this.levels[levelNumber]) {
      this.currentLevel = levelNumber;
      this.levelData = this.levels[levelNumber];
    } else {
      console.error(`Nivel ${levelNumber} no encontrado.`);
    }
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  // Método para contar cuántos niveles hay
  getLevelCount() {
    return Object.keys(this.levels).length;
  }

  saveProgress(levelNumber) {
    // Para cuando se puedan guardar avances.
  }
}

// MARK: MAPS



const maps = {
  level: {
    // MARK: Nivel 1
    1: {
      title: "Bo in the Sandbox",
      map: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 1],
        [1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      player: {
        x: 1, // 2ª columna
        y: 10, // 11ª fila
        flipX: false, // right direction
      },
      goal: {
        x: 13, // 14ª columna
        y: 1, // 2ª fila
      },
      moves: {
        min: 2,
        med: 5,
        max: 10,
      },
      size: {
        grid_x: 15,
        grid_y: 12,
        cell: 50,
      },
    },

    // MARK: Nivel 2
    2: {
      title: "Haunted by Whiffy",
      map: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 0, 1, 1],
        [1, 0, 3, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 3, 0, 3, 0, 3, 3, 3, 0, 3, 3, 3, 0, 1, 1],
        [1, 0, 3, 0, 3, 0, 0, 0, 0, 0, 3, 3, 3, 0, 1, 1],
        [1, 0, 0, 2, 0, 0, 3, 3, 3, 0, 3, 3, 3, 0, 1, 1],
        [1, 0, 3, 0, 3, 0, 3, 3, 3, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 3, 3, 0, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      player: {
        x: 3, // 4ª columna
        y: 8, // 9ª fila
        flipX: false, // right direction
      },
      goal: {
        x: 13, // 14ª columna
        y: 3, // 4ª fila
      },
      moves: {
        min: 4,
        med: 6,
        max: 15,
      },
      size: {
        grid_x: 16,
        grid_y: 14,
        cell: 42,
      },
    },

    // MARK: Nivel 3
    3: {
      title: "Michi Has Not Garbage Collector",
      map: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1],
        [1, 0, 3, 0, 0, 0, 2, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      player: {
        x: 6,
        y: 5,
        flipX: false, // right direction
      },
      goal: {
        x: 6,
        y: 2,
      },
      moves: {
        min: 6,
        med: 9,
        max: 18,
      },
      size: {
        grid_x: 11,
        grid_y: 9,
        cell: 64,
      },
    },

    // MARK: Nivel 4
    4: {
      title: "Bubu's Adventure",
      map: [
        // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
        [1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1], // 1
        [1, 0, 0, 3, 0, 0, 0, 3, 0, 0, 1], // 2
        [1, 0, 3, 0, 0, 0, 0, 0, 3, 0, 1], // 3
        [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1], // 4
        [1, 3, 0, 2, 0, 0, 3, 0, 0, 0, 1], // 5
        [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1], // 6
        [1, 0, 0, 3, 0, 0, 0, 0, 0, 3, 1], // 7
        [1, 0, 3, 3, 0, 0, 3, 0, 0, 0, 1], // 8
        [1, 0, 3, 3, 0, 0, 0, 0, 3, 0, 1], // 9
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 10
      ],
      player: {
        x: 3,
        y: 5,
        flipX: false, // right direction
      },
      goal: {
        x: 5,
        y: 3,
      },
      moves: {
        min: 7,
        med: 10,
        max: 19,
      },
      size: {
        grid_x: 11,
        grid_y: 11,
        cell: 52,
      },
    },

    // MARK: Nivel 5
    5: {
      title: "Evening for Momo",
      map: [
        // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 1], // 1
        [1, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1], // 2
        [1, 1, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
        [1, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1], // 4
        [1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 5
        [1, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 1], // 6
        [1, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1], // 7
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1], // 8
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
      ],
      player: {
        x: 12,
        y: 1,
        flipX: true, // left direction (changed to match the inverted map)
      },
      goal: {
        x: 2,
        y: 7,
      },
      moves: {
        min: 9,
        med: 12,
        max: 20,
      },
      size: {
        grid_x: 15,
        grid_y: 10,
        cell: 58,
      },
    },

    // MARK: Nivel 6
    6: {
      title: "A Lair for Dora",
      map: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 3, 0, 0, 0, 3, 3, 0, 0, 0, 1],
        [1, 0, 3, 0, 3, 0, 3, 3, 0, 0, 3, 3, 0, 1],
        [1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 1],
        [1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 3, 0, 3, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 1],
        [1, 0, 3, 0, 3, 0, 0, 0, 0, 3, 0, 3, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 0, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      player: {
        x: 5,
        y: 1,
        flipX: false, // right direction
      },
      goal: {
        x: 10,
        y: 4,
      },
      moves: {
        min: 10,
        med: 6,
        max: 15,
      },
      size: {
        grid_x: 14,
        grid_y: 13,
        cell: 45,
      },
    },

    // MARK: Nivel 7
    7: {
      title: "Ifrit's Hot Spot",
      map: [
        // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1], // 1
        [1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1], // 2
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 3
        [1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1], // 4
        [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1], // 5
        [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1], // 6
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1], // 7
        [1, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 1], // 8
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 10
      ],
      player: {
        x: 10,
        y: 1,
        flipX: true, // right direction
      },
      goal: {
        x: 6,
        y: 6,
      },
      moves: {
        min: 9,
        med: 15,
        max: 25,
      },
      size: {
        grid_x: 12,
        grid_y: 11,
        cell: 54,
      },
    },
  },
};
