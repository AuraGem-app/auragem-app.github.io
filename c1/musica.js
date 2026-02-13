// musica.js - Motor de audio interactivo
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const Sonidos = {
    // Función base para generar el sonido
    tocar: (freq, duration, type = 'sine', volume = 0.1) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Envolvente para que el sonido no sea brusco
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },

    // Sonido de carga (burbujeo ascendente)
    carga: (progreso) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        Sonidos.tocar(200 + (progreso * 1.5), 0.1, 'triangle', 0.05);
    },

    // Melodía mágica al revelar el mensaje
    revelar: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const melodia = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
        melodia.forEach((nota, i) => {
            setTimeout(() => Sonidos.tocar(nota, 0.8, 'sine', 0.1), i * 150);
        });
    },

    // Melodía paso a paso para el botón final
    // Notas: Sol, Do, Re, Mi, Sol, La, Do (agudo)
    notasMelodia: [392.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50],
    
    tocarSiguienteNota: (indice) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const nota = Sonidos.notasMelodia[indice % Sonidos.notasMelodia.length];
        // Sonido tipo campana brillante
        Sonidos.tocar(nota, 1.5, 'sine', 0.1);
    }
};