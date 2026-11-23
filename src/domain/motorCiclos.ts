import {
  SessaoAtiva,
  TemporizadorPersonalizado,
  FaseSessao,
} from '../types';

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

export function iniciarNovaSessao(
  preset: TemporizadorPersonalizado,
  agora: number = Date.now()
): SessaoAtiva {
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
    if (cicloAtual >= snapshot.ciclosAntesPausaLonga) {
      return {
        proximaFase: 'pausaLonga',
        proximoCiclo: cicloAtual,
        sessaoConcluida: false,
      };
    } else {
      return {
        proximaFase: 'pausaCurta',
        proximoCiclo: cicloAtual,
        sessaoConcluida: false,
      };
    }
  }

  if (faseAtual === 'pausaCurta') {
    return {
      proximaFase: 'foco',
      proximoCiclo: cicloAtual + 1,
      sessaoConcluida: false,
    };
  }

  return {
    proximaFase: 'pausaLonga',
    proximoCiclo: cicloAtual,
    sessaoConcluida: true,
  };
}

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

export function pularFase(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  let proximaFase: FaseSessao;
  let sessaoConcluida = false;

  if (sessao.faseAtual === 'foco') {
    if (sessao.cicloAtual >= sessao.snapshotPreset.ciclosAntesPausaLonga) {
      proximaFase = 'pausaLonga';
    } else {
      proximaFase = 'pausaCurta';
    }
  } else if (sessao.faseAtual === 'pausaCurta') {
    proximaFase = 'foco';
  } else {
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

  const estavaPausada = sessao.status === 'pausada';

  return {
    ...sessao,
    faseAtual: proximaFase,
    cicloAtual: sessao.cicloAtual,
    status: estavaPausada ? 'pausada' : 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoNovaFaseMs,
    pausadaEm: estavaPausada ? agora : null,
    tempoRestanteAoPausarMs: estavaPausada ? duracaoNovaFaseMs : null,
    atualizadaEm: agora,
  };
}

export function reiniciarCiclos(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  const duracaoFocoMs = obterDuracaoFaseMs(sessao.snapshotPreset, 'foco');
  const estavaPausada = sessao.status === 'pausada';

  return {
    ...sessao,
    faseAtual: 'foco',
    cicloAtual: 1,
    status: estavaPausada ? 'pausada' : 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoFocoMs,
    pausadaEm: estavaPausada ? agora : null,
    tempoRestanteAoPausarMs: estavaPausada ? duracaoFocoMs : null,
    atualizadaEm: agora,
  };
}

export function recalcularSessaoAposInatividade(
  sessao: SessaoAtiva,
  agora: number = Date.now()
): SessaoAtiva {
  if (sessao.status === 'concluida') {
    return sessao;
  }

  if (sessao.status === 'pausada') {
    return {
      ...sessao,
      atualizadaEm: agora,
    };
  }

  if (agora < sessao.fimFasePrevistoEm) {
    return {
      ...sessao,
      atualizadaEm: agora,
    };
  }

  let faseIter = sessao.faseAtual;
  let cicloIter = sessao.cicloAtual;
  let tempoFimIter = sessao.fimFasePrevistoEm;
  const snapshot = sessao.snapshotPreset;

  while (tempoFimIter <= agora) {
    const transicao = calcularTransicaoNatural(faseIter, cicloIter, snapshot);

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
