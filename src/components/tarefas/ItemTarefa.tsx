import React from 'react';
import { Tarefa, EstadoTarefa } from '../../types';
import {
  obterNomeEstadoTarefa,
  obterNomePrioridadeTarefa,
} from '../../utils/formatadores';

export interface ItemTarefaProps {
  tarefa: Tarefa;
  aoEditar: (tarefa: Tarefa) => void;
  aoExcluir: (tarefa: Tarefa) => void;
  aoMudarEstado: (id: string, novoEstado: EstadoTarefa) => void;
}

export const ItemTarefa: React.FC<ItemTarefaProps> = ({
  tarefa,
  aoEditar,
  aoExcluir,
  aoMudarEstado,
}) => {
  const estadosPossiveis: EstadoTarefa[] = [
    'backlog',
    'aFazer',
    'emExecucao',
    'concluida',
    'cancelada',
  ];

  return (
    <article
      className={`item-tarefa estado-${tarefa.estado} prioridade-${tarefa.prioridade}`}
      aria-label={`Tarefa: ${tarefa.titulo}`}
    >
      <div className="item-tarefa-corpo">
        <h4 className="item-tarefa-titulo">{tarefa.titulo}</h4>

        <div className="item-tarefa-badges">
          <span className={`badge-prioridade prioridade-${tarefa.prioridade}`}>
            <span className="ponto-prioridade" aria-hidden="true" />
            Prioridade: {obterNomePrioridadeTarefa(tarefa.prioridade)}
          </span>

          <div className="item-tarefa-estado-seletor">
            <label htmlFor={`estado-select-${tarefa.id}`} className="sr-only">
              Alterar estado da tarefa {tarefa.titulo}
            </label>
            <div className="select-estado-wrapper">
              <select
                id={`estado-select-${tarefa.id}`}
                className={`select-estado-rapido estado-${tarefa.estado}`}
                value={tarefa.estado}
                onChange={(e) =>
                  aoMudarEstado(tarefa.id, e.target.value as EstadoTarefa)
                }
                title="Alterar estado da tarefa"
              >
                {estadosPossiveis.map((est) => (
                  <option key={est} value={est}>
                    {obterNomeEstadoTarefa(est)}
                  </option>
                ))}
              </select>
              <span className="select-estado-seta" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="item-tarefa-acoes">
        <button
          type="button"
          className="btn-icone btn-editar"
          title="Editar tarefa"
          aria-label={`Editar tarefa ${tarefa.titulo}`}
          onClick={() => aoEditar(tarefa)}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          className="btn-icone btn-excluir"
          title="Excluir tarefa"
          aria-label={`Excluir tarefa ${tarefa.titulo}`}
          onClick={() => aoExcluir(tarefa)}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </article>
  );
};
