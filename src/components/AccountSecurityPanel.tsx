import React, { useEffect, useState } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  WRONG_PASSWORD: 'A senha atual está incorreta.',
  WEAK_PASSWORD: 'A nova senha deve ter entre 8 e 128 caracteres.',
  SAME_PASSWORD: 'A nova senha deve ser diferente da atual.',
  INVALID_EMAIL: 'Informe um e-mail válido.',
  SAME_AS_PRIMARY: 'O e-mail de recuperação deve ser diferente do e-mail da conta.',
  RATE_LIMITED: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  UNAUTHORIZED: 'Sua sessão expirou. Entre novamente.',
  MISSING_FIELDS: 'Preencha todos os campos.',
};

const authFetch = async (path: string, method: string, body?: unknown) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    throw new Error(ERROR_MESSAGES[data.code] || 'Não foi possível concluir a operação. Tente novamente.');
  }
  return data;
};

const maskEmail = (email: string) => {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(user.length - 1, 6)))}@${domain}`;
};

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const level = pw.length === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : score === 4 ? 3 : 4;
  return { level, label: ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][level] };
};

type Status = { type: 'success' | 'error'; text: string } | null;

const StatusBanner: React.FC<{ status: Status }> = ({ status }) =>
  status ? (
    <div
      role="status"
      className={`p-3.5 rounded-xl text-sm font-bold flex items-start gap-2.5 ${
        status.type === 'success'
          ? 'bg-success/10 text-success border border-success/20'
          : 'bg-red-500/10 text-red-500 border border-red-500/20'
      }`}
    >
      <span className="material-symbols-outlined text-lg shrink-0">{status.type === 'success' ? 'check_circle' : 'error'}</span>
      <span>{status.text}</span>
    </div>
  ) : null;

const Field: React.FC<{
  label: string;
  icon: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  reveal?: boolean;
}> = ({ label, icon, type = 'text', value, onChange, placeholder, autoComplete, hint, reveal }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{label}</label>
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">{icon}</span>
        <input
          type={isPassword && visible ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-14 ${isPassword && reveal ? 'pr-14' : 'pr-6'} outline-none font-bold transition-all text-slate-800`}
        />
        {isPassword && reveal && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">{visible ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] font-bold text-slate-400 ml-1">{hint}</p>}
    </div>
  );
};

const Card: React.FC<{ icon: string; title: string; subtitle: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
  <section className="bg-white rounded-3xl border border-primary/5 shadow-xl p-6 sm:p-8 space-y-6">
    <header className="flex items-start gap-4 border-b border-slate-100 pb-6">
      <div className="size-11 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <h3 className="text-xl font-black text-primary">{title}</h3>
        <p className="text-xs text-slate-500 font-bold mt-1 leading-relaxed">{subtitle}</p>
      </div>
    </header>
    {children}
  </section>
);

const primaryButton =
  'w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed';

