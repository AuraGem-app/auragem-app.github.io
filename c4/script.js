// Generación de Estrellas
const starsContainer = document.getElementById('stars-container');
for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1 + 'px';
    star.style.width = size; star.style.height = size;
    star.style.top = Math.random() * 100 + '%'; 
    star.style.left = Math.random() * 100 + '%';
    star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
    starsContainer.appendChild(star);
}

// Corazones flotantes de fondo
setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.bottom = '-5%';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 4000);
}, 1000);

const noBtn = document.getElementById('no');
const yesBtn = document.getElementById('yes');
let scaleYes = 1;

// Función para mover el botón "No" y agrandar el "Sí"
function moverBotonNo(e) {
    if(e) e.preventDefault();
    
    // Cambiar el botón a posición fija si aún está en el flujo normal
    if (noBtn.parentElement.className === 'btns') {
        document.body.appendChild(noBtn);
    }

    noBtn.style.position = 'fixed';
    
    const yesRect = yesBtn.getBoundingClientRect();
    const padding = 60;
    let newX, newY;
    let collision = true;

    // Lógica para encontrar una posición libre
    while (collision) {
        newX = Math.random() * (window.innerWidth - noBtn.offsetWidth - padding) + 20;
        newY = Math.random() * (window.innerHeight - noBtn.offsetHeight - padding) + 20;

        const noRectFuture = {
            left: newX,
            top: newY,
            right: newX + noBtn.offsetWidth,
            bottom: newY + noBtn.offsetHeight
        };

        // Evitar superposición con el botón SÍ y el botón AuraGem superior izquierdo
        const collisionWithYes = !(noRectFuture.right < yesRect.left - 20 || 
                                   noRectFuture.left > yesRect.right + 20 || 
                                   noRectFuture.bottom < yesRect.top - 20 || 
                                   noRectFuture.top > yesRect.bottom + 20);
        
        const collisionWithBackBtn = (newX < 150 && newY < 80);

        if (!collisionWithYes && !collisionWithBackBtn) {
            collision = false;
        }
    }

    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';

    // Agrandar el botón "Sí" gradualmente
    if (scaleYes < 4) {
        scaleYes += 0.3;
        yesBtn.style.transform = `scale(${scaleYes})`;
    }
}

// Listeners para el botón "No"
noBtn.addEventListener('mouseenter', moverBotonNo);
noBtn.addEventListener('touchstart', moverBotonNo, {passive: false});

// Acción al presionar "Sí"
yesBtn.addEventListener('click', () => {
    confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: ['#ff2d55', '#ffffff', '#ff85a1']
    });

    document.getElementById('quiz-card').innerHTML = `
        <div style="font-size: 4rem;">💖</div>
        <h2 style="font-size: 2.2rem;">¡Eres mi felicidad! 😍</h2>
        <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpueXNidXp6eXNidXp6eXNidXp6eXNidXp6eXNidXp6eXNidSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KztT2c4u8mYYUiMKdJ/giphy.gif" 
             style="width:100%; border-radius:15px; margin-top:15px;" 
             alt="Abrazo feliz">
    `;
    if(noBtn) noBtn.remove();
});