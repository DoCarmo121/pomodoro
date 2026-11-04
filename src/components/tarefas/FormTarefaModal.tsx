import React, { useState, useEffect } from 'react';
import {
  Tarefa,
  DadosEntradaTarefa,
  EstadoTarefa,
  PrioridadeTarefa,
  ErrosFormularioTarefa,
} from '../../types';
import { validarFormularioTarefa } from '../../utils/validacoes';
import {
  obterNomeEstadoTarefa,
  obterNomePrioridadeTarefa,
} from '../../utils/formatadores';

export interface FormTarefaModalProps {
  aberto: boolean;
  tarefaEmEdicao?: Tarefa | null;
  aoSalvar: (dados: DadosEntradaTarefa) => void;
  aoFechar: () => void;
}

export const FormTarefaModal: React.FC<FormTarefaModalProps> = ({
  aberto,
  tarefaEmEdicao,
  aoSalvar,
  aoFechar,
}) => {
  // RN-12: Toda tarefa criada assume estado 'backlog' e prioridade 'media' como valores padrão
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState<EstadoTarefa>('backlog');
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('media');
  const [erros, setErros] = useState<ErrosFormularioTarefa>({});

  // Atualiza os campos ao abrir o modal para criação ou edição
  useEffect(() => {
    if (tarefaEmEdicao) {
      setTitulo(tarefaEmEdicao.titulo);
      setEstado(tarefaEmEdicao.estado);
      setPrioridade(tarefaEmEdicao.prioridade);
    } else {
      // Valores padrão conforme RN-12
      setTitulo('');
      setEstado('backlog');
      setPrioridade('media');
    }
    setErros({});
  }, [tarefaEmEdicao, aberto]);

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const lidarComTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) {
        aoFechar();
      }
    };
    window.addEventListener('keydown', lidarComTecla);
    return () => window.removeEventListener('keydown', lidarComTecla);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dados: DadosEntradaTarefa = {
      titulo,
      estado,
      prioridade,
    };

    const resultado = validarFormularioTarefa(dados);
    if (!resultado.valido) {
      setErros(resultado.erros);
      return;
    }

    setErros({});
    aoSalvar(dados);
  };

  const estadosDisponiveis: EstadoTarefa[] = [
    'backlog',
    'aFazer',
    'emExecucao',
    'concluida',
    'cancelada',
  ];

  const prioridadesDisponiveis: PrioridadeTarefa[] = ['baixa', 'media', 'alta'];

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tarefa-titulo"
    >
      <div className="modal-conteudo">
        <h3 id="modal-tarefa-titulo" className="modal-titulo">
          {tarefaEmEdicao ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grupo">
            <label htmlFor="tarefa-titulo" className="form-label">
              Título da Tarefa *
            </label>
            <input
              id="tarefa-titulo"
              type="text"
              className={`form-input ${erros.titulo ? 'input-erro' : ''}`}
              placeholder="Ex: Resolver exercícios de grafos"
              value={titulo}
              maxLength={100}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (erros.titulo) {
                  setErros((prev) => ({ ...prev, titulo: undefined }));
                }
              }}
              autoFocus
            />
            {erros.titulo && <span className="msg-erro">{erros.titulo}</span>}
            <small className="form-ajuda">{titulo.length}/100 caracteres</small>
          </div>

          <div className="form-linha">
            <div className="form-grupo form-metade">
              <label htmlFor="tarefa-estado" className="form-label">
                Estado *
              </label>
              <select
                id="tarefa-estado"
                className={`form-select ${erros.estado ? 'input-erro' : ''}`}
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoTarefa)}
              >
                {estadosDisponiveis.map((est) => (
                  <option key={est} value={est}>
                    {obterNomeEstadoTarefa(est)}
                  </option>
                ))}
              </select>
              {erros.estado && <span className="msg-erro">{erros.estado}</span>}
            </div>

            <div className="form-grupo form-metade">
              <label htmlFor="tarefa-prioridade" className="form-label">
                Prioridade *
              </label>
              <select
                id="tarefa-prioridade"
                className={`form-select ${erros.prioridade ? 'input-erro' : ''}`}
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}
              >
                {prioridadesDisponiveis.map((prio) => (
                  <option key={prio} value={prio}>
                    {obterNomePrioridadeTarefa(prio)}
                  </option>
                ))}
              </select>
              {erros.prioridade && (
                <span className="msg-erro">{erros.prioridade}</span>
              )}
            </div>
          </div>

          <div className="modal-acoes">
            <button
              type="button"
              className="btn btn-secundario"
              onClick={aoFechar}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primario">
              {tarefaEmEdicao ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

