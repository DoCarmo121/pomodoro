/**
 * Entidade TemporizadorPersonalizado (Preset)
 * Conforme especificado na Seção 11.1 do Documento de Requisitos.
 */
export interface TemporizadorPersonalizado {
  /** Identificador único do preset (UUID) */
  id: string;

  /** Nome de identificação (1 a 40 caracteres - VR-01) */
  nome: string;

  /** Duração da fase de foco em minutos (1 a 120 - VR-02) */
  tempoFocoMin: number;

  /** Duração da pausa curta em minutos (1 a 60 - VR-03) */
  tempoPausaCurtaMin: number;

  /** Quantidade de ciclos antes de disparar uma pausa longa (1 a 12 - VR-04) */
  ciclosAntesPausaLonga: number;

  /** Duração da pausa longa em minutos (1 a 60 - VR-05) */
  tempoPausaLongaMin: number;

  /** Timestamp (ms) de quando o preset foi criado */
  criadoEm: number;

  /** Timestamp (ms) da última edição do preset */
  atualizadoEm: number;
}

/**
 * Dados de entrada para criação ou edição de preset (vindos do formulário)
 */
export interface DadosEntradaPreset {
  nome: string;
  tempoFocoMin: number | string;
  tempoPausaCurtaMin: number | string;
  ciclosAntesPausaLonga: number | string;
  tempoPausaLongaMin: number | string;
}

/** Erros mapeados por campo no formulário de preset */
export type ErrosFormularioPreset = {
  nome?: string;
  tempoFocoMin?: string;
  tempoPausaCurtaMin?: string;
  ciclosAntesPausaLonga?: string;
  tempoPausaLongaMin?: string;
};

