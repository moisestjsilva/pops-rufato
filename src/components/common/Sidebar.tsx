import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  Clock, 
  Users, 
  Briefcase, 
  Building2, 
  FileCheck2, 
  PenTool, 
  BarChart3, 
  Grid, 
  UserCheck2, 
  PieChart, 
  Award, 
  Bell, 
  History, 
  Settings, 
  ShieldCheck,
  ChevronDown, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath, 
  onNavigate, 
  mobileOpen = false, 
  onCloseMobile 
}) => {
  const { userRole, canCreatePOP, isSuperAdmin, isSectorAdmin, allUsersList } = useAuth();

  const [openPOPs, setOpenPOPs] = useState(true);
  const [openPessoas, setOpenPessoas] = useState(false);
  const [openCompliance, setOpenCompliance] = useState(false);

  const isLinkActive = (path: string) => currentPath === path;

  const handleNav = (path: string) => {
    onNavigate(path);
    onCloseMobile?.();
  };

  const navItemClass = (active: boolean) =>
    `w-full group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
      active
        ? 'bg-slate-100 text-slate-900 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
    }`;

  const iconClass = (active: boolean) =>
    `w-4 h-4 shrink-0 transition-colors ${
      active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
    }`;

  const subNavItemClass = (active: boolean) =>
    `w-full group flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
      active
        ? 'text-slate-900 font-semibold bg-slate-100/80'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
    }`;

  const subIconClass = (active: boolean) =>
    `w-3.5 h-3.5 shrink-0 transition-colors ${
      active ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'
    }`;

  const pendingUsersCount = isSuperAdmin() 
    ? (allUsersList || []).filter(u => u.account_status === 'PENDENTE').length 
    : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 w-64 border-r border-slate-200/80 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-2xs">
            P
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight leading-none">
              POP CONTROL
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Rufato &bull; Enterprise
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-md"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
        {/* Section: Principal */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pb-1">
            Geral
          </div>

          <button
            onClick={() => handleNav('/')}
            className={navItemClass(isLinkActive('/'))}
          >
            <Home className={iconClass(isLinkActive('/'))} />
            <span>Dashboard</span>
          </button>

          {/* POPs Accordion */}
          <div>
            <button
              onClick={() => setOpenPOPs(!openPOPs)}
              className="w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                <span>POPs</span>
              </div>
              {openPOPs ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openPOPs && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200/80 space-y-0.5">
                <button
                  onClick={() => handleNav('/pops')}
                  className={subNavItemClass(isLinkActive('/pops'))}
                >
                  <span>Todos os POPs</span>
                </button>

                {canCreatePOP() && (
                  <button
                    onClick={() => handleNav('/pops/criar')}
                    className={subNavItemClass(isLinkActive('/pops/criar'))}
                  >
                    <PlusCircle className={subIconClass(isLinkActive('/pops/criar'))} />
                    <span>Criar Novo POP</span>
                  </button>
                )}

                <button
                  onClick={() => handleNav('/aprovacoes')}
                  className={subNavItemClass(isLinkActive('/aprovacoes'))}
                >
                  <CheckSquare className={subIconClass(isLinkActive('/aprovacoes'))} />
                  <span>Aprovações</span>
                </button>

                <button
                  onClick={() => handleNav('/revisoes')}
                  className={subNavItemClass(isLinkActive('/revisoes'))}
                >
                  <Clock className={subIconClass(isLinkActive('/revisoes'))} />
                  <span>Controle de Revisões</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section: Organização & RH */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
            Organização
          </div>

          {/* Setores */}
          {(isSuperAdmin() || isSectorAdmin() || userRole === 'ADMINISTRADOR' || userRole === 'GESTOR') && (
            <button
              onClick={() => handleNav('/setores')}
              className={navItemClass(isLinkActive('/setores') || isLinkActive('/pessoas/setores'))}
            >
              <Building2 className={iconClass(isLinkActive('/setores') || isLinkActive('/pessoas/setores'))} />
              <span>Setores da Empresa</span>
            </button>
          )}

          {/* Colaboradores & Cargos */}
          {(isSuperAdmin() || isSectorAdmin() || userRole === 'ADMINISTRADOR' || userRole === 'RH' || userRole === 'GESTOR') && (
            <div>
              <button
                onClick={() => setOpenPessoas(!openPessoas)}
                className="w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  <span>Colaboradores & Cargos</span>
                </div>
                {openPessoas ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openPessoas && (
                <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200/80 space-y-0.5">
                  <button
                    onClick={() => handleNav('/pessoas/funcionarios')}
                    className={subNavItemClass(isLinkActive('/pessoas/funcionarios'))}
                  >
                    <span>Funcionários</span>
                  </button>

                  <button
                    onClick={() => handleNav('/pessoas/cargos')}
                    className={subNavItemClass(isLinkActive('/pessoas/cargos'))}
                  >
                    <span>Cargos</span>
                  </button>

                  <button
                    onClick={() => handleNav('/setores')}
                    className={subNavItemClass(isLinkActive('/setores'))}
                  >
                    <span>Setores</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empresas */}
          {(isSuperAdmin() || userRole === 'ADMINISTRADOR') && (
            <button
              onClick={() => handleNav('/empresas')}
              className={navItemClass(isLinkActive('/empresas'))}
            >
              <Building2 className={iconClass(isLinkActive('/empresas'))} />
              <span>Empresas</span>
            </button>
          )}

          {/* Assinaturas */}
          <button
            onClick={() => handleNav('/assinaturas')}
            className={navItemClass(isLinkActive('/assinaturas'))}
          >
            <PenTool className={iconClass(isLinkActive('/assinaturas'))} />
            <span>Assinaturas & Ciências</span>
          </button>
        </div>

        {/* Section: Conformidade & Governança */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
            Conformidade
          </div>

          {/* Compliance Group */}
          <div>
            <button
              onClick={() => setOpenCompliance(!openCompliance)}
              className="w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                <span>Central Compliance</span>
              </div>
              {openCompliance ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openCompliance && (
              <div className="mt-1 ml-4 pl-2.5 border-l border-slate-200/80 space-y-0.5">
                <button
                  onClick={() => handleNav('/compliance')}
                  className={subNavItemClass(isLinkActive('/compliance'))}
                >
                  <span>Visão Geral</span>
                </button>

                <button
                  onClick={() => handleNav('/compliance/matriz')}
                  className={subNavItemClass(isLinkActive('/compliance/matriz'))}
                >
                  <Grid className={subIconClass(isLinkActive('/compliance/matriz'))} />
                  <span>Matriz Colaborador &times; POP</span>
                </button>

                <button
                  onClick={() => handleNav('/compliance/funcionario')}
                  className={subNavItemClass(isLinkActive('/compliance/funcionario'))}
                >
                  <UserCheck2 className={subIconClass(isLinkActive('/compliance/funcionario'))} />
                  <span>Por Funcionário</span>
                </button>

                <button
                  onClick={() => handleNav('/compliance/setor')}
                  className={subNavItemClass(isLinkActive('/compliance/setor'))}
                >
                  <PieChart className={subIconClass(isLinkActive('/compliance/setor'))} />
                  <span>Por Setor</span>
                </button>

                <button
                  onClick={() => handleNav('/compliance/evidencias')}
                  className={subNavItemClass(isLinkActive('/compliance/evidencias'))}
                >
                  <Award className={subIconClass(isLinkActive('/compliance/evidencias'))} />
                  <span>Relatório de Evidência</span>
                </button>
              </div>
            )}
          </div>

          {/* Log de Auditoria */}
          {(isSuperAdmin() || userRole === 'ADMINISTRADOR' || userRole === 'RH') && (
            <button
              onClick={() => handleNav('/auditoria')}
              className={navItemClass(isLinkActive('/auditoria'))}
            >
              <History className={iconClass(isLinkActive('/auditoria'))} />
              <span>Log de Auditoria</span>
            </button>
          )}
        </div>

        {/* Section: Sistema */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
            Sistema
          </div>

          {/* Controle de Acesso (RBAC) */}
          <button
            onClick={() => handleNav('/controle-acesso')}
            className={navItemClass(isLinkActive('/controle-acesso'))}
          >
            <ShieldCheck className={iconClass(isLinkActive('/controle-acesso'))} />
            <span className="flex-1 text-left">Controle de Acesso</span>
            {pendingUsersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                {pendingUsersCount}
              </span>
            )}
          </button>

          {/* Notificações */}
          <button
            onClick={() => handleNav('/notificacoes')}
            className={navItemClass(isLinkActive('/notificacoes'))}
          >
            <Bell className={iconClass(isLinkActive('/notificacoes'))} />
            <span>Notificações</span>
          </button>

          {/* Configurações */}
          <button
            onClick={() => handleNav('/configuracoes')}
            className={navItemClass(isLinkActive('/configuracoes'))}
          >
            <Settings className={iconClass(isLinkActive('/configuracoes'))} />
            <span>Configurações & GOV.BR</span>
          </button>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <span className="truncate">Rufato Indústria</span>
        <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          v2.5
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
