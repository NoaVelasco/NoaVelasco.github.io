// @nota He empezado a añadir paso de info dentro y hacia, lo que lo hace inconsistente. Mirar en el futuro. De nada.
export function ui(state, data = null) {
  const gameContainer = document.getElementById("game-container");
  const uiDiv = document.createElement("div");
  uiDiv.id = "ui";

  switch (state) {
    // MARK: paused
    case "PausedState":
      const pausedDiv = document.createElement("div");
      pausedDiv.className = "modal-overlay";
      pausedDiv.innerHTML = `
      <div class="modal-content">
        <span class="modal-title">PAUSE</span>
        <div class="modal-buttons">
          <button class="modal-button resume-btn" id="resume">RESUME</button>
          <button class="modal-button level-menu-btn" id="exit">SELECT LEVEL</button>
        </div>
      </div>`;
      document.body.appendChild(pausedDiv);
      return;
    // MARK: complete
    // creo bloques para reutilizar variables en cases diferentes:
    case "LevelCompleteState": {
      document.querySelector(
        ".status"
      ).textContent = `PHASE 3: Reach the goal!`;

      // if (data) {
      // Crear el overlay modal
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "modal-overlay";

      // Crear el contenido del modal
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";

      // Título
      const modalTitle = document.createElement("h2");
      modalTitle.textContent = "LEVEL COMPLETED!";
      modalTitle.className = "modal-title";

      // Información del nivel
      const levelInfo = document.createElement("p");
      levelInfo.innerHTML = `You have completed the level ${data.currentLevel} with <strong>${data.movesManager.usedMoves}</strong> moves.`;

      // Puntuación (estrellas)
      const starsContainer = document.createElement("div");
      starsContainer.className = "stars-container";

      // Calcular estrellas basado en la cantidad de movimientos usados
      let stars = 0;
      if (data.movesManager.usedMoves <= data.movesManager.minMoves) {
        stars = 3; // 3 estrellas si usa menos que el mínimo
      } else if (data.movesManager.usedMoves <= data.movesManager.medMoves) {
        stars = 2; // 2 estrellas si usa menos que el medio
      } else {
        stars = 1; // 1 estrella en cualquier otro caso
      }

      // Añadir estrellas al contenedor
      for (let i = 0; i < 3; i++) {
        const star = document.createElement("span");
        star.className = i < stars ? "star filled" : "star";
        star.textContent = "★";
        starsContainer.appendChild(star);
      }

      // Contenedor para los botones
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "modal-buttons";

      // Botón de reintentar
      const retryButton = document.createElement("button");
      retryButton.textContent = "RETRY";
      retryButton.className = "modal-button retry-btn";

      // Botón de siguiente nivel
      const nextLevelButton = document.createElement("button");
      nextLevelButton.textContent = "NEXT LEVEL";
      nextLevelButton.className = "modal-button next-level-btn";

      if (data.currentLevel >= data.totalLevels) {
        // Si no hay más niveles, deshabilitar el botón
        nextLevelButton.disabled = true;
        nextLevelButton.title = "No more levels available";

        // Añadir mensaje adicional
        const noMoreLevels = document.createElement("p");
        noMoreLevels.textContent = "You have completed all available levels!";
        noMoreLevels.className = "no-more-levels";
        modalContent.appendChild(noMoreLevels);
      }

      // Botón para volver al menú de niveles
      const levelMenuButton = document.createElement("button");
      levelMenuButton.textContent = "SELECT LEVEL";
      levelMenuButton.className = "modal-button level-menu-btn";

      // Ensamblar el modal
      buttonsContainer.appendChild(retryButton);
      buttonsContainer.appendChild(nextLevelButton);
      buttonsContainer.appendChild(levelMenuButton);

      modalContent.appendChild(modalTitle);
      modalContent.appendChild(levelInfo);
      modalContent.appendChild(starsContainer);
      modalContent.appendChild(buttonsContainer);

      modalOverlay.appendChild(modalContent);

      // Añadir al DOM
      document.body.appendChild(modalOverlay);
      // }
      return {
        retryButton: retryButton,
        nextLevelButton: nextLevelButton,
        levelMenuButton: levelMenuButton,
      };
    }
    // MARK: fail
    case "LevelFailState": {
      document.querySelector(
        ".status"
      ).textContent = `PHASE 3: Rethink your moves.`;

      // Prevenir múltiples modales
      const existingModal = document.querySelector(".modal-overlay");
      if (existingModal) {
        document.body.removeChild(existingModal);
      }

      // Crear el overlay modal
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "modal-overlay";

      // Crear el contenido del modal
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content failed";

      // Título
      const modalTitle = document.createElement("h2");
      modalTitle.textContent = "FAILED LEVEL";
      modalTitle.className = "modal-title failed";

      // Información del fallo
      const failInfo = document.createElement("p");
      failInfo.textContent = "You didn't reach the target, try again!";

      // Contenedor para los botones
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "modal-buttons";

      // Botón de reintentar
      const retryButton = document.createElement("button");
      retryButton.textContent = "RETRY";
      retryButton.className = "modal-button retry-btn";

      // Botón para volver al menú de niveles
      const levelMenuButton = document.createElement("button");
      levelMenuButton.textContent = "SELECT LEVEL";
      levelMenuButton.className = "modal-button level-menu-btn";

      // Ensamblar el modal
      buttonsContainer.appendChild(retryButton);
      buttonsContainer.appendChild(levelMenuButton);

      modalContent.appendChild(modalTitle);
      modalContent.appendChild(failInfo);
      modalContent.appendChild(buttonsContainer);

      modalOverlay.appendChild(modalContent);

      // Añadir al DOM
      document.body.appendChild(modalOverlay);

      return {
        retryButton: retryButton,
        levelMenuButton: levelMenuButton,
      };
    }
    // MARK: intro
    case "IntroState":
      const mainH1 = document.createElement("div");
      uiDiv.appendChild(mainH1);
      gameContainer.appendChild(uiDiv);

      mainH1.classList.add("title");
      mainH1.innerHTML = `
        <div id="title">
          <img src="./assets/ui/cover-img.png" alt="GOZZLER">
        </div>`;
      const howToPlayButton = document.createElement("button");
      howToPlayButton.id = "how-to-play";
      howToPlayButton.classList.add("info-btn");
      howToPlayButton.textContent = "HOW TO PLAY";
      uiDiv.appendChild(howToPlayButton);
      const startButton = document.createElement("button");
      startButton.id = "play";
      startButton.textContent = "PLAY";
      uiDiv.appendChild(startButton);
      return;
  }

  // MARK: RESTO
  // <button class="modal-button restart-btn" id="restart">RESTART</button>

  const helpIcon = document.createElement("div");
  helpIcon.id = "menu-icon";
  helpIcon.textContent = "i";
  uiDiv.appendChild(helpIcon);
  // const mainH1 = document.createElement("h1");
  // mainH1.textContent = "🧱 : : GOZZLER : : 🦆";
  gameContainer.appendChild(uiDiv);

  switch (state) {
    // MARK: select
    case "LevelSelectState":
      const mainH1 = document.createElement("div");
      // mainH1.innerHTML = "🧱 : : GOZZLER : : 🦆";
      uiDiv.appendChild(mainH1);
      mainH1.classList.add("title");
      mainH1.innerHTML = `
        <div id="title">
          <img src="./assets/ui/title-sm.png" alt="GOZZLER">
        </div>`;
      const selectH2 = document.createElement("h2");
      selectH2.textContent = "SELECT A LEVEL";
      uiDiv.appendChild(selectH2);
      break;

    // MARK: playing
    case "PlayingState": {
      // mainH1.classList.add("title");
      // mainH1.innerHTML = `
      //   <div id="title">
      //     <img src="./assets/ui/title-sm.png" alt="GOZZLER">
      //   </div>`;
      const levelh2 = document.createElement("h2");
      levelh2.id = "nivel-num";
      uiDiv.appendChild(levelh2);
      const controls = document.createElement("div");
      controls.id = "controls";
      const direction_buttons = document.createElement("div");
      direction_buttons.classList.add("direction-buttons");
      const direction_pad = document.createElement("div");
      direction_pad.classList.add("direction-pad");
      const upButton = document.createElement("button");
      upButton.id = "UP";
      const leftButton = document.createElement("button");
      leftButton.id = "LEFT";
      const rightButton = document.createElement("button");
      rightButton.id = "RIGHT";
      const downButton = document.createElement("button");
      downButton.id = "DOWN";
      const buttons = [upButton, leftButton, rightButton, downButton];

      buttons.forEach((button) => {
        button.classList.add("dir", "direction-btn");
      });

      for (let i = 0; i < 9; i++) {
        let element;
        if (i % 2 === 0) {
          element = document.createElement("div");
          element.classList.add("dir");
        } else {
          element = buttons[Math.floor(i / 2)];
        }
        direction_pad.appendChild(element);
      }
      direction_buttons.appendChild(direction_pad);
      controls.appendChild(direction_buttons);
      gameContainer.appendChild(controls);

      // Create buttons container
      const btnsGame = document.createElement("div");
      btnsGame.classList.add("btns-game");

      // Create reset button
      const resetBtn = document.createElement("button");
      resetBtn.classList.add("reset-btn");
      resetBtn.textContent = "🔄 RESET";

      // Create execute button
      const executeBtn = document.createElement("button");
      executeBtn.classList.add("execute-btn");
      executeBtn.textContent = "🚀 MOVE";

      // Add buttons to container
      btnsGame.appendChild(resetBtn);
      btnsGame.appendChild(executeBtn);
      controls.appendChild(btnsGame);

      // Create moves queue container
      const movesQueue = document.createElement("div");
      movesQueue.classList.add("moves-queue");

      // Create heading for moves queue
      const movesHeading = document.createElement("h3");
      movesHeading.id = "status-info";
      movesHeading.innerHTML = `<span class="status">PHASE 1: Program the sequence of movements</span>`;

      // Create moves display
      const movesDisplay = document.createElement("div");
      movesDisplay.id = "moves-display";
      movesDisplay.textContent = "";

      // Add elements to moves queue
      movesQueue.appendChild(movesHeading);
      movesQueue.appendChild(movesDisplay);
      controls.appendChild(movesQueue);

      const gameboard = document.createElement("div");
      gameboard.id = "gameboard";
      gameContainer.appendChild(gameboard);
      const playground = document.createElement("div");
      playground.classList.add("playground");
      gameboard.appendChild(playground);
      // cargar el tablero de juego y las entidades por otro lado
      return {
        levelInfo: levelh2,
        statusInfo: movesHeading,
        movesDisplay: movesDisplay,
      };
    }
  }
}

