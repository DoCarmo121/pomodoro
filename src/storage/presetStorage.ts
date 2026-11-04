import { TemporizadorPersonalizado } from '../types';
import { CHAVE_STORAGE_PRESETS } from './chaves';

/**
 * Preset padrão inicial disponibilizado ao usuário quando o sistema
 * é executado pela primeira vez ou quando não há presets salvos.
 * Segue o modelo tradicional de Pomodoro: 25 min foco, 5 min pausa curta,
 * 4 ciclos antes da pausa longa de 15 min.
 */
export const PRESET_PADRAO: TemporizadorPersonalizado = {
  id: 'preset-classico-padrao',
  nome: 'Pomodoro Clássico',
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
  criadoEm: 1700000000000,
  atualizadoEm: 1700000000000,
};

/**
 * Validação básica da estrutura de um preset recuperado do storage
 */
function ehEstruturaPresetValida(obj: unknown): obj is TemporizadorPersonalizado {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.nome === 'string' &&
    typeof p.tempoFocoMin === 'number' &&
    typeof p.tempoPausaCurtaMin === 'number' &&
    typeof p.ciclosAntesPausaLonga === 'number' &&
    typeof p.tempoPausaLongaMin === 'number' &&
    typeof p.criadoEm === 'number' &&
    typeof p.atualizadoEm === 'number'
  );
}

/**
 * Recupera todos os presets armazenados no localStorage.
 * Se nenhum preset existir ou se os dados estiverem corrompidos,
 * inicializa a persistência com o preset padrão e o retorna.
 */
export function obterPresets(): TemporizadorPersonalizado[] {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_PRESETS);
    if (!raw) {
      salvarPresets([PRESET_PADRAO]);
      return [PRESET_PADRAO];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      salvarPresets([PRESET_PADRAO]);
      return [PRESET_PADRAO];
    }

    const presetsValidos = parsed.filter(ehEstruturaPresetValida);
    if (presetsValidos.length === 0) {
      salvarPresets([PRESET_PADRAO]);
      return [PRESET_PADRAO];
    }

    return presetsValidos;
  } catch (erro) {
    console.error('Falha ao ler presets do localStorage. Restaurando padrão:', erro);
    salvarPresets([PRESET_PADRAO]);
    return [PRESET_PADRAO];
  }
}

/**
 * Persiste a lista completa de presets no localStorage.
 * Trata exceções de cota cheia do navegador (RNF-06, R-04).
 */
export function salvarPresets(presets: TemporizadorPersonalizado[]): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_PRESETS, JSON.stringify(presets));
  } catch (erro) {
    console.error('Erro ao salvar presets no localStorage:', erro);
    throw new Error('Não foi possível salvar os temporizadores. Verifique o espaço de armazenamento local.');
  }
}

