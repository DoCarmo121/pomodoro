import React from 'react';

export interface MensagemErroProps {
  mensagem?: string | null;
  id?: string;
}

/**
 * Componente reutilizável para exibição de mensagens de erro acessíveis (RNF-04, RNF-07).
 * Utiliza role="alert" para que leitores de tela anunciem mensagens de validação imediatamente.
 */
export const MensagemErro: React.FC<MensagemErroProps> = ({ mensagem, id }) => {
  if (!mensagem) return null;

  return (
    <span id={id} className="msg-erro" role="alert" aria-live="assertive">
      {mensagem}
    </span>
  );
};

