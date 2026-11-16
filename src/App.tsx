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
  // ===== Estado dos Presets (Fase 6) =====
  const [presets, setPresets] = useState<TemporizadorPersonalizado[]>(() =>
    obterPresets()
  );
  const [presetSelecionadoId, setPresetSelecionadoId] = useState<string>(() => {
    const salvos = obterPresets();
    return salvos[0]?.id ?? '';
  });

  // ===== Estado da Sessão Ativa (Fase 7 e Fase 8) =====
  // RF-12, UC10: Ao carregar a aplicação, restaura a sessão e recalcula por timestamps (RN-06, RN-07, RN-08)
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtiva | null>(() => {
    const salva = obterSessaoAtiva();
    if (!salva) return null;
    const recalculo = recalcularSessaoAposInatividade(salva, Date.now());
    salvarSessaoAtiva(recalculo);
    return recalculo;
  });

  // Flag para exibição do Banner de Sessão Retomada (RF-13, UC11)
  const [sessaoRetomada, setSessaoRetomada] = useState<boolean>(() => {
    return obterSessaoAtiva() !== null;
  });

  // Preset selecionado atualmente
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

  // Snapshot ou parâmetros do temporizador em exibição
  const presetEmExibicao = sessaoAtiva ? sessaoAtiva.snapshotPreset : presetSelecionado;

  // Tempo restante em milissegundos para a interface
  const [tempoRestanteMs, setTempoRestanteMs] = useState<number>(() => {
    if (sessaoAtiva) {
      return calcularTempoRestanteMs(sessaoAtiva, Date.now());
    }
    return presetSelecionado.tempoFocoMin * 60 * 1000;
  });

  // ===== Estado das Tarefas (Fase 5) =====
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => obterTarefas());

  // ===== Loop de Atualização do Temporizador (RNF-03, RN-13, RF-14) =====
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

    // Intervalo de verificação a cada 200ms para manter alta precisão temporal (RNF-03)
    const interval = setInterval(() => {
      const agora = Date.now();
      const restante = calcularTempoRestanteMs(sessaoAtiva, agora);

      if (restante <= 0) {
        // Alerta sonoro ao fim de cada fase (RN-13, RF-14)
        tocarAlertaSonoro();

        // Transição natural para a próxima fase
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

  // ===== Controles da Sessão de Foco =====

  // RF-05, UC04: Iniciar Sessão com snapshot imutável (RN-05)
  const handleIniciarSessao = useCallback(() => {
    inicializarAudio(); // Destrava o áudio no clique do usuário (R-01)
    setSessaoRetomada(false);
    const agora = Date.now();
    const nova = iniciarNovaSessao(presetSelecionado, agora);
    setSessaoAtiva(nova);
    salvarSessaoAtiva(nova);
    setTempoRestanteMs(obterDuracaoFaseMs(nova.snapshotPreset, 'foco'));
  }, [presetSelecionado]);

  // RF-06, UC05: Pausar Sessão
  const handlePausarSessao = useCallback(() => {
    if (!sessaoAtiva) return;
    const pausada = pausarSessao(sessaoAtiva, Date.now());
    setSessaoAtiva(pausada);
    salvarSessaoAtiva(pausada);
  }, [sessaoAtiva]);

  // RF-07, UC05: Retomar Sessão
  const handleRetomarSessao = useCallback(() => {
    if (!sessaoAtiva) return;
    inicializarAudio();
    const retomada = retomarSessao(sessaoAtiva, Date.now());
    setSessaoAtiva(retomada);
    salvarSessaoAtiva(retomada);
  }, [sessaoAtiva]);

  // RF-08, UC06: Pular Fase sem incrementar ciclos (RN-03)
  const handlePularFase = useCallback(() => {
    if (!sessaoAtiva) return;
    const pulada = pularFase(sessaoAtiva, Date.now());
    setSessaoAtiva(pulada);
    salvarSessaoAtiva(pulada);
    setTempoRestanteMs(calcularTempoRestanteMs(pulada, Date.now()));
  }, [sessaoAtiva]);

  // RF-09, UC07: Reiniciar Ciclos (RN-04)
  const handleReiniciarCiclos = useCallback(() => {
    if (!sessaoAtiva) return;
    const reiniciada = reiniciarCiclos(sessaoAtiva, Date.now());
    setSessaoAtiva(reiniciada);
    salvarSessaoAtiva(reiniciada);
    setTempoRestanteMs(obterDuracaoFaseMs(reiniciada.snapshotPreset, 'foco'));
  }, [sessaoAtiva]);

  // RF-10, UC08: Encerrar Sessão (libera o preset para edição/exclusão por RN-01)
  const handleEncerrarSessao = useCallback(() => {
    limparSessaoAtiva();
    setSessaoAtiva(null);
    setSessaoRetomada(false);
    setTempoRestanteMs(presetSelecionado.tempoFocoMin * 60 * 1000);
  }, [presetSelecionado]);

  // RF-13, UC11: Descartar sessão retomada sem contabilizar progresso (libera preset para edição/exclusão)
  const handleDescartarSessaoRetomada = useCallback(() => {
    limparSessaoAtiva();
    setSessaoAtiva(null);
    setSessaoRetomada(false);
    setTempoRestanteMs(presetSelecionado.tempoFocoMin * 60 * 1000);
  }, [presetSelecionado]);

  // RF-11, UC09: Trocar Preset com Encerramento Automático (RN-02)
  const handleTrocarPreset = useCallback(
    (novoPreset: TemporizadorPersonalizado) => {
      setPresetSelecionadoId(novoPreset.id);
      setSessaoRetomada(false);

      // RN-02: Se houver sessão ativa em andamento ou pausada, encerra automaticamente e inicia nova sessão
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

  // ===== Handlers de Presets (Fase 6) =====
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
    // RN-01: Preset em uso pela sessão ativa não pode ser editado
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
    // RN-01: Preset em uso pela sessão ativa não pode ser excluído
    if (sessaoAtiva && id === sessaoAtiva.presetId) return;
    if (presets.length <= 1) return;

    const atualizados = presets.filter((p) => p.id !== id);
    persistirPresets(atualizados);

    if (presetSelecionadoId === id && atualizados.length > 0) {
      setPresetSelecionadoId(atualizados[0].id);
    }
  };

  // ===== Handlers de Tarefas (Fase 5) =====
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

  // Duração total da fase atual em milissegundos (para a barra de progresso)
  const duracaoTotalFaseMs = sessaoAtiva
    ? obterDuracaoFaseMs(sessaoAtiva.snapshotPreset, sessaoAtiva.faseAtual)
    : presetSelecionado.tempoFocoMin * 60 * 1000;

  const ehSessaoAtiva =
    sessaoAtiva !== null &&
    (sessaoAtiva.status === 'emAndamento' || sessaoAtiva.status === 'pausada');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Gestão de Foco (Pomodoro)</h1>
      </header>

      <main className="app-main-layout">
        {/* Seção Principal: Temporizador, Controles e Presets */}
        <section className="temporizador-secao" aria-label="Temporizador de Foco">
          {/* Banner de Sessão Retomada Automaticamente (RF-12, RF-13, UC10, UC11) */}
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

          {/* Seletor Rápido de Presets (RF-11, UC09, RN-02) */}
          <SeletorPresets
            presets={presets}
            presetSelecionadoId={presetSelecionado.id}
            ehSessaoAtiva={ehSessaoAtiva}
            aoTrocarPreset={handleTrocarPreset}
          />

          {/* Display Digital do Temporizador (RF-05, CP 7.1) */}
          <DisplayTemporizador
            tempoRestanteMs={tempoRestanteMs}
            faseAtual={sessaoAtiva ? sessaoAtiva.faseAtual : 'foco'}
            cicloAtual={sessaoAtiva ? sessaoAtiva.cicloAtual : 1}
            totalCiclos={presetEmExibicao.ciclosAntesPausaLonga}
            status={sessaoAtiva ? sessaoAtiva.status : 'inativo'}
            nomePreset={presetEmExibicao.nome}
            duracaoTotalFaseMs={duracaoTotalFaseMs}
          />

          {/* Controles da Sessão de Foco (RF-05 a RF-10, CP 7.2) */}
          <ControlesSessao
            status={sessaoAtiva ? sessaoAtiva.status : 'inativo'}
            aoIniciar={handleIniciarSessao}
            aoPausar={handlePausarSessao}
            aoRetomar={handleRetomarSessao}
            aoPular={handlePularFase}
            aoReiniciarCiclos={handleReiniciarCiclos}
            aoEncerrarSessao={handleEncerrarSessao}
          />

          {/* Listagem e Gestão Completa de Presets (RF-01 a RF-04, RN-01) */}
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

        {/* Seção Lateral Direita: Tarefas de Estudo (RF-15 a RF-19, UC12 a UC15, RN-10) */}
        <div className="tarefas-secao">
          <PainelTarefas
            tarefas={tarefas}
            aoCriarTarefa={handleCriarTarefa}
            aoEditarTarefa={handleEditarTarefa}
            aoExcluirTarefa={handleExcluirTarefa}
            aoMudarEstadoTarefa={handleMudarEstadoTarefa}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
