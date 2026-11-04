import React, { useState } from 'react';
import { TemporizadorPersonalizado, DadosEntradaPreset } from '../../types';
import { FormPresetModal } from './FormPresetModal';
import { ModalConfirmacao } from '../comum/ModalConfirmacao';

export interface ListaPresetsProps {
  presets: TemporizadorPersonalizado[];
  presetSelecionadoId: string;
  presetAtivoId?: string | null; // ID do preset que está em execução na sessão ativa (RN-01)
  aoSelecionarPreset: (preset: TemporizadorPersonalizado) => void;
  aoCriarPreset: (dados: DadosEntradaPreset) => void;
  aoEditarPreset: (id: string, dados: DadosEntradaPreset) => void;
  aoExcluirPreset: (id: string) => void;
}

export const ListaPresets: React.FC<ListaPresetsProps> = ({
  presets,
  presetSelecionadoId,
  presetAtivoId,
  aoSelecionarPreset,
  aoCriarPreset,
  aoEditarPreset,
  aoExcluirPreset,
}) => {
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [presetEmEdicao, setPresetEmEdicao] = useState<TemporizadorPersonalizado | null>(null);

  // Estado para exclusão com confirmação obrigatória (RN-11, RF-03, UC03)
  const [presetParaExcluir, setPresetParaExcluir] = useState<TemporizadorPersonalizado | null>(null);
  const [mensagemBloqueio, setMensagemBloqueio] = useState<string | null>(null);

  const abrirModalCriar = () => {
    setPresetEmEdicao(null);
    setModalFormAberto(true);
  };

  const abrirModalEditar = (preset: TemporizadorPersonalizado) => {
    // RN-01: Um preset em uso por sessão ativa não pode ser editado
    if (preset.id === presetAtivoId) {
      setMensagemBloqueio(
        `O temporizador "${preset.nome}" está em uso pela sessão ativa e não pode ser editado no momento (RN-01).`
      );
      return;
    }
    setPresetEmEdicao(preset);
    setModalFormAberto(true);
  };

  const solicitarExclusao = (preset: TemporizadorPersonalizado) => {
    // RN-01: Um preset em uso por sessão ativa não pode ser excluído
    if (preset.id === presetAtivoId) {
      setMensagemBloqueio(
        `O temporizador "${preset.nome}" está em uso pela sessão ativa e não pode ser excluído no momento (RN-01).`
      );
      return;
    }

    // Não permite excluir se for o único preset (UC04 pré-requisito: existir ao menos um preset)
    if (presets.length <= 1) {
      setMensagemBloqueio('Você deve manter ao menos um temporizador cadastrado no sistema.');
      return;
    }

    setPresetParaExcluir(preset);
  };

  const confirmarExclusao = () => {
    if (presetParaExcluir) {
      aoExcluirPreset(presetParaExcluir.id);
      setPresetParaExcluir(null);
    }
  };

  const fecharModalForm = () => {
    setPresetEmEdicao(null);
    setModalFormAberto(false);
  };

  const salvarFormulario = (dados: DadosEntradaPreset) => {
    if (presetEmEdicao) {
      aoEditarPreset(presetEmEdicao.id, dados);
    } else {
      aoCriarPreset(dados);
    }
    fecharModalForm();
  };

  return (
    <section className="lista-presets-container" aria-label="Gerenciamento de Temporizadores">
      <header className="lista-presets-cabecalho">
        <div>
          <h3>Temporizadores Personalizados</h3>
          <p className="subtitulo-secao">Selecione ou crie ciclos de foco sob medida</p>
        </div>
        <button
          type="button"
          className="btn btn-primario btn-sm"
          onClick={abrirModalCriar}
          aria-label="Criar novo temporizador personalizado"
        >
          + Novo Temporizador
        </button>
      </header>

      {/* Aviso de bloqueio RN-01 quando aplicável */}
      {mensagemBloqueio && (
        <div className="alerta-bloqueio" role="alert">
          <span>⚠️ {mensagemBloqueio}</span>
          <button
            type="button"
            className="btn-fechar-alerta"
            onClick={() => setMensagemBloqueio(null)}
            aria-label="Fechar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grade de Presets (RF-04) */}
      <div className="grid-presets">
        {presets.map((preset) => {
          const ehAtivoNaSessao = preset.id === presetAtivoId;
          const estaSelecionado = preset.id === presetSelecionadoId;

          return (
            <article
              key={preset.id}
              className={`card-preset ${estaSelecionado ? 'preset-selecionado' : ''} ${
                ehAtivoNaSessao ? 'preset-ativo' : ''
              }`}
            >
              <div className="card-preset-topo">
                <h4 className="card-preset-nome">{preset.nome}</h4>
                <div className="card-preset-tags">
                  {ehAtivoNaSessao && (
                    <span className="badge-tag tag-em-uso" title="Preset em uso na sessão ativa atual (RN-01)">
                      Sessão Ativa
                    </span>
                  )}
                  {estaSelecionado && !ehAtivoNaSessao && (
                    <span className="badge-tag tag-selecionado">Selecionado</span>
                  )}
                </div>
              </div>

              <div className="card-preset-detalhes">
                <div className="detalhe-item">
                  <span className="detalhe-rotulo">Foco</span>
                  <strong className="detalhe-valor">{preset.tempoFocoMin} min</strong>
                </div>
                <div className="detalhe-item">
                  <span className="detalhe-rotulo">Pausa Curta</span>
                  <strong className="detalhe-valor">{preset.tempoPausaCurtaMin} min</strong>
                </div>
                <div className="detalhe-item">
                  <span className="detalhe-rotulo">Ciclos</span>
                  <strong className="detalhe-valor">{preset.ciclosAntesPausaLonga}x</strong>
                </div>
                <div className="detalhe-item">
                  <span className="detalhe-rotulo">Pausa Longa</span>
                  <strong className="detalhe-valor">{preset.tempoPausaLongaMin} min</strong>
                </div>
              </div>

              <div className="card-preset-rodape">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    estaSelecionado ? 'btn-secundario btn-desabilitado' : 'btn-primario'
                  }`}
                  disabled={estaSelecionado}
                  onClick={() => aoSelecionarPreset(preset)}
                >
                  {estaSelecionado ? 'Selecionado' : 'Usar este'}
                </button>

                <div className="card-preset-acoes-edicao">
                  <button
                    type="button"
                    className="btn-icone"
                    title={
                      ehAtivoNaSessao
                        ? 'Bloqueado: temporizador em uso pela sessão ativa (RN-01)'
                        : 'Editar temporizador'
                    }
                    disabled={ehAtivoNaSessao}
                    onClick={() => abrirModalEditar(preset)}
                    aria-label={`Editar temporizador ${preset.nome}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="btn-icone btn-excluir"
                    title={
                      ehAtivoNaSessao
                        ? 'Bloqueado: temporizador em uso pela sessão ativa (RN-01)'
                        : 'Excluir temporizador'
                    }
                    disabled={ehAtivoNaSessao}
                    onClick={() => solicitarExclusao(preset)}
                    aria-label={`Excluir temporizador ${preset.nome}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal de Criação / Edição de Preset (RF-01, RF-02, UC01, UC02) */}
      <FormPresetModal
        aberto={modalFormAberto}
        presetEmEdicao={presetEmEdicao}
        aoSalvar={salvarFormulario}
        aoFechar={fecharModalForm}
      />

      {/* Modal de Confirmação Obrigatória para Exclusão (RN-11, RF-03, RF-20, UC03) */}
      <ModalConfirmacao
        aberto={presetParaExcluir !== null}
        titulo="Excluir Temporizador"
        mensagem={
          presetParaExcluir
            ? `Deseja realmente excluir o temporizador "${presetParaExcluir.nome}"? Esta ação é irreversível.`
            : ''
        }
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setPresetParaExcluir(null)}
      />
    </section>
  );
};

