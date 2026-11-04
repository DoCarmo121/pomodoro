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
      <label htmlFor="select-preset-rapido" className="seletor-presets-label">
        Temporizador:
      </label>
      <select
        id="select-preset-rapido"
        className="seletor-presets-select"
        value={presetSelecionadoId}
        onChange={handleChange}
        aria-label="Selecionar temporizador de foco"
      >
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome} ({p.tempoFocoMin}m foco / {p.tempoPausaCurtaMin}m pausa / {p.ciclosAntesPausaLonga}x)
          </option>
        ))}
      </select>

      {ehSessaoAtiva && (
        <small className="aviso-troca-preset" title="Regra RN-02">
          ℹ️ Trocar de temporizador reinicia a sessão ativa automaticamente (RN-02).
        </small>
      )}
    </div>
  );
};

