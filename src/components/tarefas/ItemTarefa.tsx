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
          {/* Badge de Prioridade */}
          <span className={`badge-prioridade prioridade-${tarefa.prioridade}`}>
            Prioridade: {obterNomePrioridadeTarefa(tarefa.prioridade)}
          </span>

          {/* Badge / Seletor de Estado Rápido */}
          <div className="item-tarefa-estado-seletor">
            <label htmlFor={`estado-select-${tarefa.id}`} className="sr-only">
              Alterar estado da tarefa {tarefa.titulo}
            </label>
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
          ✏️
        </button>
        <button
          type="button"
          className="btn-icone btn-excluir"
          title="Excluir tarefa"
          aria-label={`Excluir tarefa ${tarefa.titulo}`}
          onClick={() => aoExcluir(tarefa)}
        >
          🗑️
        </button>
      </div>
    </article>
  );
};

