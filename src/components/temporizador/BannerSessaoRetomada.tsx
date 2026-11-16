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
  // Modal de confirmação explícita para descarte da sessão retomada (RN-11, UC11)
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
        <div className="banner-retomada-icone">🔄</div>

        <div className="banner-retomada-conteudo">
          <h4 className="banner-retomada-titulo">Sessão Anterior Retomada Automaticamente</h4>
          <p className="banner-retomada-texto">{obterMensagemDescritiva()}</p>
        </div>

        <div className="banner-retomada-acoes">
          {/* Botão de Descartar Sessão (RF-13, UC11) */}
          <button
            type="button"
            className="btn btn-sm btn-secundario btn-descartar"
            onClick={() => setModalConfirmarDescarte(true)}
            aria-label="Descartar sessão retomada"
          >
            🗑️ Descartar Sessão
          </button>

          {/* Botão de Prosseguir */}
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

      {/* Modal de confirmação explícita para descarte da sessão (RN-11, UC11) */}
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
