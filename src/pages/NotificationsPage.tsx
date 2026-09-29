import React, { useState } from 'react';
import { Bell, Mail, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink, Send, Users, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, emailLogs, markNotificationRead, triggerSystemComplianceAlertsScan } = useData();
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'alerts' | 'emails'>('alerts');
  const [roleFilter, setRoleFilter] = useState<'TODOS' | 'ADMINISTRADOR' | 'GESTOR' | 'FUNCIONARIO'>('TODOS');
  const [scanResult, setScanResult] = useState<{ createdAlerts: number; sentEmails: number } | null>(null);

  const myNotifications = notifications.filter(n => {
    if (userRole === 'ADMINISTRADOR') {
      if (roleFilter === 'TODOS') return true;
      return n.target_role === roleFilter;
    }
    return n.employee_id === currentUser.id || n.target_role === userRole;
  });

  const filteredEmailLogs = emailLogs.filter(e => {
    if (userRole === 'ADMINISTRADOR') {
      if (roleFilter === 'TODOS') return true;
      return e.recipient_role === roleFilter;
    }
    return e.recipient_email === currentUser.email || e.recipient_role === userRole;
  });

  const handleRunScan = () => {
    const res = triggerSystemComplianceAlertsScan();
    setScanResult(res);
    setTimeout(() => setScanResult(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Scanner Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight flex items-center gap-2">
            <Bell className="w-5.5 h-5.5 text-indigo-600" />
            Central de Notificações & Disparo de E-mails
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoramento inteligente de prazos, cobrança de ciências pendentes e notificações por perfil (Admin, Gestor, Colaborador).
          </p>
        </div>

        {(userRole === 'ADMINISTRADOR' || userRole === 'GESTOR') && (
          <button
            onClick={handleRunScan}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <RefreshCw className="w-4 h-4 animate-spin-once" />
            Varredura de Conformidade & Disparo E-mail
          </button>
        )}
      </div>

      {scanResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Varredura concluída! Gerados <strong>{scanResult.createdAlerts}</strong> novos alertas e <strong>{scanResult.sentEmails}</strong> disparos de e-mail de cobrança.</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs & Role Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" /> Alertas do Sistema ({myNotifications.length})
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'emails'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" /> Histórico de E-mails Disparados ({filteredEmailLogs.length})
          </button>
        </div>

        {userRole === 'ADMINISTRADOR' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Filtrar por Perfil:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-transparent font-bold text-indigo-600 focus:outline-hidden cursor-pointer"
            >
              <option value="TODOS">Todos os Perfis</option>
              <option value="ADMINISTRADOR">Administradores (POP Vencido)</option>
              <option value="GESTOR">Gestores (Ciência de Equipe)</option>
              <option value="FUNCIONARIO">Funcionários (Atribuições)</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: In-App System Alerts */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {myNotifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Nenhum alerta pendente para este filtro.
            </div>
          ) : (
            myNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.link) onNavigate(notif.link);
                }}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                  !notif.read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm">{notif.title}</span>
                    {notif.target_role && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {notif.target_role}
                      </span>
                    )}
                    {!notif.read && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full shadow-2xs">
                        Novo
                      </span>
                    )}
                    {notif.email_sent && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Mail className="w-2.5 h-2.5" /> E-mail enviado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block">{formatDateTime(notif.created_at)}</span>
                </div>

                {notif.link && (
                  <span className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 shrink-0 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    Acessar <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Email Dispatch Logs */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm">Registro de Envio de E-mails de Cobrança (SMTP Log)</h3>
                <p className="text-xs text-slate-400">Rastreabilidade completa das mensagens enviadas aos colaboradores e gestores</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              Servidor SMTP POP Control Active
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEmailLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Nenhum e-mail disparado até o momento.
              </div>
            ) : (
              filteredEmailLogs.map(em => (
                <div key={em.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm">{em.subject}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                        {em.recipient_role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                        Entregue (200 OK)
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{formatDateTime(em.sent_at)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    <span className="text-slate-700 font-bold">Destinatário:</span> {em.recipient_name} &lt;{em.recipient_email}&gt;
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                    {em.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
