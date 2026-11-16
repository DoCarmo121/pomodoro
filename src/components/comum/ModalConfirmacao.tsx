import React, { useEffect, useRef } from 'react';

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

  // Foco inicial e navegação por teclado (RNF-07)
  useEffect(() => {
    if (!aberto) return;

    // Foca o botão de cancelar por padrão para evitar confirmações acidentais
    const timer = setTimeout(() => {
      botaoCancelarRef.current?.focus();
    }, 50);

    const lidarComTeclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoCancelar();
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
      clearTimeout(timer);
      window.removeEventListener('keydown', lidarComTeclas);
    };
  }, [aberto, aoCancelar]);

  if (!aberto) return null;

  return (
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
      <div className="modal-conteudo" ref={conteudoRef}>
        <h3 id="modal-confirmacao-titulo" className="modal-titulo">
          {titulo}
        </h3>
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
};
