import { categories, statusOptions } from '../constants';
import type { Occurrence } from '../types';
import { mapUrl } from '../services/location';
import { statusClass, statusLabel } from '../utils/status';

type OccurrenceSearchScreenProps = {
  categoryFilter: string;
  hasSearched: boolean;
  occurrences: Occurrence[];
  onChangeCategoryFilter: (value: string) => void;
  onChangeSearch: (value: string) => void;
  onChangeStatusFilter: (value: string) => void;
  onClearFilters: () => void;
  onDelete: (item: Occurrence) => void;
  onEdit: (item: Occurrence) => void;
  onLoadOccurrences: () => void;
  onStartNewOccurrence: () => void;
  search: string;
  statusFilter: string;
};

export function OccurrenceSearchScreen({
  categoryFilter,
  hasSearched,
  occurrences,
  onChangeCategoryFilter,
  onChangeSearch,
  onChangeStatusFilter,
  onClearFilters,
  onDelete,
  onEdit,
  onLoadOccurrences,
  onStartNewOccurrence,
  search,
  statusFilter,
}: OccurrenceSearchScreenProps) {
  return (
    <section className="workPanel">
      <div className="sectionHeader">
        <div>
          <p className="sectionKicker">Consulta</p>
          <h2>Ocorrências</h2>
        </div>

        <button type="button" className="primaryButton" onClick={onStartNewOccurrence}>
          Nova ocorrência
        </button>
      </div>

      <div className="filterBar">
        <label>
          Buscar
          <input value={search} onChange={(event) => onChangeSearch(event.target.value)} placeholder="Título, descrição ou endereço" />
        </label>

        <label>
          Categoria
          <select value={categoryFilter} onChange={(event) => onChangeCategoryFilter(event.target.value)}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={statusFilter} onChange={(event) => onChangeStatusFilter(event.target.value)}>
            <option value="">Todos</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <div className="filterActions">
          <button type="button" className="primaryButton" onClick={onLoadOccurrences}>
            Filtrar
          </button>
          <button type="button" className="ghostButton" onClick={onClearFilters}>
            Limpar
          </button>
        </div>
      </div>

      <div className="recordList tableShell">
        {!hasSearched && occurrences.length === 0 && (
          <div className="emptyState">Use os filtros acima para localizar ocorrências.</div>
        )}

        {hasSearched && occurrences.length === 0 && (
          <div className="emptyState">Nenhuma ocorrência encontrada.</div>
        )}

        {occurrences.length > 0 && (
          <table className="occurrenceTable">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Endereço</th>
                <th>Mapa</th>
                <th>Autor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {occurrences.map((item) => (
                <tr key={item.id}>
                  <td className="titleCell" data-label="Título">{item.title}</td>
                  <td data-label="Categoria">{item.category}</td>
                  <td data-label="Endereço">{item.address}</td>
                  <td data-label="Mapa">
                    {typeof item.latitude === 'number' && typeof item.longitude === 'number' ? (
                      <a className="mapLinkButton compactMapLink" href={mapUrl(item.latitude, item.longitude)} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    ) : (
                      <span className="readOnlyLabel">Sem mapa</span>
                    )}
                  </td>
                  <td data-label="Autor">{item.authorName || 'Morador'}</td>
                  <td data-label="Status">
                    <span className={`status ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
                  </td>
                  <td data-label="Ações">
                    {item.canManage ? (
                      <div className="tableActions">
                        <button className="ghostButton compactButton" onClick={() => onEdit(item)}>
                          Editar
                        </button>
                        <button className="dangerButton compactButton" onClick={() => onDelete(item)}>
                          Excluir
                        </button>
                      </div>
                    ) : (
                      <span className="readOnlyLabel">Somente leitura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
