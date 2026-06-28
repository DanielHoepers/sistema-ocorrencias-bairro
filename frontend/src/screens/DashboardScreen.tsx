import type { AppView, Occurrence } from '../types';
import { statusLabel } from '../utils/status';

type DashboardScreenProps = {
  occurrences: Occurrence[];
  onChangeView: (view: AppView) => void;
  onStartNewOccurrence: () => void;
};

export function DashboardScreen({ occurrences, onChangeView, onStartNewOccurrence }: DashboardScreenProps) {
  const totalOpen = occurrences.filter((item) => item.status === 'ABERTA').length;
  const totalProgress = occurrences.filter((item) => item.status === 'EM_ANALISE').length;
  const totalResolved = occurrences.filter((item) => item.status === 'RESOLVIDA').length;

  return (
    <>
      <section className="metricGrid" aria-label="Resumo das ocorrências consultadas">
        <div className="metricCard">
          <span>Total consultado</span>
          <strong>{occurrences.length}</strong>
        </div>
        <div className="metricCard">
          <span>Abertas</span>
          <strong>{totalOpen}</strong>
        </div>
        <div className="metricCard">
          <span>Em análise</span>
          <strong>{totalProgress}</strong>
        </div>
        <div className="metricCard">
          <span>Resolvidas</span>
          <strong>{totalResolved}</strong>
        </div>
      </section>

      <section className="shortcutGrid">
        <button type="button" className="shortcutButton" onClick={onStartNewOccurrence}>
          <span className="shortcutSymbol">+</span>
          <strong>Registrar ocorrência</strong>
          <small>Informar um novo problema ou solicitação</small>
        </button>

        <button type="button" className="shortcutButton" onClick={() => onChangeView('search')}>
          <span className="shortcutSymbol">⌕</span>
          <strong>Consultar ocorrências</strong>
          <small>Buscar por categoria, status ou texto</small>
        </button>
      </section>

      <section className="workPanel compactPanel">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Acesso rápido</p>
            <h2>Última consulta</h2>
          </div>
        </div>

        {occurrences.length === 0 ? (
          <div className="emptyState">Nenhuma ocorrência carregada nesta sessão.</div>
        ) : (
          <div className="miniList">
            {occurrences.slice(0, 4).map((item) => (
              <button type="button" className="miniListItem" key={item.id} onClick={() => onChangeView('search')}>
                <span>{item.title}</span>
                <strong>{statusLabel(item.status)}</strong>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
