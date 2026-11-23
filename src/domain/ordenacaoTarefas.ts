import { Tarefa, PrioridadeTarefa, EstadoTarefa } from '../types';

const PESO_PRIORIDADE: Record<PrioridadeTarefa, number> = {
  alta: 3,
  media: 2,
  baixa: 1,
};

const ORDEM_ESTADO: Record<EstadoTarefa, number> = {
  aFazer: 1,
  emExecucao: 2,
  concluida: 3,
  cancelada: 4,
  backlog: 5,
};

export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    const pesoA = PESO_PRIORIDADE[a.prioridade] ?? 0;
    const pesoB = PESO_PRIORIDADE[b.prioridade] ?? 0;
    if (pesoB !== pesoA) {
      return pesoB - pesoA;
    }

    const ordemEstadoA = ORDEM_ESTADO[a.estado] ?? 99;
    const ordemEstadoB = ORDEM_ESTADO[b.estado] ?? 99;
    if (ordemEstadoA !== ordemEstadoB) {
      return ordemEstadoA - ordemEstadoB;
    }

    return a.criadaEm - b.criadaEm;
  });
}
