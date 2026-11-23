export interface TemporizadorPersonalizado {
  id: string;

  nome: string;

  tempoFocoMin: number;

  tempoPausaCurtaMin: number;

  ciclosAntesPausaLonga: number;

  tempoPausaLongaMin: number;

  criadoEm: number;

  atualizadoEm: number;
}

export interface DadosEntradaPreset {
  nome: string;
  tempoFocoMin: number | string;
  tempoPausaCurtaMin: number | string;
  ciclosAntesPausaLonga: number | string;
  tempoPausaLongaMin: number | string;
}

export type ErrosFormularioPreset = {
  nome?: string;
  tempoFocoMin?: string;
  tempoPausaCurtaMin?: string;
  ciclosAntesPausaLonga?: string;
  tempoPausaLongaMin?: string;
};
