/**
 * Módulo de Alerta Sonoro utilizando Web Audio API nativa.
 * Atende ao RF-14, RN-13, RNF-10 e resolve o risco R-01 (política de autoplay).
 */

let audioContextInstance: AudioContext | null = null;

/**
 * Obtém ou cria a instância única do AudioContext.
 * Retorna null se executado fora do navegador (ex: testes em Node.js).
 */
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

/**
 * Inicializa ou destrava o AudioContext após uma interação do usuário (ex: clique no botão Iniciar).
 * Essencial para contornar a restrição de autoplay dos navegadores (R-01).
 */
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

/**
 * Emite o alerta sonoro audível ao final de uma fase (RN-13, RF-14).
 * Utiliza osciladores senoidais sintetizados nativamente com decaimento suave,
 * evitando arquivos de áudio externos que poderiam falhar ao carregar.
 */
export async function tocarAlertaSonoro(): Promise<void> {
  const ctx = obterAudioContext();
  if (!ctx) return;

  // Garante que o contexto não está suspenso
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Se o navegador bloquear, não interrompe o fluxo da aplicação
      return;
    }
  }

  try {
    const agora = ctx.currentTime;

    // Tom 1: Nota Lá (440 Hz)
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

    // Tom 2: Nota Mi (659.25 Hz) um pouco depois, gerando um efeito de sino agradável
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