export const AccountSecurityPanel: React.FC = () => {
  const [account, setAccount] = useState<{ email: string; recovery_email: string | null } | null>(null);
  const [accountError, setAccountError] = useState('');

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<Status>(null);
  const [pwBusy, setPwBusy] = useState(false);

  // Recovery e-mail
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<Status>(null);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  // Send reset link
  const [resetStatus, setResetStatus] = useState<Status>(null);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    authFetch('/api/auth/me', 'GET')
      .then((me) => {
        setAccount({ email: me.email, recovery_email: me.recovery_email || null });
        setRecoveryInput(me.recovery_email || '');
      })
      .catch((err) => setAccountError(err.message));
  }, []);

  const strength = passwordStrength(newPassword);
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-success'];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (newPassword.length < 8) return setPwStatus({ type: 'error', text: ERROR_MESSAGES.WEAK_PASSWORD });
    if (newPassword !== confirmPassword) return setPwStatus({ type: 'error', text: 'A confirmação não é igual à nova senha.' });
    if (newPassword === currentPassword) return setPwStatus({ type: 'error', text: ERROR_MESSAGES.SAME_PASSWORD });

    setPwBusy(true);
    try {
      await authFetch('/api/auth/change-password', 'POST', { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwStatus({ type: 'success', text: 'Senha alterada com sucesso. Enviamos um aviso para o seu e-mail.' });
    } catch (err: any) {
      setPwStatus({ type: 'error', text: err.message });
    } finally {
      setPwBusy(false);
    }
  };

  const saveRecoveryEmail = async (value: string) => {
    setRecoveryStatus(null);
    setRecoveryBusy(true);
    try {
      const data = await authFetch('/api/auth/recovery-email', 'PUT', { recovery_email: value, current_password: recoveryPassword });
      setAccount((a) => (a ? { ...a, recovery_email: data.recovery_email } : a));
      setRecoveryInput(data.recovery_email || '');
      setRecoveryPassword('');
      setRecoveryStatus({
        type: 'success',
        text: data.recovery_email ? 'E-mail de recuperação salvo.' : 'E-mail de recuperação removido.',
      });
    } catch (err: any) {
      setRecoveryStatus({ type: 'error', text: err.message });
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPassword) return setRecoveryStatus({ type: 'error', text: 'Digite sua senha atual para confirmar.' });
    if (!recoveryInput.trim()) return setRecoveryStatus({ type: 'error', text: 'Informe o e-mail de recuperação ou use "Remover".' });
    saveRecoveryEmail(recoveryInput);
  };

  const handleRemoveRecovery = () => {
    if (!recoveryPassword) return setRecoveryStatus({ type: 'error', text: 'Digite sua senha atual para confirmar.' });
    saveRecoveryEmail('');
  };

  const handleSendResetLink = async () => {
    if (!account) return;
    setResetStatus(null);
    setResetBusy(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email }),
      }).then(async (res) => {
        if (res.status === 429) throw new Error(ERROR_MESSAGES.RATE_LIMITED);
        if (!res.ok) throw new Error('Não foi possível enviar o link agora. Tente novamente.');
      });
      setResetStatus({ type: 'success', text: 'Link enviado. Ele vale por 60 minutos e só pode ser usado uma vez.' });
    } catch (err: any) {
      setResetStatus({ type: 'error', text: err.message });
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {accountError && <StatusBanner status={{ type: 'error', text: accountError }} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ---------------- Change password ---------------- */}
        <Card icon="key" title="Alterar senha" subtitle="Use uma senha longa e exclusiva, com pelo menos 8 caracteres.">
          <form onSubmit={handleChangePassword} className="space-y-5">
            <Field label="Senha atual" icon="lock" type="password" reveal autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
            <div className="space-y-3">
              <Field label="Nova senha" icon="lock_reset" type="password" reveal autoComplete="new-password" value={newPassword} onChange={setNewPassword} placeholder="Mínimo de 8 caracteres" />
              {newPassword && (
                <div className="flex items-center gap-3 ml-1" aria-live="polite">
                  <div className="flex gap-1.5 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.level ? strengthColors[strength.level] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 w-16 text-right">{strength.label}</span>
                </div>
              )}
            </div>
            <Field label="Confirmar nova senha" icon="check" type="password" reveal autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repita a nova senha" />
            <StatusBanner status={pwStatus} />
            <button disabled={pwBusy || !currentPassword || !newPassword || !confirmPassword} className={primaryButton}>
              {pwBusy ? 'Salvando...' : 'Alterar senha'}
              {!pwBusy && <span className="material-symbols-outlined text-lg">shield</span>}
            </button>
          </form>
        </Card>

        {/* ---------------- Recovery e-mail ---------------- */}
        <Card
          icon="alternate_email"
          title="E-mail de recuperação"
          subtitle="Um segundo endereço que também recebe o link de redefinição e os avisos de segurança da sua conta."
        >
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm font-bold">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail da conta</span>
              <span className="text-slate-700 truncate">{account?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recuperação</span>
              <span className={`truncate ${account?.recovery_email ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                {account ? account.recovery_email || 'Não cadastrado' : '—'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveRecovery} className="space-y-5">
            <Field
              label={account?.recovery_email ? 'Novo e-mail de recuperação' : 'E-mail de recuperação'}
              icon="mail"
              type="email"
              autoComplete="email"
              value={recoveryInput}
              onChange={setRecoveryInput}
              placeholder="outro.email@exemplo.com"
              hint="Precisa ser diferente do e-mail da conta."
            />
            <Field label="Senha atual (para confirmar)" icon="lock" type="password" reveal autoComplete="current-password" value={recoveryPassword} onChange={setRecoveryPassword} placeholder="••••••••" />
            <StatusBanner status={recoveryStatus} />
            <div className="flex flex-col sm:flex-row gap-3">
              <button disabled={recoveryBusy} className={primaryButton}>
                {recoveryBusy ? 'Salvando...' : account?.recovery_email ? 'Atualizar e-mail' : 'Salvar e-mail'}
              </button>
              {account?.recovery_email && (
                <button
                  type="button"
                  onClick={handleRemoveRecovery}
                  disabled={recoveryBusy}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 rounded-xl font-black text-sm transition-colors disabled:opacity-50"
                >
                  Remover
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* ---------------- Send reset link ---------------- */}
      <Card
        icon="mark_email_read"
        title="Recuperar senha por e-mail"
        subtitle="Esqueceu a senha ou suspeita que alguém a descobriu? Enviamos um link seguro para criar uma nova."
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="text-sm font-bold text-slate-600 leading-relaxed">
            O link (válido por 60 minutos, uso único) será enviado para{' '}
            <span className="text-primary">{account ? maskEmail(account.email) : '…'}</span>
            {account?.recovery_email && (
              <>
                {' '}e para <span className="text-primary">{maskEmail(account.recovery_email)}</span>
              </>
            )}
            .
          </div>
          <button type="button" onClick={handleSendResetLink} disabled={resetBusy || !account} className={`${primaryButton} lg:shrink-0`}>
            {resetBusy ? 'Enviando...' : 'Enviar link de redefinição'}
            {!resetBusy && <span className="material-symbols-outlined text-lg">send</span>}
          </button>
        </div>
        <StatusBanner status={resetStatus} />
      </Card>
    </div>
  );
};
