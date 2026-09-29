import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  UserCheck, 
  ChevronDown, 
  ShieldCheck, 
  CheckCircle2, 
  Building2,
  QrCode,
  LogOut,
  User,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { formatDateTime } from '../../utils/helpers';

interface HeaderProps {
  onOpenSearch?: () => void;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { currentUser, userRole, quickSwitchUser, logout, allUsersList, isSuperAdmin } = useAuth();
  const { notifications, markNotificationRead } = useData();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const myNotifications = notifications.filter(n => n.employee_id === currentUser?.id || isSuperAdmin());
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMINISTRADOR':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
      case 'ADMIN':
      case 'GESTOR':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold';
      case 'USUARIO':
      case 'FUNCIONARIO':
      case 'RH':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMINISTRADOR':
        return 'SUPER ADMIN';
      case 'ADMIN':
      case 'GESTOR':
        return 'ADMIN (GESTOR)';
      case 'USUARIO':
      case 'FUNCIONARIO':
      case 'RH':
      default:
        return 'USUÁRIO';
    }
  };

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-xs">
      {/* Brand & Page Context */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
          P
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              POP CONTROL
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              Enterprise v2.5
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden md:block">
            Gestão de Procedimentos e Compliance Operacional
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick RBAC Management Link for Admins */}
        <button
          onClick={() => onNavigate?.('/controle-acesso')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors"
          title="Controle de Acesso & Permissões"
        >
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Controle de Acesso</span>
        </button>

        {/* Quick QR Validation Link */}
        <button
          onClick={() => onNavigate?.('/validar/POP-PROD-001/03')}
          className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          title="Validar Autenticidade de POP"
        >
          <QrCode className="w-4 h-4 text-slate-500" />
          <span>Validar POP</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Notificações do Sistema
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {unreadCount} não lida(s)
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {myNotifications.length === 0 ? (
                  <p className="text-slate-500 text-center py-6">Nenhuma notificação encontrada.</p>
                ) : (
                  myNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) onNavigate?.(notif.link);
                        setShowNotifMenu(false);
                      }}
                      className={`p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors ${
                        !notif.read ? 'bg-blue-50/50 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role & Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${
              currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-700' :
              currentUser.role === 'ADMIN' ? 'bg-blue-700' : 'bg-slate-700'
            }`}>
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden sm:block text-xs">
              <div className="font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">
                {getRoleDisplayName(currentUser.role)} &bull; {currentUser.department_name}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 pb-3 mb-2 border-b border-slate-100 space-y-1">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Usuário Conectado</p>
                <p className="font-extrabold text-sm text-slate-900">{currentUser.full_name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <div className="pt-1 flex items-center gap-1.5">
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] rounded-md border ${getRoleBadge(currentUser.role)}`}>
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Setor: {currentUser.department_name}
                  </span>
                </div>
              </div>

              {/* Quick Profile Alternator for RBAC Testing */}
              <div className="py-1">
                <div className="px-2 mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Alternar Usuário para Testes (RBAC):</span>
                </div>

                <div className="space-y-1 text-xs max-h-56 overflow-y-auto pr-1">
                  {allUsersList.filter(u => u.account_status === 'APROVADO').map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        quickSwitchUser(user);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors ${
                        currentUser.id === user.id
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{user.full_name}</div>
                        <div className="text-[10px] text-slate-500">
                          {getRoleDisplayName(user.role)} &bull; {user.department_name}
                        </div>
                      </div>
                      {currentUser.id === user.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Control Navigation and Logout */}
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => {
                    onNavigate?.('/controle-acesso');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Gerenciar Controle de Acesso (RBAC)</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sair do Sistema (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
