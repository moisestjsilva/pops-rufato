import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  ShieldCheck, 
  QrCode, 
  LogOut, 
  Menu,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { formatDateTime } from '../../utils/helpers';

interface HeaderProps {
  currentPath?: string;
  onOpenSearch?: () => void;
  onNavigate?: (path: string) => void;
  onOpenMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPath = '/', 
  onNavigate, 
  onOpenMobile 
}) => {
  const { currentUser, logout, isSuperAdmin } = useAuth();
  const { notifications, markNotificationRead } = useData();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const myNotifications = currentUser 
    ? (notifications || []).filter(n => n.employee_id === currentUser.id || isSuperAdmin())
    : [];
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMINISTRADOR':
        return 'Super Admin';
      case 'ADMIN':
      case 'GESTOR':
        return 'Gestor / Admin';
      case 'RH':
        return 'RH';
      case 'USUARIO':
      case 'FUNCIONARIO':
      default:
        return 'Colaborador';
    }
  };

  const getBreadcrumbs = (path: string) => {
    if (path.startsWith('/pops/pop-')) {
      return { section: 'Procedimentos', page: 'Detalhes do POP' };
    }
    if (path === '/pops/criar') {
      return { section: 'Procedimentos', page: 'Novo POP' };
    }
    if (path === '/pops/editar') {
      return { section: 'Procedimentos', page: 'Editar POP' };
    }
    if (path.startsWith('/pops')) {
      return { section: 'Procedimentos', page: 'Todos os POPs' };
    }
    if (path === '/aprovacoes') {
      return { section: 'Procedimentos', page: 'Aprovações Pendentes' };
    }
    if (path === '/revisoes') {
      return { section: 'Procedimentos', page: 'Controle de Revisões' };
    }
    if (path === '/setores') {
      return { section: 'Organização', page: 'Setores da Empresa' };
    }
    if (path.startsWith('/pessoas')) {
      return { section: 'Organização', page: 'Colaboradores & Cargos' };
    }
    if (path === '/empresas') {
      return { section: 'Organização', page: 'Empresas' };
    }
    if (path === '/assinaturas') {
      return { section: 'Conformidade', page: 'Assinaturas & Ciências' };
    }
    if (path.startsWith('/compliance')) {
      return { section: 'Conformidade', page: 'Central de Compliance' };
    }
    if (path === '/notificacoes') {
      return { section: 'Sistema', page: 'Notificações' };
    }
    if (path === '/auditoria') {
      return { section: 'Governança', page: 'Log de Auditoria' };
    }
    if (path === '/configuracoes') {
      return { section: 'Sistema', page: 'Configurações & GOV.BR' };
    }
    if (path === '/controle-acesso') {
      return { section: 'Segurança', page: 'Controle de Acesso (RBAC)' };
    }
    return { section: 'Painel', page: 'Dashboard Geral' };
  };

  if (!currentUser) return null;

  const crumbs = getBreadcrumbs(currentPath);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0 truncate">
          <span className="font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-default hidden sm:inline">
            {crumbs.section}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
          <span className="font-semibold text-slate-900 truncate">
            {crumbs.page}
          </span>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick RBAC Link */}
        <button
          onClick={() => onNavigate?.('/controle-acesso')}
          className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/90 transition-colors shadow-2xs"
          title="Controle de Acesso & Permissões"
        >
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span>Controle de Acesso</span>
        </button>

        {/* Quick Validation Link */}
        <button
          onClick={() => onNavigate?.('/validar/POP-PROD-001/03')}
          className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/90 transition-colors shadow-2xs"
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
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notificações"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200/90 p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h3 className="font-semibold text-xs text-slate-900 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  Notificações do Sistema
                </h3>
                <span className="text-[11px] text-slate-500">
                  {unreadCount} não lida(s)
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {myNotifications.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">Nenhuma notificação encontrada.</p>
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
                        !notif.read ? 'bg-slate-50/70 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors text-left shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden sm:block text-xs">
              <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                {getRoleDisplayName(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200/90 p-3 z-50 animate-in fade-in">
              <div className="px-2 pb-3 mb-2 border-b border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Conta Conectada</p>
                <p className="font-bold text-xs text-slate-900">{currentUser.full_name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <div className="pt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {currentUser.department_name}
                  </span>
                </div>
              </div>

              <div className="pt-1 space-y-0.5">
                <button
                  onClick={() => {
                    onNavigate?.('/controle-acesso');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Gerenciar Acessos (RBAC)</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
