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
  ChevronDown, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { userRole } = useAuth();

  const [openPOPs, setOpenPOPs] = useState(true);
  const [openPessoas, setOpenPessoas] = useState(false);
  const [openCompliance, setOpenCompliance] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLinkActive = (path: string) => currentPath === path;

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
      active
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const subNavItemClass = (active: boolean) =>
    `flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-blue-50 text-blue-700 font-bold'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 w-64 border-r border-slate-800 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black">
            P
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight">
              POP CONTROL
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Compliance & Safety
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-slate-300">
        {/* Dashboard */}
        <button
          onClick={() => handleNav('/')}
          className={`w-full ${navItemClass(isLinkActive('/'))} text-slate-300 hover:text-white hover:bg-slate-800 ${isLinkActive('/') ? '!bg-blue-600 !text-white' : ''}`}
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* POPs Group */}
        <div>
          <button
            onClick={() => setOpenPOPs(!openPOPs)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>POPs</span>
            </div>
            {openPOPs ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openPOPs && (
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => handleNav('/pops')}
                className={`w-full ${subNavItemClass(isLinkActive('/pops'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/pops') ? '!bg-blue-900/50 !text-blue-300' : ''}`}
              >
                <span>Todos os POPs</span>
              </button>

              {(userRole === 'ADMINISTRADOR' || userRole === 'GESTOR') && (
                <button
                  onClick={() => handleNav('/pops/criar')}
                  className={`w-full ${subNavItemClass(isLinkActive('/pops/criar'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/pops/criar') ? '!bg-blue-900/50 !text-blue-300' : ''}`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Criar POP</span>
                </button>
              )}

              <button
                onClick={() => handleNav('/aprovacoes')}
                className={`w-full ${subNavItemClass(isLinkActive('/aprovacoes'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/aprovacoes') ? '!bg-blue-900/50 !text-blue-300' : ''}`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Aprovações</span>
              </button>

              <button
                onClick={() => handleNav('/revisoes')}
                className={`w-full ${subNavItemClass(isLinkActive('/revisoes'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/revisoes') ? '!bg-blue-900/50 !text-blue-300' : ''}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Controle de Revisões</span>
              </button>
            </div>
          )}
        </div>

        {/* Pessoas Group (Admin, Gestor, RH) */}
        {(userRole === 'ADMINISTRADOR' || userRole === 'RH' || userRole === 'GESTOR') && (
          <div>
            <button
              onClick={() => setOpenPessoas(!openPessoas)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Pessoas</span>
              </div>
              {openPessoas ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {openPessoas && (
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => handleNav('/pessoas/funcionarios')}
                  className={`w-full ${subNavItemClass(isLinkActive('/pessoas/funcionarios'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/pessoas/funcionarios') ? '!bg-emerald-900/50 !text-emerald-300' : ''}`}
                >
                  <span>Funcionários</span>
                </button>

                <button
                  onClick={() => handleNav('/pessoas/cargos')}
                  className={`w-full ${subNavItemClass(isLinkActive('/pessoas/cargos'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/pessoas/cargos') ? '!bg-emerald-900/50 !text-emerald-300' : ''}`}
                >
                  <span>Cargos</span>
                </button>

                <button
                  onClick={() => handleNav('/pessoas/setores')}
                  className={`w-full ${subNavItemClass(isLinkActive('/pessoas/setores'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/pessoas/setores') ? '!bg-emerald-900/50 !text-emerald-300' : ''}`}
                >
                  <span>Setores</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empresas (Admin) */}
        {userRole === 'ADMINISTRADOR' && (
          <button
            onClick={() => handleNav('/empresas')}
            className={`w-full ${navItemClass(isLinkActive('/empresas'))} text-slate-300 hover:text-white hover:bg-slate-800 ${isLinkActive('/empresas') ? '!bg-blue-600 !text-white' : ''}`}
          >
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Empresas</span>
          </button>
        )}

        {/* Assinaturas */}
        <button
          onClick={() => handleNav('/assinaturas')}
          className={`w-full ${navItemClass(isLinkActive('/assinaturas'))} text-slate-300 hover:text-white hover:bg-slate-800 ${isLinkActive('/assinaturas') ? '!bg-blue-600 !text-white' : ''}`}
        >
          <PenTool className="w-4 h-4 text-amber-400" />
          <span>Assinaturas & Ciências</span>
        </button>

        {/* Compliance Group */}
        <div>
          <button
            onClick={() => setOpenCompliance(!openCompliance)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span>Compliance</span>
            </div>
            {openCompliance ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {openCompliance && (
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => handleNav('/compliance')}
                className={`w-full ${subNavItemClass(isLinkActive('/compliance'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/compliance') ? '!bg-teal-900/50 !text-teal-300' : ''}`}
              >
                <span>Central de Compliance</span>
              </button>

              <button
                onClick={() => handleNav('/compliance/matriz')}
                className={`w-full ${subNavItemClass(isLinkActive('/compliance/matriz'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/compliance/matriz') ? '!bg-teal-900/50 !text-teal-300' : ''}`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Matriz Funcionário × POP</span>
              </button>

              <button
                onClick={() => handleNav('/compliance/funcionario')}
                className={`w-full ${subNavItemClass(isLinkActive('/compliance/funcionario'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/compliance/funcionario') ? '!bg-teal-900/50 !text-teal-300' : ''}`}
              >
                <UserCheck2 className="w-3.5 h-3.5" />
                <span>Por Funcionário</span>
              </button>

              <button
                onClick={() => handleNav('/compliance/setor')}
                className={`w-full ${subNavItemClass(isLinkActive('/compliance/setor'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/compliance/setor') ? '!bg-teal-900/50 !text-teal-300' : ''}`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Por Setor</span>
              </button>

              <button
                onClick={() => handleNav('/compliance/evidencias')}
                className={`w-full ${subNavItemClass(isLinkActive('/compliance/evidencias'))} text-slate-300 hover:text-white hover:bg-slate-800/60 ${isLinkActive('/compliance/evidencias') ? '!bg-teal-900/50 !text-teal-300' : ''}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Relatório de Evidência</span>
              </button>
            </div>
          )}
        </div>

        {/* Notificações */}
        <button
          onClick={() => handleNav('/notificacoes')}
          className={`w-full ${navItemClass(isLinkActive('/notificacoes'))} text-slate-300 hover:text-white hover:bg-slate-800 ${isLinkActive('/notificacoes') ? '!bg-blue-600 !text-white' : ''}`}
        >
          <Bell className="w-4 h-4 text-indigo-400" />
          <span>Notificações</span>
        </button>

        {/* Log de Auditoria */}
        {(userRole === 'ADMINISTRADOR' || userRole === 'RH') && (
          <button
            onClick={() => handleNav('/auditoria')}
            className={`w-full ${navItemClass(isLinkActive('/auditoria'))} text-slate-300 hover:text-white hover:bg-slate-800 ${isLinkActive('/auditoria') ? '!bg-blue-600 !text-white' : ''}`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Log de Auditoria</span>
          </button>
        )}

        {/* Configurações & Validade Jurídica / GOV.BR */}
        <button
          onClick={() => handleNav('/configuracoes')}
          className={`w-full ${navItemClass(isLinkActive('/configuracoes'))} text-slate-300 hover:text-white hover:bg-slate-800 ${isLinkActive('/configuracoes') ? '!bg-blue-600 !text-white' : ''}`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Configurações & GOV.BR</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        Rufato Indústria de Móveis &copy; 2026
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-transform active:scale-95"
          title="Abrir Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
