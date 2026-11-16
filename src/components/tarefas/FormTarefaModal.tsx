import React, { useState, useEffect, useRef } from 'react';
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
import { MensagemErro } from '../comum/MensagemErro';

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

  const modalRef = useRef<HTMLDivElement>(null);
  const inputTituloRef = useRef<HTMLInputElement>(null);

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

  // Foco inicial e controle de teclado (Escape e Tab trap - RNF-07)
  useEffect(() => {
    if (!aberto) return;

    const timer = setTimeout(() => {
      inputTituloRef.current?.focus();
    }, 50);

    const lidarComTeclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoFechar();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const elementosFocaveis = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (elementosFocaveis.length === 0) return;

        const primeiroElemento = elementosFocaveis[0];
        const ultimoElemento = elementosFocaveis[elementosFocaveis.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === primeiroElemento) {
            e.preventDefault();
            ultimoElemento.focus();
          }
        } else {
          if (document.activeElement === ultimoElemento) {
            e.preventDefault();
            primeiroElemento.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', lidarComTeclas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', lidarComTeclas);
    };
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
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          aoFechar();
        }
      }}
    >
      <div className="modal-conteudo" ref={modalRef}>
        <h3 id="modal-tarefa-titulo" className="modal-titulo">
          {tarefaEmEdicao ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grupo">
            <label htmlFor="tarefa-titulo" className="form-label">
              Título da Tarefa *
            </label>
            <input
              ref={inputTituloRef}
              id="tarefa-titulo"
              type="text"
              className={`form-input ${erros.titulo ? 'input-erro' : ''}`}
              placeholder="Ex: Resolver exercícios de grafos"
              value={titulo}
              maxLength={100}
              aria-required="true"
              aria-invalid={erros.titulo ? 'true' : 'false'}
              aria-describedby={erros.titulo ? 'erro-tarefa-titulo' : undefined}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (erros.titulo) {
                  setErros((prev) => ({ ...prev, titulo: undefined }));
                }
              }}
            />
            <MensagemErro id="erro-tarefa-titulo" mensagem={erros.titulo} />
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
                aria-required="true"
                aria-invalid={erros.estado ? 'true' : 'false'}
                aria-describedby={erros.estado ? 'erro-tarefa-estado' : undefined}
                onChange={(e) => setEstado(e.target.value as EstadoTarefa)}
              >
                {estadosDisponiveis.map((est) => (
                  <option key={est} value={est}>
                    {obterNomeEstadoTarefa(est)}
                  </option>
                ))}
              </select>
              <MensagemErro id="erro-tarefa-estado" mensagem={erros.estado} />
            </div>

            <div className="form-grupo form-metade">
              <label htmlFor="tarefa-prioridade" className="form-label">
                Prioridade *
              </label>
              <select
                id="tarefa-prioridade"
                className={`form-select ${erros.prioridade ? 'input-erro' : ''}`}
                value={prioridade}
                aria-required="true"
                aria-invalid={erros.prioridade ? 'true' : 'false'}
                aria-describedby={erros.prioridade ? 'erro-tarefa-prioridade' : undefined}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}
              >
                {prioridadesDisponiveis.map((prio) => (
                  <option key={prio} value={prio}>
                    {obterNomePrioridadeTarefa(prio)}
                  </option>
                ))}
              </select>
              <MensagemErro id="erro-tarefa-prioridade" mensagem={erros.prioridade} />
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
