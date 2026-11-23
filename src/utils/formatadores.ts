import { FaseSessao, EstadoTarefa, PrioridadeTarefa } from '../types';

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
