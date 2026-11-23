import { TemporizadorPersonalizado } from '../types';
import { CHAVE_STORAGE_PRESETS } from './chaves';

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

export function salvarPresets(presets: TemporizadorPersonalizado[]): void {
  try {
    localStorage.setItem(CHAVE_STORAGE_PRESETS, JSON.stringify(presets));
  } catch (erro) {
    console.error('Erro ao salvar presets no localStorage:', erro);
    throw new Error('Não foi possível salvar os temporizadores. Verifique o espaço de armazenamento local.');
  }
}
