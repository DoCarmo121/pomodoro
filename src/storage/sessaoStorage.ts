import { SessaoAtiva, FaseSessao, StatusSessao } from '../types';
import { CHAVE_STORAGE_SESSAO_ATIVA } from './chaves';

const FASES_VALIDAS: FaseSessao[] = ['foco', 'pausaCurta', 'pausaLonga'];
const STATUS_VALIDOS: StatusSessao[] = ['emAndamento', 'pausada', 'concluida'];

/**
 * Validação de integridade e consistência da SessaoAtiva (R-03).
 * Garante que dados corrompidos ou incompletos no localStorage
 * não quebrem o ciclo de execução do temporizador.
 */
export function ehEstruturaSessaoValida(obj: unknown): obj is SessaoAtiva {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;

  const snapshotValido =
    typeof s.snapshotPreset === 'object' &&
    s.snapshotPreset !== null &&
    typeof (s.snapshotPreset as Record<string, unknown>).nome === 'string' &&
    typeof (s.snapshotPreset as Record<string, unknown>).tempoFocoMin === 'number';

  const valoresBasicosValidos =
    typeof s.id === 'string' &&
    typeof s.presetId === 'string' &&
    snapshotValido &&
    typeof s.faseAtual === 'string' &&
    FASES_VALIDAS.includes(s.faseAtual as FaseSessao) &&
    typeof s.cicloAtual === 'number' &&
    s.cicloAtual >= 1 &&
    typeof s.status === 'string' &&
    STATUS_VALIDOS.includes(s.status as StatusSessao) &&
    typeof s.inicioFaseEm === 'number' &&
    typeof s.fimFasePrevistoEm === 'number' &&
    typeof s.criadaEm === 'number' &&
    typeof s.atualizadaEm === 'number';

  if (!valoresBasicosValidos) return false;

  const pausadaEmValido = s.pausadaEm === null || typeof s.pausadaEm === 'number';
  const tempoRestanteValido =
    s.tempoRestanteAoPausarMs === null || typeof s.tempoRestanteAoPausarMs === 'number';

  return pausadaEmValido && tempoRestanteValido;
}

/**
 * Recupera a sessão ativa do localStorage.
 * Se estiver ausente ou corrompida (R-03), limpa e retorna null.
 */
export function obterSessaoAtiva(): SessaoAtiva | null {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_SESSAO_ATIVA);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!ehEstruturaSessaoValida(parsed)) {
      console.warn('Sessão ativa corrompida ou inconsistente no localStorage. Descartando chave (R-03).');
      limparSessaoAtiva();
      return null;
    }

    return parsed;
  } catch (erro) {
    console.error('Falha ao parsear sessão ativa do localStorage. Limpando chave:', erro);
    limparSessaoAtiva();
    return null;
  }
}

/**
 * Persiste o estado atual da sessão ativa no localStorage.
 */
export function salvarSessaoAtiva(sessao: SessaoAtiva): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_SESSAO_ATIVA, JSON.stringify(sessao));
  } catch (erro) {
    console.error('Erro ao salvar sessão ativa no localStorage:', erro);
    throw new Error('Não foi possível salvar o estado da sessão ativa.');
  }
}

/**
 * Remove a sessão ativa do localStorage (ao encerrar, concluir ou descartar sessão).
 */
export function limparSessaoAtiva(): void {
  try {
    localStorage.removeItem(CHAVE_STORAGE_SESSAO_ATIVA);
  } catch (erro) {
    console.error('Erro ao remover sessão ativa do localStorage:', erro);
  }
}

