import React from 'react';
import { TemporizadorPersonalizado } from '../../types';

export interface SeletorPresetsProps {
  presets: TemporizadorPersonalizado[];
  presetSelecionadoId: string;
  ehSessaoAtiva: boolean;
  aoTrocarPreset: (preset: TemporizadorPersonalizado) => void;
}

export const SeletorPresets: React.FC<SeletorPresetsProps> = ({
  presets,
  presetSelecionadoId,
  ehSessaoAtiva,
  aoTrocarPreset,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selecionado = presets.find((p) => p.id === id);
    if (selecionado) {
      aoTrocarPreset(selecionado);
    }
  };

  return (
    <div className="seletor-presets-container">
      <div className="seletor-presets-header">
        <label htmlFor="select-preset-rapido" className="seletor-presets-label">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Temporizador Ativo:
        </label>
      </div>

      <div className="seletor-presets-select-wrapper">
        <select
          id="select-preset-rapido"
          className="seletor-presets-select"
          value={presetSelecionadoId}
          onChange={handleChange}
          aria-label="Selecionar temporizador de foco"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} — {p.tempoFocoMin}m foco • {p.tempoPausaCurtaMin}m pausa • {p.ciclosAntesPausaLonga} ciclos
            </option>
          ))}
        </select>
        <div className="seletor-presets-seta" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {ehSessaoAtiva && (
        <small className="aviso-troca-preset" title="Regra RN-02">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Trocar de temporizador reinicia a sessão ativa automaticamente (RN-02).
        </small>
      )}
    </div>
  );
};
