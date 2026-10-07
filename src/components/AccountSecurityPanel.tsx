import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    throw new Error(data.code || 'UNKNOWN_ERROR');
  }
  return data;
};

const maskEmail = (email: string) => {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(user.length - 1, 6)))}@${domain}`;
};

const passwordStrength = (pw: string, t: (k: string) => string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const level = pw.length === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : score === 4 ? 3 : 4;
  return { 
    level, 
    label: ['', t('accountSecurity.strengthWeak'), t('accountSecurity.strengthFair'), t('accountSecurity.strengthGood'), t('accountSecurity.strengthStrong')][level] 
  };
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
            aria-label={visible ? 'Hide password' : 'Show password'}
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
  const { t } = useTranslation();
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

  const translateErrorCode = (code: string) => {
    switch (code) {
      case 'WRONG_PASSWORD': return t('accountSecurity.msgWrongPassword');
      case 'WEAK_PASSWORD': return t('accountSecurity.msgWeakPassword');
      case 'SAME_PASSWORD': return t('accountSecurity.msgSamePassword');
      case 'INVALID_EMAIL': return t('accountSecurity.msgInvalidEmail');
      case 'SAME_AS_PRIMARY': return t('accountSecurity.msgSameAsPrimary');
      case 'RATE_LIMITED': return t('accountSecurity.msgRateLimited');
      case 'UNAUTHORIZED': return t('accountSecurity.msgUnauthorized');
      case 'MISSING_FIELDS': return t('accountSecurity.msgMissingFields');
      default: return t('accountSecurity.msgMissingFields');
    }
  };

  useEffect(() => {
    authFetch('/api/auth/me', 'GET')
      .then((me) => {
        setAccount({ email: me.email, recovery_email: me.recovery_email || null });
        setRecoveryInput(me.recovery_email || '');
      })
      .catch((err) => setAccountError(translateErrorCode(err.message)));
  }, []);

  const strength = passwordStrength(newPassword, t);
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-success'];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (newPassword.length < 8) return setPwStatus({ type: 'error', text: t('accountSecurity.msgWeakPassword') });
    if (newPassword !== confirmPassword) return setPwStatus({ type: 'error', text: t('accountSecurity.msgMismatch') });
    if (newPassword === currentPassword) return setPwStatus({ type: 'error', text: t('accountSecurity.msgSamePassword') });

    setPwBusy(true);
    try {
      await authFetch('/api/auth/change-password', 'POST', { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwStatus({ type: 'success', text: t('accountSecurity.msgChangeSuccess') });
    } catch (err: any) {
      setPwStatus({ type: 'error', text: translateErrorCode(err.message) });
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
        text: data.recovery_email ? t('accountSecurity.msgRecoverySaved') : t('accountSecurity.msgRecoveryRemoved'),
      });
    } catch (err: any) {
      setRecoveryStatus({ type: 'error', text: translateErrorCode(err.message) });
    } finally {
      setRecoveryBusy(false);
    }
  };

  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPassword) return setRecoveryStatus({ type: 'error', text: t('accountSecurity.confirmPasswordHint') });
    if (!recoveryInput.trim()) return setRecoveryStatus({ type: 'error', text: t('accountSecurity.msgInvalidEmail') });
    saveRecoveryEmail(recoveryInput);
  };

  const handleRemoveRecovery = () => {
    if (!recoveryPassword) return setRecoveryStatus({ type: 'error', text: t('accountSecurity.confirmPasswordHint') });
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
        if (res.status === 429) throw new Error('RATE_LIMITED');
        if (!res.ok) throw new Error('UNAUTHORIZED');
      });
      setResetStatus({ type: 'success', text: t('accountSecurity.msgResetSent') });
    } catch (err: any) {
      setResetStatus({ type: 'error', text: translateErrorCode(err.message) });
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {accountError && <StatusBanner status={{ type: 'error', text: accountError }} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ---------------- Change password ---------------- */}
        <Card icon="key" title={t('accountSecurity.cardChangePasswordTitle')} subtitle={t('accountSecurity.cardChangePasswordSubtitle')}>
          <form onSubmit={handleChangePassword} className="space-y-5">
            <Field label={t('accountSecurity.currentPassword')} icon="lock" type="password" reveal autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword} placeholder={t('accountSecurity.currentPasswordPlaceholder')} />
            <div className="space-y-3">
              <Field label={t('accountSecurity.newPassword')} icon="lock_reset" type="password" reveal autoComplete="new-password" value={newPassword} onChange={setNewPassword} placeholder={t('accountSecurity.newPasswordPlaceholder')} />
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
            <Field label={t('accountSecurity.confirmNewPassword')} icon="check" type="password" reveal autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} placeholder={t('accountSecurity.confirmPasswordPlaceholder')} />
            <StatusBanner status={pwStatus} />
            <button disabled={pwBusy || !currentPassword || !newPassword || !confirmPassword} className={primaryButton}>
              {pwBusy ? t('accountSecurity.btnSaving') : t('accountSecurity.btnChangePassword')}
              {!pwBusy && <span className="material-symbols-outlined text-lg">shield</span>}
            </button>
          </form>
        </Card>

        {/* ---------------- Recovery e-mail ---------------- */}
        <Card
          icon="alternate_email"
          title={t('accountSecurity.cardRecoveryTitle')}
          subtitle={t('accountSecurity.cardRecoverySubtitle')}
        >
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2 text-sm font-bold">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accountSecurity.accountEmailLabel')}</span>
              <span className="text-slate-700 truncate">{account?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accountSecurity.recoveryEmailLabel')}</span>
              <span className={`truncate ${account?.recovery_email ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                {account ? account.recovery_email || t('accountSecurity.notRegistered') : '—'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveRecovery} className="space-y-5">
            <Field
              label={account?.recovery_email ? t('accountSecurity.newRecoveryEmailLabel') : t('accountSecurity.recoveryEmailLabel')}
              icon="mail"
              type="email"
              autoComplete="email"
              value={recoveryInput}
              onChange={setRecoveryInput}
              placeholder="email@example.com"
              hint={t('accountSecurity.recoveryEmailHint')}
            />
            <Field label={t('accountSecurity.confirmPasswordHint')} icon="lock" type="password" reveal autoComplete="current-password" value={recoveryPassword} onChange={setRecoveryPassword} placeholder="••••••••" />
            <StatusBanner status={recoveryStatus} />
            <div className="flex flex-col sm:flex-row gap-3">
              <button disabled={recoveryBusy} className={primaryButton}>
                {recoveryBusy ? t('accountSecurity.btnSaving') : account?.recovery_email ? t('accountSecurity.btnUpdateEmail') : t('accountSecurity.btnSaveEmail')}
              </button>
              {account?.recovery_email && (
                <button
                  type="button"
                  onClick={handleRemoveRecovery}
                  disabled={recoveryBusy}
                  className="w-full sm:w-auto px-6 py-4 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 rounded-xl font-black text-sm transition-colors disabled:opacity-50"
                >
                  {t('accountSecurity.btnRemove')}
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* ---------------- Send reset link ---------------- */}
      <Card
        icon="mark_email_read"
        title={t('accountSecurity.cardResetTitle')}
        subtitle={t('accountSecurity.cardResetSubtitle')}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="text-sm font-bold text-slate-600 leading-relaxed">
            {t('accountSecurity.resetInfoText')}{' '}
            <span className="text-primary">{account ? maskEmail(account.email) : '…'}</span>
            {account?.recovery_email && (
              <>
                {' '}& <span className="text-primary">{maskEmail(account.recovery_email)}</span>
              </>
            )}
            .
          </div>
          <button type="button" onClick={handleSendResetLink} disabled={resetBusy || !account} className={`${primaryButton} lg:shrink-0`}>
            {resetBusy ? t('accountSecurity.sendingResetLink') : t('accountSecurity.sendResetLink')}
            {!resetBusy && <span className="material-symbols-outlined text-lg">send</span>}
          </button>
        </div>
        <StatusBanner status={resetStatus} />
      </Card>
    </div>
  );
};
