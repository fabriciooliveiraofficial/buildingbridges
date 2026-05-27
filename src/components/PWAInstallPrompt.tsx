import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import logoUrl from '../assets/logo_building_bridges.png';

export const PWAInstallPrompt: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isPt = i18n.language?.startsWith('pt') || false;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      await installApp();
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl shadow-primary/10 border border-primary/10 dark:border-white/10"
        >
          {!showIOSGuide ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 flex items-center justify-center p-2 shrink-0">
                  <img src={logoUrl} alt="Building Bridges" className="size-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">
                    {isPt ? 'Instalar Plataforma' : 'Install Platform'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {isPt 
                      ? 'Adicione à sua tela de início para acesso rápido, atualizações em tempo real e suporte offline completo.' 
                      : 'Add to your home screen for instant access, real-time updates, and lightweight offline support.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={dismissPrompt}
                  className="flex-1 px-4 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
                >
                  {isPt ? 'Lembrar Depois' : 'Maybe Later'}
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-5 py-2.5 rounded-full text-xs font-extrabold bg-accent text-white hover:bg-orange-600 transition-all text-center shadow-lg shadow-accent/25 cursor-pointer"
                >
                  {isPt ? 'Instalar' : 'Install'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
                  {isPt ? 'Instruções para iOS' : 'iOS Installation'}
                </h4>
                <button 
                  onClick={() => setShowIOSGuide(false)} 
                  className="size-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-3.5 py-1">
                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isPt ? (
                      <>
                        Toque no botão **Compartilhar**{' '}
                        <span className="material-symbols-outlined text-base align-middle inline-block mx-0.5 text-primary">
                          share
                        </span>{' '}
                        na barra inferior do Safari.
                      </>
                    ) : (
                      <>
                        Tap the **Share** button{' '}
                        <span className="material-symbols-outlined text-base align-middle inline-block mx-0.5 text-primary">
                          share
                        </span>{' '}
                        in the Safari menu bar.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isPt ? (
                      <>
                        Role a lista de ações e selecione **Adicionar à Tela de Início**{' '}
                        <span className="material-symbols-outlined text-base align-middle inline-block mx-0.5 text-primary">
                          add_box
                        </span>.
                      </>
                    ) : (
                      <>
                        Scroll down the menu and choose **Add to Home Screen**{' '}
                        <span className="material-symbols-outlined text-base align-middle inline-block mx-0.5 text-primary">
                          add_box
                        </span>.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isPt ? (
                      <>
                        Toque em **Adicionar** no canto superior direito para finalizar a instalação.
                      </>
                    ) : (
                      <>
                        Tap **Add** in the upper right corner to complete the installation.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={dismissPrompt}
                className="w-full mt-1 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-center border border-slate-100 dark:border-white/5 cursor-pointer"
              >
                {isPt ? 'Entendido, Lembrar Depois' : 'Got it, Maybe Later'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
