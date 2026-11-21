import React, { useState } from 'react';
import { StatusSessao } from '../../types';
import { ModalConfirmacao } from '../comum/ModalConfirmacao';

export interface ControlesSessaoProps {
  status: StatusSessao | 'inativo';
  aoIniciar: () => void;
  aoPausar: () => void;
  aoRetomar: () => void;
  aoPular: () => void;
  aoReiniciarCiclos: () => void;
  aoEncerrarSessao: () => void;
}

export const ControlesSessao: React.FC<ControlesSessaoProps> = ({
  status,
  aoIniciar,
  aoPausar,
  aoRetomar,
  aoPular,
  aoReiniciarCiclos,
  aoEncerrarSessao,
}) => {
  // Controle de modais de confirmação explícita (RN-11, RF-20)
  const [modalReiniciarAberto, setModalReiniciarAberto] = useState(false);
  const [modalEncerrarAberto, setModalEncerrarAberto] = useState(false);

  const confirmarReiniciar = () => {
    aoReiniciarCiclos();
    setModalReiniciarAberto(false);
  };

  const confirmarEncerrar = () => {
    aoEncerrarSessao();
    setModalEncerrarAberto(false);
  };

  const ehSessaoAtiva = status === 'emAndamento' || status === 'pausada';

  return (
    <div className="controles-sessao-container" aria-label="Controles da Sessão de Foco">
      {/* Caso inativo ou concluído: exibe botão principal de Iniciar */}
      {!ehSessaoAtiva && (
        <button
          type="button"
          className="btn btn-primario btn-lg btn-iniciar"
          onClick={aoIniciar}
          aria-label="Iniciar sessão de foco"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '8px' }}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Iniciar Sessão de Foco
        </button>
      )}

      {/* Caso em andamento ou pausada: exibe controles completos */}
      {ehSessaoAtiva && (
        <div className="controles-botoes-grupo">
          {/* Botão Pausar / Retomar */}
          {status === 'emAndamento' ? (
            <button
              type="button"
              className="btn btn-secundario btn-acao-principal btn-pausar"
              onClick={aoPausar}
              aria-label="Pausar contagem"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '6px' }}>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pausar
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primario btn-acao-principal btn-retomar"
              onClick={aoRetomar}
              aria-label="Retomar contagem"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '6px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Retomar
            </button>
          )}

          {/* Botão Pular Fase (RN-03, RF-08, UC06) */}
          <button
            type="button"
            className="btn btn-secundario btn-pular"
            onClick={aoPular}
            title="Avança manualmente para a próxima fase sem alterar contagem de ciclos (RN-03)"
            aria-label="Pular fase atual"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '6px' }}>
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Pular Fase
          </button>

          {/* Botão Reiniciar Ciclos (RN-04, RN-11, RF-09, UC07) */}
          <button
            type="button"
            className="btn btn-secundario btn-reiniciar"
            onClick={() => setModalReiniciarAberto(true)}
            title="Retorna ao primeiro ciclo de foco (RN-04)"
            aria-label="Reiniciar ciclos de estudo"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Reiniciar Ciclos
          </button>

          {/* Botão Encerrar Sessão (RN-11, RF-10, UC08) */}
          <button
            type="button"
            className="btn btn-perigo btn-encerrar"
            onClick={() => setModalEncerrarAberto(true)}
            title="Finaliza e descarta a sessão ativa, liberando o temporizador (RN-01)"
            aria-label="Encerrar sessão ativa"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '6px' }}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            Encerrar
          </button>
        </div>
      )}

      {/* Modal de Confirmação para Reiniciar Ciclos (RN-11, UC07) */}
      <ModalConfirmacao
        aberto={modalReiniciarAberto}
        titulo="Reiniciar Ciclos"
        mensagem="Deseja zerar a contagem de ciclos e retornar ao primeiro ciclo de foco? O tempo da fase atual será reiniciado."
        textoConfirmar="Sim, Reiniciar"
        textoCancelar="Cancelar"
        variante="primario"
        aoConfirmar={confirmarReiniciar}
        aoCancelar={() => setModalReiniciarAberto(false)}
      />

      {/* Modal de Confirmação para Encerrar Sessão (RN-11, UC08) */}
      <ModalConfirmacao
        aberto={modalEncerrarAberto}
        titulo="Encerrar Sessão"
        mensagem="Tem certeza de que deseja encerrar a sessão ativa? O progresso da sessão atual será finalizado e o temporizador será liberado."
        textoConfirmar="Sim, Encerrar"
        textoCancelar="Cancelar"
        variante="perigo"
        aoConfirmar={confirmarEncerrar}
        aoCancelar={() => setModalEncerrarAberto(false)}
      />
    </div>
  );
};
