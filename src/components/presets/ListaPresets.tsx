import React, { useState, useCallback } from 'react';
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

  const fecharModalForm = useCallback(() => {
    setPresetEmEdicao(null);
    setModalFormAberto(false);
  }, []);

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
          <div className="lista-presets-titulo-bloco">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <h3>Temporizadores Personalizados</h3>
          </div>
          <p className="subtitulo-secao">Selecione ou crie ciclos de foco sob medida</p>
        </div>

        <button
          type="button"
          className="btn btn-primario btn-sm btn-novo-preset"
          onClick={abrirModalCriar}
          aria-label="Criar novo temporizador personalizado"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Temporizador
        </button>
      </header>

      {/* Aviso de bloqueio RN-01 quando aplicável */}
      {mensagemBloqueio && (
        <div className="alerta-bloqueio" role="alert">
          <div className="alerta-bloqueio-texto">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{mensagemBloqueio}</span>
          </div>
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
                      <span className="dot-pulso-ativo" /> Sessão Ativa
                    </span>
                  )}
                  {estaSelecionado && !ehAtivoNaSessao && (
                    <span className="badge-tag tag-selecionado">Selecionado</span>
                  )}
                </div>
              </div>

              <div className="card-preset-detalhes">
                <div className="detalhe-item">
                  <span className="detalhe-rotulo">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Foco
                  </span>
                  <strong className="detalhe-valor">{preset.tempoFocoMin} min</strong>
                </div>

                <div className="detalhe-item">
                  <span className="detalhe-rotulo">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                    Pausa Curta
                  </span>
                  <strong className="detalhe-valor">{preset.tempoPausaCurtaMin} min</strong>
                </div>

                <div className="detalhe-item">
                  <span className="detalhe-rotulo">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    Ciclos
                  </span>
                  <strong className="detalhe-valor">{preset.ciclosAntesPausaLonga}x</strong>
                </div>

                <div className="detalhe-item">
                  <span className="detalhe-rotulo">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                      <path d="M18 20V10" />
                      <path d="M12 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                    Pausa Longa
                  </span>
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
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
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
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
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
