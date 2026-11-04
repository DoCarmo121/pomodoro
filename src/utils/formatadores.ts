import { FaseSessao, EstadoTarefa, PrioridadeTarefa } from '../types';

/**
 * Formata um valor em milissegundos para o formato clássico MM:SS.
 * Arredonda para cima (Math.ceil) para evitar exibir 00:00 enquanto ainda resta fração de segundo.
 */
export function formatarTempo(ms: number): string {
  if (ms <= 0) {
    return '00:00';
  }

  const segundosTotais = Math.ceil(ms / 1000);
  const minutos = Math.floor(segundosTotais / 60);
  const segundos = segundosTotais % 60;

  const mm = String(minutos).padStart(2, '0');
  const ss = String(segundos).padStart(2, '0');

  return `${mm}:${ss}`;
}

/**
 * Formata minutos para exibição amigável em texto (ex: "25 min" ou "1h 30min").
 */
export function formatarDuracaoMinutos(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const minRestantes = minutos % 60;

  if (minRestantes === 0) {
    return `${horas}h`;
  }

  return `${horas}h ${minRestantes}min`;
}

/**
 * Retorna o nome amigável e legível em português da fase Pomodoro.
 */
export function obterNomeFase(fase: FaseSessao): string {
  switch (fase) {
    case 'foco':
      return 'Foco';
    case 'pausaCurta':
      return 'Pausa Curta';
    case 'pausaLonga':
      return 'Pausa Longa';
  }
}

/**
 * Retorna o rótulo semântico em português para o estado da tarefa.
 */
export function obterNomeEstadoTarefa(estado: EstadoTarefa): string {
  switch (estado) {
    case 'backlog':
      return 'Backlog';
    case 'aFazer':
      return 'A fazer';
    case 'emExecucao':
      return 'Em execução';
    case 'concluida':
      return 'Concluída';
    case 'cancelada':
      return 'Cancelada';
  }
}

/**
 * Retorna o rótulo em português para a prioridade da tarefa.
 */
export function obterNomePrioridadeTarefa(prioridade: PrioridadeTarefa): string {
  switch (prioridade) {
    case 'baixa':
      return 'Baixa';
    case 'media':
      return 'Média';
    case 'alta':
      return 'Alta';
  }
}

