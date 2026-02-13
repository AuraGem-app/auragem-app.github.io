const container = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const tutoOverlay = document.getElementById('tutorial-overlay');
const tutoText = document.getElementById('tuto-text');
const btnBack = document.querySelector('.btn-back');
const moveHint = document.getElementById('tuto-move-hint');

let score = 0, lives = 3, active = false, isTutorial = false;
let config = { speed: 5, accel: 0.1, spawnRate: 850, rockHoming: false, penalty: 2 };
let currentSpeed = 5, hasShield = false, tutoStep = 0;

let targetX = container.clientWidth / 2;
let currentX = container.clientWidth / 2;

// --- VARIABLES ADMIN ---
let adminEnabled = false;
let godMode = false;
const ADMIN_PASSWORD = "123"; // <--- Tu contraseña secreta

// --- MOTOR DE MOVIMIENTO ---
function updatePosition() {
    if (active) {
        currentX += (targetX - currentX) * 0.15;
        player.style.left = `${currentX}px`;
    }
    requestAnimationFrame(updatePosition);
}
updatePosition();

const handleMove = (e) => {
    if (!active) return;
    const rect = container.getBoundingClientRect();
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    let x = clientX - rect.left;
    targetX = Math.max(50, Math.min(rect.width - 50, x));
    if (isTutorial) moveHint.style.display = 'none';
};

container.addEventListener('pointermove', handleMove);
container.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});

// --- LÓGICA DE TUTORIAL ---
const tutorialSteps = [
    { icon: '❤️', text: "Los CORAZONES suben tu barra de progreso. ¡Atrapa todos!", type: 'good' },
    { icon: '🪨', text: "Las ROCAS son fatales. Un impacto y la misión termina.", type: 'death' },
    { icon: '🛡️', text: "El ESCUDO te permite resistir un impacto sin daño.", type: 'shield' },
    { icon: '🧪', text: "EL TURBO: Aumenta tu velocidad drásticamente por unos segundos.", type: 'potion' },
    { icon: '🚫', text: "RED FLAGS: Te restan vidas. ¡Esquiva el drama!", type: 'bad' }
];

function startTutorial() { 
    isTutorial = true; active = true; 
    btnBack.classList.add('hidden');
    moveHint.style.display = 'block';
    document.getElementById('menu-modal').style.display = 'none'; 
    nextTutoStep(); 
}

function nextTutoStep() {
    if (tutoStep >= tutorialSteps.length) { 
        isTutorial = false; finish("tuto_end"); return; 
    }
    const step = tutorialSteps[tutoStep];
    spawnTutoEntity(step.icon, step.type, step.text);
}

function spawnTutoEntity(icon, type, text) {
    const el = document.createElement('div');
    el.className = 'entity' + (type === 'death' ? ' rock' : '');
    el.innerHTML = icon; el.dataset.type = type; 
    el.style.left = '50%'; el.style.top = '-60px';
    container.appendChild(el);

    let fall = setInterval(() => {
        let y = parseFloat(el.style.top); 
        el.style.top = (y + 5) + 'px';
        if (y > container.clientHeight * 0.25 && tutoOverlay.style.display !== 'flex') {
            clearInterval(fall); 
            tutoText.innerText = text; 
            tutoOverlay.style.display = 'flex';
            const resume = () => {
                tutoOverlay.style.display = 'none'; 
                container.removeEventListener('pointerdown', resume);
                fall = setInterval(() => {
                    let y2 = parseFloat(el.style.top); 
                    el.style.top = (y2 + 10) + 'px';
                    if (checkCollision(el, fall, true)) return;
                    if (y2 > container.clientHeight) { 
                        clearInterval(fall); el.remove(); 
                        tutoStep++; nextTutoStep(); 
                    }
                }, 16);
            };
            container.addEventListener('pointerdown', resume);
        }
    }, 16);
}

// --- CONFIGURACIÓN DE DIFICULTAD ---
function checkAdminPassword() {
    const entry = prompt("INGRESE CÓDIGO DE ACCESO:");
    if (entry === ADMIN_PASSWORD) {
        adminEnabled = true;
        godMode = false; 
        setupGame('admin');
    } else {
        alert("ERROR: ACCESO DENEGADO.");
    }
}

