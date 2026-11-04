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
      {(!ehSessaoAtiva) && (
        <button
          type="button"
          className="btn btn-primario btn-lg btn-iniciar"
          onClick={aoIniciar}
          aria-label="Iniciar sessão de foco"
        >
          ▶ Iniciar Sessão de Foco
        </button>
      )}

      {/* Caso em andamento ou pausada: exibe controles completos */}
      {ehSessaoAtiva && (
        <div className="controles-botoes-grupo">
          {/* Botão Pausar / Retomar */}
          {status === 'emAndamento' ? (
            <button
              type="button"
              className="btn btn-secundario btn-acao-principal"
              onClick={aoPausar}
              aria-label="Pausar contagem"
            >
              ⏸ Pausar
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primario btn-acao-principal"
              onClick={aoRetomar}
              aria-label="Retomar contagem"
            >
              ▶ Retomar
            </button>
          )}

          {/* Botão Pular Fase (RN-03, RF-08, UC06) */}
          <button
            type="button"
            className="btn btn-secundario"
            onClick={aoPular}
            title="Avança manualmente para a próxima fase sem alterar contagem de ciclos (RN-03)"
            aria-label="Pular fase atual"
          >
            ⏭ Pular Fase
          </button>

          {/* Botão Reiniciar Ciclos (RN-04, RN-11, RF-09, UC07) */}
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setModalReiniciarAberto(true)}
            title="Retorna ao primeiro ciclo de foco (RN-04)"
            aria-label="Reiniciar ciclos de estudo"
          >
            🔄 Reiniciar Ciclos
          </button>

          {/* Botão Encerrar Sessão (RN-11, RF-10, UC08) */}
          <button
            type="button"
            className="btn btn-perigo"
            onClick={() => setModalEncerrarAberto(true)}
            title="Finaliza e descarta a sessão ativa, liberando o temporizador (RN-01)"
            aria-label="Encerrar sessão ativa"
          >
            ⏹ Encerrar
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

