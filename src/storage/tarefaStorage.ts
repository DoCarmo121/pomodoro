import { Tarefa } from '../types';
import { CHAVE_STORAGE_TAREFAS } from './chaves';

const ESTADOS_VALIDOS = ['backlog', 'aFazer', 'emExecucao', 'concluida', 'cancelada'];
const PRIORIDADES_VALIDAS = ['baixa', 'media', 'alta'];

/**
 * Validação básica da estrutura de uma tarefa recuperada do storage
 */
function ehEstruturaTarefaValida(obj: unknown): obj is Tarefa {
  if (typeof obj !== 'object' || obj === null) return false;
  const t = obj as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.titulo === 'string' &&
    typeof t.estado === 'string' &&
    ESTADOS_VALIDOS.includes(t.estado) &&
    typeof t.prioridade === 'string' &&
    PRIORIDADES_VALIDAS.includes(t.prioridade) &&
    typeof t.criadaEm === 'number' &&
    typeof t.atualizadaEm === 'number'
  );
}

/**
 * Recupera todas as tarefas armazenadas no localStorage.
 * Se nenhuma tarefa estiver cadastrada, retorna um array vazio.
 */
export function obterTarefas(): Tarefa[] {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_TAREFAS);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(ehEstruturaTarefaValida);
  } catch (erro) {
    console.error('Falha ao ler tarefas do localStorage:', erro);
    return [];
  }
}

/**
 * Persiste a lista de tarefas no localStorage.
 * Trata possíveis erros de quota de armazenamento excedida (RNF-06, R-04).
 */
export function salvarTarefas(tarefas: Tarefa[]): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_TAREFAS, JSON.stringify(tarefas));
  } catch (erro) {
    console.error('Erro ao salvar tarefas no localStorage:', erro);
    throw new Error('Não foi possível salvar as tarefas. O armazenamento local pode estar cheio.');
  }
}

