import React, { useEffect } from 'react';

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
  // Fecha o modal ao pressionar a tecla ESC (RNF-07)
  useEffect(() => {
    const lidarComTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) {
        aoCancelar();
      }
    };
    window.addEventListener('keydown', lidarComTecla);
    return () => window.removeEventListener('keydown', lidarComTecla);
  }, [aberto, aoCancelar]);

  if (!aberto) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacao-titulo"
    >
      <div className="modal-conteudo">
        <h3 id="modal-confirmacao-titulo" className="modal-titulo">
          {titulo}
        </h3>
        <p className="modal-mensagem">{mensagem}</p>

        <div className="modal-acoes">
          <button
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

