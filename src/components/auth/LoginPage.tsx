import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  FileText, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff,
  UserPlus,
  Crown,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register, quickSwitchUser, allUsersList } = useAuth();
  const { departments } = useData();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regRegistration, setRegRegistration] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDeptId, setRegDeptId] = useState(departments[0]?.id || 'd1111111-1111-1111-1111-111111111111');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        onSuccess?.();
      } else {
        setLoginError(res.message || 'Falha ao efetuar login.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const targetDept = departments.find(d => d.id === regDeptId);
      const res = await register({
        full_name: regName,
        cpf: regCpf,
        registration_number: regRegistration,
        email: regEmail,
        password: regPassword || '123',
        department_id: regDeptId,
        department_name: targetDept?.name || 'Produção'
      });

      if (res.success) {
        setRegSuccessMsg(res.message);
        setRegName('');
        setRegCpf('');
        setRegRegistration('');
        setRegEmail('');
        setRegPassword('');
        setTimeout(() => {
          setMode('login');
          setRegSuccessMsg(null);
        }, 3500);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao registrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const superAdminUser = allUsersList.find(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMINISTRADOR');
  const sectorAdminUser = allUsersList.find(u => u.role === 'ADMIN');
  const standardUser = allUsersList.find(u => (u.role === 'USUARIO' || u.role === 'FUNCIONARIO') && !u.can_create_pop && u.account_status === 'APROVADO');
  const authorizedUser = allUsersList.find(u => u.role === 'USUARIO' && u.can_create_pop);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Rufato Móveis &bull; Gestão da Qualidade ISO 9001
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-600/30">
              R
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                POP CONTROL
              </h1>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">
                Autenticação & Controle de Acesso (RBAC)
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setLoginError(null); }}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar no Sistema
            </button>
            <button
              onClick={() => { setMode('register'); setLoginError(null); }}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Solicitar Novo Cadastro
            </button>
          </div>

          {/* Feedback Messages */}
          {loginError && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {regSuccessMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  E-mail, Matrícula ou CPF
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="carlos.admin@rufato.com.br ou 00101"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Autenticando...' : 'Acessar o POP Control'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">CPF *</label>
                  <input
                    type="text"
                    required
                    value={regCpf}
                    onChange={e => setRegCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Matrícula *</label>
                  <input
                    type="text"
                    required
                    value={regRegistration}
                    onChange={e => setRegRegistration(e.target.value)}
                    placeholder="00456"
                    className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="seu.nome@rufato.com.br"
                  className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Setor de Lotação *</label>
                  <select
                    value={regDeptId}
                    onChange={e => setRegDeptId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Criar Senha *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-slate-400 text-[11px] leading-relaxed">
                ℹ️ <strong>Regra de Compliance:</strong> Toda nova conta entra com status <span className="text-amber-400 font-bold">PENDENTE</span> e deve ser homologada pelo <strong>SUPER ADMIN</strong> antes de ter acesso liberado.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Solicitar Cadastro de Acesso</span>
              </button>
            </form>
          )}

          {/* Corporate Security Footer Notice */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Ambiente Seguro &bull; Rufato Móveis S/A</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Acesso restrito e autenticado. Insira suas credenciais corporativas para validação de identidade e controle de acesso RBAC.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-[11px] text-slate-500">
          Rufato Móveis &bull; Política de Segurança da Informação e Conformidade Operacional
        </div>
      </div>
    </div>
  );
};
