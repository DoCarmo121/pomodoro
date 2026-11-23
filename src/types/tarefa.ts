export type EstadoTarefa =
  | 'backlog'
  | 'aFazer'
  | 'emExecucao'
  | 'concluida'
  | 'cancelada';

export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';

export interface Tarefa {
  id: string;

  titulo: string;

  estado: EstadoTarefa;

  prioridade: PrioridadeTarefa;

  criadaEm: number;

  atualizadaEm: number;
}

export interface DadosEntradaTarefa {
  titulo: string;
  estado: EstadoTarefa;
  prioridade: PrioridadeTarefa;
}

export type ErrosFormularioTarefa = {
  titulo?: string;
  estado?: string;
  prioridade?: string;
};
