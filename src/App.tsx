import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tarefa,
  DadosEntradaTarefa,
  EstadoTarefa,
  TemporizadorPersonalizado,
  DadosEntradaPreset,
  SessaoAtiva,
} from './types';
import {
  obterTarefas,
  salvarTarefas,
  obterPresets,
  salvarPresets,
  obterSessaoAtiva,
  salvarSessaoAtiva,
  limparSessaoAtiva,
} from './storage';
import {
  iniciarNovaSessao,
  pausarSessao,
  retomarSessao,
  avancarFaseConcluida,
  pularFase,
  reiniciarCiclos,
  calcularTempoRestanteMs,
  obterDuracaoFaseMs,
  recalcularSessaoAposInatividade,
} from './domain';
import { inicializarAudio, tocarAlertaSonoro } from './utils';
import { PainelTarefas } from './components/tarefas';
import { ListaPresets } from './components/presets';
import {
  DisplayTemporizador,
  ControlesSessao,
  SeletorPresets,
  BannerSessaoRetomada,
} from './components/temporizador';
import './App.css';

export const App: React.FC = () => {
  const [presets, setPresets] = useState<TemporizadorPersonalizado[]>(() =>
    obterPresets()
  );
  const [presetSelecionadoId, setPresetSelecionadoId] = useState<string>(() => {
    const salvos = obterPresets();
    return salvos[0]?.id ?? '';
  });

  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtiva | null>(() => {
    const salva = obterSessaoAtiva();
    if (!salva) return null;
    const recalculo = recalcularSessaoAposInatividade(salva, Date.now());
    salvarSessaoAtiva(recalculo);
    return recalculo;
  });

  const [sessaoRetomada, setSessaoRetomada] = useState<boolean>(() => {
    return obterSessaoAtiva() !== null;
  });

  const presetSelecionado = useMemo(() => {
    return (
      presets.find((p) => p.id === presetSelecionadoId) ??
      presets[0] ?? {
        id: 'padrao',
        nome: 'Pomodoro Clássico',
        tempoFocoMin: 25,
        tempoPausaCurtaMin: 5,
        ciclosAntesPausaLonga: 4,
        tempoPausaLongaMin: 15,
        criadoEm: Date.now(),
        atualizadoEm: Date.now(),
      }
    );
  }, [presets, presetSelecionadoId]);

  const presetEmExibicao = sessaoAtiva ? sessaoAtiva.snapshotPreset : presetSelecionado;

  const [tempoRestanteMs, setTempoRestanteMs] = useState<number>(() => {
    if (sessaoAtiva) {
      return calcularTempoRestanteMs(sessaoAtiva, Date.now());
    }
    return presetSelecionado.tempoFocoMin * 60 * 1000;
  });

  const [tarefas, setTarefas] = useState<Tarefa[]>(() => obterTarefas());

  useEffect(() => {
    if (!sessaoAtiva) {
      setTempoRestanteMs(presetSelecionado.tempoFocoMin * 60 * 1000);
      return;
    }

    if (sessaoAtiva.status === 'pausada') {
      setTempoRestanteMs(sessaoAtiva.tempoRestanteAoPausarMs ?? 0);
      return;
    }

    if (sessaoAtiva.status === 'concluida') {
      setTempoRestanteMs(0);
      return;
    }

    const interval = setInterval(() => {
      const agora = Date.now();
      const restante = calcularTempoRestanteMs(sessaoAtiva, agora);

      if (restante <= 0) {
        tocarAlertaSonoro();

        const novaSessao = avancarFaseConcluida(sessaoAtiva, agora);
        setSessaoAtiva(novaSessao);
        salvarSessaoAtiva(novaSessao);
        setTempoRestanteMs(calcularTempoRestanteMs(novaSessao, agora));
      } else {
        setTempoRestanteMs(restante);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [sessaoAtiva, presetSelecionado]);

  const handleIniciarSessao = useCallback(() => {
    inicializarAudio();
    setSessaoRetomada(false);
    const agora = Date.now();
    const nova = iniciarNovaSessao(presetSelecionado, agora);
    setSessaoAtiva(nova);
    salvarSessaoAtiva(nova);
    setTempoRestanteMs(obterDuracaoFaseMs(nova.snapshotPreset, 'foco'));
  }, [presetSelecionado]);

  const handlePausarSessao = useCallback(() => {
    if (!sessaoAtiva) return;
    const pausada = pausarSessao(sessaoAtiva, Date.now());
    setSessaoAtiva(pausada);
    salvarSessaoAtiva(pausada);
  }, [sessaoAtiva]);

  const handleRetomarSessao = useCallback(() => {
    if (!sessaoAtiva) return;
    inicializarAudio();
    const retomada = retomarSessao(sessaoAtiva, Date.now());
    setSessaoAtiva(retomada);
    salvarSessaoAtiva(retomada);
  }, [sessaoAtiva]);

  const handlePularFase = useCallback(() => {
    if (!sessaoAtiva) return;
    const pulada = pularFase(sessaoAtiva, Date.now());
    setSessaoAtiva(pulada);
    salvarSessaoAtiva(pulada);
    setTempoRestanteMs(calcularTempoRestanteMs(pulada, Date.now()));
  }, [sessaoAtiva]);

  const handleReiniciarCiclos = useCallback(() => {
    if (!sessaoAtiva) return;
    const reiniciada = reiniciarCiclos(sessaoAtiva, Date.now());
    setSessaoAtiva(reiniciada);
    salvarSessaoAtiva(reiniciada);
    setTempoRestanteMs(obterDuracaoFaseMs(reiniciada.snapshotPreset, 'foco'));
  }, [sessaoAtiva]);

  const handleEncerrarSessao = useCallback(() => {
    limparSessaoAtiva();
    setSessaoAtiva(null);
    setSessaoRetomada(false);
    setTempoRestanteMs(presetSelecionado.tempoFocoMin * 60 * 1000);
  }, [presetSelecionado]);

  const handleDescartarSessaoRetomada = useCallback(() => {
    limparSessaoAtiva();
    setSessaoAtiva(null);
    setSessaoRetomada(false);
    setTempoRestanteMs(presetSelecionado.tempoFocoMin * 60 * 1000);
  }, [presetSelecionado]);

  const handleTrocarPreset = useCallback(
    (novoPreset: TemporizadorPersonalizado) => {
      setPresetSelecionadoId(novoPreset.id);
      setSessaoRetomada(false);

      if (sessaoAtiva && sessaoAtiva.status !== 'concluida') {
        inicializarAudio();
        const agora = Date.now();
        const nova = iniciarNovaSessao(novoPreset, agora);
        setSessaoAtiva(nova);
        salvarSessaoAtiva(nova);
        setTempoRestanteMs(obterDuracaoFaseMs(nova.snapshotPreset, 'foco'));
      } else {
        setTempoRestanteMs(novoPreset.tempoFocoMin * 60 * 1000);
      }
    },
    [sessaoAtiva]
  );

  const persistirPresets = (novosPresets: TemporizadorPersonalizado[]) => {
    setPresets(novosPresets);
    salvarPresets(novosPresets);
  };

  const handleCriarPreset = (dados: DadosEntradaPreset) => {
    const novo: TemporizadorPersonalizado = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: dados.nome.trim(),
      tempoFocoMin: Number(dados.tempoFocoMin),
      tempoPausaCurtaMin: Number(dados.tempoPausaCurtaMin),
      ciclosAntesPausaLonga: Number(dados.ciclosAntesPausaLonga),
      tempoPausaLongaMin: Number(dados.tempoPausaLongaMin),
      criadoEm: Date.now(),
      atualizadoEm: Date.now(),
    };
    persistirPresets([...presets, novo]);
    setPresetSelecionadoId(novo.id);
  };

  const handleEditarPreset = (id: string, dados: DadosEntradaPreset) => {
    if (sessaoAtiva && id === sessaoAtiva.presetId) return;

    const atualizados = presets.map((p) =>
      p.id === id
        ? {
            ...p,
            nome: dados.nome.trim(),
            tempoFocoMin: Number(dados.tempoFocoMin),
            tempoPausaCurtaMin: Number(dados.tempoPausaCurtaMin),
            ciclosAntesPausaLonga: Number(dados.ciclosAntesPausaLonga),
            tempoPausaLongaMin: Number(dados.tempoPausaLongaMin),
            atualizadoEm: Date.now(),
          }
        : p
    );
    persistirPresets(atualizados);
  };

  const handleExcluirPreset = (id: string) => {
    if (sessaoAtiva && id === sessaoAtiva.presetId) return;
    if (presets.length <= 1) return;

    const atualizados = presets.filter((p) => p.id !== id);
    persistirPresets(atualizados);

    if (presetSelecionadoId === id && atualizados.length > 0) {
      setPresetSelecionadoId(atualizados[0].id);
    }
  };

  const persistirTarefas = (novasTarefas: Tarefa[]) => {
    setTarefas(novasTarefas);
    salvarTarefas(novasTarefas);
  };

  const handleCriarTarefa = (dados: DadosEntradaTarefa) => {
    const nova: Tarefa = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `tarefa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      titulo: dados.titulo.trim(),
      estado: dados.estado,
      prioridade: dados.prioridade,
      criadaEm: Date.now(),
      atualizadaEm: Date.now(),
    };
    persistirTarefas([...tarefas, nova]);
  };

  const handleEditarTarefa = (id: string, dados: DadosEntradaTarefa) => {
    const atualizadas = tarefas.map((t) =>
      t.id === id
        ? {
            ...t,
            titulo: dados.titulo.trim(),
            estado: dados.estado,
            prioridade: dados.prioridade,
            atualizadaEm: Date.now(),
          }
        : t
    );
    persistirTarefas(atualizadas);
  };

  const handleMudarEstadoTarefa = (id: string, novoEstado: EstadoTarefa) => {
    const atualizadas = tarefas.map((t) =>
      t.id === id
        ? {
            ...t,
            estado: novoEstado,
            atualizadaEm: Date.now(),
          }
        : t
    );
    persistirTarefas(atualizadas);
  };

  const handleExcluirTarefa = (id: string) => {
    const atualizadas = tarefas.filter((t) => t.id !== id);
    persistirTarefas(atualizadas);
  };

  const duracaoTotalFaseMs = sessaoAtiva
    ? obterDuracaoFaseMs(sessaoAtiva.snapshotPreset, sessaoAtiva.faseAtual)
    : presetSelecionado.tempoFocoMin * 60 * 1000;

  const ehSessaoAtiva =
    sessaoAtiva !== null &&
    (sessaoAtiva.status === 'emAndamento' || sessaoAtiva.status === 'pausada');

  const faseAtual = sessaoAtiva ? sessaoAtiva.faseAtual : 'foco';

  return (
    <div className={`app-container fase-atual-${faseAtual}`}>
      <header className="app-header">
        <div className="app-header-brand">
          <div className="brand-icone-wrapper" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                fill="url(#brand-grad)"
              />
              <path
                d="M12 6v6l4 2"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2c0-1 1-2 2-2"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="brand-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f43f5e" />
                  <stop offset="1" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-textos">
            <h1>Gestão de Foco <span className="brand-destaque">(Pomodoro)</span></h1>
            <p className="app-subtitulo">
              Ciclos de estudo personalizados e gerenciamento de tarefas
            </p>
          </div>
        </div>
      </header>

      <main className="app-main-layout">
        <section className="temporizador-secao" aria-label="Temporizador de Foco">
          {sessaoAtiva && (
            <BannerSessaoRetomada
              aberto={sessaoRetomada}
              statusSessao={sessaoAtiva.status}
              faseAtual={sessaoAtiva.faseAtual}
              cicloAtual={sessaoAtiva.cicloAtual}
              nomePreset={sessaoAtiva.snapshotPreset.nome}
              aoContinuar={() => setSessaoRetomada(false)}
              aoDescartar={handleDescartarSessaoRetomada}
            />
          )}

          <SeletorPresets
            presets={presets}
            presetSelecionadoId={presetSelecionado.id}
            ehSessaoAtiva={ehSessaoAtiva}
            aoTrocarPreset={handleTrocarPreset}
          />

          <DisplayTemporizador
            tempoRestanteMs={tempoRestanteMs}
            faseAtual={sessaoAtiva ? sessaoAtiva.faseAtual : 'foco'}
            cicloAtual={sessaoAtiva ? sessaoAtiva.cicloAtual : 1}
            totalCiclos={presetEmExibicao.ciclosAntesPausaLonga}
            status={sessaoAtiva ? sessaoAtiva.status : 'inativo'}
            nomePreset={presetEmExibicao.nome}
            duracaoTotalFaseMs={duracaoTotalFaseMs}
          />

          <ControlesSessao
            status={sessaoAtiva ? sessaoAtiva.status : 'inativo'}
            aoIniciar={handleIniciarSessao}
            aoPausar={handlePausarSessao}
            aoRetomar={handleRetomarSessao}
            aoPular={handlePularFase}
            aoReiniciarCiclos={handleReiniciarCiclos}
            aoEncerrarSessao={handleEncerrarSessao}
          />

          <ListaPresets
            presets={presets}
            presetSelecionadoId={presetSelecionado.id}
            presetAtivoId={sessaoAtiva ? sessaoAtiva.presetId : null}
            aoSelecionarPreset={handleTrocarPreset}
            aoCriarPreset={handleCriarPreset}
            aoEditarPreset={handleEditarPreset}
            aoExcluirPreset={handleExcluirPreset}
          />
        </section>

        <aside className="tarefas-secao" aria-label="Painel de Tarefas">
          <PainelTarefas
            tarefas={tarefas}
            aoCriarTarefa={handleCriarTarefa}
            aoEditarTarefa={handleEditarTarefa}
            aoExcluirTarefa={handleExcluirTarefa}
            aoMudarEstadoTarefa={handleMudarEstadoTarefa}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>Aplicação Web de Gestão de Foco • Desenvolvido com React e TypeScript</p>
      </footer>
    </div>
  );
};

export default App;
