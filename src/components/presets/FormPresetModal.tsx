import React, { useState, useEffect } from 'react';
import {
  TemporizadorPersonalizado,
  DadosEntradaPreset,
  ErrosFormularioPreset,
} from '../../types';
import { validarFormularioPreset } from '../../utils/validacoes';

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

  // Fecha o modal ao pressionar ESC (RNF-07)
  useEffect(() => {
    const lidarComTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aberto) {
        aoFechar();
      }
    };
    window.addEventListener('keydown', lidarComTecla);
    return () => window.removeEventListener('keydown', lidarComTecla);
  }, [aberto, aoFechar]);

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

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-preset-titulo"
    >
      <div className="modal-conteudo">
        <h3 id="modal-preset-titulo" className="modal-titulo">
          {presetEmEdicao ? 'Editar Temporizador' : 'Novo Temporizador'}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nome do Preset (VR-01) */}
          <div className="form-grupo">
            <label htmlFor="preset-nome" className="form-label">
              Nome do Temporizador *
            </label>
            <input
              id="preset-nome"
              type="text"
              className={`form-input ${erros.nome ? 'input-erro' : ''}`}
              placeholder="Ex: Foco Intenso"
              value={nome}
              maxLength={40}
              onChange={(e) => {
                setNome(e.target.value);
                if (erros.nome) {
                  setErros((prev) => ({ ...prev, nome: undefined }));
                }
              }}
              autoFocus
            />
            {erros.nome && <span className="msg-erro">{erros.nome}</span>}
            <small className="form-ajuda">{nome.length}/40 caracteres</small>
          </div>

          <div className="form-linha">
            {/* Tempo de Foco (VR-02) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-foco" className="form-label">
                Foco (minutos) *
              </label>
              <input
                id="preset-foco"
                type="number"
                min={1}
                max={120}
                className={`form-input ${erros.tempoFocoMin ? 'input-erro' : ''}`}
                value={tempoFocoMin}
                onChange={(e) => {
                  setTempoFocoMin(e.target.value);
                  if (erros.tempoFocoMin) {
                    setErros((prev) => ({ ...prev, tempoFocoMin: undefined }));
                  }
                }}
              />
              {erros.tempoFocoMin && (
                <span className="msg-erro">{erros.tempoFocoMin}</span>
              )}
              <small className="form-ajuda">1 a 120 min</small>
            </div>

            {/* Tempo de Pausa Curta (VR-03) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-pausa-curta" className="form-label">
                Pausa Curta (min) *
              </label>
              <input
                id="preset-pausa-curta"
                type="number"
                min={1}
                max={60}
                className={`form-input ${erros.tempoPausaCurtaMin ? 'input-erro' : ''}`}
                value={tempoPausaCurtaMin}
                onChange={(e) => {
                  setTempoPausaCurtaMin(e.target.value);
                  if (erros.tempoPausaCurtaMin) {
                    setErros((prev) => ({ ...prev, tempoPausaCurtaMin: undefined }));
                  }
                }}
              />
              {erros.tempoPausaCurtaMin && (
                <span className="msg-erro">{erros.tempoPausaCurtaMin}</span>
              )}
              <small className="form-ajuda">1 a 60 min</small>
            </div>
          </div>

          <div className="form-linha">
            {/* Ciclos antes da Pausa Longa (VR-04) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-ciclos" className="form-label">
                Ciclos até Pausa Longa *
              </label>
              <input
                id="preset-ciclos"
                type="number"
                min={1}
                max={12}
                className={`form-input ${erros.ciclosAntesPausaLonga ? 'input-erro' : ''}`}
                value={ciclosAntesPausaLonga}
                onChange={(e) => {
                  setCiclosAntesPausaLonga(e.target.value);
                  if (erros.ciclosAntesPausaLonga) {
                    setErros((prev) => ({ ...prev, ciclosAntesPausaLonga: undefined }));
                  }
                }}
              />
              {erros.ciclosAntesPausaLonga && (
                <span className="msg-erro">{erros.ciclosAntesPausaLonga}</span>
              )}
              <small className="form-ajuda">1 a 12 ciclos</small>
            </div>

            {/* Tempo de Pausa Longa (VR-05) */}
            <div className="form-grupo form-metade">
              <label htmlFor="preset-pausa-longa" className="form-label">
                Pausa Longa (min) *
              </label>
              <input
                id="preset-pausa-longa"
                type="number"
                min={1}
                max={60}
                className={`form-input ${erros.tempoPausaLongaMin ? 'input-erro' : ''}`}
                value={tempoPausaLongaMin}
                onChange={(e) => {
                  setTempoPausaLongaMin(e.target.value);
                  if (erros.tempoPausaLongaMin) {
                    setErros((prev) => ({ ...prev, tempoPausaLongaMin: undefined }));
                  }
                }}
              />
              {erros.tempoPausaLongaMin && (
                <span className="msg-erro">{erros.tempoPausaLongaMin}</span>
              )}
              <small className="form-ajuda">1 a 60 min</small>
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
};

