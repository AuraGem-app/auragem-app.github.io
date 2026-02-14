/* --- CONFIGURACIÓN Y ESTADO --- */
let paginaActual = 0;
const MENSAJES = [
    { titulo: "¡Para ti! ❤️", cuerpo: "Cada página de este librito es un pequeño detalle para recordarte lo especial que eres." },
    { titulo: "Eres increíble ✨", cuerpo: "Gracias por estar en mi vida y por todos los momentos que compartimos." },
    { titulo: "Tu sonrisa 😊", cuerpo: "Es capaz de iluminar hasta mi día más gris. Nunca dejes de sonreír." },
    { titulo: "Un deseo 🌟", cuerpo: "Espero que sigamos creando recuerdos hermosos juntos, paso a paso." },
    { titulo: "Te quiero mucho", cuerpo: "Gracias por ser exactamente como eres. 🎁" }
];

// Selectores frecuentes
const elements = {
    stack: () => document.getElementById('stack'),
    hint: () => document.getElementById('hint'),
    gif: () => document.getElementById('final-gif-container'),
    musica: () => document.getElementById('musica-regalo')
};

/* --- FUNCIONES PRINCIPALES --- */

/**
 * Crea las cartas en el DOM basándose en el array de mensajes.
 */
function inicializarCartas() {
    const stack = elements.stack();
    stack.innerHTML = '';
    
    MENSAJES.forEach((msg, index) => {
        const carta = document.createElement('div');
        carta.className = 'hoja-libro';
        
        // Estilo dinámico: z-index invertido y efecto de profundidad
        Object.assign(carta.style, {
            zIndex: MENSAJES.length - index,
            transform: `translateY(${index * 5}px) scale(${1 - index * 0.02})`
        });

        carta.innerHTML = `
            <h1>${msg.titulo}</h1>
            <p>${msg.cuerpo}</p>
        `;
        
        carta.onclick = (e) => {
            e.stopPropagation();
            siguientePagina();
        };
        stack.appendChild(carta);
    });
}

/**
 * Activa la apertura de la caja y la música.
 */
function abrirRegalo() {
    if (document.body.classList.contains('abierto')) return;
    
    document.body.classList.add('abierto');
    gestionarMusica(true);

    // Partículas de explosión inicial
    emitirParticulas(50);
}

/**
 * Controla la transición de las cartas (pasa de una a otra).
 */
function siguientePagina() {
    const cartas = document.querySelectorAll('.hoja-libro');
    
    if (paginaActual < cartas.length) {
        cartas[paginaActual].classList.add('carta-fuera');
        emitirParticulas(10);
        paginaActual++;

        if (paginaActual === cartas.length) {
            finalizarExperiencia();
        }
    }
}

/**
 * Acciones finales al terminar de leer todas las cartas.
 */
function finalizarExperiencia() {
    elements.stack().classList.add('oculto'); 
    
    const hint = elements.hint();
    const gifContainer = elements.gif();
    const btnReset = document.querySelector('.btn-reset');

    // Preparamos el texto
    hint.innerHTML = "Con amor, para ti ❤️";
    hint.classList.add('final');

    setTimeout(() => {
        // Mostramos el contenedor principal
        gifContainer.classList.add('mostrar');

        // Reordenamos los elementos dentro del contenedor
        // Al hacer esto, se disparan las animaciones de CSS con sus delays
        gifContainer.appendChild(document.querySelector('.gif-final img')); 
        gifContainer.appendChild(hint); 
        gifContainer.appendChild(btnReset); 

        emitirParticulas(40, 40);
    }, 600);
}

/**
 * Reinicia todo el flujo al estado original.
 */
function reiniciarExperiencia() {
    elements.gif().classList.remove('mostrar');
    document.body.classList.remove('abierto');
    elements.stack().classList.remove('oculto'); 

    paginaActual = 0;
    gestionarMusica(false);
    
    setTimeout(() => {
        const hint = elements.hint();
        hint.classList.remove('final');
        hint.innerHTML = "Toca la carta para ver más ❤️";
        inicializarCartas();
    }, 800);
}

/* --- UTILIDADES --- */

/**
 * Gestiona el audio con un pequeño efecto de fade-in o reset.
 */
function gestionarMusica(play) {
    const musica = elements.musica();
    if (play) {
        musica.volume = 0;
        musica.play().then(() => {
            let fade = setInterval(() => {
                if (musica.volume < 0.5) musica.volume += 0.05;
                else clearInterval(fade);
            }, 200);
        }).catch(() => console.warn("Audio bloqueado por el navegador"));
    } else {
        musica.pause();
        musica.currentTime = 0;
    }
}

/**
 * Genera efectos visuales de corazones.
 */
function crearParticula() {
    const p = document.createElement('div');
    p.className = 'particula';
    p.innerHTML = Math.random() > 0.5 ? '❤️' : '💖';
    
    const x = (Math.random() - 0.5) * 800;
    const y = (Math.random() - 0.5) * 800;
    
    p.style.setProperty('--x', `${x}px`);
    p.style.setProperty('--y', `${y}px`);
    p.style.setProperty('--r', `${Math.random() * 360}deg`);
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2500);
}

function emitirParticulas(cantidad, delay = 0) {
    for (let i = 0; i < cantidad; i++) {
        delay > 0 ? setTimeout(crearParticula, i * delay) : crearParticula();
    }
}

// Inicialización
window.onload = inicializarCartas;