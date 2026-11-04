import {
  SessaoAtiva,
  TemporizadorPersonalizado,
  FaseSessao,
} from '../types';

/**
 * Retorna a duração em milissegundos para uma determinada fase
 * com base no snapshot do preset ativo.
 */
export function obterDuracaoFaseMs(
  snapshot: TemporizadorPersonalizado,
  fase: FaseSessao
): number {
  switch (fase) {
    case 'foco':
      return snapshot.tempoFocoMin * 60 * 1000;
    case 'pausaCurta':
      return snapshot.tempoPausaCurtaMin * 60 * 1000;
    case 'pausaLonga':
      return snapshot.tempoPausaLongaMin * 60 * 1000;
  }
}

/**
 * Cria uma nova instância de SessaoAtiva a partir de um preset selecionado.
 * Segue UC04 e RN-05 (criação de snapshot imutável do preset).
 */
export function iniciarNovaSessao(
  preset: TemporizadorPersonalizado,
  agora: number = Date.now()
): SessaoAtiva {
  // Snapshot imutável dos parâmetros do preset no momento de início (RN-05)
  const snapshotPreset: TemporizadorPersonalizado = { ...preset };
  const duracaoFocoMs = obterDuracaoFaseMs(snapshotPreset, 'foco');

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sessao-${agora}-${Math.random().toString(36).substring(2, 9)}`,
    presetId: preset.id,
    snapshotPreset,
    faseAtual: 'foco',
    cicloAtual: 1,
    status: 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoFocoMs,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    criadaEm: agora,
    atualizadaEm: agora,
  };
}

/**
 * Pausa uma sessão em andamento, preservando o tempo restante.
 * Segue UC05 e RN-06.
 */
export function pausarSessao(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  if (sessao.status !== 'emAndamento') {
    return sessao;
  }

  const tempoRestanteMs = Math.max(0, sessao.fimFasePrevistoEm - agora);

  return {
    ...sessao,
    status: 'pausada',
    pausadaEm: agora,
    tempoRestanteAoPausarMs: tempoRestanteMs,
    atualizadaEm: agora,
  };
}

/**
 * Retoma uma sessão pausada, recalculando o timestamp de fim a partir do momento atual.
 * Segue UC05.
 */
export function retomarSessao(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  if (sessao.status !== 'pausada') {
    return sessao;
  }

  const tempoRestante = sessao.tempoRestanteAoPausarMs ?? 0;
  const novoFimFase = agora + tempoRestante;

  return {
    ...sessao,
    status: 'emAndamento',
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    fimFasePrevistoEm: novoFimFase,
    atualizadaEm: agora,
  };
}

/**
 * Determina a próxima fase prevista e o próximo ciclo após o término NATURAL
 * da fase atual (o tempo se esgotou normalmente).
 */
export function calcularTransicaoNatural(
  faseAtual: FaseSessao,
  cicloAtual: number,
  snapshot: TemporizadorPersonalizado
): {
  proximaFase: FaseSessao;
  proximoCiclo: number;
  sessaoConcluida: boolean;
} {
  if (faseAtual === 'foco') {
    // Se o ciclo atual atingiu a meta para pausa longa
    if (cicloAtual >= snapshot.ciclosAntesPausaLonga) {
      return {
        proximaFase: 'pausaLonga',
        proximoCiclo: cicloAtual, // Ciclo não incrementa ao ir para a pausa
        sessaoConcluida: false,
      };
    } else {
      return {
        proximaFase: 'pausaCurta',
        proximoCiclo: cicloAtual, // Ciclo não incrementa ao ir para a pausa
        sessaoConcluida: false,
      };
    }
  }

  if (faseAtual === 'pausaCurta') {
    // Conclusão natural da pausa curta: avança para o próximo foco e incrementa o ciclo
    return {
      proximaFase: 'foco',
      proximoCiclo: cicloAtual + 1,
      sessaoConcluida: false,
    };
  }

  // Se faseAtual === 'pausaLonga': o último ciclo do preset foi completado
  return {
    proximaFase: 'pausaLonga',
    proximoCiclo: cicloAtual,
    sessaoConcluida: true,
  };
}

/**
 * Avança a sessão quando o cronômetro atinge o fim de forma natural.
 * Se atingir a conclusão de todos os ciclos, marca status como concluída.
 */
export function avancarFaseConcluida(
  sessao: SessaoAtiva,
  momentoTermino: number = Date.now()
): SessaoAtiva {
  const transicao = calcularTransicaoNatural(
    sessao.faseAtual,
    sessao.cicloAtual,
    sessao.snapshotPreset
  );

  if (transicao.sessaoConcluida) {
    return {
      ...sessao,
      status: 'concluida',
      atualizadaEm: momentoTermino,
    };
  }

  const duracaoNovaFaseMs = obterDuracaoFaseMs(
    sessao.snapshotPreset,
    transicao.proximaFase
  );

  return {
    ...sessao,
    faseAtual: transicao.proximaFase,
    cicloAtual: transicao.proximoCiclo,
    status: 'emAndamento',
    inicioFaseEm: momentoTermino,
    fimFasePrevistoEm: momentoTermino + duracaoNovaFaseMs,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: momentoTermino,
  };
}

/**
 * Pula a fase atual manualmente pelo usuário.
 * Segue UC06 e RN-03:
 * "Pular uma fase de foco não incrementa a contagem de ciclos;
 *  pular uma fase de pausa também não incrementa."
 */
export function pularFase(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  let proximaFase: FaseSessao;
  let sessaoConcluida = false;

  if (sessao.faseAtual === 'foco') {
    // Pula para a pausa prevista, mantendo o ciclo atual
    if (sessao.cicloAtual >= sessao.snapshotPreset.ciclosAntesPausaLonga) {
      proximaFase = 'pausaLonga';
    } else {
      proximaFase = 'pausaCurta';
    }
  } else if (sessao.faseAtual === 'pausaCurta') {
    // Pula pausa curta -> vai para foco SEM incrementar ciclos (RN-03)
    proximaFase = 'foco';
  } else {
    // Estava na pausa longa e pulou -> encerra a sessão
    proximaFase = 'pausaLonga';
    sessaoConcluida = true;
  }

  if (sessaoConcluida) {
    return {
      ...sessao,
      status: 'concluida',
      atualizadaEm: agora,
    };
  }

  const duracaoNovaFaseMs = obterDuracaoFaseMs(
    sessao.snapshotPreset,
    proximaFase
  );

  // Se a sessão estava pausada, ao pular ela continua pausada com o tempo total da nova fase
  const estavaPausada = sessao.status === 'pausada';

  return {
    ...sessao,
    faseAtual: proximaFase,
    // cicloAtual mantido inalterado por RN-03
    cicloAtual: sessao.cicloAtual,
    status: estavaPausada ? 'pausada' : 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoNovaFaseMs,
    pausadaEm: estavaPausada ? agora : null,
    tempoRestanteAoPausarMs: estavaPausada ? duracaoNovaFaseMs : null,
    atualizadaEm: agora,
  };
}

/**
 * Reinicia todos os ciclos da sessão ativa.
 * Segue UC07 e RN-04:
 * "Reiniciar ciclos zera a contagem de ciclos e retorna ao primeiro ciclo de foco,
 *  mantendo o preset ativo."
 */
export function reiniciarCiclos(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  const duracaoFocoMs = obterDuracaoFaseMs(sessao.snapshotPreset, 'foco');
  const estavaPausada = sessao.status === 'pausada';

  return {
    ...sessao,
    faseAtual: 'foco',
    cicloAtual: 1, // Volta a 1 conforme UC07
    status: estavaPausada ? 'pausada' : 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoFocoMs,
    pausadaEm: estavaPausada ? agora : null,
    tempoRestanteAoPausarMs: estavaPausada ? duracaoFocoMs : null,
    atualizadaEm: agora,
  };
}

/**
 * Recalcula a sessão ativa ao reabrir a aplicação após inatividade / fechamento do navegador.
 * Segue UC10, RN-06, RN-07, RN-08 e R-05:
 * - Se estava pausada: preserva exatamente o tempo restante (RN-06).
 * - Se estava em andamento: compara o timestamp atual com o fim previsto da fase.
 *   Se venceu, avança sequencialmente pelas fases previstas até achar uma fase vigente
 *   ou concluir a sessão se todas vencerem (RN-07, RN-08).
 */
export function recalcularSessaoAposInatividade(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  // Se já estava concluída, não há o que recalcular
  if (sessao.status === 'concluida') {
    return sessao;
  }

  // RN-06: Sessão pausada não sofre avanço temporal automático
  if (sessao.status === 'pausada') {
    return {
      ...sessao,
      atualizadaEm: agora,
    };
  }

  // Caso 1: A fase atual ainda não terminou
  if (agora < sessao.fimFasePrevistoEm) {
    return {
      ...sessao,
      atualizadaEm: agora,
    };
  }

  // Caso 2: A fase atual venceu enquanto fechado (RN-07).
  // Itera pelas fases de forma sequencial utilizando os timestamps reais acumulados (R-05).
  let faseIter = sessao.faseAtual;
  let cicloIter = sessao.cicloAtual;
  let tempoFimIter = sessao.fimFasePrevistoEm;
  const snapshot = sessao.snapshotPreset;

  while (tempoFimIter <= agora) {
    const transicao = calcularTransicaoNatural(faseIter, cicloIter, snapshot);

    // RN-08: Se todas as fases previstas vencerem durante o período fechado, encerra com status concluído
    if (transicao.sessaoConcluida) {
      return {
        ...sessao,
        faseAtual: faseIter,
        cicloAtual: cicloIter,
        status: 'concluida',
        fimFasePrevistoEm: tempoFimIter,
        atualizadaEm: agora,
      };
    }

    faseIter = transicao.proximaFase;
    cicloIter = transicao.proximoCiclo;
    const duracaoMs = obterDuracaoFaseMs(snapshot, faseIter);
    const novoFim = tempoFimIter + duracaoMs;

    // Se o novo fim ultrapassa agora, encontramos a fase vigente!
    if (novoFim > agora) {
      return {
        ...sessao,
        faseAtual: faseIter,
        cicloAtual: cicloIter,
        status: 'emAndamento',
        inicioFaseEm: tempoFimIter,
        fimFasePrevistoEm: novoFim,
        pausadaEm: null,
        tempoRestanteAoPausarMs: null,
        atualizadaEm: agora,
      };
    }

    tempoFimIter = novoFim;
  }

  return {
    ...sessao,
    faseAtual: faseIter,
    cicloAtual: cicloIter,
    status: 'concluida',
    fimFasePrevistoEm: tempoFimIter,
    atualizadaEm: agora,
  };
}

/**
 * Calcula os milissegundos restantes para a fase atual em tempo real.
 */
export function calcularTempoRestanteMs(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): number {
  if (sessao.status === 'concluida') {
    return 0;
  }
  if (sessao.status === 'pausada') {
    return sessao.tempoRestanteAoPausarMs ?? 0;
  }
  return Math.max(0, sessao.fimFasePrevistoEm - agora);
}

