import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-4xl text-orange-500">send</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Message Sent!</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
          Thank you for reaching out. Our team will get back to you as soon as possible.
        </p>
        <button onClick={() => setSubmitted(false)} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('footer.contact')}</h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg mb-12">
        Have questions about our missions or how you can help? We'd love to hear from you.
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name</label>
            <input required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" type="text" placeholder="Your Name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" type="email" placeholder="your@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
          <input required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" type="text" placeholder="How can we help?" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
          <textarea required rows={6} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="Your message here..."></textarea>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:opacity-90 transition-opacity">
          Send Message
        </button>
      </form>
    </div>
  );
};
