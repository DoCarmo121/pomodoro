import React, { useState } from 'react';
import { FaseSessao, StatusSessao } from '../../types';
import { obterNomeFase } from '../../utils/formatadores';
import { ModalConfirmacao } from '../comum/ModalConfirmacao';

export interface BannerSessaoRetomadaProps {
  aberto: boolean;
  statusSessao: StatusSessao;
  faseAtual: FaseSessao;
  cicloAtual: number;
  nomePreset: string;
  aoContinuar: () => void;
  aoDescartar: () => void;
}

export const BannerSessaoRetomada: React.FC<BannerSessaoRetomadaProps> = ({
  aberto,
  statusSessao,
  faseAtual,
  cicloAtual,
  nomePreset,
  aoContinuar,
  aoDescartar,
}) => {
  const [modalConfirmarDescarte, setModalConfirmarDescarte] = useState(false);

  if (!aberto) return null;

  const nomeFase = obterNomeFase(faseAtual);

  const obterMensagemDescritiva = () => {
    if (statusSessao === 'concluida') {
      return `Todas as fases previstas do temporizador "${nomePreset}" foram concluídas enquanto a aplicação esteve fechada (RN-08).`;
    }
    if (statusSessao === 'pausada') {
      return `Sessão do temporizador "${nomePreset}" retomada em estado pausado na fase de ${nomeFase} (Ciclo ${cicloAtual}), preservando o tempo restante (RN-06).`;
    }
    return `Sessão do temporizador "${nomePreset}" recalculada por marca temporal na fase de ${nomeFase} (Ciclo ${cicloAtual}) (RN-07).`;
  };

  const handleConfirmarDescarte = () => {
    setModalConfirmarDescarte(false);
    aoDescartar();
  };

  return (
    <>
      <div
        className="banner-sessao-retomada"
        role="region"
        aria-label="Aviso de Sessão Retomada"
      >
        <div className="banner-retomada-icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </div>

        <div className="banner-retomada-conteudo">
          <h4 className="banner-retomada-titulo">Sessão Anterior Retomada</h4>
          <p className="banner-retomada-texto">{obterMensagemDescritiva()}</p>
        </div>

        <div className="banner-retomada-acoes">
          <button
            type="button"
            className="btn btn-sm btn-secundario btn-descartar"
            onClick={() => setModalConfirmarDescarte(true)}
            aria-label="Descartar sessão retomada"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Descartar
          </button>

          <button
            type="button"
            className="btn btn-sm btn-primario"
            onClick={aoContinuar}
            aria-label="Continuar com a sessão retomada"
          >
            Continuar
          </button>
        </div>
      </div>

      <ModalConfirmacao
        aberto={modalConfirmarDescarte}
        titulo="Descartar Sessão Retomada"
        mensagem="Deseja realmente descartar a sessão anterior restaurada? Ela será encerrada sem contabilizar progresso e o temporizador voltará a ficar disponível para edição."
        textoConfirmar="Sim, Descartar"
        textoCancelar="Cancelar"
        variante="perigo"
        aoConfirmar={handleConfirmarDescarte}
        aoCancelar={() => setModalConfirmarDescarte(false)}
      />
    </>
  );
};
