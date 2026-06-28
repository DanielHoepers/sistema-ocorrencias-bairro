import type { AdminUser, AuditLog, AuthUser } from '../types';

type AdminScreenProps = {
  adminError: string;
  adminLogs: AuditLog[];
  adminLogsLoading: boolean;
  adminLoading: boolean;
  adminUsers: AdminUser[];
  isAdmin: boolean;
  onLoadUsers: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onUpdateRole: (id: string, role: string) => void;
  user: AuthUser;
};

export function AdminScreen({
  adminError,
  adminLogs,
  adminLogsLoading,
  adminLoading,
  adminUsers,
  isAdmin,
  onLoadUsers,
  onToggleActive,
  onUpdateRole,
  user,
}: AdminScreenProps) {
  return (
    <>
      <section className="workPanel compactPanel">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Administração</p>
            <h2>Painel do administrador</h2>
          </div>
        </div>

        <div className="adminGrid">
          <div>
            <span>Usuário</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>E-mail</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Perfil</span>
            <strong>{isAdmin ? 'Administrador' : 'Morador'}</strong>
          </div>
        </div>
      </section>

      <section className="workPanel">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Usuários</p>
            <h2>Gerenciar perfis</h2>
          </div>
        </div>

        {adminError && <div className="inlineAlert danger">{adminError}</div>}

        <div className="tableShell">
          {adminUsers.length === 0 ? (
            <div className="emptyState">
              {adminLoading ? 'Carregando usuários...' : 'Nenhum usuário carregado.'}
            </div>
          ) : (
            <table className="occurrenceTable usersTable">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((item) => {
                  const isCurrentUser = item.email === user.email;

                  return (
                    <tr key={item.id} className={item.active ? 'userRow' : 'userRow inactiveUserRow'}>
                      <td className="titleCell" data-label="Nome">{item.name}</td>
                      <td data-label="E-mail">{item.email}</td>
                      <td data-label="Perfil">
                        <select
                          className="roleSelect"
                          value={item.role}
                          onChange={(event) => onUpdateRole(item.id, event.target.value)}
                          disabled={adminLoading || isCurrentUser}
                          aria-label={`Perfil de ${item.name}`}
                        >
                          <option value="MORADOR">Morador</option>
                          <option value="ADMINISTRADOR">Administrador</option>
                        </select>
                        {isCurrentUser && <span className="fieldHint">Seu próprio perfil não pode ser alterado aqui.</span>}
                      </td>
                      <td data-label="Status">
                        <div className="statusActionCell">
                          <span className={item.active ? 'status resolved' : 'status archived'}>
                            {item.active ? 'Ativo' : 'Inativo'}
                          </span>

                          {!isCurrentUser && (
                            <button
                              type="button"
                              className={item.active ? 'dangerButton compactButton hoverActionButton' : 'ghostButton compactButton hoverActionButton'}
                              onClick={() => onToggleActive(item.id, !item.active)}
                              disabled={adminLoading}
                            >
                              {item.active ? 'Desativar' : 'Ativar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="workPanel">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Auditoria</p>
            <h2>Logs do sistema</h2>
          </div>
        </div>

        <div className="tableShell">
          {adminLogs.length === 0 ? (
            <div className="emptyState">
              {adminLogsLoading ? 'Carregando logs...' : 'Nenhum log registrado.'}
            </div>
          ) : (
            <table className="occurrenceTable logsTable">
              <thead>
                <tr>
                  <th>Tabela</th>
                  <th>Alteração</th>
                  <th>Usuário</th>
                  <th>Data</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {adminLogs.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Tabela">{item.tableName}</td>
                    <td className="titleCell" data-label="Alteração">{item.action}</td>
                    <td data-label="Usuário">
                      <strong>{item.userName}</strong>
                      <span className="fieldHint">{item.userEmail}</span>
                    </td>
                    <td data-label="Data">{formatLogDate(item.createdAt)}</td>
                    <td data-label="Detalhe">{item.details || 'Sem detalhe'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}

function formatLogDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
