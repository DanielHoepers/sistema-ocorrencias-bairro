export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ABERTA: 'Aberta',
    EM_ANALISE: 'Em análise',
    RESOLVIDA: 'Resolvida',
    ARQUIVADA: 'Arquivada',
  };

  return labels[status] || status;
}

export function statusClass(status: string) {
  const classes: Record<string, string> = {
    ABERTA: 'open',
    EM_ANALISE: 'progress',
    RESOLVIDA: 'resolved',
    ARQUIVADA: 'archived',
  };

  return classes[status] || 'open';
}
