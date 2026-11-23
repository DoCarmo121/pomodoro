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
  const tempoDecorridoMs = Math.max(0, duracaoTotalFaseMs - tempoRestanteMs);
  const porcentagemProgresso =
    duracaoTotalFaseMs > 0
      ? Math.min(100, Math.max(0, (tempoDecorridoMs / duracaoTotalFaseMs) * 100))
      : 0;

  const nomeFaseLegivel = obterNomeFase(faseAtual);

  const raio = 108;
  const circunferencia = 2 * Math.PI * raio;
  const offsetCirculo = circunferencia - (porcentagemProgresso / 100) * circunferencia;

  const renderIconeFase = () => {
    switch (faseAtual) {
      case 'foco':
        return (
          <svg className="icone-fase" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2c1.1 0 2 .9 2 2 0 .74-.4 1.38-1 1.72V7c4.42.45 8 4.13 8 8.64 0 4.97-4.03 9-9 9s-9-4.03-9-9c0-4.51 3.58-8.19 8-8.64V5.72C10.4 5.38 10 4.74 10 4c0-1.1.9-2 2-2zm0 7c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z" />
          </svg>
        );
      case 'pausaCurta':
        return (
          <svg className="icone-fase" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
          </svg>
        );
      case 'pausaLonga':
        return (
          <svg className="icone-fase" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`display-temporizador fase-${faseAtual} status-${status}`}
      aria-live="polite"
    >
      <div className="display-info-cabecalho">
        <span className={`badge-fase badge-fase-${faseAtual}`}>
          {renderIconeFase()}
          <span>{status === 'inativo' ? 'Pronto para iniciar' : nomeFaseLegivel}</span>
        </span>
        <span className="display-nome-preset" title="Temporizador selecionado">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: '-2px' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {nomePreset}
        </span>
      </div>

      <div className="display-anel-wrapper">
        <svg className="display-anel-svg" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <linearGradient id="grad-foco" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="grad-pausaCurta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="grad-pausaLonga" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <circle
            className="anel-trilha-fundo"
            cx="120"
            cy="120"
            r={raio}
            fill="none"
            strokeWidth="10"
          />

          <circle
            className={`anel-trilha-progresso progresso-${faseAtual}`}
            cx="120"
            cy="120"
            r={raio}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offsetCirculo}
            transform="rotate(-90 120 120)"
          />
        </svg>

        <div className="display-anel-conteudo">
          <div
            className="display-relogio"
            aria-label={`Tempo restante: ${formatarTempo(tempoRestanteMs)}`}
          >
            {formatarTempo(tempoRestanteMs)}
          </div>

          <div className="display-substatus">
            {status === 'emAndamento' && (
              <span className="indicador-em-andamento">
                <span className="dot-pulso" /> Em andamento
              </span>
            )}
            {status === 'pausada' && (
              <span className="indicador-pausado">Em pausa</span>
            )}
            {status === 'concluida' && (
              <span className="indicador-concluido">Concluído!</span>
            )}
            {status === 'inativo' && (
              <span className="indicador-inativo">Aguardando início</span>
            )}
          </div>
        </div>
      </div>

      <div className="display-ciclos-visual" title={`Ciclo ${cicloAtual} de ${totalCiclos}`}>
        {Array.from({ length: totalCiclos }).map((_, index) => {
          const numCiclo = index + 1;
          const ehConcluido = numCiclo < cicloAtual;
          const ehAtual = numCiclo === cicloAtual;
          return (
            <span
              key={index}
              className={`ciclo-ponto ${ehConcluido ? 'concluido' : ''} ${ehAtual ? 'atual' : ''}`}
              title={`Ciclo ${numCiclo}`}
            />
          );
        })}
      </div>

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

      <div className="display-info-rodape">
        <span className="display-ciclos">
          <strong>Ciclo {cicloAtual}</strong> de {totalCiclos}
        </span>

        <span className="display-porcentagem-texto">
          {Math.round(porcentagemProgresso)}% concluído
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
