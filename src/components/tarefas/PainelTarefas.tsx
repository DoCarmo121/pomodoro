import React, { useState } from 'react';
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

  const fecharModalForm = () => {
    setTarefaEmEdicao(null);
    setModalFormAberto(false);
  };

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
          <h3>Tarefas de Estudo</h3>
          <span className="painel-tarefas-contador" title="Total de tarefas cadastradas">
            {tarefas.length}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-primario btn-sm"
          onClick={abrirModalCriar}
          aria-label="Criar nova tarefa de estudo"
        >
          + Nova Tarefa
        </button>
      </header>

      <section className="painel-tarefas-lista" aria-label="Lista ordenada de tarefas">
        {tarefasOrdenadas.length === 0 ? (
          <div className="painel-tarefas-vazio">
            <p>Nenhuma tarefa cadastrada.</p>
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

