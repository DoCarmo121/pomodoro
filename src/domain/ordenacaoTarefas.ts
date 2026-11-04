import { Tarefa, PrioridadeTarefa, EstadoTarefa } from '../types';

/**
 * Mapeamento numérico da prioridade para ordenação decrescente:
 * Alta (3) > Média (2) > Baixa (1).
 */
const PESO_PRIORIDADE: Record<PrioridadeTarefa, number> = {
  alta: 3,
  media: 2,
  baixa: 1,
};

/**
 * Mapeamento numérico da ordem fixa de estados definida em RN-10:
 * 1º: A fazer (aFazer)
 * 2º: Em execução (emExecucao)
 * 3º: Concluída (concluida)
 * 4º: Cancelada (cancelada)
 * 5º: Backlog (backlog)
 */
const ORDEM_ESTADO: Record<EstadoTarefa, number> = {
  aFazer: 1,
  emExecucao: 2,
  concluida: 3,
  cancelada: 4,
  backlog: 5,
};

/**
 * Ordena a lista de tarefas aplicando rigorosamente a RN-10:
 * 1. Prioridade em ordem decrescente (Alta -> Média -> Baixa);
 * 2. Em caso de empate de prioridade, estado na ordem fixa:
 *    A fazer -> Em execução -> Concluída -> Cancelada -> Backlog;
 * 3. Desempate estável: data de criação cronológica.
 *
 * Retorna uma cópia ordenada do array sem modificar a lista original (imutabilidade).
 */
export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    // 1. Comparar prioridade (decrescente: maior peso primeiro)
    const pesoA = PESO_PRIORIDADE[a.prioridade] ?? 0;
    const pesoB = PESO_PRIORIDADE[b.prioridade] ?? 0;
    if (pesoB !== pesoA) {
      return pesoB - pesoA;
    }

    // 2. Comparar estado (ordem fixa: menor número primeiro)
    const ordemEstadoA = ORDEM_ESTADO[a.estado] ?? 99;
    const ordemEstadoB = ORDEM_ESTADO[b.estado] ?? 99;
    if (ordemEstadoA !== ordemEstadoB) {
      return ordemEstadoA - ordemEstadoB;
    }

    // 3. Desempate estável: tarefa criada mais cedo primeiro
    return a.criadaEm - b.criadaEm;
  });
}

