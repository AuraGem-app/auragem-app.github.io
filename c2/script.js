let paginaActual = 0;
const mensajes = [
    { titulo: "¡Para ti! ❤️", cuerpo: "Cada página de este librito es un pequeño detalle para recordarte lo especial que eres." },
    { titulo: "Eres increíble ✨", cuerpo: "Gracias por estar en mi vida y por todos los momentos que compartimos." },
    { titulo: "Tu sonrisa 😊", cuerpo: "Es capaz de iluminar hasta mi día más gris. Nunca dejes de sonreír." },
    { titulo: "Un deseo 🌟", cuerpo: "Espero que sigamos creando recuerdos hermosos juntos, paso a paso." },
    { titulo: "Te quiero mucho", cuerpo: "Gracias por ser exactamente como eres. 🎁" }
];

function inicializarCartas() {
    const stack = document.getElementById('stack');
    stack.innerHTML = '';
    
    mensajes.forEach((msg, index) => {
        const carta = document.createElement('div');
        carta.className = 'hoja-libro';
        carta.style.zIndex = mensajes.length - index;
        
        // Efecto visual de pila
        carta.style.transform = `translateY(${index * 5}px) scale(${1 - index * 0.02})`;

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

function abrirRegalo() {
    if (document.body.classList.contains('abierto')) return;
    document.body.classList.add('abierto');

    // Música
    const musica = document.getElementById('musica-regalo');
    musica.volume = 0;
    musica.play().then(() => {
        let fadeAudio = setInterval(() => {
            if (musica.volume < 0.5) musica.volume += 0.05;
            else clearInterval(fadeAudio);
        }, 200);
    }).catch(() => console.log("Interacción requerida para audio"));

    // Partículas iniciales
    for (let i = 0; i < 50; i++) crearParticula();
}

function siguientePagina() {
    const cartas = document.querySelectorAll('.hoja-libro');
    if (paginaActual < cartas.length) {
        cartas[paginaActual].classList.add('carta-fuera');
        for (let i = 0; i < 10; i++) crearParticula();
        
        paginaActual++;

        if (paginaActual === cartas.length) {
            const hint = document.getElementById('hint');
            hint.innerHTML = "Con amor, para ti ❤️";
            hint.classList.add('final');
            
            mostrarGifFinal();
        }
    }
}

function mostrarGifFinal() {
    const gifContainer = document.getElementById('final-gif-container');
    setTimeout(() => {
        gifContainer.classList.add('mostrar');
        // Explosión de corazones final
        for (let i = 0; i < 40; i++) {
            setTimeout(crearParticula, i * 40);
        }
    }, 600);
}

// Función para volver al inicio manualmente
function reiniciarExperiencia() {
    // 1. Desvanecer elementos finales
    const gifContainer = document.getElementById('final-gif-container');
    const hint = document.getElementById('hint');
    
    gifContainer.classList.remove('mostrar');
    
    // 2. Cerrar el regalo (volver el body a estado normal)
    document.body.classList.remove('abierto');

    // 3. Resetear variables y cartas
    paginaActual = 0;
    
    setTimeout(() => {
        // Quitamos la clase final al texto después de que la transición del body ayude a ocultarlo
        hint.classList.remove('final');
        hint.innerHTML = "Toca la carta para ver más ❤️";
        
        // Limpiamos el stack y lo reinicializamos
        inicializarCartas();
        
        // Reset música
        const musica = document.getElementById('musica-regalo');
        musica.pause();
        musica.currentTime = 0;
    }, 800); // Esperamos a que la animación de cierre de la caja progrese
}

function crearParticula() {
    const p = document.createElement('div');
    p.className = 'particula';
    p.innerHTML = Math.random() > 0.5 ? '❤️' : '💖';
    
    const x = (Math.random() - 0.5) * 800;
    const y = (Math.random() - 0.5) * 800;
    
    p.style.setProperty('--x', `${x}px`);
    p.style.setProperty('--y', `${y}px`);
    p.style.setProperty('--r', `${Math.random() * 360}deg`);
    p.style.left = '50%'; p.style.top = '50%';
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2500);
}

window.onload = inicializarCartas;