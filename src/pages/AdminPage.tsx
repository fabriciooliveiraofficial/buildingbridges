import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { parseImages } from '../lib/imageUtils';
import { AccountSecurityPanel } from '../components/AccountSecurityPanel';
import { SEO } from '../components/SEO';
import { getTranslatedProject, getTranslatedInitiative } from '../lib/projectTranslations';

export const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Console state: 'mission', 'initiative', 'pledges', 'account' or 'zelle'
  const [activeConsole, setActiveConsole] = useState<'mission' | 'initiative' | 'pledges' | 'account' | 'zelle'>('mission');

  // ZELLE SETTINGS STATE
  const [adminZelleKey, setAdminZelleKey] = useState('donate@buildingbridgesbrusa.org');
  const [adminZelleHolder, setAdminZelleHolder] = useState('Building Bridges Foundation Inc.');
  const [zelleLoading, setZelleLoading] = useState(false);
  const [zelleSaving, setZelleSaving] = useState(false);
  const [zellePreviewQr, setZellePreviewQr] = useState('');
  const [zelleSuccessMsg, setZelleSuccessMsg] = useState('');
  const [zelleErrorMsg, setZelleErrorMsg] = useState('');

  // UI state for showing list vs form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Multilingual Form state (3 languages: pt, en, es)
  const [formLang, setFormLang] = useState<'pt' | 'en' | 'es'>('pt');
  const [projectTranslations, setProjectTranslations] = useState<{
    pt: { name: string; description: string; long_description: string };
    en: { name: string; description: string; long_description: string };
    es: { name: string; description: string; long_description: string };
  }>({
    pt: { name: '', description: '', long_description: '' },
    en: { name: '', description: '', long_description: '' },
    es: { name: '', description: '', long_description: '' },
  });

  const [initiativeTranslations, setInitiativeTranslations] = useState<{
    pt: { title: string; description: string; impact_description: string };
    en: { title: string; description: string; impact_description: string };
    es: { title: string; description: string; impact_description: string };
  }>({
    pt: { title: '', description: '', impact_description: '' },
    en: { title: '', description: '', impact_description: '' },
    es: { title: '', description: '', impact_description: '' },
  });

  // Lists state
  const [missionsList, setMissionsList] = useState<any[]>([]);
  const [initiativeList, setInitiativeList] = useState<any[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [initiativesLoading, setInitiativesLoading] = useState(false);

  // Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

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
      const response = await fetch(`/api/contributions?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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
      const response = await fetch(`/api/projects?limit=100&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const projectsArray = data.projects || (Array.isArray(data) ? data : []);
        setMissionsList(projectsArray);
        setProjectList(projectsArray);
        if (projectsArray.length > 0 && !initiativeData.project_id) {
          setInitiativeData(prev => ({ ...prev, project_id: projectsArray[0].id }));
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
      const response = await fetch(`/api/initiatives?all=true&limit=100&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const initArray = data.initiatives || (Array.isArray(data) ? data : []);
        setInitiativeList(initArray);
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

  // Fetch Zelle Settings
  const fetchZelleSettings = async () => {
    setZelleLoading(true);
    try {
      const response = await fetch(`/api/settings/zelle?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.zelle_key) setAdminZelleKey(data.zelle_key);
        if (data.zelle_name) setAdminZelleHolder(data.zelle_name);
      }
    } catch (err) {
      console.error('Failed to load Zelle settings:', err);
    } finally {
      setZelleLoading(false);
    }
  };

  // Generate Zelle preview QR code
  useEffect(() => {
    if (adminZelleKey) {
      QRCode.toDataURL(adminZelleKey, { width: 220, margin: 1, color: { dark: '#0a3161', light: '#ffffff' } })
        .then(setZellePreviewQr)
        .catch(console.error);
    }
  }, [adminZelleKey]);

  // Handle Save Zelle Settings
  const handleSaveZelle = async (e: React.FormEvent) => {
    e.preventDefault();
    setZelleSaving(true);
    setZelleSuccessMsg('');
    setZelleErrorMsg('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/settings/zelle', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          zelle_key: adminZelleKey,
          zelle_name: adminZelleHolder
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao salvar configurações do Zelle.');
      }

      setZelleSuccessMsg('Chave Zelle atualizada com sucesso! O novo QR Code já está ativo no site.');
      setTimeout(() => setZelleSuccessMsg(''), 5000);
    } catch (err: any) {
      setZelleErrorMsg(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setZelleSaving(false);
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
    } else if (activeConsole === 'zelle') {
      fetchZelleSettings();
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
      if (formImages.length >= 5) {
        setMessage({ type: 'error', text: 'Limite máximo de 5 imagens atingido.' });
        return;
      }
      setImageFile(file);
      setIsReadingFile(true);
      
      // Convert to Base64 immediately in the frontend!
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormImages(prev => [...prev, base64String]);
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setIsReadingFile(false);
        setMessage({ type: 'error', text: 'Erro ao processar arquivo de imagem.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (formImages.length >= 5) {
      setMessage({ type: 'error', text: 'Limite máximo de 5 imagens atingido.' });
      return;
    }
    setFormImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper to copy Portuguese values to active language tab
  const handleCopyFromPt = () => {
    if (activeConsole === 'mission') {
      setProjectTranslations(prev => ({
        ...prev,
        [formLang]: {
          name: prev.pt.name,
          description: prev.pt.description,
          long_description: prev.pt.long_description
        }
      }));
    } else {
      setInitiativeTranslations(prev => ({
        ...prev,
        [formLang]: {
          title: prev.pt.title,
          description: prev.pt.description,
          impact_description: prev.pt.impact_description
        }
      }));
    }
  };

  // Switch to creation mode
  const handleCreateNew = () => {
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setFormImages([]);
    setImageUrlInput('');
    setMessage({ type: '', text: '' });
    setFormLang('pt');

    setProjectTranslations({
      pt: { name: '', description: '', long_description: '' },
      en: { name: '', description: '', long_description: '' },
      es: { name: '', description: '', long_description: '' }
    });

    setInitiativeTranslations({
      pt: { title: '', description: '', impact_description: '' },
      en: { title: '', description: '', impact_description: '' },
      es: { title: '', description: '', impact_description: '' }
    });

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
    const parsed = parseImages(item.image_url);
    setFormImages(parsed);
    setImageUrlInput('');
    setMessage({ type: '', text: '' });
    setFormLang('pt');

    if (activeConsole === 'mission') {
      let tJson: any = item.translations_json;
      if (typeof tJson === 'string') {
        try { tJson = JSON.parse(tJson); } catch (e) { tJson = null; }
      }

      const enKnown = !tJson?.en?.name ? getTranslatedProject(item, 'en') : null;
      const esKnown = !tJson?.es?.name ? getTranslatedProject(item, 'es') : null;

      const ptName = tJson?.pt?.name || item.name || '';
      const ptDesc = tJson?.pt?.description || item.description || '';
      const ptLong = tJson?.pt?.long_description || item.long_description || '';

      const enName = tJson?.en?.name || (enKnown && enKnown.name !== item.name ? enKnown.name : '') || '';
      const enDesc = tJson?.en?.description || (enKnown && enKnown.description !== item.description ? enKnown.description : '') || '';
      const enLong = tJson?.en?.long_description || (enKnown && enKnown.long_description !== item.long_description ? enKnown.long_description : '') || '';

      const esName = tJson?.es?.name || (esKnown && esKnown.name !== item.name ? esKnown.name : '') || '';
      const esDesc = tJson?.es?.description || (esKnown && esKnown.description !== item.description ? esKnown.description : '') || '';
      const esLong = tJson?.es?.long_description || (esKnown && esKnown.long_description !== item.long_description ? esKnown.long_description : '') || '';

      setProjectTranslations({
        pt: { name: ptName, description: ptDesc, long_description: ptLong },
        en: { name: enName, description: enDesc, long_description: enLong },
        es: { name: esName, description: esDesc, long_description: esLong }
      });

      setFormData({
        name: ptName,
        description: ptDesc,
        goal_amount: item.goal_amount ? item.goal_amount.toString() : '',
        image_url: item.image_url || '',
        category: item.category || 'BRAZIL RELIEF',
        status: item.status || 'active',
        long_description: ptLong,
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
      let tJson: any = item.translations_json;
      if (typeof tJson === 'string') {
        try { tJson = JSON.parse(tJson); } catch (e) { tJson = null; }
      }

      const enKnown = !tJson?.en?.title ? getTranslatedInitiative(item, 'en') : null;
      const esKnown = !tJson?.es?.title ? getTranslatedInitiative(item, 'es') : null;

      const ptTitle = tJson?.pt?.title || item.title || '';
      const ptDesc = tJson?.pt?.description || item.description || '';
      const ptImpact = tJson?.pt?.impact_description || item.impact_description || '';

      const enTitle = tJson?.en?.title || (enKnown && enKnown.title !== item.title ? enKnown.title : '') || '';
      const enDesc = tJson?.en?.description || (enKnown && enKnown.description !== item.description ? enKnown.description : '') || '';
      const enImpact = tJson?.en?.impact_description || (enKnown && enKnown.impact_description !== item.impact_description ? enKnown.impact_description : '') || '';

      const esTitle = tJson?.es?.title || (esKnown && esKnown.title !== item.title ? esKnown.title : '') || '';
      const esDesc = tJson?.es?.description || (esKnown && esKnown.description !== item.description ? esKnown.description : '') || '';
      const esImpact = tJson?.es?.impact_description || (esKnown && esKnown.impact_description !== item.impact_description ? esKnown.impact_description : '') || '';

      setInitiativeTranslations({
        pt: { title: ptTitle, description: ptDesc, impact_description: ptImpact },
        en: { title: enTitle, description: enDesc, impact_description: enImpact },
        es: { title: esTitle, description: esDesc, impact_description: esImpact }
      });

      setInitiativeData({
        project_id: item.project_id,
        title: ptTitle,
        type: item.type,
        description: ptDesc,
        suggested_price: item.suggested_price ? item.suggested_price.toString() : '',
        impact_description: ptImpact,
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
        text: `${type === 'mission' ? 'Projeto excluído' : 'Iniciativa excluída'} com sucesso!` 
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
      const savedImageUrl = formImages.length > 0 
        ? JSON.stringify(formImages) 
        : (activeConsole === 'mission' 
          ? 'https://picsum.photos/seed/default-mission/1200/800' 
          : 'https://picsum.photos/seed/default-initiative/800/600');

      if (activeConsole === 'mission') {
        // ================== PROCESS MISSION (PROJECT) ==================
        const primaryName = projectTranslations.pt.name.trim() || projectTranslations.en.name.trim() || projectTranslations.es.name.trim();
        const primaryDesc = projectTranslations.pt.description.trim() || projectTranslations.en.description.trim() || projectTranslations.es.description.trim();
        const primaryLong = projectTranslations.pt.long_description.trim() || projectTranslations.en.long_description.trim() || projectTranslations.es.long_description.trim();

        if (!primaryName) {
          throw new Error('O nome do projeto é obrigatório (preencha ao menos em um dos idiomas).');
        }

        const budgetJson = budgetRows
          .filter(row => row.label && row.percent)
          .map(row => ({ label: row.label, percent: parseInt(row.percent as string) }));

        const translationsJson = {
          pt: {
            name: projectTranslations.pt.name.trim() || primaryName,
            description: projectTranslations.pt.description.trim() || primaryDesc,
            long_description: projectTranslations.pt.long_description.trim() || primaryLong
          },
          en: {
            name: projectTranslations.en.name.trim() || primaryName,
            description: projectTranslations.en.description.trim() || primaryDesc,
            long_description: projectTranslations.en.long_description.trim() || primaryLong
          },
          es: {
            name: projectTranslations.es.name.trim() || primaryName,
            description: projectTranslations.es.description.trim() || primaryDesc,
            long_description: projectTranslations.es.long_description.trim() || primaryLong
          }
        };

        const projectData = {
          name: primaryName,
          description: primaryDesc,
          image_url: savedImageUrl,
          status: formData.status,
          category: formData.category,
          long_description: primaryLong,
          budget_json: budgetJson.length > 0 ? budgetJson : null,
          translations_json: translationsJson
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
          text: `Projeto Humanitário ${editingId ? 'atualizado' : 'publicado'} com sucesso nos 3 idiomas!` 
        });
        
        // Return to list and reload
        setShowForm(false);
        setEditingId(null);
        fetchMissions();
      } else {
        // ================== PROCESS INITIATIVE (PRODUCT/EXPERIENCE) ==================
        const primaryTitle = initiativeTranslations.pt.title.trim() || initiativeTranslations.en.title.trim() || initiativeTranslations.es.title.trim();
        const primaryDesc = initiativeTranslations.pt.description.trim() || initiativeTranslations.en.description.trim() || initiativeTranslations.es.description.trim();
        const primaryImpact = initiativeTranslations.pt.impact_description.trim() || initiativeTranslations.en.impact_description.trim() || initiativeTranslations.es.impact_description.trim();

        if (!primaryTitle || !initiativeData.suggested_price || !primaryImpact) {
          throw new Error('Título, Contribuição Sugerida e Descrição do Impacto são obrigatórios.');
        }

        const translationsJson = {
          pt: {
            title: initiativeTranslations.pt.title.trim() || primaryTitle,
            description: initiativeTranslations.pt.description.trim() || primaryDesc,
            impact_description: initiativeTranslations.pt.impact_description.trim() || primaryImpact
          },
          en: {
            title: initiativeTranslations.en.title.trim() || primaryTitle,
            description: initiativeTranslations.en.description.trim() || primaryDesc,
            impact_description: initiativeTranslations.en.impact_description.trim() || primaryImpact
          },
          es: {
            title: initiativeTranslations.es.title.trim() || primaryTitle,
            description: initiativeTranslations.es.description.trim() || primaryDesc,
            impact_description: initiativeTranslations.es.impact_description.trim() || primaryImpact
          }
        };

        const finalInitiative = {
          project_id: initiativeData.project_id,
          title: primaryTitle,
          type: initiativeData.type,
          description: primaryDesc,
          suggested_price: parseFloat(initiativeData.suggested_price),
          impact_description: primaryImpact,
          image_url: savedImageUrl,
          goal_amount: parseFloat(initiativeData.goal_amount || '0'),
          status: initiativeData.status,
          created_by_user: 'admin_console',
          translations_json: translationsJson
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
          text: `Iniciativa Solidária ${editingId ? 'atualizada' : 'registrada'} com sucesso nos 3 idiomas!` 
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
      <SEO fallbackTitle="Admin Console | Building Bridges" noindex />
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Painel Administrativo da ONG</h1>
            <p className="text-slate-500 font-bold text-sm mt-0.5">Gerencie projetos, ações solidárias e recursos cadastrados</p>
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
            {t('admin.tabMissions')}
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
            {t('admin.tabInitiatives')}
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
            {t('admin.tabPledges')}
          </button>
          <button
            type="button"
            onClick={() => setActiveConsole('account')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all w-full md:w-auto flex items-center justify-center gap-1.5 ${
              activeConsole === 'account'
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">manage_accounts</span>
            {t('admin.tabAccount')}
          </button>
          <button
            type="button"
            onClick={() => setActiveConsole('zelle')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all w-full md:w-auto flex items-center justify-center gap-1.5 ${
              activeConsole === 'zelle'
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            Chave Zelle
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
      {activeConsole === 'account' ? (
        // ================== ACCOUNT SECURITY (password / recovery e-mail) ==================
        <AccountSecurityPanel />
      ) : activeConsole === 'zelle' ? (
        // ================== ZELLE SETTINGS DASHBOARD ==================
        <div className="bg-white rounded-3xl border border-primary/5 shadow-xl p-6 sm:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-black uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                Gateway Instantâneo EUA
              </div>
              <h2 className="text-2xl font-black text-primary">Configurações de Pagamento Zelle</h2>
              <p className="text-slate-500 font-bold text-sm mt-1">
                Configure a chave e o titular do Zelle. O QR Code e a chave serão atualizados imediatamente na Página Inicial e no Checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchZelleSettings}
              disabled={zelleLoading}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Atualizar
            </button>
          </div>

          {zelleSuccessMsg && (
            <div className="p-4 bg-success/10 border border-success/20 text-success text-sm font-black rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {zelleSuccessMsg}
            </div>
          )}

          {zelleErrorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-black rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {zelleErrorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <form onSubmit={handleSaveZelle} className="lg:col-span-7 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-primary uppercase tracking-wider block">
                  Chave Zelle (E-mail ou Telefone oficial) *
                </label>
                <input
                  type="text"
                  required
                  value={adminZelleKey}
                  onChange={(e) => setAdminZelleKey(e.target.value)}
                  placeholder="Ex: donate@buildingbridgesbrusa.org"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 px-5 outline-none font-bold text-slate-800 transition-all text-sm"
                />
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  Esta é a chave que o doador copia e cola no aplicativo bancário (Chase, Bank of America, Wells Fargo, etc.), e a mesma usada para codificar o QR Code.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-primary uppercase tracking-wider block">
                  Nome do Titular / Razão Social da Conta *
                </label>
                <input
                  type="text"
                  required
                  value={adminZelleHolder}
                  onChange={(e) => setAdminZelleHolder(e.target.value)}
                  placeholder="Ex: Building Bridges Foundation Inc."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-xl py-4 px-5 outline-none font-bold text-slate-800 transition-all text-sm"
                />
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  Exibido para o usuário como confirmação do destinatário oficial para garantir confiança e segurança antes da transferência.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={zelleSaving || zelleLoading}
                  className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {zelleSaving ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      <span>Salvar Configurações Zelle</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 text-center space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                Pré-Visualização ao Vivo (Como o Doador Vê)
              </span>

              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block">
                {zellePreviewQr ? (
                  <img src={zellePreviewQr} alt="Zelle QR Code Preview" className="size-44 object-contain mx-auto" />
                ) : (
                  <div className="size-44 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold mx-auto">
                    Digite a chave acima
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-slate-500">Destinatário Oficial:</p>
                <p className="text-xs font-black text-primary">{adminZelleHolder || 'Nome não definido'}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 truncate">
                {adminZelleKey || 'Chave não informada'}
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Isento de taxas bancárias • Rede Instantânea Zelle
              </p>
            </div>
          </div>
        </div>
      ) : activeConsole === 'pledges' ? (
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
                          <p className="text-[10px] text-slate-400 uppercase font-black">Projeto: {p.project_name || 'Geral'}</p>
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
              {editingId ? 'Editar' : 'Cadastrar'} {activeConsole === 'mission' ? 'Projeto' : 'Iniciativa'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multilingual Language Selector Header */}
            <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">translate</span>
                    <h4 className="text-sm font-black text-primary uppercase tracking-wider">Tradução em 3 Idiomas</h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Preencha os textos em Português, Inglês e Espanhol para que o widget de idiomas na plataforma traduza seu conteúdo em tempo real.
                  </p>
                </div>

                {formLang !== 'pt' && (
                  <button
                    type="button"
                    onClick={handleCopyFromPt}
                    className="self-start sm:self-auto px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Copiar textos em Português para este idioma como ponto de partida"
                  >
                    <span className="material-symbols-outlined text-sm text-accent">content_copy</span>
                    Copiar do Português
                  </button>
                )}
              </div>

              {/* Language Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pt' as const, label: 'Português', flag: '🇧🇷', subtitle: 'Padrão / Principal' },
                  { id: 'en' as const, label: 'English', flag: '🇺🇸', subtitle: 'Internacional / EUA' },
                  { id: 'es' as const, label: 'Español', flag: '🇲🇽', subtitle: 'Latinoamérica' },
                ].map((lang) => {
                  const isActive = formLang === lang.id;
                  const isFilled = activeConsole === 'mission'
                    ? !!projectTranslations[lang.id].name.trim()
                    : !!initiativeTranslations[lang.id].title.trim();

                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setFormLang(lang.id)}
                      className={`flex flex-col sm:flex-row items-center sm:items-start justify-between p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl leading-none">{lang.flag}</span>
                        <div>
                          <p className={`text-xs font-black ${isActive ? 'text-white' : 'text-slate-800'}`}>{lang.label}</p>
                          <p className={`text-[10px] hidden sm:block font-bold ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{lang.subtitle}</p>
                        </div>
                      </div>
                      <span className={`mt-1 sm:mt-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? isFilled ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                          : isFilled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isFilled ? 'Pronto' : 'Vazio'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeConsole === 'mission' ? (
              // --- MISSION FORM FIELDS ---
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                        Nome do Projeto ({formLang === 'pt' ? 'Português 🇧🇷' : formLang === 'en' ? 'Inglês 🇺🇸' : 'Espanhol 🇲🇽'})
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {formLang === 'pt' ? 'Obrigatório' : 'Opcional (fallback: PT)'}
                      </span>
                    </div>
                    <input 
                      required={formLang === 'pt'}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                      value={projectTranslations[formLang].name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjectTranslations(prev => ({
                          ...prev,
                          [formLang]: { ...prev[formLang], name: val }
                        }));
                        if (formLang === 'pt') {
                          setFormData(prev => ({ ...prev, name: val }));
                        }
                      }}
                      placeholder={
                        formLang === 'pt' ? 'Ex: Auxílio Enchentes no Sul' :
                        formLang === 'en' ? 'Ex: Southern Floods Relief' :
                        'Ex: Auxilio Inundaciones del Sur'
                      }
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
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Status do Projeto</label>
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                      Breve Descrição / Sumário ({formLang === 'pt' ? 'Português 🇧🇷' : formLang === 'en' ? 'Inglês 🇺🇸' : 'Espanhol 🇲🇽'})
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formLang === 'pt' ? 'Obrigatório' : 'Opcional (fallback: PT)'}
                    </span>
                  </div>
                  <textarea 
                    required={formLang === 'pt'}
                    rows={2}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                    value={projectTranslations[formLang].description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProjectTranslations(prev => ({
                        ...prev,
                        [formLang]: { ...prev[formLang], description: val }
                      }));
                      if (formLang === 'pt') {
                        setFormData(prev => ({ ...prev, description: val }));
                      }
                    }}
                    placeholder={
                      formLang === 'pt' ? 'Descrição rápida de até 2 parágrafos em português...' :
                      formLang === 'en' ? 'Short summary in English (1-2 paragraphs)...' :
                      'Breve descripción en español (1-2 párrafos)...'
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Premium Multi-Image Upload & Gallery (Up to 5 images) */}
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block flex justify-between items-center">
                      <span>Galeria de Imagens do Projeto ({formImages.length}/5)</span>
                      <span className="text-[10px] text-slate-400 italic font-bold">A primeira imagem será o destaque</span>
                    </label>
                    <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 space-y-4">
                      {/* Grid of added images */}
                      {formImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {formImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-200 group shadow-sm bg-white shrink-0">
                              <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                              <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-black px-2 py-0.5 rounded">
                                #{idx + 1} {idx === 0 ? 'Destaque' : ''}
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-colors shadow flex items-center justify-center opacity-0 group-hover:opacity-100"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new image controls */}
                      {formImages.length < 5 ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                          {/* File input upload */}
                          <label className="flex-1 cursor-pointer">
                            <div className="h-full bg-white border-2 border-dashed border-slate-200 hover:border-accent transition-all rounded-xl py-6 px-4 flex flex-col items-center justify-center gap-1 group text-center">
                              <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-accent transition-colors">cloud_upload</span>
                              <span className="text-xs font-bold text-slate-500">Upload de Arquivo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                          </label>

                          {/* URL input */}
                          <div className="flex-[2] flex flex-col justify-between gap-2 bg-white border-2 border-slate-100 rounded-xl p-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ou Adicionar via URL</label>
                            <div className="flex gap-2">
                              <input 
                                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-accent rounded-lg py-2 px-3 outline-none font-bold text-xs text-slate-800"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-4 py-2 bg-primary hover:bg-slate-800 text-white font-black text-xs rounded-lg transition-colors flex items-center justify-center"
                              >
                                Adicionar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-4 text-xs font-bold text-center">
                          Limite máximo de 5 imagens atingido. Remova uma imagem para adicionar outra.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                      História Completa / Página de Impacto ({formLang === 'pt' ? 'Português 🇧🇷' : formLang === 'en' ? 'Inglês 🇺🇸' : 'Espanhol 🇲🇽'})
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">Opcional</span>
                  </div>
                  <textarea 
                    rows={5}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                    value={projectTranslations[formLang].long_description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProjectTranslations(prev => ({
                        ...prev,
                        [formLang]: { ...prev[formLang], long_description: val }
                      }));
                      if (formLang === 'pt') {
                        setFormData(prev => ({ ...prev, long_description: val }));
                      }
                    }}
                    placeholder={
                      formLang === 'pt' ? 'Escreva a história completa de impacto social em português...' :
                      formLang === 'en' ? 'Write the full social impact story in English...' :
                      'Escribe la historia completa de impacto social en español...'
                    }
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                        Título da Iniciativa ({formLang === 'pt' ? 'Português 🇧🇷' : formLang === 'en' ? 'Inglês 🇺🇸' : 'Espanhol 🇲🇽'})
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {formLang === 'pt' ? 'Obrigatório' : 'Opcional (fallback: PT)'}
                      </span>
                    </div>
                    <input 
                      required={formLang === 'pt'}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                      value={initiativeTranslations[formLang].title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInitiativeTranslations(prev => ({
                          ...prev,
                          [formLang]: { ...prev[formLang], title: val }
                        }));
                        if (formLang === 'pt') {
                          setInitiativeData(prev => ({ ...prev, title: val }));
                        }
                      }}
                      placeholder={
                        formLang === 'pt' ? 'Ex: Camiseta Oficial Building Bridges' :
                        formLang === 'en' ? 'Ex: Official Building Bridges T-Shirt' :
                        'Ex: Camiseta Oficial Building Bridges'
                      }
                    />
                  </div>

                  {/* Linked Project Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Vincular ao Projeto Apoiado</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all appearance-none text-slate-800"
                      value={initiativeData.project_id}
                      onChange={(e) => setInitiativeData({...initiativeData, project_id: e.target.value})}
                    >
                      {projectList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                      {projectList.length === 0 && (
                        <option value="">Nenhum projeto cadastrado</option>
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                      Descrição Detalhada ({formLang === 'pt' ? 'Português 🇧🇷' : formLang === 'en' ? 'Inglês 🇺🇸' : 'Espanhol 🇲🇽'})
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formLang === 'pt' ? 'Obrigatório' : 'Opcional (fallback: PT)'}
                    </span>
                  </div>
                  <textarea 
                    required={formLang === 'pt'}
                    rows={3}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all resize-none text-slate-800"
                    value={initiativeTranslations[formLang].description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInitiativeTranslations(prev => ({
                        ...prev,
                        [formLang]: { ...prev[formLang], description: val }
                      }));
                      if (formLang === 'pt') {
                        setInitiativeData(prev => ({ ...prev, description: val }));
                      }
                    }}
                    placeholder={
                      formLang === 'pt' ? 'Detalhe o produto ou como funcionará a atividade solidária em português...' :
                      formLang === 'en' ? 'Detail the product or community activity in English...' :
                      'Detalle el producto o actividad solidaria en español...'
                    }
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                        Framing de Impacto ({formLang === 'pt' ? 'Português 🇧🇷' : formLang === 'en' ? 'Inglês 🇺🇸' : 'Espanhol 🇲🇽'})
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {formLang === 'pt' ? 'Obrigatório' : 'Opcional (fallback: PT)'}
                      </span>
                    </div>
                    <input 
                      required={formLang === 'pt'}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-accent rounded-xl py-4 px-6 outline-none font-bold transition-all text-slate-800"
                      value={initiativeTranslations[formLang].impact_description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInitiativeTranslations(prev => ({
                          ...prev,
                          [formLang]: { ...prev[formLang], impact_description: val }
                        }));
                        if (formLang === 'pt') {
                          setInitiativeData(prev => ({ ...prev, impact_description: val }));
                        }
                      }}
                      placeholder={
                        formLang === 'pt' ? 'Ex: Garante 5 dias de refeições e água limpa' :
                        formLang === 'en' ? 'Ex: Provides 5 days of meals and clean water' :
                        'Ex: Garantiza 5 días de alimentos y agua potable'
                      }
                    />
                  </div>

                  {/* Premium Multi-Image Upload & Gallery (Up to 5 images) */}
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block flex justify-between items-center">
                      <span>Galeria de Imagens da Iniciativa ({formImages.length}/5)</span>
                      <span className="text-[10px] text-slate-400 italic font-bold">A primeira imagem será o destaque</span>
                    </label>
                    <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 space-y-4">
                      {/* Grid of added images */}
                      {formImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {formImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-200 group shadow-sm bg-white shrink-0">
                              <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                              <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-black px-2 py-0.5 rounded">
                                #{idx + 1} {idx === 0 ? 'Destaque' : ''}
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-colors shadow flex items-center justify-center opacity-0 group-hover:opacity-100"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new image controls */}
                      {formImages.length < 5 ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                          {/* File input upload */}
                          <label className="flex-1 cursor-pointer">
                            <div className="h-full bg-white border-2 border-dashed border-slate-200 hover:border-accent transition-all rounded-xl py-6 px-4 flex flex-col items-center justify-center gap-1 group text-center">
                              <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-accent transition-colors">cloud_upload</span>
                              <span className="text-xs font-bold text-slate-500">Upload de Imagem</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                          </label>

                          {/* URL input */}
                          <div className="flex-[2] flex flex-col justify-between gap-2 bg-white border-2 border-slate-100 rounded-xl p-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ou Adicionar via URL</label>
                            <div className="flex gap-2">
                              <input 
                                className="flex-1 bg-slate-50 border-2 border-transparent focus:border-accent rounded-lg py-2 px-3 outline-none font-bold text-xs text-slate-800"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-4 py-2 bg-primary hover:bg-slate-800 text-white font-black text-xs rounded-lg transition-colors flex items-center justify-center"
                              >
                                Adicionar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-4 text-xs font-bold text-center">
                          Limite máximo de 5 imagens atingido. Remova uma imagem para adicionar outra.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button 
              disabled={loading || isReadingFile}
              type="submit" 
              className="w-full bg-accent hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : isReadingFile ? 'Processando imagem...' : editingId ? 'Salvar Alterações' : activeConsole === 'mission' ? 'Publicar Projeto' : 'Registrar Iniciativa'}
              {!loading && !isReadingFile && <span className="material-symbols-outlined">save</span>}
            </button>
          </form>
        </div>
      ) : (
        // ================== STANDARD LIST VIEW (DASHBOARD) ==================
        <div className="bg-white rounded-3xl border border-primary/5 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 shrink-0">
            <div>
              <h3 className="text-xl font-black text-primary">
                {activeConsole === 'mission' ? 'Projetos Cadastrados' : 'Iniciativas de Apoio'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {activeConsole === 'mission' 
                  ? 'Gerencie projetos humanitários urgentes de auxílio a desastres.' 
                  : 'Gerencie itens e experiências disponíveis para compras e doações.'}
              </p>
            </div>
            <button 
              type="button"
              onClick={handleCreateNew}
              className="px-6 py-3.5 bg-accent hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-accent/20 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {activeConsole === 'mission' ? 'Novo Projeto' : 'Nova Iniciativa'}
            </button>
          </div>

          {activeConsole === 'mission' ? (
            // --- PROJECTS/MISSIONS TABLE LIST ---
            missionsLoading ? (
              <div className="py-12 text-center text-slate-400 font-bold">Carregando projetos...</div>
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
                    {missionsList.map((m) => {
                      const mTrans = typeof m.translations_json === 'string' 
                        ? (() => { try { return JSON.parse(m.translations_json); } catch(e) { return null; } })()
                        : m.translations_json;
                      const hasPt = !!(mTrans?.pt?.name || m.name);
                      const hasEn = !!(mTrans?.en?.name || (getTranslatedProject(m, 'en').name !== m.name));
                      const hasEs = !!(mTrans?.es?.name || (getTranslatedProject(m, 'es').name !== m.name));

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="size-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                              <img src={parseImages(m.image_url)[0] || 'https://picsum.photos/seed/default-mission/1200/800'} alt={m.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-4 px-4 space-y-1">
                            <p className="font-black text-slate-900 text-sm">{m.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.category || 'Geral'}</p>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${hasPt ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>PT</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${hasEn ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>EN</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${hasEs ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}>ES</span>
                              </div>
                            </div>
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
                                className="size-8 rounded-lg bg-slate-100 hover:bg-primary/5 text-slate-500 hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                                title="Editar"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(m.id, m.name)}
                                className="size-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors flex items-center justify-center cursor-pointer"
                                title="Excluir"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 font-bold">Nenhum projeto humanitário cadastrado.</div>
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
                      <th className="py-4 px-4">Projeto Apoiado</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                    {initiativeList.map((i) => {
                      const iTrans = typeof i.translations_json === 'string'
                        ? (() => { try { return JSON.parse(i.translations_json); } catch(e) { return null; } })()
                        : i.translations_json;
                      const hasPt = !!(iTrans?.pt?.title || i.title);
                      const hasEn = !!(iTrans?.en?.title || (getTranslatedInitiative(i, 'en').title !== i.title));
                      const hasEs = !!(iTrans?.es?.title || (getTranslatedInitiative(i, 'es').title !== i.title));

                      return (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="size-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                              <img src={parseImages(i.image_url)[0] || 'https://picsum.photos/seed/default-initiative/800/600'} alt={i.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-4 px-4 space-y-1">
                            <p className="font-black text-slate-900 text-sm">{i.title}</p>
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${hasPt ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>PT</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${hasEn ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>EN</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${hasEs ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}>ES</span>
                            </div>
                          </td>
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
                    );
                  })}
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
              
              <h3 className="text-2xl font-black text-primary mb-2">{t('admin.deleteConfirmTitle')}</h3>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed mb-6">
                {t('admin.deleteConfirmDesc', { name: deleteConfirm.name })}
              </p>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-sm transition-all"
                >
                  {t('admin.btnCancel')}
                </button>
                <button 
                  disabled={loading}
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5"
                >
                  {loading ? t('projects.loading') : t('admin.btnDelete')}
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
