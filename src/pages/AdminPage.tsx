import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Console state: 'mission' (projects) or 'initiative' (products/experiences)
  const [activeConsole, setActiveConsole] = useState<'mission' | 'initiative'>('mission');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 1. PROJECTS STATE
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

  // 2. INITIATIVES STATE
  const [projectList, setProjectList] = useState<any[]>([]);
  const [initiativeData, setInitiativeData] = useState({
    project_id: '',
    title: '',
    type: 'item', // 'item' or 'experience'
    description: '',
    suggested_price: '',
    impact_description: '',
    image_url: '',
    goal_amount: ''
  });

  // Fetch projects list when mounting, required for initiative dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await supabase.from('projects').select('*');
        if (data && data.length > 0) {
          setProjectList(data);
          setInitiativeData(prev => ({ ...prev, project_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error loading projects list for admin console:', err);
      }
    };
    fetchProjects();
  }, [activeConsole]);

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
      
      // Clear manual URL fields
      if (activeConsole === 'mission') {
        setFormData(prev => ({ ...prev, image_url: '' }));
      } else {
        setInitiativeData(prev => ({ ...prev, image_url: '' }));
      }
    }
  };

  // Reusable secure image uploader
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `project-images/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('media') 
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error('Supabase Storage bucket "media" not found. Please verify local uploads folder is active.');
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
      let finalImageUrl = activeConsole === 'mission' ? formData.image_url : initiativeData.image_url;

      if (imageFile) {
        setMessage({ type: 'info', text: 'Uploading image...' });
        finalImageUrl = await uploadImage(imageFile);
      }

      if (activeConsole === 'mission') {
        // --- 1. PUBLISH HUMANITARIAN MISSION (PROJECT) ---
        if (!formData.name || !formData.goal_amount) {
          throw new Error('Name and Goal Amount are required');
        }

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

        setMessage({ type: 'success', text: 'Humanitarian mission published successfully!' });
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
      } else {
        // --- 2. REGISTER SOLIDARITY INITIATIVE (PRODUCT/EXPERIENCE) ---
        if (!initiativeData.title || !initiativeData.suggested_price || !initiativeData.impact_description) {
          throw new Error('Title, Suggested Contribution and Impact Description are required.');
        }

        const finalInitiative = {
          project_id: initiativeData.project_id,
          title: initiativeData.title,
          type: initiativeData.type,
          description: initiativeData.description || '',
          suggested_price: parseFloat(initiativeData.suggested_price),
          impact_description: initiativeData.impact_description,
          image_url: finalImageUrl || 'https://picsum.photos/seed/default-initiative/800/600',
          goal_amount: parseFloat(initiativeData.goal_amount || '0'),
          created_by_user: 'admin_console'
        };

        const { error } = await supabase.from('initiatives').insert([finalInitiative]);
        if (error) throw error;

        setMessage({ type: 'success', text: 'Solidarity initiative registered successfully!' });
        setInitiativeData({
          project_id: projectList[0]?.id || '',
          title: '',
          type: 'item',
          description: '',
          suggested_price: '',
          impact_description: '',
          image_url: '',
          goal_amount: ''
        });
      }

      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error processing request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary line-height-tight"> NGO Staff Console</h1>
            <p className="text-slate-500 font-medium">Manage missions, solidarity actions and resources</p>
          </div>
        </div>

        {/* Console Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto shrink-0 border border-slate-200">
          <button 
            type="button"
            onClick={() => { setActiveConsole('mission'); setMessage({ type: '', text: '' }); }}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              activeConsole === 'mission' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            Missões
          </button>
          <button 
            type="button"
            onClick={() => { setActiveConsole('initiative'); setMessage({ type: '', text: '' }); }}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
              activeConsole === 'initiative' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            Iniciativas (Vendas)
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-8 flex items-center gap-3 font-bold ${
            message.type === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </motion.div>
      )}

      {/* Active Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-xl space-y-6">
        
        {activeConsole === 'mission' ? (
          // ================== MISSION FORM ==================
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.name')}</label>
                <input 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('admin.form.name')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.category')}</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.status')}</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
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
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.desc')}</label>
              <textarea 
                required
                rows={2}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('admin.form.desc')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.goal')}</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    required
                    type="number"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-12 pr-6 outline-none font-bold transition-all text-slate-800"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
                    placeholder="500000"
                  />
                </div>
              </div>
              
              {/* Common Image Upload component shared logic */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.image')}</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-accent transition-all rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-2 group">
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
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-20 pr-6 outline-none font-bold transition-all text-slate-800"
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
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.story')}</label>
              <textarea 
                rows={5}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                value={formData.long_description}
                onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                placeholder="Tell the full story of this mission..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{t('admin.form.budget')}</label>
              <div className="space-y-4">
                {budgetRows.map((row, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-200 sm:border-none">
                    <input 
                      className="flex-1 w-full bg-white sm:bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-3 px-6 outline-none font-bold transition-all text-slate-800"
                      value={row.label}
                      onChange={(e) => updateBudgetRow(index, 'label', e.target.value)}
                      placeholder="Item Name (e.g. Food)"
                    />
                    <div className="flex gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-32">
                        <input 
                          type="number"
                          className="w-full bg-white sm:bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-3 px-6 outline-none font-bold transition-all pr-10 text-slate-800"
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
          </>
        ) : (
          // ================== INITIATIVE FORM ==================
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Título da Iniciativa</label>
                <input 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                  value={initiativeData.title}
                  onChange={(e) => setInitiativeData({...initiativeData, title: e.target.value})}
                  placeholder="Ex: Camiseta Bridges Oficial"
                />
              </div>

              {/* Linked Project Select */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Vincular à Missão Apoiada</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
                  value={initiativeData.project_id}
                  onChange={(e) => setInitiativeData({...initiativeData, project_id: e.target.value})}
                >
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  {projectList.length === 0 && (
                    <option value="">Nenhuma missão cadastrada</option>
                  )}
                </select>
              </div>

              {/* Type Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Tipo de Iniciativa</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
                  value={initiativeData.type}
                  onChange={(e) => setInitiativeData({...initiativeData, type: e.target.value as any})}
                >
                  <option value="item">Símbolo de Apoio (Venda de Produto Físico)</option>
                  <option value="experience">Atividade Coletiva (Inscrição para Experiência/Evento)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Descrição Detalhada</label>
              <textarea 
                required
                rows={3}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                value={initiativeData.description}
                onChange={(e) => setInitiativeData({...initiativeData, description: e.target.value})}
                placeholder="Detalhe o produto ou como funcionará a atividade solidária..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Suggested Price */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Contribuição Sugerida (Preço Mínimo)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    required
                    type="number"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-12 pr-6 outline-none font-bold transition-all text-slate-800"
                    value={initiativeData.suggested_price}
                    onChange={(e) => setInitiativeData({...initiativeData, suggested_price: e.target.value})}
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Goal Amount */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Meta Financeira Coletiva da Ação (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-12 pr-6 outline-none font-bold transition-all text-slate-800"
                    value={initiativeData.goal_amount}
                    onChange={(e) => setInitiativeData({...initiativeData, goal_amount: e.target.value})}
                    placeholder="3000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Impact Description */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Descrição do Impacto Direto (Framing de Generosidade)</label>
                <input 
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                  value={initiativeData.impact_description}
                  onChange={(e) => setInitiativeData({...initiativeData, impact_description: e.target.value})}
                  placeholder="Ex: Garante 5 dias de refeições e água limpa"
                />
              </div>

              {/* Shared Image Uploader logic */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Imagem Ilustrativa</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-accent transition-all rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-2 group">
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
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-20 pr-6 outline-none font-bold transition-all text-slate-800"
                      value={initiativeData.image_url}
                      onChange={(e) => {
                        setInitiativeData({...initiativeData, image_url: e.target.value});
                        if (e.target.value) { setImageFile(null); setImagePreview(null); }
                      }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-accent hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Processando...' : activeConsole === 'mission' ? t('admin.form.publish') : 'Registrar Iniciativa'}
          {!loading && <span className="material-symbols-outlined">publish</span>}
        </button>
      </form>
    </div>
  );
};
