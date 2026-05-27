import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Console state: 'mission', 'initiative', or 'pledges'
  const [activeConsole, setActiveConsole] = useState<'mission' | 'initiative' | 'pledges'>('mission');

  // UI state for showing list vs form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lists state
  const [missionsList, setMissionsList] = useState<any[]>([]);
  const [initiativeList, setInitiativeList] = useState<any[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [initiativesLoading, setInitiativesLoading] = useState(false);

  // Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; type: 'mission' | 'initiative'; id: string; name: string } | null>(null);

  // 3. PLEDGES STATE
  const [pledges, setPledges] = useState<any[]>([]);
  const [pledgesLoading, setPledgesLoading] = useState(false);

  // 1. PROJECTS (MISSIONS) FORM STATE
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_amount: '',
    image_url: '',
    category: 'BRAZIL RELIEF',
    status: 'active',
    long_description: '',
  });
  const [budgetRows, setBudgetRows] = useState([{ label: '', percent: '' }]);

  // 2. INITIATIVES FORM STATE
  const [projectList, setProjectList] = useState<any[]>([]);
  const [initiativeData, setInitiativeData] = useState({
    project_id: '',
    title: '',
    type: 'item', // 'item' or 'experience'
    description: '',
    suggested_price: '',
    impact_description: '',
    image_url: '',
    goal_amount: '',
    status: 'active'
  });

  // Fetch pledges data
  const fetchPledges = async () => {
    setPledgesLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/contributions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPledges(data);
      } else {
        console.error('Failed to fetch contributions:', data.error);
      }
    } catch (err) {
      console.error('Error fetching contributions:', err);
    } finally {
      setPledgesLoading(false);
    }
  };

  // Fetch all projects (missions)
  const fetchMissions = async () => {
    setMissionsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setMissionsList(data);
        setProjectList(data);
        if (data.length > 0 && !initiativeData.project_id) {
          setInitiativeData(prev => ({ ...prev, project_id: data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load missions:', err);
    } finally {
      setMissionsLoading(false);
    }
  };

  // Fetch all initiatives (including completed/archived ones for admin management)
  const fetchInitiatives = async () => {
    setInitiativesLoading(true);
    try {
      const response = await fetch('/api/initiatives?all=true');
      if (response.ok) {
        const data = await response.json();
        setInitiativeList(data);
      }
    } catch (err) {
      console.error('Failed to load initiatives:', err);
    } finally {
      setInitiativesLoading(false);
    }
  };

  // Update pledge contribution status
  const handleUpdateStatus = async (pledgeId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/contributions/${pledgeId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setPledges(prev => prev.map(p => {
          if (p.id === pledgeId) {
            return { ...p, status: newStatus };
          }
          return p;
        }));
        setMessage({ type: 'success', text: `Status do apoio atualizado com sucesso!` });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar status.');
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar status.' });
    }
  };

  // Fetch data automatically based on active tab
  useEffect(() => {
    setMessage({ type: '', text: '' });
    setShowForm(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);

    if (activeConsole === 'pledges') {
      fetchPledges();
    } else if (activeConsole === 'mission') {
      fetchMissions();
    } else if (activeConsole === 'initiative') {
      fetchMissions();
      fetchInitiatives();
    }
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

  // Reusable Base64 Image Uploader via /api/upload endpoint
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Falha ao converter imagem para Base64.');
    }

    const resData = await response.json();
    return resData.publicUrl; // Returns a persistent Base64 Data URI
  };

  // Switch to creation mode
  const handleCreateNew = () => {
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setMessage({ type: '', text: '' });

    if (activeConsole === 'mission') {
      setFormData({
        name: '',
        description: '',
        goal_amount: '',
        image_url: '',
        category: 'BRAZIL RELIEF',
        status: 'active',
        long_description: '',
      });
      setBudgetRows([{ label: '', percent: '' }]);
    } else {
      setInitiativeData({
        project_id: projectList[0]?.id || '',
        title: '',
        type: 'item',
        description: '',
        suggested_price: '',
        impact_description: '',
        image_url: '',
        goal_amount: '',
        status: 'active'
      });
    }
    setShowForm(true);
  };

  // Switch to edit mode
  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setImageFile(null);
    setImagePreview(item.image_url);
    setMessage({ type: '', text: '' });

    if (activeConsole === 'mission') {
      setFormData({
        name: item.name,
        description: item.description || '',
        goal_amount: item.goal_amount.toString(),
        image_url: item.image_url || '',
        category: item.category || 'BRAZIL RELIEF',
        status: item.status || 'active',
        long_description: item.long_description || '',
      });
      
      if (item.budget_json) {
        const rows = typeof item.budget_json === 'string' 
          ? JSON.parse(item.budget_json) 
          : item.budget_json;
        setBudgetRows(rows.map((r: any) => ({ label: r.label, percent: r.percent.toString() })));
      } else {
        setBudgetRows([{ label: '', percent: '' }]);
      }
    } else {
      setInitiativeData({
        project_id: item.project_id,
        title: item.title,
        type: item.type,
        description: item.description || '',
        suggested_price: item.suggested_price.toString(),
        impact_description: item.impact_description,
        image_url: item.image_url || '',
        goal_amount: item.goal_amount ? item.goal_amount.toString() : '',
        status: item.status || 'active'
      });
    }
    setShowForm(true);
  };

  // Trigger Delete confirmation dialog
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({
      show: true,
      type: activeConsole === 'mission' ? 'mission' : 'initiative',
      id,
      name
    });
  };

  // Confirm delete operation
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    try {
      const { type, id } = deleteConfirm;
      let res;
      if (type === 'mission') {
        res = await supabase.from('projects').eq('id', id).delete();
      } else {
        res = await supabase.from('initiatives').eq('id', id).delete();
      }

      if (res.error) throw res.error;

      setMessage({ 
        type: 'success', 
        text: `${type === 'mission' ? 'Missão' : 'Iniciativa'} excluída com sucesso!` 
      });
      
      // Refresh lists
      if (type === 'mission') {
        fetchMissions();
      } else {
        fetchInitiatives();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir item.' });
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let finalImageUrl = activeConsole === 'mission' ? formData.image_url : initiativeData.image_url;

      if (imageFile) {
        setMessage({ type: 'info', text: 'Convertendo e otimizando imagem...' });
        finalImageUrl = await uploadImage(imageFile);
      }

      if (activeConsole === 'mission') {
        // ================== PROCESS MISSION (PROJECT) ==================
        if (!formData.name || !formData.goal_amount) {
          throw new Error('Nome e Meta de Arrecadação são obrigatórios.');
        }

        const budgetJson = budgetRows
          .filter(row => row.label && row.percent)
          .map(row => ({ label: row.label, percent: parseInt(row.percent as string) }));

        const projectData = {
          name: formData.name,
          description: formData.description,
          goal_amount: parseFloat(formData.goal_amount),
          image_url: finalImageUrl || 'https://picsum.photos/seed/default-mission/1200/800',
          status: formData.status,
          category: formData.category,
          long_description: formData.long_description,
          budget_json: budgetJson.length > 0 ? budgetJson : null
        };

        let res;
        if (editingId) {
          // Edit operation
          res = await supabase.from('projects').eq('id', editingId).update(projectData);
        } else {
          // Insert operation
          res = await supabase.from('projects').insert([projectData]);
        }

        if (res.error) throw res.error;

        setMessage({ 
          type: 'success', 
          text: `Missão Humanitária ${editingId ? 'atualizada' : 'publicada'} com sucesso!` 
        });
        
        // Return to list and reload
        setShowForm(false);
        setEditingId(null);
        fetchMissions();
      } else {
        // ================== PROCESS INITIATIVE (PRODUCT/EXPERIENCE) ==================
        if (!initiativeData.title || !initiativeData.suggested_price || !initiativeData.impact_description) {
          throw new Error('Título, Contribuição Sugerida e Descrição do Impacto são obrigatórios.');
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
          status: initiativeData.status,
          created_by_user: 'admin_console'
        };

        let res;
        if (editingId) {
          // Edit operation
          res = await supabase.from('initiatives').eq('id', editingId).update(finalInitiative);
        } else {
          // Insert operation
          res = await supabase.from('initiatives').insert([finalInitiative]);
        }

        if (res.error) throw res.error;

        setMessage({ 
          type: 'success', 
          text: `Iniciativa Solidária ${editingId ? 'atualizada' : 'registrada'} com sucesso!` 
        });
        
        // Return to list and reload
        setShowForm(false);
        setEditingId(null);
        fetchInitiatives();
      }

      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao processar requisição.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Painel Administrativo da ONG</h1>
            <p className="text-slate-500 font-bold text-sm mt-0.5">Gerencie missões, ações solidárias e recursos cadastrados</p>
          </div>
        </div>

        {/* Console Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto shrink-0 border border-slate-200 shadow-inner">
          <button 
            type="button"
            onClick={() => setActiveConsole('mission')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all w-full md:w-auto ${
              activeConsole === 'mission' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            Missões
          </button>
          <button 
            type="button"
            onClick={() => setActiveConsole('initiative')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all w-full md:w-auto ${
              activeConsole === 'initiative' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            Iniciativas (Vendas)
          </button>
          <button 
            type="button"
            onClick={() => setActiveConsole('pledges')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all w-full md:w-auto ${
              activeConsole === 'pledges' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            Apoios Recebidos
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-8 flex items-center gap-3 font-bold text-sm ${
            message.type === 'success' 
              ? 'bg-success/10 text-success border border-success/20' 
              : message.type === 'info'
              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : message.type === 'info' ? 'hourglass_top' : 'error'}
          </span>
          {message.text}
        </motion.div>
      )}

      {/* Active Form, Listing, or Pledges Dashboard */}
      {activeConsole === 'pledges' ? (
        // ================== PLEDGES LIST DASHBOARD ==================
        <div className="bg-white rounded-3xl border border-primary/5 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-6 shrink-0">
            <div>
              <h3 className="text-xl font-black text-primary">Apoios Coletados</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">Gerencie os apoios recebidos via Stripe (USD) e Mercado Pago (BRL).</p>
            </div>
            <button 
              type="button"
              onClick={fetchPledges}
              disabled={pledgesLoading}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Atualizar
            </button>
          </div>

          {pledgesLoading ? (
            <div className="py-12 text-center text-slate-400 font-bold">Carregando apoios...</div>
          ) : pledges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-4 px-4">Apoiador</th>
                    <th className="py-4 px-4">Iniciativa / Projeto</th>
                    <th className="py-4 px-4 text-right">Valor Pago</th>
                    <th className="py-4 px-4">Gateway / ID</th>
                    <th className="py-4 px-4">Observações</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                  {pledges.map((p) => {
                    const cleanPhone = p.supporter_phone.replace(/[^\d]/g, '');
                    const waLink = `https://wa.me/${cleanPhone}`;
                    
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 space-y-1">
                          <p className="font-bold text-slate-900">{p.supporter_name}</p>
                          <p className="text-[10px] text-slate-400">{p.supporter_email}</p>
                          {p.supporter_phone && (
                            <a 
                              href={waLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] text-success hover:underline font-black mt-1"
                            >
                              <span className="material-symbols-outlined text-xs">chat</span>
                              {p.supporter_phone}
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-4 space-y-0.5">
                          <p className="font-bold text-slate-800">{p.initiative_title || 'Ação Solidária'}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">Missão: {p.project_name || 'Geral'}</p>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-900">
                          {p.currency === 'BRL' ? 'R$' : '$'} {parseFloat(p.pledge_amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 space-y-0.5">
                          <span className={`inline-block text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                            p.gateway === 'stripe' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {p.gateway}
                          </span>
                          <p className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">{p.transaction_reference}</p>
                        </td>
                        <td className="py-4 px-4 max-w-[200px] truncate" title={p.additional_notes}>
                          {p.additional_notes || <span className="text-slate-300 font-normal italic">Nenhuma</span>}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            p.status === 'completed' 
                              ? 'bg-success/10 text-success' 
                              : p.status === 'contacted'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {p.status === 'completed' ? 'Pago' : p.status === 'contacted' ? 'Contactado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            {p.status === 'completed' && (
                              <button 
                                type="button"
                                onClick={() => handleUpdateStatus(p.id, 'contacted')}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black text-[10px] rounded-lg tracking-wider uppercase transition-colors"
                              >
                                Contactar
                              </button>
                            )}
                            {p.status !== 'completed' && p.status !== 'delivered' && (
                              <button 
                                type="button"
                                onClick={() => handleUpdateStatus(p.id, 'completed')}
                                className="px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success font-black text-[10px] rounded-lg tracking-wider uppercase transition-colors"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-slate-200">payments</span>
              <p className="text-lg font-bold text-slate-400">Nenhum apoio coletado até o momento.</p>
            </div>
          )}
        </div>
      ) : showForm ? (
        // ================== FORM VIEW (CREATING OR EDITING) ==================
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-primary/5 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <button 
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Voltar para a Lista
            </button>
            <h3 className="text-lg font-black text-primary uppercase">
              {editingId ? 'Editar' : 'Cadastrar'} {activeConsole === 'mission' ? 'Missão' : 'Iniciativa'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeConsole === 'mission' ? (
              // --- MISSION FORM FIELDS ---
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nome da Missão</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Auxílio Enchentes no Sul"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Categoria</label>
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
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Status da Missão</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Ativa (Arrecadando)</option>
                      <option value="completed">Concluída (Arrecadação encerrada)</option>
                      <option value="archive">Arquivada</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Breve Descrição (Sumário)</label>
                  <textarea 
                    required
                    rows={2}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição rápida de até 2 parágrafos..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Meta de Arrecadação (USD)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        required
                        type="number"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-12 pr-6 outline-none font-bold transition-all text-slate-800"
                        value={formData.goal_amount}
                        onChange={(e) => setFormData({...formData, goal_amount: e.target.value})}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  
                  {/* Persistent Base64 Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Imagem da Missão</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-accent transition-all rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-2 group">
                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-accent transition-colors">cloud_upload</span>
                            <span className="text-sm font-bold text-slate-500">Upload de Arquivo (Persistido no Banco)</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </div>
                        </label>
                        {imagePreview && (
                          <div className="size-24 rounded-xl overflow-hidden border-2 border-accent shadow-lg shadow-accent/10 relative group shrink-0">
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => { setImageFile(null); setImagePreview(null); setFormData(p => ({ ...p, image_url: '' })); }}
                              className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                          <span className="text-xs font-black text-slate-400 uppercase">OU URL</span>
                        </div>
                        <input 
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-20 pr-6 outline-none font-bold transition-all text-slate-800"
                          value={formData.image_url}
                          onChange={(e) => {
                            setFormData({...formData, image_url: e.target.value});
                            if (e.target.value) { setImageFile(null); setImagePreview(e.target.value); }
                          }}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">História Completa (Página de Impacto)</label>
                  <textarea 
                    rows={5}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                    value={formData.long_description}
                    onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                    placeholder="Escreva a história completa de impacto social..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Divisão do Orçamento (Destinação de Recursos)</label>
                  <div className="space-y-4">
                    {budgetRows.map((row, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-200 sm:border-none">
                        <input 
                          className="flex-1 w-full bg-white sm:bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-3 px-6 outline-none font-bold transition-all text-slate-800"
                          value={row.label}
                          onChange={(e) => updateBudgetRow(index, 'label', e.target.value)}
                          placeholder="Item Destinado (ex: Cestas Básicas)"
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
                    Adicionar Item ao Orçamento
                  </button>
                </div>
              </>
            ) : (
              // --- INITIATIVE FORM FIELDS ---
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
                      placeholder="Ex: Camiseta Oficial Building Bridges"
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

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Status</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
                      value={initiativeData.status}
                      onChange={(e) => setInitiativeData({...initiativeData, status: e.target.value})}
                    >
                      <option value="active">Ativo (Hub de Ações)</option>
                      <option value="completed">Concluído</option>
                      <option value="archive">Arquivado</option>
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
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Framing de Impacto (Mensagem Solidária)</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                      value={initiativeData.impact_description}
                      onChange={(e) => setInitiativeData({...initiativeData, impact_description: e.target.value})}
                      placeholder="Ex: Garante 5 dias de refeições e água limpa"
                    />
                  </div>

                  {/* Persistent Base64 Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Imagem da Iniciativa</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-accent transition-all rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-2 group">
                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-accent transition-colors">cloud_upload</span>
                            <span className="text-sm font-bold text-slate-500">Upload de Imagem (Persistido no Banco)</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </div>
                        </label>
                        {imagePreview && (
                          <div className="size-24 rounded-xl overflow-hidden border-2 border-accent shadow-lg shadow-accent/10 relative group shrink-0">
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => { setImageFile(null); setImagePreview(null); setInitiativeData(p => ({ ...p, image_url: '' })); }}
                              className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
                          <span className="text-xs font-black text-slate-400 uppercase">OU URL</span>
                        </div>
                        <input 
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 pl-20 pr-6 outline-none font-bold transition-all text-slate-800"
                          value={initiativeData.image_url}
                          onChange={(e) => {
                            setInitiativeData({...initiativeData, image_url: e.target.value});
                            if (e.target.value) { setImageFile(null); setImagePreview(e.target.value); }
                          }}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-accent hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : activeConsole === 'mission' ? 'Publicar Missão' : 'Registrar Iniciativa'}
              {!loading && <span className="material-symbols-outlined">save</span>}
            </button>
          </form>
        </div>
      ) : (
        // ================== STANDARD LIST VIEW (DASHBOARD) ==================
        <div className="bg-white rounded-3xl border border-primary/5 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 shrink-0">
            <div>
              <h3 className="text-xl font-black text-primary">
                {activeConsole === 'mission' ? 'Missões Cadastradas' : 'Iniciativas de Apoio'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {activeConsole === 'mission' 
                  ? 'Gerencie missões humanitárias urgentes de auxílio a desastres.' 
                  : 'Gerencie itens e experiências disponíveis para compras e doações.'}
              </p>
            </div>
            <button 
              type="button"
              onClick={handleCreateNew}
              className="px-6 py-3.5 bg-accent hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-accent/20 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {activeConsole === 'mission' ? 'Nova Missão' : 'Nova Iniciativa'}
            </button>
          </div>

          {activeConsole === 'mission' ? (
            // --- PROJECTS/MISSIONS TABLE LIST ---
            missionsLoading ? (
              <div className="py-12 text-center text-slate-400 font-bold">Carregando missões...</div>
            ) : missionsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-4 px-4 w-[80px]">Imagem</th>
                      <th className="py-4 px-4">Nome / Categoria</th>
                      <th className="py-4 px-4">Meta (USD)</th>
                      <th className="py-4 px-4">Arrecadado</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                    {missionsList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="size-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-4 px-4 space-y-1">
                          <p className="font-black text-slate-900 text-sm">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.category || 'Geral'}</p>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          ${parseFloat(m.goal_amount).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          ${parseFloat(m.raised_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                            m.status === 'active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {m.status === 'active' ? 'Ativo' : 'Concluído'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleEditClick(m)}
                              className="size-8 rounded-lg bg-slate-100 hover:bg-primary/5 text-slate-500 hover:text-primary transition-colors flex items-center justify-center"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(m.id, m.name)}
                              className="size-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors flex items-center justify-center"
                              title="Excluir"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 font-bold">Nenhuma missão humanitária cadastrada.</div>
            )
          ) : (
            // --- INITIATIVES TABLE LIST ---
            initiativesLoading ? (
              <div className="py-12 text-center text-slate-400 font-bold">Carregando iniciativas...</div>
            ) : initiativeList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-4 px-4 w-[80px]">Imagem</th>
                      <th className="py-4 px-4">Título</th>
                      <th className="py-4 px-4">Tipo</th>
                      <th className="py-4 px-4">Contribuição</th>
                      <th className="py-4 px-4">Missão Apoiada</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                    {initiativeList.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="size-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            <img src={i.image_url} alt={i.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 text-sm">{i.title}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                            i.type === 'item' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'
                          }`}>
                            {i.type === 'item' ? 'Produto' : 'Atividade'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          ${parseFloat(i.suggested_price).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-500 max-w-[150px] truncate" title={i.project_id}>
                          {projectList.find(p => p.id === i.project_id)?.name || i.project_id}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                            i.status === 'active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {i.status === 'active' ? 'Ativa' : 'Encerrada'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleEditClick(i)}
                              className="size-8 rounded-lg bg-slate-100 hover:bg-primary/5 text-slate-500 hover:text-primary transition-colors flex items-center justify-center"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(i.id, i.title)}
                              className="size-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors flex items-center justify-center"
                              title="Excluir"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 font-bold">Nenhuma iniciativa de apoio cadastrada.</div>
            )
          )}
        </div>
      )}

      {/* ================== DELETE CONFIRMATION MODAL ================== */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 text-center border border-red-500/20 shadow-2xl z-50"
            >
              <div className="size-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
              
              <h3 className="text-2xl font-black text-primary mb-2">Excluir Registro?</h3>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed mb-6">
                Você está prestes a excluir permanentemente o item: <strong className="text-slate-800">"{deleteConfirm.name}"</strong>.
                {deleteConfirm.type === 'mission' && ' Essa exclusão em cascata apagará também todas as iniciativas vinculadas a esta missão.'} Esta ação não poderá ser desfeita.
              </p>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-sm transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={loading}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Excluindo...' : 'Sim, Excluir'}
                  {!loading && <span className="material-symbols-outlined text-base">delete_forever</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
