import React from 'react';

export interface MensagemErroProps {
  mensagem?: string | null;
  id?: string;
}

export const MensagemErro: React.FC<MensagemErroProps> = ({ mensagem, id }) => {
  if (!mensagem) return null;

  return (
    <span id={id} className="msg-erro" role="alert" aria-live="assertive">
      {mensagem}
    </span>
  );
};
