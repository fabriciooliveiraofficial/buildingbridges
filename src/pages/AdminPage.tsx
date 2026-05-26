import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_amount: '',
    image_url: '',
    category: 'BRAZIL RELIEF',
    status: 'active',
    long_description: '',
    budget_breakdown: ''
  });

  const [budgetRows, setBudgetRows] = useState([{ label: '', percent: '' }]);

  const addBudgetRow = () => setBudgetRows([...budgetRows, { label: '', percent: '' }]);
  const removeBudgetRow = (index: number) => setBudgetRows(budgetRows.filter((_, i) => i !== index));
  const updateBudgetRow = (index: number, field: string, value: string) => {
    const newRows = [...budgetRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setBudgetRows(newRows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, image_url: '' }); // Clear URL if file is selected
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `project-images/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('media') 
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error('Supabase Storage bucket "media" not found. Please: 1. Go to Supabase > Storage. 2. Create a new bucket named "media". 3. Set it to "Public".');
      }
      throw uploadError;
    }

    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate input
      if (!formData.name || !formData.goal_amount) {
        throw new Error('Name and Goal Amount are required');
      }

      let finalImageUrl = formData.image_url;

      if (imageFile) {
        setMessage({ type: 'info', text: 'Uploading image...' });
        finalImageUrl = await uploadImage(imageFile);
      }

      // Convert rows to valid JSON for DB
      const budgetJson = budgetRows
        .filter(row => row.label && row.percent)
        .map(row => ({ label: row.label, percent: parseInt(row.percent as string) }));

      const projectData = {
        name: formData.name,
        description: formData.description,
        goal_amount: parseFloat(formData.goal_amount),
        raised_amount: 0,
        image_url: finalImageUrl || 'https://picsum.photos/seed/default-mission/1200/800',
        status: formData.status,
        category: formData.category,
        long_description: formData.long_description,
        budget_json: budgetJson.length > 0 ? budgetJson : null
      };

      const { error } = await supabase.from('projects').insert([projectData]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Project created successfully!' });
      setFormData({
        name: '',
        description: '',
        goal_amount: '',
        image_url: '',
        category: 'BRAZIL RELIEF',
        status: 'active',
        long_description: '',
        budget_breakdown: ''
      });
      setBudgetRows([{ label: '', percent: '' }]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error creating project' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
        <div className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined">admin_panel_settings</span>
        </div>
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white line-height-tight">{t('admin.title')}</h1>
          <p className="text-slate-500">{t('admin.subtitle')}</p>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-8 flex items-center gap-3 font-bold ${
            message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">{t('admin.form.name')}</label>
            <input 
              required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('admin.form.name')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">{t('admin.form.category')}</label>
            <select 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="BRAZIL RELIEF">BRAZIL RELIEF</option>
              <option value="USA RESILIENCE">USA RESILIENCE</option>
              <option value="AMAZON RELIEF">AMAZON RELIEF</option>
              <option value="EMERGENCY">EMERGENCY</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('admin.form.status')}</label>
            <select 
              className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">{t('projects.active')}</option>
              <option value="completed">{t('projects.completed')}</option>
              <option value="archive">{t('projects.archive')}</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('admin.form.desc')}</label>
          <textarea 
            required
            rows={2}
            className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder={t('admin.form.desc')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('admin.form.goal')}</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                required
                type="number"
                className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-12 pr-6 outline-none font-bold transition-all"
                value={formData.goal_amount}
                onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
                placeholder="500000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">{t('admin.form.image')}</label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="w-full bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-accent transition-all rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-2 group">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-accent transition-colors">cloud_upload</span>
                    <span className="text-sm font-bold text-slate-500">{t('admin.form.upload')}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </label>
                {imagePreview && (
                  <div className="size-24 rounded-xl overflow-hidden border-2 border-accent shadow-lg shadow-accent/10 relative group">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                  <span className="text-xs font-black text-slate-400 uppercase">OR URL</span>
                </div>
                <input 
                  className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-20 pr-6 outline-none font-bold transition-all"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({...formData, image_url: e.target.value});
                    if (e.target.value) { setImageFile(null); setImagePreview(null); }
                  }}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('admin.form.story')}</label>
          <textarea 
            rows={5}
            className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none"
            value={formData.long_description}
            onChange={(e) => setFormData({...formData, long_description: e.target.value})}
            placeholder="Tell the full story of this mission..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">{t('admin.form.budget')}</label>
          <div className="space-y-4">
            {budgetRows.map((row, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 sm:p-0 bg-slate-50 dark:bg-white/5 sm:bg-transparent rounded-xl border border-slate-200 dark:border-white/10 sm:border-none">
                <input 
                  className="flex-1 w-full bg-white dark:bg-slate-900 sm:bg-slate-50 sm:dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-3 px-6 outline-none font-bold transition-all"
                  value={row.label}
                  onChange={(e) => updateBudgetRow(index, 'label', e.target.value)}
                  placeholder="Item Name (e.g. Food)"
                />
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-32">
                    <input 
                      type="number"
                      className="w-full bg-white dark:bg-slate-900 sm:bg-slate-50 sm:dark:bg-white/5 border-2 border-transparent focus:border-accent rounded-xl py-3 px-6 outline-none font-bold transition-all pr-10"
                      value={row.percent}
                      onChange={(e) => updateBudgetRow(index, 'percent', e.target.value)}
                      placeholder="70"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  {budgetRows.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeBudgetRow(index)}
                      className="size-12 flex items-center justify-center bg-red-50 sm:bg-transparent text-red-500 hover:text-red-600 transition-colors rounded-xl"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button 
            type="button"
            onClick={addBudgetRow}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors mt-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t('admin.form.addItem')}
          </button>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-accent hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? t('admin.form.creating') : t('admin.form.publish')}
          {!loading && <span className="material-symbols-outlined">publish</span>}
        </button>
      </form>
    </div>
  );
};
