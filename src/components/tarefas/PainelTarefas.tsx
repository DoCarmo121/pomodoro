import React, { useState, useCallback } from 'react';
import { Tarefa, DadosEntradaTarefa, EstadoTarefa } from '../../types';
import { ordenarTarefas } from '../../domain/ordenacaoTarefas';
import { ItemTarefa } from './ItemTarefa';
import { FormTarefaModal } from './FormTarefaModal';
import { ModalConfirmacao } from '../comum/ModalConfirmacao';

export interface PainelTarefasProps {
  tarefas: Tarefa[];
  aoCriarTarefa: (dados: DadosEntradaTarefa) => void;
  aoEditarTarefa: (id: string, dados: DadosEntradaTarefa) => void;
  aoExcluirTarefa: (id: string) => void;
  aoMudarEstadoTarefa: (id: string, novoEstado: EstadoTarefa) => void;
}

export const PainelTarefas: React.FC<PainelTarefasProps> = ({
  tarefas,
  aoCriarTarefa,
  aoEditarTarefa,
  aoExcluirTarefa,
  aoMudarEstadoTarefa,
}) => {
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<Tarefa | null>(null);

  // Estado para exclusão com confirmação obrigatória (RN-11, RF-17, UC14)
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<Tarefa | null>(null);

  // Ordenação fixa aplicada automaticamente por RN-10
  const tarefasOrdenadas = ordenarTarefas(tarefas);

  const abrirModalCriar = () => {
    setTarefaEmEdicao(null);
    setModalFormAberto(true);
  };

  const abrirModalEditar = (tarefa: Tarefa) => {
    setTarefaEmEdicao(tarefa);
    setModalFormAberto(true);
  };

  const fecharModalForm = useCallback(() => {
    setTarefaEmEdicao(null);
    setModalFormAberto(false);
  }, []);

  const salvarFormulario = (dados: DadosEntradaTarefa) => {
    if (tarefaEmEdicao) {
      aoEditarTarefa(tarefaEmEdicao.id, dados);
    } else {
      aoCriarTarefa(dados);
    }
    fecharModalForm();
  };

  const solicitarExclusao = (tarefa: Tarefa) => {
    setTarefaParaExcluir(tarefa);
  };

  const confirmarExclusao = () => {
    if (tarefaParaExcluir) {
      aoExcluirTarefa(tarefaParaExcluir.id);
      setTarefaParaExcluir(null);
    }
  };

  const cancelarExclusao = () => {
    setTarefaParaExcluir(null);
  };

  return (
    <aside className="painel-tarefas-container" aria-label="Painel de Tarefas de Estudo">
      <header className="painel-tarefas-cabecalho">
        <div className="painel-tarefas-titulo-bloco">
          <div className="painel-tarefas-icone-titulo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h3>Tarefas de Estudo</h3>
          <span className="painel-tarefas-contador" title="Total de tarefas cadastradas">
            {tarefas.length}
          </span>
        </div>

        <button
          type="button"
          className="btn btn-primario btn-sm btn-nova-tarefa"
          onClick={abrirModalCriar}
          aria-label="Criar nova tarefa de estudo"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Tarefa
        </button>
      </header>

      <section className="painel-tarefas-lista" aria-label="Lista ordenada de tarefas">
        {tarefasOrdenadas.length === 0 ? (
          <div className="painel-tarefas-vazio">
            <div className="icone-vazio-tarefas" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p>Nenhuma tarefa cadastrada</p>
            <small>Crie tarefas para organizar suas sessões de estudo!</small>
          </div>
        ) : (
          tarefasOrdenadas.map((tarefa) => (
            <ItemTarefa
              key={tarefa.id}
              tarefa={tarefa}
              aoEditar={abrirModalEditar}
              aoExcluir={solicitarExclusao}
              aoMudarEstado={aoMudarEstadoTarefa}
            />
          ))
        )}
      </section>

      {/* Modal de Criação / Edição de Tarefas (UC12, UC13) */}
      <FormTarefaModal
        aberto={modalFormAberto}
        tarefaEmEdicao={tarefaEmEdicao}
        aoSalvar={salvarFormulario}
        aoFechar={fecharModalForm}
      />

      {/* Modal de Confirmação Obrigatória para Exclusão de Tarefa (RN-11, RF-17, UC14) */}
      <ModalConfirmacao
        aberto={tarefaParaExcluir !== null}
        titulo="Excluir Tarefa"
        mensagem={
          tarefaParaExcluir
            ? `Tem certeza de que deseja excluir a tarefa "${tarefaParaExcluir.titulo}"? Esta operação não pode ser desfeita.`
            : ''
        }
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
        aoConfirmar={confirmarExclusao}
        aoCancelar={cancelarExclusao}
      />
    </aside>
  );
};
