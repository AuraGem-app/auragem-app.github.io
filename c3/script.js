const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

let particles = [], stars = [], phrasesPoints = [];
let tick = 0, modeTimer = 0, globalMode = "heart";
let currentPhraseIndex = 0;

const phrases = ["ERES MI TODO", "FELIZ 14", "JUNTOS X SIEMPRE", "MI CORAZÓN"];
const colors = ["#ff0040", "#ff4d6d", "#ff85a1", "#ffd700"];
const sprites = {};
let mouse = { x: -1000, y: -1000, active: false, burst: 0 };

const dpr = window.devicePixelRatio || 1;
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 1200 : 2200;

// Optimización: Crear sprites de corazones una sola vez
function createSprites() {
    colors.forEach(color => {
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 16 * dpr; sCanvas.height = 16 * dpr;
        const sCtx = sCanvas.getContext('2d');
        sCtx.scale(dpr, dpr);
        sCtx.fillStyle = color;
        sCtx.beginPath();
        sCtx.moveTo(8, 5);
        sCtx.bezierCurveTo(8, 3, 5, 3, 5, 5);
        sCtx.bezierCurveTo(5, 7, 8, 9, 8, 12);
        sCtx.bezierCurveTo(8, 9, 11, 7, 11, 5);
        sCtx.bezierCurveTo(11, 3, 8, 3, 8, 5);
        sCtx.fill();
        sprites[color] = sCanvas;
    });
}

function precalculatePhrases() {
    phrasesPoints = phrases.map(p => getTextPoints(p));
}

function getTextPoints(phrase) {
    const tCanvas = document.createElement("canvas");
    const tCtx = tCanvas.getContext("2d");
    tCanvas.width = window.innerWidth;
    tCanvas.height = window.innerHeight;
    
    let fontSize = Math.min(window.innerWidth / 7, isMobile ? 65 : 115);
    tCtx.font = `900 ${fontSize}px sans-serif`;
    
    const metrics = tCtx.measureText(phrase);
    const maxWidth = window.innerWidth * 0.85; 
    const shouldSplit = isMobile && (metrics.width > maxWidth || phrase.length > 9);
    const words = phrase.split(' ');
    
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillStyle = "white";

    if (shouldSplit && words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        tCtx.fillText(line1, tCanvas.width / 2, tCanvas.height / 2 - fontSize * 0.6);
        tCtx.fillText(line2, tCanvas.width / 2, tCanvas.height / 2 + fontSize * 0.6);
    } else {
        if (metrics.width > maxWidth) {
            const adjustedSize = (maxWidth / metrics.width) * fontSize;
            tCtx.font = `900 ${adjustedSize}px sans-serif`;
        }
        tCtx.fillText(phrase, tCanvas.width / 2, tCanvas.height / 2);
    }

    const data = tCtx.getImageData(0, 0, tCanvas.width, tCanvas.height).data;
    const points = [];
    const step = isMobile ? 6 : 5; 
    for (let y = 0; y < tCanvas.height; y += step) {
        for (let x = 0; x < tCanvas.width; x += step) {
            if (data[(y * tCanvas.width + x) * 4 + 3] > 128) {
                points.push({ x, y });
            }
        }
    }
    return points;
}

function init() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
    
    createSprites();
    precalculatePhrases();

    stars = Array.from({length: 60}, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        s: Math.random() * 2,
        p: Math.random() * Math.PI
    }));

    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: 0, vy: 0,
            color: colors[i % colors.length],
            angle: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03,
            offset: Math.random() * 100
        });
    }
}

function draw() {
    ctx.fillStyle = "#0a0005";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    tick += 0.02; 
    modeTimer += 0.016;

    if(modeTimer > 4.5) { 
        globalMode = (globalMode === "heart") ? "text" : "heart";
        if(globalMode === "heart") currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        modeTimer = 0;
        mouse.burst = 1.5;
    }

    if(mouse.burst > 0) mouse.burst -= 0.04;

    stars.forEach(s => {
        ctx.globalAlpha = 0.1 + Math.abs(Math.sin(tick + s.p)) * 0.4;
        ctx.fillStyle = "white";
        ctx.fillRect(s.x, s.y, s.s, s.s);
    });

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const heartBeat = Math.pow(Math.sin(tick * 1.5), 6); 
    const scale = (Math.min(window.innerWidth, window.innerHeight) / 48) * (1 + heartBeat * 0.08);

    ctx.globalCompositeOperation = 'lighter';
    const currentPoints = phrasesPoints[currentPhraseIndex];

    particles.forEach((p, i) => {
        let tx, ty;

        if (globalMode === "text" && currentPoints.length > 0) {
            const target = currentPoints[i % currentPoints.length];
            const waveX = Math.sin(tick * 1.5 + p.offset) * 1.1;
            const waveY = Math.cos(tick * 1.2 + p.offset) * 1.1;
            tx = target.x + waveX;
            ty = target.y + waveY;
        } else {
            p.angle += p.speed;
            const xH = 16 * Math.pow(Math.sin(p.angle), 3);
            const yH = -(13 * Math.cos(p.angle) - 5 * Math.cos(2*p.angle) - 2 * Math.cos(3*p.angle) - Math.cos(4*p.angle));
            tx = cx + xH * scale + Math.sin(tick + p.offset) * 5;
            ty = cy + yH * scale + Math.cos(tick + p.offset) * 5;
        }

        const dx = tx - p.x;
        const dy = ty - p.y;
        
        const friction = 0.76;
        const ease = globalMode === "text" ? 0.09 : 0.05;
        
        p.vx = (p.vx + dx * (ease + mouse.burst * 0.05)) * friction;
        p.vy = (p.vy + dy * (ease + mouse.burst * 0.05)) * friction;

        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const dist = Math.sqrt(mdx*mdx + mdy*mdy);
        if(dist < 75) {
            const force = (75 - dist) / 75;
            p.vx -= mdx * force * 0.5;
            p.vy -= mdy * force * 0.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        const pSize = isMobile ? 8 : 11;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(sprites[p.color], p.x - pSize/2, p.y - pSize/2, pSize, pSize);
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
}

// Eventos de interacción
const updatePos = (e) => {
    const pos = e.touches ? e.touches[0] : e;
    mouse.x = pos.clientX; mouse.y = pos.clientY;
};

window.addEventListener("mousedown", (e) => { mouse.active = true; updatePos(e); });
window.addEventListener("mousemove", (e) => { updatePos(e); });
window.addEventListener("mouseup", () => { mouse.active = false; mouse.x = -1000; });
window.addEventListener("touchstart", (e) => { mouse.active = true; updatePos(e); });
window.addEventListener("touchmove", (e) => { 
    if(e.cancelable) e.preventDefault(); 
    updatePos(e); 
}, { passive: false });
window.addEventListener("touchend", () => { mouse.active = false; mouse.x = -1000; });
window.addEventListener("resize", () => { init(); });

// Arranque
init();
draw();