import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: 'perigo' | 'primario';
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

/**
 * Componente de Modal de Confirmação Reutilizável (CP 9.1, RF-20, RN-11, RNF-07).
 * Utilizado para confirmação explícita em exclusões e operações destrutivas.
 * Possui acessibilidade total por teclado (Escape para fechar, foco inicial e navegação Tab em ciclo).
 */
export const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'perigo',
  aoConfirmar,
  aoCancelar,
}) => {
  const botaoCancelarRef = useRef<HTMLButtonElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const aoCancelarRef = useRef(aoCancelar);

  useEffect(() => {
    aoCancelarRef.current = aoCancelar;
  }, [aoCancelar]);

  // Foco inicial executado apenas UMA vez ao abrir o modal
  useEffect(() => {
    if (!aberto) return;

    // Foca o botão de cancelar por padrão para evitar confirmações acidentais
    const timer = setTimeout(() => {
      botaoCancelarRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [aberto]);

  // Navegação e fechamento por teclado (RNF-07)
  useEffect(() => {
    if (!aberto) return;

    const lidarComTeclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoCancelarRef.current();
        return;
      }

      // Ciclo de foco (Focus Trap) dentro do modal
      if (e.key === 'Tab' && conteudoRef.current) {
        const elementosFocaveis = conteudoRef.current.querySelectorAll<HTMLElement>(
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

  const modalJSX = (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacao-titulo"
      aria-describedby="modal-confirmacao-mensagem"
      onClick={(e) => {
        // Clicar fora da caixa fecha o modal
        if (e.target === e.currentTarget) {
          aoCancelar();
        }
      }}
    >
      <div className="modal-conteudo modal-confirmacao-conteudo" ref={conteudoRef}>
        <div className="modal-cabecalho-icone">
          <div className={`icone-destaque variante-${variante}`} aria-hidden="true">
            {variante === 'perigo' ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          </div>
          <h3 id="modal-confirmacao-titulo" className="modal-titulo">
            {titulo}
          </h3>
        </div>

        <p id="modal-confirmacao-mensagem" className="modal-mensagem">
          {mensagem}
        </p>

        <div className="modal-acoes">
          <button
            ref={botaoCancelarRef}
            type="button"
            className="btn btn-secundario"
            onClick={aoCancelar}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`btn ${variante === 'perigo' ? 'btn-perigo' : 'btn-primario'}`}
            onClick={aoConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalJSX, document.body)
    : modalJSX;
};
