import { TemporizadorPersonalizado } from './preset';

/**
 * Fases possíveis de uma sessão Pomodoro.
 * Conforme Seção 4 (Glossário) e Seção 11.2.
 */
export type FaseSessao = 'foco' | 'pausaCurta' | 'pausaLonga';

/**
 * Status possíveis da sessão ativa.
 * Conforme Seção 11.2.
 */
export type StatusSessao = 'emAndamento' | 'pausada' | 'concluida';

/**
 * Entidade SessaoAtiva
 * Conforme especificado na Seção 11.2 do Documento de Requisitos.
 */
export interface SessaoAtiva {
  /** Identificador único da sessão ativa */
  id: string;

  /** Referência ao preset que deu origem a esta sessão */
  presetId: string;

  /** Cópia imutável dos parâmetros do preset no início da sessão (RN-05) */
  snapshotPreset: TemporizadorPersonalizado;

  /** Fase atual em execução */
  faseAtual: FaseSessao;

  /** Número do ciclo atual (inicia em 1) */
  cicloAtual: number;

  /** Estado da execução da sessão */
  status: StatusSessao;

  /** Timestamp (ms) em que a fase atual foi iniciada ou recalculada */
  inicioFaseEm: number;

  /** Timestamp (ms) calculado para o término da fase atual */
  fimFasePrevistoEm: number;

  /** Timestamp (ms) em que a sessão foi pausada (ou null se em andamento/concluída) */
  pausadaEm: number | null;

  /** Tempo que faltava para a fase terminar no momento da pausa (em milissegundos) */
  tempoRestanteAoPausarMs: number | null;

  /** Timestamp (ms) de quando a sessão foi criada */
  criadaEm: number;

  /** Timestamp (ms) da última atualização de estado da sessão */
  atualizadaEm: number;
}

