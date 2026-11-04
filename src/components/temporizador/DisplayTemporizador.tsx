import React from 'react';
import { FaseSessao, StatusSessao } from '../../types';
import { formatarTempo, obterNomeFase } from '../../utils/formatadores';

export interface DisplayTemporizadorProps {
  tempoRestanteMs: number;
  faseAtual: FaseSessao;
  cicloAtual: number;
  totalCiclos: number;
  status: StatusSessao | 'inativo';
  nomePreset: string;
  duracaoTotalFaseMs: number;
}

export const DisplayTemporizador: React.FC<DisplayTemporizadorProps> = ({
  tempoRestanteMs,
  faseAtual,
  cicloAtual,
  totalCiclos,
  status,
  nomePreset,
  duracaoTotalFaseMs,
}) => {
  // Cálculo de porcentagem de progresso da fase atual
  const tempoDecorridoMs = Math.max(0, duracaoTotalFaseMs - tempoRestanteMs);
  const porcentagemProgresso =
    duracaoTotalFaseMs > 0
      ? Math.min(100, Math.max(0, (tempoDecorridoMs / duracaoTotalFaseMs) * 100))
      : 0;

  const nomeFaseLegivel = obterNomeFase(faseAtual);

  return (
    <div
      className={`display-temporizador fase-${faseAtual} status-${status}`}
      aria-live="polite"
    >
      {/* Informações de cabeçalho do temporizador */}
      <div className="display-info-cabecalho">
        <span className={`badge-fase badge-fase-${faseAtual}`}>
          {status === 'inativo' ? 'Pronto para iniciar' : nomeFaseLegivel}
        </span>
        <span className="display-nome-preset" title="Temporizador selecionado">
          {nomePreset}
        </span>
      </div>

      {/* Relógio digital principal no formato MM:SS */}
      <div className="display-relogio" aria-label={`Tempo restante: ${formatarTempo(tempoRestanteMs)}`}>
        {formatarTempo(tempoRestanteMs)}
      </div>

      {/* Barra de progresso visual */}
      <div
        className="display-barra-container"
        role="progressbar"
        aria-valuenow={Math.round(porcentagemProgresso)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso da fase de ${nomeFaseLegivel}`}
      >
        <div
          className={`display-barra-progresso barra-${faseAtual}`}
          style={{ width: `${porcentagemProgresso}%` }}
        />
      </div>

      {/* Rodapé do display com ciclo e status */}
      <div className="display-info-rodape">
        <span className="display-ciclos">
          Ciclo {cicloAtual} de {totalCiclos}
        </span>
        {status === 'pausada' && (
          <span className="badge-status-pausa">⏸️ Sessão Pausada</span>
        )}
        {status === 'concluida' && (
          <span className="badge-status-concluida">🎉 Sessão Concluída!</span>
        )}
      </div>
    </div>
  );
};

