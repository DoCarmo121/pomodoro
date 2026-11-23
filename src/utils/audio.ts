let audioContextInstance: AudioContext | null = null;

function obterAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!audioContextInstance) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioContextInstance = new AudioContextClass();
    }
  }

  return audioContextInstance;
}

export async function inicializarAudio(): Promise<void> {
  const ctx = obterAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (erro) {
      console.warn('Não foi possível desbloquear o contexto de áudio:', erro);
    }
  }
}

export async function tocarAlertaSonoro(): Promise<void> {
  const ctx = obterAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  try {
    const agora = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, agora);
    gain1.gain.setValueAtTime(0.2, agora);
    gain1.gain.exponentialRampToValueAtTime(0.001, agora + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(agora);
    osc1.stop(agora + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, agora + 0.18);
    gain2.gain.setValueAtTime(0.25, agora + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, agora + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(agora + 0.18);
    osc2.stop(agora + 0.65);
  } catch (erro) {
    console.error('Falha ao emitir alerta sonoro da Web Audio API:', erro);
  }
}