function setupGame(difficulty) {
    document.querySelector('.btn-back').classList.add('hidden');
    document.getElementById('menu-modal').style.display = 'none';
    isTutorial = false;

    if (difficulty === 'easy') {
        config = { speed: 4.5, accel: 0.08, spawnRate: 1000, rockHoming: false, penalty: 1 };
    } else if (difficulty === 'med') {
        config = { speed: 6.5, accel: 0.2, spawnRate: 750, rockHoming: false, penalty: 4 };
    } else if (difficulty === 'hard') {
        config = { speed: 9, accel: 0.5, spawnRate: 280, rockHoming: true, penalty: 5 };
    } else if (difficulty === 'admin') {
        config = { speed: 10, accel: 0, spawnRate: 999999, rockHoming: true, penalty: 0 };
        debugPanel.style.display = 'block';
        player.style.filter = 'sepia(1) saturate(10) hue-rotate(90deg) drop-shadow(0 0 10px none)';
    }

    currentSpeed = config.speed; 
    startGame();
}

function startGame() { 
    active = true;
    createEntity(); 
}

// --- GENERADOR DE ENTIDADES ---
function createEntity() {
    if (!active || isTutorial) return;
    const el = document.createElement('div'); 
    el.className = 'entity';
    const rnd = Math.random();
    
    // Probabilidades
    if (config.rockHoming) {
        if (rnd > 0.8) { el.innerHTML = '❤️'; el.dataset.type = 'good'; }
        else if (rnd > 0.35) { el.innerHTML = '🪨'; el.className += ' rock'; el.dataset.type = 'death'; }
        else if (rnd > 0.15) { el.innerHTML = '🚫'; el.dataset.type = 'bad'; }
        else if (rnd > 0.07) { el.innerHTML = '🛡️'; el.dataset.type = 'shield'; }
        else { el.innerHTML = '🧪'; el.dataset.type = 'potion'; }
    } else {
        if (rnd > 0.5) { el.innerHTML = '❤️'; el.dataset.type = 'good'; }
        else if (rnd > 0.25) { el.innerHTML = '🪨'; el.className += ' rock'; el.dataset.type = 'death'; }
        else if (rnd > 0.15) { el.innerHTML = '🚫'; el.dataset.type = 'bad'; }
        else if (rnd > 0.08) { el.innerHTML = '🛡️'; el.dataset.type = 'shield'; }
        else { el.innerHTML = '🧪'; el.dataset.type = 'potion'; }
    }

    const margin = 60;
    const startX = Math.random() * (container.clientWidth - margin * 2) + margin;
    el.style.left = startX + 'px'; 
    el.style.top = '-60px';
    container.appendChild(el);

    let angle = 0;
    const wobbleSpeed = Math.random() * 0.08 + 0.04;
    const wobbleWidth = 15;

    function fallFrame() {
        if (!active || !el.parentNode) return;
        let y = parseFloat(el.style.top) + currentSpeed;
        let currentXPos = startX;

        if (config.rockHoming && el.dataset.type === 'death') {
            let targetXPos = parseFloat(el.style.left);
            let diffX = currentX - targetXPos;
            currentXPos = targetXPos + (diffX * 0.01);
        } else {
            angle += wobbleSpeed;
            currentXPos = startX + (Math.sin(angle) * wobbleWidth);
        }

        currentXPos = Math.max(20, Math.min(container.clientWidth - 40, currentXPos));
        el.style.top = y + 'px'; 
        el.style.left = currentXPos + 'px';
        
        if (!checkCollision(el, fallFrame)) {
            if (y > container.clientHeight) {
                if (el.dataset.type === 'good') { 
                    score = Math.max(0, score - config.penalty); 
                    scoreDisplay.innerText = score; 
                }
                el.remove();
            } else {
                requestAnimationFrame(fallFrame);
            }
        }
    }
    requestAnimationFrame(fallFrame);
    setTimeout(createEntity, Math.max(150, config.spawnRate - (score * 2)));
}

// --- COLISIONES ---
function checkCollision(el, interval, isTuto) {
    const pR = player.getBoundingClientRect();
    const eR = el.getBoundingClientRect();
    const padding = 25;

    if (eR.top < pR.bottom - padding && eR.bottom > pR.top + padding && 
        eR.left < pR.right - padding && eR.right > pR.left + padding) {
        
        if (godMode && el.dataset.type === 'death' && !isTuto) {
            el.remove(); return true; 
        }

        if (isTuto) { 
            el.remove(); clearInterval(interval); 
            tutoStep++; nextTutoStep(); return true; 
        }
        handleCollision(el.dataset.type); el.remove(); return true;
    }
    return false;
}

function handleCollision(type) {
    if (type === 'good') { score += 5; currentSpeed += config.accel; }
    else if (type === 'bad') { if(hasShield) { toggleShield(false); return; } lives--; }
    else if (type === 'death') { if(hasShield) { toggleShield(false); return; } finish("rock"); return; }
    else if (type === 'shield') toggleShield(true);
    else if (type === 'potion') { 
        let oldS = currentSpeed; currentSpeed *= 1.7; 
        setTimeout(() => currentSpeed = oldS, 2000); 
    }
    
    livesDisplay.innerText = godMode ? "♾️ GOD" : "❤️".repeat(Math.max(0, lives));
    scoreDisplay.innerText = Math.min(score, 100);
    if (score >= 100) finish("win");
    if (lives <= 0 && !godMode) finish("lose");
}

