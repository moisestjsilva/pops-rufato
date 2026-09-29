import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LegalDisclaimerBanner } from './components/common/LegalDisclaimerBanner';
import { DashboardPage } from './pages/DashboardPage';
import { POPsListPage } from './pages/POPsListPage';
import { POPViewer } from './components/pops/POPViewer';
import { POPEditCreateForm } from './components/pops/POPEditCreateForm';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { RevisionsControlPage } from './pages/RevisionsControlPage';
import { PeopleManagementPage } from './pages/PeopleManagementPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { SignaturesPage } from './pages/SignaturesPage';
import { ComplianceHubPage } from './pages/ComplianceHubPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ShieldAlert } from 'lucide-react';
import { SettingsGovBRPage } from './pages/SettingsGovBRPage';
import { PublicValidationPage } from './pages/PublicValidationPage';
import { AccessControlPage } from './pages/AccessControlPage';
import { LoginPage } from './components/auth/LoginPage';
import { POP, POPVersion } from './types';

function MainApp() {
  const { pops } = useData();
  const { currentUser, isAuthenticated, canCreatePOP, canEditPOP } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Selected state for details & edits
  const [selectedPOPId, setSelectedPOPId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<POPVersion | undefined>(undefined);
  const [isCreatingPOP, setIsCreatingPOP] = useState<boolean>(false);
  const [editingPOP, setEditingPOP] = useState<POP | null>(null);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setIsCreatingPOP(false);
    setEditingPOP(null);

    // If path is e.g. /pops/pop-101
    if (path.startsWith('/pops/pop-')) {
      const id = path.replace('/pops/', '');
      setSelectedPOPId(id);
    } else if (path === '/pops/criar') {
      setIsCreatingPOP(true);
    }
  };

  const handleSelectPOP = (pop: POP) => {
    setSelectedPOPId(pop.id);
    setSelectedVersion(undefined);
    setCurrentPath(`/pops/${pop.id}`);
  };

  const handleEditPOP = (pop: POP) => {
    setEditingPOP(pop);
    setIsCreatingPOP(false);
    setCurrentPath('/pops/editar');
  };

  // Extract public validation params if applicable
  const isValidationPage = currentPath.startsWith('/validar/');
  let validationCode = 'POP-PROD-001';
  let validationVer = '03';

  if (isValidationPage) {
    const parts = currentPath.split('/');
    if (parts[2]) validationCode = parts[2];
    if (parts[3]) validationVer = parts[3];
  }

  // Se não for tela de validação pública e não houver usuário autenticado/aprovado:
  if (!isValidationPage && (!currentUser || currentUser.account_status !== 'APROVADO')) {
    return <LoginPage onSuccess={() => navigateTo('/')} />;
  }

  // Render main screen according to currentPath
  const renderScreen = () => {
    if (isValidationPage) {
      return (
        <PublicValidationPage
          code={validationCode}
          version={validationVer}
          onNavigate={navigateTo}
        />
      );
    }

    if (isCreatingPOP || currentPath === '/pops/criar') {
      if (!canCreatePOP()) {
        return (
          <div className="bg-white p-8 rounded-3xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto mt-12 shadow-sm">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Permissão de Criação Restrita</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              De acordo com o Controle de Acesso (RBAC), colaboradores padrão têm permissão apenas de leitura.
              Solicite ao Administrador/Gestor do seu setor a liberação de permissão para criar procedimentos.
            </p>
            <button
              onClick={() => navigateTo('/pops')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Voltar aos POPs
            </button>
          </div>
        );
      }

      return (
        <POPEditCreateForm
          initialPOP={undefined}
          onSave={() => navigateTo('/pops')}
          onCancel={() => navigateTo('/pops')}
        />
      );
    }

    if (editingPOP || currentPath === '/pops/editar') {
      return (
        <POPEditCreateForm
          initialPOP={editingPOP || undefined}
          onSave={() => navigateTo('/pops')}
          onCancel={() => navigateTo('/pops')}
        />
      );
    }

    if (currentPath.startsWith('/pops/pop-') && selectedPOPId) {
      const currentPOP = pops.find(p => p.id === selectedPOPId) || pops[0];
      if (currentPOP) {
        return (
          <POPViewer
            pop={currentPOP}
            selectedVersion={selectedVersion}
            onEdit={() => handleEditPOP(currentPOP)}
            onBack={() => navigateTo('/pops')}
          />
        );
      }
    }

    switch (currentPath) {
      case '/':
        return <DashboardPage onNavigate={navigateTo} />;

      case '/pops':
        return (
          <POPsListPage
            onNavigate={navigateTo}
            onSelectPOP={handleSelectPOP}
            onCreatePOP={() => navigateTo('/pops/criar')}
          />
        );

      case '/controle-acesso':
        return <AccessControlPage />;

      case '/aprovacoes':
        return (
          <ApprovalsPage
            onNavigate={navigateTo}
            onSelectPOP={handleSelectPOP}
          />
        );

      case '/revisoes':
        return (
          <RevisionsControlPage
            onNavigate={navigateTo}
            onSelectPOP={handleSelectPOP}
            onEditPOP={handleEditPOP}
          />
        );

      case '/pessoas':
      case '/pessoas/funcionarios':
        return <PeopleManagementPage initialTab="funcionarios" />;

      case '/pessoas/cargos':
        return <PeopleManagementPage initialTab="cargos" />;

      case '/pessoas/setores':
        return <PeopleManagementPage initialTab="setores" />;

      case '/empresas':
        return <CompaniesPage />;

      case '/assinaturas':
        return <SignaturesPage />;

      case '/compliance':
        return <ComplianceHubPage initialSubTab="matriz" />;

      case '/compliance/matriz':
        return <ComplianceHubPage initialSubTab="matriz" />;

      case '/compliance/funcionario':
        return <ComplianceHubPage initialSubTab="funcionario" />;

      case '/compliance/setor':
        return <ComplianceHubPage initialSubTab="setor" />;

      case '/compliance/evidencias':
        return <ComplianceHubPage initialSubTab="evidencias" />;

      case '/notificacoes':
        return <NotificationsPage onNavigate={navigateTo} />;

      case '/auditoria':
        return <AuditLogPage />;

      case '/configuracoes':
        return <SettingsGovBRPage />;

      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {!isValidationPage && (
        <Header onNavigate={navigateTo} />
      )}

      <div className="flex-1 flex overflow-hidden">
        {!isValidationPage && (
          <Sidebar currentPath={currentPath} onNavigate={navigateTo} />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {!isValidationPage && <LegalDisclaimerBanner />}
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
