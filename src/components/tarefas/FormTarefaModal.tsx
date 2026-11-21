import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const aoFecharRef = useRef(aoFechar);

  useEffect(() => {
    aoFecharRef.current = aoFechar;
  }, [aoFechar]);

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

  // Foco inicial executado apenas UMA vez ao abrir o modal
  useEffect(() => {
    if (!aberto) return;

    const timer = setTimeout(() => {
      inputTituloRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [aberto]);

  // Controle de teclado (Escape e Tab trap - RNF-07)
  useEffect(() => {
    if (!aberto) return;

    const lidarComTeclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoFecharRef.current();
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
      window.removeEventListener('keydown', lidarComTeclas);
    };
  }, [aberto]);

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

  const modalJSX = (
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
        <div className="modal-cabecalho">
          <div className="modal-titulo-grupo">
            <div className="modal-icone-wrapper" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 id="modal-tarefa-titulo" className="modal-titulo">
              {tarefaEmEdicao ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h3>
          </div>
          <button
            type="button"
            className="modal-btn-fechar"
            onClick={aoFechar}
            aria-label="Fechar janela modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grupo">
            <label htmlFor="tarefa-titulo" className="form-label">
              Título da Tarefa <span className="campo-obrigatorio">*</span>
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
            <div className="form-grupo-rodape">
              <MensagemErro id="erro-tarefa-titulo" mensagem={erros.titulo} />
              <small className="form-ajuda">{titulo.length}/100 caracteres</small>
            </div>
          </div>

          <div className="form-linha">
            <div className="form-grupo form-metade">
              <label htmlFor="tarefa-estado" className="form-label">
                Estado <span className="campo-obrigatorio">*</span>
              </label>
              <div className="select-personalizado-wrapper">
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
                <div className="select-icone-seta" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <MensagemErro id="erro-tarefa-estado" mensagem={erros.estado} />
            </div>

            <div className="form-grupo form-metade">
              <label htmlFor="tarefa-prioridade" className="form-label">
                Prioridade <span className="campo-obrigatorio">*</span>
              </label>
              <div className="select-personalizado-wrapper">
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
                <div className="select-icone-seta" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
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

  return typeof document !== 'undefined'
    ? createPortal(modalJSX, document.body)
    : modalJSX;
};
