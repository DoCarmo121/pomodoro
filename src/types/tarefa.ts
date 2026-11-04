/**
 * Estados possíveis de uma tarefa de estudo.
 * Conforme Seção 4 (Glossário), Seção 11.3 e VR-07.
 */
export type EstadoTarefa =
  | 'backlog'
  | 'aFazer'
  | 'emExecucao'
  | 'concluida'
  | 'cancelada';

/**
 * Níveis de prioridade de uma tarefa.
 * Conforme Seção 11.3 e VR-08.
 */
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';

/**
 * Entidade Tarefa
 * Conforme especificado na Seção 11.3 do Documento de Requisitos.
 */
export interface Tarefa {
  /** Identificador único da tarefa */
  id: string;

  /** Título descritivo da tarefa (1 a 100 caracteres - VR-06) */
  titulo: string;

  /** Estado da tarefa no fluxo de estudo */
  estado: EstadoTarefa;

  /** Grau de prioridade da tarefa */
  prioridade: PrioridadeTarefa;

  /** Timestamp (ms) de quando a tarefa foi cadastrada */
  criadaEm: number;

  /** Timestamp (ms) da última edição da tarefa */
  atualizadaEm: number;
}

/**
 * Dados de entrada para criação ou edição de tarefa (vindos do formulário)
 */
export interface DadosEntradaTarefa {
  titulo: string;
  estado: EstadoTarefa;
  prioridade: PrioridadeTarefa;
}

/** Erros mapeados por campo no formulário de tarefa */
export type ErrosFormularioTarefa = {
  titulo?: string;
  estado?: string;
  prioridade?: string;
};