export function createInfoModal(container) {
  const infoModal = container;
  infoModal.className = "modal-overlay";
  infoModal.innerHTML = `
      <div class="modal-content">
        <span class="modal-title">ABOUT GOZZLER</span>
<h3>How to play</h3>
<p class="about">In each level you have to reach the gem. To do this, think ahead
and <span class="bold">press the direction buttons or keys</span> to create the sequence of movements.
Once you have it ready, press the <span class="bold">MOVE</span> button or press
<span class="bold">ENTER</span> to put Gozzler in motion.
<br>
But be careful, because Gozzler won't stop moving in every direction until he hits something.
Only then will he stop for a moment and move on to the next direction until
there are no more left. If the movement does not end on the gem,
you have not passed the level.
<br>
Try to do it in as few moves as possible and you will earn more stars.</p>

<hr>
        <h3>Credits</h3>
        <p><span class="bold">Author</span>: <a href="https://github.com/NoaVelasco">NOAVE<a>, 2025</p>
        <p>
          <span class="bold">Assets</span>: <a href="https://www.kenney.nl/">KENNEY</a>
          and <a href="https://duckhive.itch.io/">DUCKHIVE<a>
        </p>

<hr>

        <div class="modal-buttons">
          <button class="modal-button exit-btn" id="exit">EXIT</button>
        </div>
      </div>`;
  return infoModal;
}

// console.log("UI Test loaded");

// window.onload = () => ui("PlayingState");
