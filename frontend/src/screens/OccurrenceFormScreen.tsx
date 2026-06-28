import type { FormEvent } from 'react';
import { categories, statusOptions } from '../constants';
import type { Occurrence } from '../types';
import { mapUrl } from '../services/location';

type OccurrenceFormScreenProps = {
  form: Occurrence;
  loading: boolean;
  mode: 'create' | 'edit';
  onCancelEdit: () => void;
  onChangeForm: (form: Occurrence) => void;
  onUseCurrentLocation: () => void;
  onSubmit: (event: FormEvent) => void;
  locating: boolean;
  locationHint: string;
};

export function OccurrenceFormScreen({
  form,
  loading,
  mode,
  onCancelEdit,
  onChangeForm,
  onUseCurrentLocation,
  onSubmit,
  locating,
  locationHint,
}: OccurrenceFormScreenProps) {
  const isEditing = mode === 'edit';
  const hasCoordinates = typeof form.latitude === 'number' && typeof form.longitude === 'number';
  const occurrenceMapUrl = mapUrl(form.latitude, form.longitude);

  return (
    <section className={isEditing ? 'workPanel editPanel' : 'workPanel'}>
      <div className="sectionHeader">
        <div>
          <p className="sectionKicker">{isEditing ? 'Edição' : 'Ocorrência'}</p>
          <h2>{isEditing ? 'Editar ocorrência' : 'Novo registro'}</h2>
        </div>

        {isEditing && (
          <button type="button" className="ghostButton" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </div>

      <form className="recordForm" onSubmit={onSubmit}>
        {isEditing && (
          <div className="editNotice">
            Revise os dados abaixo e altere apenas o que for necessário.
          </div>
        )}

        <label>
          Título
          <input
            value={form.title}
            onChange={(event) => onChangeForm({ ...form, title: event.target.value })}
            placeholder="Ex.: Lâmpada queimada"
            minLength={5}
            maxLength={200}
            required
          />
        </label>

        <label>
          Descrição
          <textarea
            value={form.description}
            onChange={(event) => onChangeForm({ ...form, description: event.target.value })}
            placeholder="Descreva a ocorrência com detalhes"
            minLength={10}
            maxLength={5000}
            required
          />
        </label>

        <div className="formColumns">
          <label>
            Categoria
            <select value={form.category} onChange={(event) => onChangeForm({ ...form, category: event.target.value })}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          {isEditing && (
            <label>
              Status
              <select value={form.status} onChange={(event) => onChangeForm({ ...form, status: event.target.value })}>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <label>
          Endereço ou referência
          <input
            value={form.address}
            onChange={(event) => onChangeForm({ ...form, address: event.target.value })}
            placeholder="Ex.: Rua Rudolfo Mass, perto da praça"
            required
          />
        </label>

        <div className="locationActions">
          <button type="button" className="ghostButton locationButton" onClick={onUseCurrentLocation} disabled={locating}>
            {locating ? 'Localizando...' : 'Usar minha localização'}
          </button>

          {hasCoordinates && (
            <a className="mapLinkButton" href={occurrenceMapUrl} target="_blank" rel="noreferrer">
              Abrir mapa
            </a>
          )}
        </div>

        {locationHint && <p className="locationHint">{locationHint}</p>}

        <div className="formActions">
          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar ocorrência'}
          </button>
          {isEditing && (
            <button type="button" className="ghostButton" onClick={onCancelEdit}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
