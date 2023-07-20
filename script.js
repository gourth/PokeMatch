
const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const game = document.getElementById('game');

let firstPick;
let isPaused = true;
let matches;

const colors = {
	fire: '#FDDFDF',
	grass: '#DEFDE0',
	electric: '#FCF7DE',
	water: '#DEF3FD',
	ground: '#f4e7da',
	rock: '#d5d5d4',
	fairy: '#fceaff',
	poison: '#98d7a5',
	bug: '#f8d5a3',
	dragon: '#97b3e6',
	psychic: '#eaeda1',
	flying: '#F5F5F5',
	fighting: '#E6E0D4',
	normal: '#F5F5F5'
};


const levels = {
    easy: {
      numCards: 8,
      
    },
    medium: {
      numCards: 12,
      
    },
    hard: {
      numCards: 16,
      
    },
  };
  
  // Get the selected level from the dropdown
  const levelSelector = document.getElementById("level");
  let selectedLevel = levelSelector.value;
  
  // Update the selected level whenever the dropdown changes
  levelSelector.addEventListener("change", () => {
    selectedLevel = levelSelector.value;
    resetGame(); // Call resetGame() when the level changes
  });

const loadPokemon = async () => {
  const randomIds = new Set();
  while (randomIds.size < levels[selectedLevel].numCards / 2) {
    const randomNumber = Math.ceil(Math.random() * 150);
    randomIds.add(randomNumber);
  }
  const pokePromises = [...randomIds].map((id) => fetch(pokeAPIBaseUrl + id));
  const results = await Promise.all(pokePromises);
  return await Promise.all(results.map((res) => res.json()));
};

const resetGame = async() => {
    
    const loadedPokemon = await loadPokemon();
  displayPokemon([...loadedPokemon, ...loadedPokemon]);
    game.innerHTML = '';
    isPaused = true;
    firstPick = null;
    matches = 0;
    resetTimer();
    setTimeout(async () => {
        const loadedPokemon = await loadPokemon();
        displayPokemon([...loadedPokemon, ...loadedPokemon]);
        isPaused = false;
    },200)
    const winnerMessageElement = document.getElementById('winnerMessage');
    if (winnerMessageElement) {
        winnerMessageElement.style.display = 'none';
    }

    const gameOverMessageElement = document.getElementById('gameOverMessage');
    if (gameOverMessageElement) {
        gameOverMessageElement.style.display = 'none';
    }
}

const displayPokemon = (pokemon) => {
    pokemon.sort(_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
        const type = pokemon.types[0]?.type?.name;
        const color = colors[type] ||'#F5F5F5';
        return `
          <div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}" style="background-color:${color};">
            <div class="front ">
            </div>
            <div class="back rotated" style="background-color:${color};">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"  />
            <h2>${pokemon.name}</h2>
            </div>
        </div>
    `}).join('');
    game.innerHTML = pokemonHTML;
}

let timeRemaining = 60;
let timerInterval;

const startTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval); 
    }

    const timerElement = document.getElementById("timer");
    timerElement.textContent = timeRemaining; 

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining >= 0) {
            timerElement.textContent = timeRemaining;
        } else {
            clearInterval(timerInterval);
            handleGameOver(); 
        }
    }, 1000);
};

const resetTimer = () => {
    timeRemaining = 60; 
    const timerElement = document.getElementById("timer");
    timerElement.textContent = timeRemaining; 
};

const handleGameOver = () => {
    // Display the "GAME OVER" message on the screen
    const loseSound = document.getElementById('loseSound');
    loseSound.play();
    const gameOverMessageElement = document.getElementById("gameOverMessage");
    gameOverMessageElement.style.display = "block";
};

const handleGameWon = () => {
    // Display and flash "WINNER" message on the screen
    const winSound = document.getElementById('winSound');
    winSound.play();
    const winnerMessageElement = document.getElementById("winnerMessage");

    let isVisible = true;
    const flashingInterval = setInterval(() => {
        isVisible = !isVisible;
        winnerMessageElement.style.display = isVisible ? "block" : "none";
    }, 500);

    setTimeout(() => {
        clearInterval(flashingInterval);
        winnerMessageElement.style.display = "none";
    }, 5000);
};


const clickCard = (e) => {
    const clickSound = document.getElementById('clickSound');
    clickSound.play();
    const pokemonCard = e.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard);
    if (front.classList.contains("rotated") || isPaused) {
        return;
    }
    isPaused = true;
    rotateElements([front, back]);
    if (!firstPick) {
        firstPick = pokemonCard;
        isPaused = false;
        // Start the timer when the first card is clicked
        startTimer();
    } else {
        const secondPokemonName = pokemonCard.dataset.pokename;
        const firstPokemonName = firstPick.dataset.pokename;
        if (firstPokemonName !== secondPokemonName) {
            const incorrectMatchSound = document.getElementById('incorrectMatchSound');
            incorrectMatchSound.play();
            const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
            setTimeout(() => {
                rotateElements([front, back, firstFront, firstBack]);
                firstPick = null;
                isPaused = false;
            }, 500);
        } else {
            matches++;
            if (matches === levels[selectedLevel].numCards / 2) {
                handleGameWon();
                clearInterval(timerInterval);
            }
            firstPick = null;
            isPaused = false;

            const correctMatchSound = document.getElementById('correctMatchSound');
            correctMatchSound.play();
        }
    }
};
const getFrontAndBackFromCard = (card) => {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    return [front, back]
}

const rotateElements = (elements) => {
    if(typeof elements !== 'object' || !elements.length) return;
    elements.forEach(element => element.classList.toggle('rotated'));
}

resetGame();