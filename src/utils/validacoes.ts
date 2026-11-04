import type {
  DadosEntradaPreset,
  ErrosFormularioPreset,
  DadosEntradaTarefa,
  ErrosFormularioTarefa,
  EstadoTarefa,
  PrioridadeTarefa,
} from '../types';

/**
 * Utilitário para verificar se um valor é um número inteiro válido
 */
function ehInteiroValido(valor: unknown): boolean {
  if (typeof valor === 'number') {
    return Number.isInteger(valor);
  }
  if (typeof valor === 'string') {
    const limpo = valor.trim();
    if (limpo === '' || !/^-?\d+$/.test(limpo)) {
      return false;
    }
    const num = Number(limpo);
    return Number.isInteger(num);
  }
  return false;
}

/**
 * VR-01: Validação do nome do preset
 * Obrigatório, entre 1 e 40 caracteres.
 */
export function validarNomePreset(nome: string): string | null {
  const nomeLimpo = nome.trim();
  if (nomeLimpo.length === 0) {
    return 'O nome do temporizador é obrigatório.';
  }
  if (nome.length > 40) {
    return 'O nome do temporizador deve ter no máximo 40 caracteres.';
  }
  return null;
}

/**
 * VR-02: Validação do tempo de foco
 * Inteiro entre 1 e 120 minutos.
 */
export function validarTempoFoco(tempo: unknown): string | null {
  if (!ehInteiroValido(tempo)) {
    return 'O tempo de foco deve ser um número inteiro entre 1 e 120 minutos.';
  }
  const valorNum = Number(tempo);
  if (valorNum < 1 || valorNum > 120) {
    return 'O tempo de foco deve estar entre 1 e 120 minutos.';
  }
  return null;
}

/**
 * VR-03: Validação do tempo de pausa curta
 * Inteiro entre 1 e 60 minutos.
 */
export function validarTempoPausaCurta(tempo: unknown): string | null {
  if (!ehInteiroValido(tempo)) {
    return 'O tempo de pausa curta deve ser um número inteiro entre 1 e 60 minutos.';
  }
  const valorNum = Number(tempo);
  if (valorNum < 1 || valorNum > 60) {
    return 'O tempo de pausa curta deve estar entre 1 e 60 minutos.';
  }
  return null;
}

/**
 * VR-04: Validação da quantidade de ciclos antes da pausa longa
 * Inteiro entre 1 e 12.
 */
export function validarCiclosAntesPausaLonga(ciclos: unknown): string | null {
  if (!ehInteiroValido(ciclos)) {
    return 'A quantidade de ciclos antes da pausa longa deve ser um número inteiro entre 1 e 12.';
  }
  const valorNum = Number(ciclos);
  if (valorNum < 1 || valorNum > 12) {
    return 'A quantidade de ciclos deve estar entre 1 e 12.';
  }
  return null;
}

/**
 * VR-05: Validação do tempo de pausa longa
 * Inteiro entre 1 e 60 minutos.
 */
export function validarTempoPausaLonga(tempo: unknown): string | null {
  if (!ehInteiroValido(tempo)) {
    return 'O tempo de pausa longa deve ser um número inteiro entre 1 e 60 minutos.';
  }
  const valorNum = Number(tempo);
  if (valorNum < 1 || valorNum > 60) {
    return 'O tempo de pausa longa deve estar entre 1 e 60 minutos.';
  }
  return null;
}

/**
 * Validação completa do formulário de preset (VR-01 a VR-05)
 */
export function validarFormularioPreset(dados: DadosEntradaPreset): {
  valido: boolean;
  erros: ErrosFormularioPreset;
} {
  const erros: ErrosFormularioPreset = {};

  const erroNome = validarNomePreset(dados.nome ?? '');
  if (erroNome) erros.nome = erroNome;

  const erroFoco = validarTempoFoco(dados.tempoFocoMin);
  if (erroFoco) erros.tempoFocoMin = erroFoco;

  const erroPausaCurta = validarTempoPausaCurta(dados.tempoPausaCurtaMin);
  if (erroPausaCurta) erros.tempoPausaCurtaMin = erroPausaCurta;

  const erroCiclos = validarCiclosAntesPausaLonga(dados.ciclosAntesPausaLonga);
  if (erroCiclos) erros.ciclosAntesPausaLonga = erroCiclos;

  const erroPausaLonga = validarTempoPausaLonga(dados.tempoPausaLongaMin);
  if (erroPausaLonga) erros.tempoPausaLongaMin = erroPausaLonga;

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
}

/**
 * VR-06: Validação do título da tarefa
 * Obrigatório, entre 1 e 100 caracteres.
 */
export function validarTituloTarefa(titulo: string): string | null {
  const tituloLimpo = titulo.trim();
  if (tituloLimpo.length === 0) {
    return 'O título da tarefa é obrigatório.';
  }
  if (titulo.length > 100) {
    return 'O título da tarefa deve ter no máximo 100 caracteres.';
  }
  return null;
}

const ESTADOS_VALIDOS: EstadoTarefa[] = [
  'backlog',
  'aFazer',
  'emExecucao',
  'concluida',
  'cancelada',
];

/**
 * VR-07: Validação do estado da tarefa
 * Um entre backlog, aFazer, emExecucao, concluida e cancelada.
 */
export function validarEstadoTarefa(estado: unknown): string | null {
  if (typeof estado !== 'string' || !ESTADOS_VALIDOS.includes(estado as EstadoTarefa)) {
    return 'Estado inválido. Escolha entre: Backlog, A fazer, Em execução, Concluída ou Cancelada.';
  }
  return null;
}

const PRIORIDADES_VALIDAS: PrioridadeTarefa[] = ['baixa', 'media', 'alta'];

/**
 * VR-08: Validação da prioridade da tarefa
 * Uma entre baixa, média e alta.
 */
export function validarPrioridadeTarefa(prioridade: unknown): string | null {
  if (
    typeof prioridade !== 'string' ||
    !PRIORIDADES_VALIDAS.includes(prioridade as PrioridadeTarefa)
  ) {
    return 'Prioridade inválida. Escolha entre: Baixa, Média ou Alta.';
  }
  return null;
}

/**
 * Validação completa do formulário de tarefa (VR-06 a VR-08)
 */
export function validarFormularioTarefa(dados: DadosEntradaTarefa): {
  valido: boolean;
  erros: ErrosFormularioTarefa;
} {
  const erros: ErrosFormularioTarefa = {};

  const erroTitulo = validarTituloTarefa(dados.titulo ?? '');
  if (erroTitulo) erros.titulo = erroTitulo;

  const erroEstado = validarEstadoTarefa(dados.estado);
  if (erroEstado) erros.estado = erroEstado;

  const erroPrioridade = validarPrioridadeTarefa(dados.prioridade);
  if (erroPrioridade) erros.prioridade = erroPrioridade;

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
}
