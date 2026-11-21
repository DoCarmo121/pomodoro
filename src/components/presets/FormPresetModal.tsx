import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  TemporizadorPersonalizado,
  DadosEntradaPreset,
  ErrosFormularioPreset,
} from '../../types';
import { validarFormularioPreset } from '../../utils/validacoes';
import { MensagemErro } from '../comum/MensagemErro';

export interface FormPresetModalProps {
  aberto: boolean;
  presetEmEdicao?: TemporizadorPersonalizado | null;
  aoSalvar: (dados: DadosEntradaPreset) => void;
  aoFechar: () => void;
}

export const FormPresetModal: React.FC<FormPresetModalProps> = ({
  aberto,
  presetEmEdicao,
  aoSalvar,
  aoFechar,
}) => {
  const [nome, setNome] = useState('');
  const [tempoFocoMin, setTempoFocoMin] = useState<number | string>(25);
  const [tempoPausaCurtaMin, setTempoPausaCurtaMin] = useState<number | string>(5);
  const [ciclosAntesPausaLonga, setCiclosAntesPausaLonga] = useState<number | string>(4);
  const [tempoPausaLongaMin, setTempoPausaLongaMin] = useState<number | string>(15);
  const [erros, setErros] = useState<ErrosFormularioPreset>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const inputNomeRef = useRef<HTMLInputElement>(null);
  const aoFecharRef = useRef(aoFechar);

  useEffect(() => {
    aoFecharRef.current = aoFechar;
  }, [aoFechar]);

  // Inicializa o formulário com dados do preset em edição ou valores padrão
  useEffect(() => {
    if (presetEmEdicao) {
      setNome(presetEmEdicao.nome);
      setTempoFocoMin(presetEmEdicao.tempoFocoMin);
      setTempoPausaCurtaMin(presetEmEdicao.tempoPausaCurtaMin);
      setCiclosAntesPausaLonga(presetEmEdicao.ciclosAntesPausaLonga);
      setTempoPausaLongaMin(presetEmEdicao.tempoPausaLongaMin);
    } else {
      setNome('');
      setTempoFocoMin(25);
      setTempoPausaCurtaMin(5);
      setCiclosAntesPausaLonga(4);
      setTempoPausaLongaMin(15);
    }
    setErros({});
  }, [presetEmEdicao, aberto]);

  // Foco inicial executado apenas UMA vez ao abrir o modal
  useEffect(() => {
    if (!aberto) return;

    const timer = setTimeout(() => {
      inputNomeRef.current?.focus();
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

    const dados: DadosEntradaPreset = {
      nome,
      tempoFocoMin: Number(tempoFocoMin),
      tempoPausaCurtaMin: Number(tempoPausaCurtaMin),
      ciclosAntesPausaLonga: Number(ciclosAntesPausaLonga),
      tempoPausaLongaMin: Number(tempoPausaLongaMin),
    };

    const resultado = validarFormularioPreset(dados);
    if (!resultado.valido) {
      setErros(resultado.erros);
      return;
    }

    setErros({});
    aoSalvar(dados);
  };

  const modalJSX = (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-preset-titulo"
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 id="modal-preset-titulo" className="modal-titulo">
              {presetEmEdicao ? 'Editar Temporizador' : 'Novo Temporizador'}
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
          {/* Nome do Preset (VR-01) */}
          <div className="form-grupo">
            <label htmlFor="preset-nome" className="form-label">
              Nome do Temporizador <span className="campo-obrigatorio">*</span>
            </label>
            <input
              ref={inputNomeRef}
              id="preset-nome"
              type="text"
              className={`form-input ${erros.nome ? 'input-erro' : ''}`}
              placeholder="Ex: Foco Intenso"
              value={nome}
              maxLength={40}
              aria-required="true"
              aria-invalid={erros.nome ? 'true' : 'false'}
              aria-describedby={erros.nome ? 'erro-preset-nome' : undefined}
              onChange={(e) => {
                setNome(e.target.value);
                if (erros.nome) {
                  setErros((prev) => ({ ...prev, nome: undefined }));
                }
              }}
            />
            <div className="form-grupo-rodape">
              <MensagemErro id="erro-preset-nome" mensagem={erros.nome} />
              <small className="form-ajuda">{nome.length}/40 caracteres</small>
            </div>
          </div>

          <div className="form-linha">
            {/* Tempo de Foco (VR-02) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-foco" className="form-label">
                Foco (minutos) <span className="campo-obrigatorio">*</span>
              </label>
              <input
                id="preset-foco"
                type="number"
                min={1}
                max={120}
                className={`form-input ${erros.tempoFocoMin ? 'input-erro' : ''}`}
                value={tempoFocoMin}
                aria-required="true"
                aria-invalid={erros.tempoFocoMin ? 'true' : 'false'}
                aria-describedby={erros.tempoFocoMin ? 'erro-preset-foco' : undefined}
                onChange={(e) => {
                  setTempoFocoMin(e.target.value);
                  if (erros.tempoFocoMin) {
                    setErros((prev) => ({ ...prev, tempoFocoMin: undefined }));
                  }
                }}
              />
              <div className="form-grupo-rodape">
                <MensagemErro id="erro-preset-foco" mensagem={erros.tempoFocoMin} />
                <small className="form-ajuda">1 a 120 min</small>
              </div>
            </div>

            {/* Tempo de Pausa Curta (VR-03) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-pausa-curta" className="form-label">
                Pausa Curta (min) <span className="campo-obrigatorio">*</span>
              </label>
              <input
                id="preset-pausa-curta"
                type="number"
                min={1}
                max={60}
                className={`form-input ${erros.tempoPausaCurtaMin ? 'input-erro' : ''}`}
                value={tempoPausaCurtaMin}
                aria-required="true"
                aria-invalid={erros.tempoPausaCurtaMin ? 'true' : 'false'}
                aria-describedby={erros.tempoPausaCurtaMin ? 'erro-preset-pausa-curta' : undefined}
                onChange={(e) => {
                  setTempoPausaCurtaMin(e.target.value);
                  if (erros.tempoPausaCurtaMin) {
                    setErros((prev) => ({ ...prev, tempoPausaCurtaMin: undefined }));
                  }
                }}
              />
              <div className="form-grupo-rodape">
                <MensagemErro id="erro-preset-pausa-curta" mensagem={erros.tempoPausaCurtaMin} />
                <small className="form-ajuda">1 a 60 min</small>
              </div>
            </div>
          </div>

          <div className="form-linha">
            {/* Ciclos antes da Pausa Longa (VR-04) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-ciclos" className="form-label">
                Ciclos até Pausa Longa <span className="campo-obrigatorio">*</span>
              </label>
              <input
                id="preset-ciclos"
                type="number"
                min={1}
                max={12}
                className={`form-input ${erros.ciclosAntesPausaLonga ? 'input-erro' : ''}`}
                value={ciclosAntesPausaLonga}
                aria-required="true"
                aria-invalid={erros.ciclosAntesPausaLonga ? 'true' : 'false'}
                aria-describedby={erros.ciclosAntesPausaLonga ? 'erro-preset-ciclos' : undefined}
                onChange={(e) => {
                  setCiclosAntesPausaLonga(e.target.value);
                  if (erros.ciclosAntesPausaLonga) {
                    setErros((prev) => ({ ...prev, ciclosAntesPausaLonga: undefined }));
                  }
                }}
              />
              <div className="form-grupo-rodape">
                <MensagemErro id="erro-preset-ciclos" mensagem={erros.ciclosAntesPausaLonga} />
                <small className="form-ajuda">1 a 12 ciclos</small>
              </div>
            </div>

            {/* Tempo de Pausa Longa (VR-05) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-pausa-longa" className="form-label">
                Pausa Longa (min) <span className="campo-obrigatorio">*</span>
              </label>
              <input
                id="preset-pausa-longa"
                type="number"
                min={1}
                max={60}
                className={`form-input ${erros.tempoPausaLongaMin ? 'input-erro' : ''}`}
                value={tempoPausaLongaMin}
                aria-required="true"
                aria-invalid={erros.tempoPausaLongaMin ? 'true' : 'false'}
                aria-describedby={erros.tempoPausaLongaMin ? 'erro-preset-pausa-longa' : undefined}
                onChange={(e) => {
                  setTempoPausaLongaMin(e.target.value);
                  if (erros.tempoPausaLongaMin) {
                    setErros((prev) => ({ ...prev, tempoPausaLongaMin: undefined }));
                  }
                }}
              />
              <div className="form-grupo-rodape">
                <MensagemErro id="erro-preset-pausa-longa" mensagem={erros.tempoPausaLongaMin} />
                <small className="form-ajuda">1 a 60 min</small>
              </div>
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
              {presetEmEdicao ? 'Salvar Alterações' : 'Criar Temporizador'}
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
