function abrirRegalo() {
    const escena = document.getElementById('escena');
    
    // Evitar que se repita la animación si ya está abierto
    if (escena.classList.contains('abierto')) return;

    escena.classList.add('abierto');
    
    // Lanzar partículas (corazones)
    for (let i = 0; i < 50; i++) {
        crearParticula();
    }
}

function crearParticula() {
    const p = document.createElement('div');
    p.className = 'particula';
    
    // Elegir aleatoriamente entre dos tipos de corazones
    p.innerHTML = Math.random() > 0.5 ? '❤️' : '💖';
    
    // Calcular trayectoria aleatoria
    const x = (Math.random() - 0.5) * (window.innerWidth < 600 ? 500 : 800);
    const y = (Math.random() - 0.5) * (window.innerHeight < 600 ? 500 : 800);
    const r = Math.random() * 360;
    
    // Aplicar variables CSS para la animación
    p.style.setProperty('--x', `${x}px`);
    p.style.setProperty('--y', `${y}px`);
    p.style.setProperty('--r', `${r}deg`);
    
    // Posición inicial (centro)
    p.style.left = '50%';
    p.style.top = '50%';
    p.style.fontSize = (Math.random() * 20 + 15) + 'px';
    
    document.body.appendChild(p);
    
    // Limpiar el DOM después de la animación
    setTimeout(() => p.remove(), 2500);
}