// script.js - Lógica y Animaciones
const btnTouch = document.getElementById('btn-touch');
const loader = document.getElementById('loader');
const intro = document.getElementById('intro');
const finalMsg = document.getElementById('final-msg');
const btnFinal = document.getElementById('btn-final');

let pressTimer;
let charge = 0;
const limit = 377; 
let clickCount = 0; // Contador para la melodía final

// --- LÓGICA DE CARGA (MANTENER PRESIONADO) ---
function startPress(e) {
    e.preventDefault();
    pressTimer = setInterval(() => {
        charge += 4;
        
        // Efecto de sonido de carga
        if (charge % 20 === 0 && typeof Sonidos !== 'undefined') {
            Sonidos.carga(charge);
        }

        if (charge <= 100) {
            const offset = limit - (charge / 100) * limit;
            loader.style.strokeDashoffset = offset;
        } else {
            complete();
        }
    }, 30);
}

function stopPress() {
    clearInterval(pressTimer);
    if (charge < 100) {
        charge = 0;
        loader.style.strokeDashoffset = limit;
    }
}

function complete() {
    clearInterval(pressTimer);
    if(navigator.vibrate) navigator.vibrate(100);

    if (typeof Sonidos !== 'undefined') Sonidos.revelar();

    intro.style.opacity = '0';
    intro.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
        intro.style.display = 'none';
        finalMsg.style.display = 'block';
        setTimeout(() => {
            finalMsg.style.opacity = '1';
            finalMsg.style.transform = 'translateY(0)';
        }, 100);
    }, 600);
}

// --- EVENTOS DEL CÍRCULO ---
btnTouch.addEventListener('touchstart', startPress);
btnTouch.addEventListener('touchend', stopPress);
btnTouch.addEventListener('mousedown', startPress);
btnTouch.addEventListener('mouseup', stopPress);

// --- EVENTO DEL BOTÓN FINAL (MELODÍA POR CLIC) ---
btnFinal.addEventListener('click', function() {
    if (typeof Sonidos !== 'undefined') {
        Sonidos.tocarSiguienteNota(clickCount);
        clickCount++;
    }

    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff2d55', '#d4af37', '#ffffff']
    });

    // Cambia el texto para que sea dinámico
    const frases = ["SÍ, ACEPTO", "❤️", "Eres increíble", "✨", "¡Gracias!", "🥰"];
    this.innerText = frases[clickCount % frases.length];
});

// --- GENERADOR DE ESTRELLAS ---
const container = document.getElementById('stars-container');
for (let i = 0; i < 40; i++) {
    const star = document.createElement('div');
    star.style.position = 'absolute';
    star.style.width = '2px';
    star.style.height = '2px';
    star.style.background = 'white';
    star.style.borderRadius = '50%';
    star.style.top = Math.random() * 100 + '%';
    star.style.left = Math.random() * 100 + '%';
    star.style.opacity = Math.random() * 0.7;
    container.appendChild(star);
}