function toggleShield(state) { 
    hasShield = state; 
    player.style.filter = state ? 'drop-shadow(0 0 20px #fbff00) brightness(1.5)' : 'none'; 
}

function finish(reason) {
    active = false; 
    btnBack.classList.remove('hidden');
    debugPanel.style.display = 'none';
    const m = document.getElementById('end-modal');
    m.style.display = 'flex';
    
    if (reason === "win") { 
        document.getElementById('end-title').innerText = "¡VICTORIA! ❤️"; 
        document.getElementById('end-msg').innerHTML = "Has superado todos los obstáculos.<br><b>¿Aceptarías ser mi Valentín?</b>"; 
    } else if (reason === "tuto_end") {
        document.getElementById('end-title').innerText = "ENTRENAMIENTO COMPLETO";
        document.getElementById('end-msg').innerText = "Estás listo para pilotar. Elige un nivel.";
    } else {
        document.getElementById('end-title').innerText = "MISIÓN FALLIDA";
        document.getElementById('end-msg').innerText = reason === "rock" ? "Impacto crítico con una roca espacial." : "Te has quedado sin amor (corazones).";
    }
}

// --- SISTEMA ADMINISTRADOR PANEL ---
const debugPanel = document.createElement('div');
debugPanel.id = 'admin-panel';
debugPanel.style = `position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.85);color:#0f0;padding:10px;font-family:monospace;font-size:11px;border:1px solid #0f0;border-radius:5px;z-index:1000;display:none;pointer-events:none;line-height:1.4;`;
document.body.appendChild(debugPanel);

window.addEventListener('keydown', (e) => {
    if (!active || !adminEnabled) return;
    if (e.key === '0') {
        godMode = !godMode;
        if (godMode) {
            player.style.filter = 'sepia(1) saturate(10) hue-rotate(90deg) drop-shadow(0 0 15px #0f0)';
            player.style.transform = 'translateX(-50%) scale(1.2)'; // El cohete crece un poco
            livesDisplay.innerText = "♾️ GOD";
        } else {
            player.style.filter = 'none';
            player.style.transform = 'translateX(-50%) scale(1)'; // Vuelve a su tamaño
            lives = 3;
            livesDisplay.innerText = "❤️❤️❤️";
        }
    }
    if (e.key === '+') currentSpeed += 1;
    if (e.key === '-') currentSpeed = Math.max(1, currentSpeed - 1);

    switch(e.key) {
        case '1': adminSpawn('❤️', 'good'); break;
        case '2': adminSpawn('🪨', 'death', true); break;
        case '3': adminSpawn('🚫', 'bad'); break;
        case '4': adminSpawn('🛡️', 'shield'); break;
        case '5': adminSpawn('🧪', 'potion'); break;
    }
});

function adminSpawn(icon, type, isRock = false) {
    const el = document.createElement('div');
    el.className = 'entity' + (isRock ? ' rock' : '');
    el.innerHTML = icon; el.dataset.type = type;
    
    // Spawnea un poco alejado para que tenga tiempo de perseguirte
    const startXPos = Math.random() * (container.clientWidth - 100) + 50;
    el.style.left = startXPos + 'px'; 
    el.style.top = '-60px';
    container.appendChild(el);

    function fall() {
        if (!active || !el.parentNode) return;
        
        let y = parseFloat(el.style.top) + currentSpeed;
        let x = parseFloat(el.style.left);

        // --- LÓGICA DE PERSECUCIÓN (HOMING) ---
        if (isRock) {
            let diffX = currentX - x;
            x += diffX * 0.025; // Fuerza de persecución
        }

        el.style.top = y + 'px';
        el.style.left = x + 'px';

        if (!checkCollision(el, fall)) {
            if (y > container.clientHeight) {
                el.remove();
            } else {
                requestAnimationFrame(fall);
            }
        }
    }
    requestAnimationFrame(fall);
}

setInterval(() => {
    if (active && adminEnabled) {
        debugPanel.innerHTML = `NIVEL ADMIN<br>----------<br>VELOCIDAD: ${currentSpeed.toFixed(2)}<br>GOD MODE: ${godMode ? 'SI' : 'NO'}<br><br>[1-5] Invocación<br>[0] Modo Dios<br>[+/-] Velocidad`;
    }
}, 100);