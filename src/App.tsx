import React, { useState, useEffect, useReducer, useRef, useMemo, ReactNode, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SideMenu } from './components/SideMenu';
import { CameraModal } from './components/CameraModal';
import { 
    CustomMenuIcon, AppLogoIcon, LoadingBoxIcon, IconPlus, IconMinus, IconUndo, IconSearch, IconCamera, IconGallery, IconX, IconShare, IconChevronLeft, IconChevronRight,
    IconFileExcel, IconFileText, IconFilePdf, IconWhatsapp, IconTelegram, IconEmail, IconStack, IconChevronDown, IconBell, IconCameraLens, IconSettings, IconExport, IconCalendar, IconInfo, IconSun, IconMoon, IconSave, IconDownload,
    IconBox, IconSpeaker, IconRemote, IconChip, IconTrash, IconCloud, IconCloudOff, IconSun as IconSparkles, IconEye, IconEyeOff
} from './components/icons';
import { generateClaroIcon } from './services/imageGenerator';
import { EquipmentCategory, AppData, DailyData, EquipmentItem, AppNotification, UserProfile } from './types';
import { CATEGORIES, HOLIDAYS_SP } from './constants';

const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const createEmptyDailyData = (): DailyData => {
  const data = {} as Partial<DailyData>;
  CATEGORIES.forEach(category => {
    data[category] = [{ id: generateId(), contract: '', serial: '', photos: [], createdAt: Date.now() }];
  });
  return data as DailyData;
};

const isChristmasPeriod = (): boolean => {
  const now = new Date();
  const month = now.getMonth(); 
  const day = now.getDate();
  return month === 11 && day >= 20 && day <= 25;
};

const generateFullMonthReport = (data: AppData, date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    
    let report = `relatorio mensal de equipamentos\n`;
    report += `${monthName} /. ${year}\n`;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalMonthRegistrations = 0;
    
    // Calculate total registrations first
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = data[dateStr];
        if (dayData) {
            totalMonthRegistrations += Object.values(dayData).flat().filter(isItemActive).length;
        }
    }
    
    report += `total de resgriwtro no mes: ${totalMonthRegistrations}\n\n`;
    
    const categoryTotals: Record<string, number> = {};
    CATEGORIES.forEach(cat => categoryTotals[cat] = 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = data[dateStr];
        
        if (dayData) {
            const dayItems: any[] = [];
            CATEGORIES.forEach(cat => {
                const catItems = (dayData[cat] || []).filter(isItemActive);
                catItems.forEach(item => {
                    dayItems.push({ ...item, category: cat });
                    categoryTotals[cat]++;
                });
            });
            
            if (dayItems.length > 0) {
                report += `data: ${String(day).padStart(2, '0')} ${monthName} ${year}\n`;
                
                // Sort by time
                dayItems.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                
                dayItems.forEach(item => {
                    const time = new Date(item.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    report += `${time} /. ${item.category} /. ${item.contract || '---'} /. ${item.serial || '---'}\n`;
                });
                report += `\n`;
            }
        }
    }

    report += `rsumo final do mes\n\n`;
    CATEGORIES.forEach(cat => {
        report += `${cat.toLowerCase()} : ${categoryTotals[cat]}\n`;
    });
    report += `\ntotal gerado no mes: ${totalMonthRegistrations}\n`;
    
    return report;
};

const downloadTXT = (data: AppData, date: Date) => {
    const reportText = generateFullMonthReport(data, date);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${monthName}_${year}.txt`;
    link.click();
    URL.revokeObjectURL(url);
};

const drawCategoryIcon = (doc: any, category: string, x: number, y: number, size: number) => {
    doc.setLineWidth(0.2);
    doc.setDrawColor(37, 99, 235); // blue-600
    
    if (category === EquipmentCategory.BOX) {
        doc.roundedRect(x, y + 1, size, size * 0.6, 0.5, 0.5);
        doc.circle(x + size * 0.8, y + size * 0.3 + 1, 0.2, 'F');
        doc.line(x + size * 0.2, y + size * 0.3 + 1, x + size * 0.5, y + size * 0.3 + 1);
    } else if (category === EquipmentCategory.BOX_SOUND) {
        doc.roundedRect(x, y + 1, size * 0.7, size * 0.6, 0.5, 0.5);
        doc.circle(x + size * 0.35, y + size * 0.3 + 1, 0.2, 'F');
        doc.line(x + size * 0.8, y + 1, x + size * 0.9, y + 1);
        doc.line(x + size * 0.8, y + size * 0.6 + 1, x + size * 0.9, y + size * 0.6 + 1);
    } else if (category === EquipmentCategory.CONTROLE) {
        doc.roundedRect(x + size * 0.2, y, size * 0.4, size, 0.5, 0.5);
        doc.circle(x + size * 0.4, y + size * 0.2, 0.2, 'F');
    } else if (category === EquipmentCategory.CAMERA) {
        doc.rect(x, y + size * 0.2 + 1, size, size * 0.5);
        doc.circle(x + size * 0.5, y + size * 0.45 + 1, size * 0.15);
    } else if (category === EquipmentCategory.CHIP) {
        doc.rect(x + size * 0.1, y + size * 0.1 + 1, size * 0.6, size * 0.6);
        doc.line(x, y + size * 0.3 + 1, x + size * 0.1, y + size * 0.3 + 1);
        doc.line(x + size * 0.7, y + size * 0.3 + 1, x + size * 0.8, y + size * 0.3 + 1);
    }
};

const exportToPDF = (data: AppData, date: Date) => {
    const doc = new jsPDF();
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("Relatório Mensal de Equipamentos", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${monthName.toUpperCase()} / ${year}`, 14, 30);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const tableData: any[] = [];
    const categoryTotals: Record<string, number> = {};
    CATEGORIES.forEach(cat => categoryTotals[cat] = 0);
    let totalMonthRegistrations = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = data[dateStr];
        
        if (dayData) {
            const dayItems: any[] = [];
            CATEGORIES.forEach(cat => {
                const catItems = (dayData[cat] || []).filter(isItemActive);
                catItems.forEach(item => {
                    dayItems.push({ ...item, category: cat });
                    categoryTotals[cat]++;
                    totalMonthRegistrations++;
                });
            });
            
            dayItems.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            
            dayItems.forEach(item => {
                const time = new Date(item.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                tableData.push([
                    `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`,
                    time,
                    item.category,
                    item.contract || '---',
                    item.serial || '---'
                ]);
            });
        }
    }

    autoTable(doc, {
        startY: 38,
        head: [['Data', 'Hora', 'Categoria', 'Contrato', 'Serial']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const category = data.cell.raw as string;
                const x = data.cell.x + 2;
                const y = data.cell.y + 2;
                drawCategoryIcon(doc, category, x, y, 4);
                // Adjust text position to make room for icon
                data.cell.text = ["    " + category];
            }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    if (finalY > 250) doc.addPage();

    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text("Resumo Final do Mês", 14, finalY > 250 ? 20 : finalY);
    
    let currentY = (finalY > 250 ? 20 : finalY) + 10;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    CATEGORIES.forEach(cat => {
        doc.text(`${cat}: ${categoryTotals[cat]}`, 14, currentY);
        currentY += 7;
    });
    
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Gerado no Mês: ${totalMonthRegistrations}`, 14, currentY + 5);
    
    doc.save(`relatorio_${monthName}_${year}.pdf`);
};

type Action =
  | { type: 'SET_DATA'; payload: AppData }
  | { type: 'ADD_ITEM'; payload: { date: string; category: EquipmentCategory } }
  | { type: 'UPDATE_ITEM'; payload: { date: string; category: EquipmentCategory; item: EquipmentItem } }
  | { type: 'DELETE_SINGLE_ITEM'; payload: { date: string; category: EquipmentCategory; itemId: string } }
  | { type: 'DELETE_MULTIPLE_ITEMS'; payload: { date: string; category: EquipmentCategory; itemIds: string[] } };

const dataReducer = (state: AppData, action: Action): AppData => {
    switch(action.type) {
        case 'SET_DATA': return action.payload;
        case 'ADD_ITEM': {
            const { date, category } = action.payload;
            const newState = JSON.parse(JSON.stringify(state));
            if (!newState[date]) newState[date] = createEmptyDailyData();
            newState[date][category].push({ id: generateId(), contract: '', serial: '', photos: [], createdAt: Date.now() });
            return newState;
        }
        case 'UPDATE_ITEM': {
            const { date, category, item } = action.payload;
            const newState = JSON.parse(JSON.stringify(state));
            if (!newState[date]) newState[date] = createEmptyDailyData();
            const dayData = newState[date][category];
            const itemIndex = dayData.findIndex((i: EquipmentItem) => i.id === item.id);
            if (itemIndex > -1) dayData[itemIndex] = item;
            else dayData.push(item);
            return newState;
        }
        case 'DELETE_SINGLE_ITEM': {
             const { date, category, itemId } = action.payload;
             const newState = JSON.parse(JSON.stringify(state));
             const dayData = newState[date]?.[category];
             if (!dayData) return state;
             newState[date][category] = dayData.filter((item: EquipmentItem) => item.id !== itemId);
             if (newState[date][category].length === 0) {
                 newState[date][category].push({ id: generateId(), contract: '', serial: '', photos: [], createdAt: Date.now() });
             }
             return newState;
        }
        case 'DELETE_MULTIPLE_ITEMS': {
            const { date, category, itemIds } = action.payload;
            if (!itemIds || itemIds.length === 0) return state;
            const newState = JSON.parse(JSON.stringify(state));
            if (!newState[date] || !newState[date][category]) return state;
            newState[date][category] = newState[date][category].filter((item: EquipmentItem) => !itemIds.includes(item.id));
            if (newState[date][category].length === 0) {
                newState[date][category].push({ id: generateId(), contract: '', serial: '', photos: [], createdAt: Date.now() });
            }
            return newState;
        }
        default: return state;
    }
}

const isItemActive = (item: EquipmentItem): boolean => (item.contract && item.contract.trim() !== '') || (item.serial && item.serial.trim() !== '') || item.photos.length > 0;

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600 bg-slate-950 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-black mb-4 uppercase tracking-tighter">Erro Crítico</h1>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[3px] text-[10px]">Recarregar App</button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const getCategoryIcon = (category: EquipmentCategory) => {
    switch(category) {
        case EquipmentCategory.BOX: return IconBox;
        case EquipmentCategory.BOX_SOUND: return IconSpeaker;
        case EquipmentCategory.CONTROLE: return IconRemote;
        case EquipmentCategory.CAMERA: return IconCameraLens;
        case EquipmentCategory.CHIP: return IconChip;
        default: return IconStack;
    }
};

const getCategoryColor = (category: EquipmentCategory) => {
    return { 
        bg: 'bg-blue-600', 
        text: 'text-blue-600', 
        light: 'bg-blue-50', 
        border: 'border-blue-200', 
        glow: 'shadow-[0_10px_25px_rgba(37,99,235,0.4)]'
    };
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [appData, dispatch] = useReducer(dataReducer, {} as AppData);
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    name: 'Leo Luz', 
    cpf: '', 
    profileImage: '',
    menuButtonImage: undefined
  });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeHoliday, setActiveHoliday] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<EquipmentCategory>(CATEGORIES[0]);
  const [cameraTarget, setCameraTarget] = useState<{ category: EquipmentCategory, item: EquipmentItem | 'profile' } | null>(null);
  const [galleryItem, setGalleryItem] = useState<EquipmentItem | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [history, setHistory] = useState<AppData[]>([]);
  const [showMonthlyTotals, setShowMonthlyTotals] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CATEGORIES.forEach(cat => initial[cat] = true);
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [iconPrompt, setIconPrompt] = useState('');
  const [iconRefImage, setIconRefImage] = useState<string | null>(null);
  const [aiAppRequest, setAiAppRequest] = useState('');
  const [isProcessingAiRequest, setIsProcessingAiRequest] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('Estudando seu padrão de uso para sugerir melhorias...');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoginData, setAdminLoginData] = useState({ user: '', pass: '' });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, type: 'all' | 'profile' }>({ show: false, type: 'all' });

  useEffect(() => {
    if (notifications.length > 5) {
      const types = notifications.map(n => n.type);
      const mostFrequent = types.reduce((a, b, i, arr) => 
        (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b), 
        null as string | null
      );
      
      if (mostFrequent === 'Adição') {
        setAiSuggestion("Notei que você está adicionando muitos itens rapidamente. Gostaria que eu habilitasse o preenchimento automático de contratos frequentes?");
      } else if (mostFrequent === 'IA') {
        setAiSuggestion("Você tem usado bastante a IA para ícones. Que tal uma galeria dedicada para salvar suas criações favoritas?");
      }
    }
  }, [notifications]);
  
  const isChristmas = isChristmasPeriod();
  const formattedDate = getFormattedDate(currentDate);
  
  const currentHolidays = useMemo(() => {
    const dayMonth = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return HOLIDAYS_SP[dayMonth] || [];
  }, [currentDate]);

  useEffect(() => {
    const loadInitialData = async () => {
        try {
            const [dataRes, profileRes] = await Promise.all([
                fetch('/api/data'),
                fetch('/api/profile')
            ]);
            if (dataRes.ok) {
                const data = await dataRes.json();
                dispatch({ type: 'SET_DATA', payload: data || {} });
            }
            if (profileRes.ok) setUserProfile(await profileRes.json());
        } catch (err) {
            console.error("Failed to fetch initial data", err);
            setSyncStatus('offline');
        } finally {
            setIsLoading(false);
        }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const syncWithServer = async () => {
        if (!navigator.onLine) { setSyncStatus('offline'); return; }
        setSyncStatus('syncing');
        try {
            await Promise.all([
                fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(appData) }),
                fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userProfile) })
            ]);
            setSyncStatus('synced');
        } catch (err) { setSyncStatus('error'); }
    };
    const debounceTimer = setTimeout(syncWithServer, 2000);
    return () => clearTimeout(debounceTimer);
  }, [appData, userProfile, isLoading]);

  // Midnight reset check
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(new Date());
      }
    };
    const interval = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  const currentDayData = useMemo(() => appData[formattedDate] || createEmptyDailyData(), [appData, formattedDate]);

  const handleUndo = () => {
    if (deleteMode) { setDeleteMode(false); setSelectedForDelete([]); return; }
    if (history.length > 0) {
        const lastState = history[history.length - 1];
        dispatch({ type: 'SET_DATA', payload: lastState });
        setHistory(prev => prev.slice(0, -1));
    }
  };

  const addToHistory = (state: AppData) => {
    setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(state))]);
  };

  const handleAddItem = () => {
    addToHistory(appData);
    dispatch({ type: 'ADD_ITEM', payload: { date: formattedDate, category: activeCategory } });
    addNotification('Adição', `Novo item em ${activeCategory}`);
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length > 0) {
        addToHistory(appData);
        dispatch({ type: 'DELETE_MULTIPLE_ITEMS', payload: { date: formattedDate, category: activeCategory, itemIds: selectedForDelete } });
        addNotification('Exclusão', `${selectedForDelete.length} itens removidos de ${activeCategory}`);
        setSelectedForDelete([]);
        setDeleteMode(false);
    }
  };

  const addNotification = (type: string, details: string) => {
    const newNotif: AppNotification = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type,
        details,
        timestamp: Date.now(),
        read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAdminLogin = () => {
    console.log('Attempting admin login...', adminLoginData);
    if (adminLoginData.user.trim() === 'Leo' && adminLoginData.pass.trim() === 'leopri301102') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      addNotification('Sistema', 'Acesso de administrador concedido.');
      console.log('Admin login successful');
    } else {
      addNotification('Erro', 'Usuário ou senha de administrador incorretos.');
      console.log('Admin login failed');
    }
  };
  const totalActiveItems = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    
    return Object.entries(appData).reduce((acc: number, [dateStr, day]) => {
        if (!day) return acc;
        const d = new Date(dateStr + 'T12:00:00');
        // Filter by same month/year AND day <= selected day
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && d.getDate() <= currentDay) {
            return acc + Object.values(day).flat().filter(isItemActive).length;
        }
        return acc;
    }, 0);
  }, [appData, currentDate]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    
    CATEGORIES.forEach(cat => {
        let count = 0;
        Object.entries(appData).forEach(([dateStr, day]) => {
            if (!day) return;
            const d = new Date(dateStr + 'T12:00:00');
            // Filter by same month/year AND day <= selected day
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && d.getDate() <= currentDay) {
                if (day[cat]) count += day[cat].filter(isItemActive).length;
            }
        });
        totals[cat] = count;
    });
    return totals;
  }, [appData, currentDate]);

  const somaTotalGeral = useMemo(() => {
    return Object.values(categoryTotals).reduce((a: number, b: number) => a + b, 0);
  }, [categoryTotals]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results: { date: string; category: EquipmentCategory; item: EquipmentItem }[] = [];
    Object.entries(appData).forEach(([date, dayData]) => {
      if (!dayData) return;
      Object.entries(dayData).forEach(([category, items]) => {
        items.forEach(item => {
          if (item.contract.toLowerCase().includes(searchQuery.toLowerCase()) || item.serial.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ date, category: category as EquipmentCategory, item });
          }
        });
      });
    });
    return results.sort((a, b) => (b.item.createdAt || 0) - (a.item.createdAt || 0));
  }, [appData, searchQuery]);

  const handleCameraCapture = (data: string, type: 'qr' | 'photo') => {
    if (!cameraTarget) return;
    if (cameraTarget.item === 'profile') {
        setUserProfile(prev => ({ ...prev, profileImage: data }));
    } else {
        const item = cameraTarget.item as EquipmentItem;
        if (type === 'qr') {
            if ('vibrate' in navigator) navigator.vibrate(100);
            dispatch({ type: 'UPDATE_ITEM', payload: { date: formattedDate, category: cameraTarget.category, item: { ...item, serial: data } } });
        } else {
            dispatch({ type: 'UPDATE_ITEM', payload: { date: formattedDate, category: cameraTarget.category, item: { ...item, photos: [...item.photos, data] } } });
        }
    }
    setCameraTarget(null);
  };

  const handleGenerateIcon = async () => {
    setIsGeneratingIcon(true);
    try {
      const newIcon = await generateClaroIcon(iconPrompt, iconRefImage || undefined);
      if (newIcon) {
        setUserProfile(prev => ({ ...prev, menuButtonImage: newIcon }));
        addNotification('IA', 'Novo ícone do Claro Box gerado com sucesso!');
        setIconPrompt('');
        setIconRefImage(null);
      }
    } catch (err) {
      console.error("Failed to generate icon", err);
      addNotification('Erro', 'Falha ao gerar ícone com IA');
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  if (isLoading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[100]">
      <div className="relative w-32 h-32 mb-8">
        <CustomMenuIcon src={userProfile.menuButtonImage} className="w-full h-full" />
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-4 right-8 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e] border border-white/20"
        />
      </div>
      <p className="font-black uppercase tracking-[6px] text-[10px] text-slate-300 animate-pulse">Iniciando Controle...</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-x-hidden bg-slate-50 font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50"></div>
      </div>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onMenuClick={setActiveModal} userProfile={userProfile} isAdmin={isAdmin} />

      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-white/40">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(true)} 
                    className="relative"
                >
                    <AppLogoIcon 
                        src={userProfile.menuButtonImage} 
                        className="w-11 h-11 shadow-lg rounded-[22%] border border-white/40" 
                    />
                </motion.button>
                <div className="flex flex-col">
                    <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{userProfile.name}</h1>
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-[3px] mt-1">Equipamentos</span>
                </div>
            </div>
            
            <div className="flex gap-1.5 items-center">
                <motion.button 
                    whileTap={{ scale: 0.9, backgroundColor: '#2563eb', color: '#fff' }}
                    onClick={handleAddItem} 
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/60 backdrop-blur-md text-blue-600 border border-white/60 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] transition-colors duration-200"
                >
                    <IconPlus className="w-3.5 h-3.5"/>
                </motion.button>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        if (selectedForDelete.length > 0) {
                            handleDeleteSelected();
                        } else {
                            setDeleteMode(!deleteMode);
                            setSelectedForDelete([]);
                        }
                    }} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] border backdrop-blur-md ${
                        deleteMode || selectedForDelete.length > 0 
                        ? 'bg-red-600/90 text-white border-red-500 scale-110 shadow-red-600/20' 
                        : 'bg-white/60 text-red-600 border-white/60'
                    }`}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedForDelete.length > 0 ? 'trash' : 'minus'}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            {selectedForDelete.length > 0 ? <IconTrash className="w-3.5 h-3.5"/> : <IconMinus className="w-3.5 h-3.5"/>}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={handleUndo} 
                    disabled={!deleteMode && history.length === 0} 
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-blue-600 border border-blue-100 shadow-[0_4px_12px_rgba(37,99,235,0.1)] disabled:opacity-30 disabled:shadow-none"
                >
                    <IconUndo className="w-3.5 h-3.5"/>
                </motion.button>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveModal('search')} 
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-slate-400 border border-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                >
                    <IconSearch className="w-3.5 h-3.5"/>
                </motion.button>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setActiveModal('notifications'); }} 
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-slate-400 border border-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] relative"
                >
                    <IconBell className="w-3.5 h-3.5"/>
                    {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-white shadow-[0_0_5px_#22c55e]"></span>}
                </motion.button>
            </div>
        </div>

        <div className="flex flex-col items-center mb-6 relative">
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setViewDate(new Date(currentDate)); setActiveModal('calendar'); }} 
                className="px-3 py-1 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-1.5"
            >
                <IconCalendar className="w-2.5 h-2.5 text-slate-400" />
                <span className="font-black text-[8px] tracking-[1.5px] text-slate-800">
                    {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
            </motion.button>
            {currentHolidays.length > 0 && (
                <div className="absolute left-[calc(50%+60px)] top-1/2 -translate-y-1/2 flex gap-1 z-10">
                    {currentHolidays.map((holiday, idx) => (
                        <motion.button
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveHoliday(currentHolidays)}
                            className="w-8 h-8 rounded-full bg-white shadow-lg border border-slate-50 flex items-center justify-center text-lg"
                        >
                            {holiday.icon}
                        </motion.button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex gap-1.5 px-6 justify-between mb-2">
            {CATEGORIES.map(cat => {
                const Icon = getCategoryIcon(cat);
                const isActive = activeCategory === cat;
                const catColor = getCategoryColor(cat);
                const count = (currentDayData[cat] || []).filter(isItemActive).length;
                return (
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        key={cat}
                        onClick={() => {
                            setActiveCategory(cat);
                            setCollapsedCategories(prev => ({ ...prev, [cat]: true }));
                        }}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 p-1 rounded-xl aspect-square transition-all relative ${isActive ? `${catColor.bg} text-white ${catColor.glow} scale-105 z-10` : 'bg-white text-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50'}`}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-300'}`}/>
                        </div>
                        <span className={`text-[4px] font-black uppercase tracking-[0.5px] ${isActive ? 'text-white/90' : 'text-slate-400'}`}>{cat}</span>
                        <CountBadge count={count} />
                    </motion.button>
                );
            })}
        </div>
      </header>

      <main className="flex-1 px-3 space-y-4 mt-4 pb-48 relative z-10 overflow-visible">
          <div className="space-y-3 overflow-visible">
              <motion.div 
                  layout
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCollapsedCategories(prev => ({ ...prev, [activeCategory]: !prev[activeCategory] }))}
                  className={`flex items-center justify-center px-6 py-2.5 rounded-full shadow-lg border cursor-pointer transition-all duration-500 ${
                      !collapsedCategories[activeCategory] 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-400 scale-[1.01]' 
                      : 'bg-white text-slate-800 border-slate-100'
                  }`}
              >
                  <span className="text-sm font-black uppercase tracking-[2px]">{activeCategory}</span>
              </motion.div>

              <div className="overflow-visible">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={activeCategory + (collapsedCategories[activeCategory] ? '-collapsed' : '-expanded')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 overflow-visible"
                    >
                        {/* Always show the active/last row */}
                        <EquipmentItemRow 
                            category={activeCategory}
                            item={currentDayData[activeCategory][currentDayData[activeCategory].length - 1]} 
                            onUpdate={(item: any, forceAdd?: boolean) => { 
                                addToHistory(appData); 
                                dispatch({ type: 'UPDATE_ITEM', payload: { date: formattedDate, category: activeCategory, item } });
                                // Auto-add when serial is complete (20 chars) or forced (on paste)
                                if (forceAdd || (item.serial && item.serial.length === 20)) {
                                    dispatch({ type: 'ADD_ITEM', payload: { date: formattedDate, category: activeCategory } });
                                }
                            }}
                            onDelete={(id: string) => dispatch({ type: 'DELETE_SINGLE_ITEM', payload: { date: formattedDate, category: activeCategory, itemId: id } })}
                            onGallery={setGalleryItem}
                            onCamera={(item: any) => setCameraTarget({ category: activeCategory, item })}
                            deleteMode={deleteMode}
                            selectedForDelete={selectedForDelete}
                            onToggleSelect={(id: string) => setSelectedForDelete(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                        />

                        {collapsedCategories[activeCategory] ? (
                            <div className="mt-16 flex flex-col items-center px-4">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full max-w-[380px] bg-slate-50/40 rounded-[4rem] py-8 px-6 flex flex-col items-center gap-2"
                                >
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[2px] text-center opacity-70">
                                        {currentDayData[activeCategory].filter(isItemActive).length} ITENS CONCLUÍDOS OCULTOS
                                    </span>
                                    <motion.button 
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setCollapsedCategories(prev => ({ ...prev, [activeCategory]: false }))}
                                        className="text-blue-500/70 font-bold text-[8px] uppercase tracking-[1.2px] underline underline-offset-4 decoration-blue-500/30"
                                    >
                                        Expandir para ver todos
                                    </motion.button>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentDayData[activeCategory].slice(0, -1).reverse().map((item: any) => (
                                    <EquipmentItemRow 
                                        key={item.id} 
                                        category={activeCategory}
                                        item={item} 
                                        onUpdate={(item: any) => dispatch({ type: 'UPDATE_ITEM', payload: { date: formattedDate, category: activeCategory, item } })}
                                        onDelete={(id: string) => dispatch({ type: 'DELETE_SINGLE_ITEM', payload: { date: formattedDate, category: activeCategory, itemId: id } })}
                                        onGallery={setGalleryItem}
                                        onCamera={(item: any) => setCameraTarget({ category: activeCategory, item })}
                                        deleteMode={deleteMode}
                                        selectedForDelete={selectedForDelete}
                                        onToggleSelect={(id: string) => setSelectedForDelete(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                                    />
                                ))}
                                <div className="mt-10 flex justify-center">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setCollapsedCategories(prev => ({ ...prev, [activeCategory]: true }))}
                                        className="text-slate-400 font-bold text-[8px] uppercase tracking-[2px] underline underline-offset-4 decoration-slate-200"
                                    >
                                        Recolher Histórico
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
              </div>
          </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/60 backdrop-blur-xl p-4 pb-8 shadow-[0_-6px_30px_rgba(0,0,0,0.04)] max-w-[480px] mx-auto w-full rounded-t-[2.5rem] border-t border-white/40">
          <div className="flex items-center justify-between px-2">
              <div className="flex items-center justify-between flex-1 pr-4">
                  {CATEGORIES.map(cat => {
                      const Icon = getCategoryIcon(cat);
                      const count = showMonthlyTotals 
                        ? categoryTotals[cat] 
                        : (currentDayData[cat] || []).filter(isItemActive).length;
                      return (
                        <div key={cat} className="flex flex-col items-center">
                            <Icon className={`w-4 h-4 mb-1 transition-colors ${showMonthlyTotals ? 'text-purple-600' : 'text-slate-800 opacity-70'}`}/>
                            <span className={`text-[10px] font-black transition-colors ${showMonthlyTotals ? 'text-purple-600' : 'text-blue-600'}`}>{count}</span>
                        </div>
                      );
                  })}
              </div>
              
              <div className="flex items-center gap-6 shrink-0 border-l border-white/20 pl-6">
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Dia</span>
                    <span className="text-2xl font-black leading-none text-blue-600">{Object.values(currentDayData).flat().filter(isItemActive).length}</span>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMonthlyTotals(!showMonthlyTotals)}
                    className="flex flex-col items-center"
                >
                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1 transition-colors ${showMonthlyTotals ? 'text-purple-600' : 'text-purple-400'}`}>Mês</span>
                    <div className={`rounded-2xl px-5 py-2.5 transition-all border shadow-[0_0_0_1px_rgba(255,255,255,0.4)] flex items-center justify-center min-w-[80px] backdrop-blur-md ${showMonthlyTotals ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-white/40 scale-105 shadow-purple-600/30' : 'bg-white/60 border-white/60'}`}>
                        <span className={`text-2xl font-black leading-none transition-colors ${showMonthlyTotals ? 'text-white' : 'text-purple-600'}`}>{somaTotalGeral}</span>
                    </div>
                </motion.button>
              </div>
          </div>
      </footer>

      {confirmModal.show && (
          <Modal title="Atenção" onClose={() => setConfirmModal({ ...confirmModal, show: false })} hideHeader>
              <div className="py-6 text-center space-y-8">
                  <div className="w-20 h-20 bg-red-50 rounded-[22%] flex items-center justify-center mx-auto border-2 border-red-100 shadow-inner">
                      <IconTrash className="w-10 h-10 text-red-500"/>
                  </div>
                  <div className="space-y-3">
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Perigo Extremo!</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] leading-relaxed px-4">
                          {confirmModal.type === 'all' 
                            ? "VOCÊ ESTÁ PRESTES A APAGAR TODAS AS TAREFAS E DADOS DO APP. ESTA AÇÃO É IRREVERSÍVEL!" 
                            : "VOCÊ ESTÁ PRESTES A RESETAR SEU PERFIL E ÍCONE GERADO POR I.A. PARA O PADRÃO."}
                      </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                        className="py-5 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase tracking-[3px] text-[11px] active:scale-95 transition-all"
                      >
                        Não
                      </motion.button>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                            const defaultProfile = { 
                                name: 'Leo Luz', 
                                cpf: '', 
                                profileImage: '',
                                menuButtonImage: undefined
                            };
                            
                            if (confirmModal.type === 'all') {
                                dispatch({ type: 'SET_DATA', payload: {} });
                                setUserProfile(defaultProfile);
                                setNotifications([]);
                                setHistory([]);
                                
                                // Immediate sync for critical clear action
                                try {
                                    await Promise.all([
                                        fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }),
                                        fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(defaultProfile) })
                                    ]);
                                } catch (err) { console.error("Immediate sync failed", err); }
                            } else {
                                setUserProfile(defaultProfile);
                                try {
                                    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(defaultProfile) });
                                } catch (err) { console.error("Immediate profile sync failed", err); }
                            }
                            setConfirmModal({ ...confirmModal, show: false });
                            setActiveModal(null);
                        }}
                        className="py-5 bg-red-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-[11px] active:scale-95 transition-all shadow-xl shadow-red-600/30"
                      >
                        Sim
                      </motion.button>
                  </div>
              </div>
          </Modal>
      )}

      {galleryItem && <PhotoGalleryModal item={galleryItem} onClose={() => setGalleryItem(null)} />}
      {cameraTarget && <CameraModal target={cameraTarget.item} onClose={() => setCameraTarget(null)} onCapture={handleCameraCapture} />}
      
      {activeHoliday && (
          <Modal title="Data Especial" onClose={() => setActiveHoliday(null)}>
              <div className="space-y-6 py-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {Array.isArray(activeHoliday) ? activeHoliday.map((holiday, idx) => (
                      <div key={idx} className="text-center border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                          <div className="text-5xl mb-4">{holiday.icon}</div>
                          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">{holiday.name}</h2>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[3px] mb-4">{holiday.type === 'holiday' ? 'Feriado' : 'Data Comemorativa'}</p>
                          <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 shadow-inner">
                              <p className="text-[10px] font-black text-slate-600 leading-relaxed">{holiday.description}</p>
                          </div>
                      </div>
                  )) : (
                      <div className="text-center">
                          <div className="text-5xl mb-6">{activeHoliday.icon}</div>
                          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">{activeHoliday.name}</h2>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-6">{activeHoliday.type === 'holiday' ? 'Feriado Nacional' : 'Data Comemorativa'}</p>
                          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
                              <p className="text-[11px] font-black text-slate-600 leading-relaxed">{activeHoliday.description}</p>
                          </div>
                      </div>
                  )}
              </div>
          </Modal>
      )}

      {activeModal === 'search' && (
          <Modal title="Pesquisar" onClose={() => setActiveModal(null)}>
              <div className="space-y-4">
                  <div className="relative">
                      <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"/>
                      <input type="text" autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Contrato ou Serial..." className="w-full py-4 pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black text-sm text-slate-800 focus:bg-white transition-all shadow-inner" />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-2 no-scrollbar">
                      {searchResults.map((res, i) => (
                          <motion.button 
                              whileTap={{ scale: 0.98 }}
                              key={i} 
                              onClick={() => { setCurrentDate(new Date(res.date + 'T12:00:00')); setActiveCategory(res.category); setActiveModal(null); }} 
                              className="w-full text-left p-4 rounded-2xl bg-white border border-slate-100 flex flex-col gap-1 active:scale-[0.98] transition-all shadow-sm"
                          >
                              <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{res.category}</span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(res.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                              </div>
                              <p className="text-xs font-black text-slate-800">CTR: {res.item.contract || '---'}</p>
                              <p className="text-[10px] font-black text-slate-400">SN: {res.item.serial || '---'}</p>
                          </motion.button>
                      ))}
                  </div>
              </div>
          </Modal>
      )}

      {activeModal === 'export' && (
          <Modal title="Relatórios e Backup" onClose={() => setActiveModal(null)}>
              <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { const dataStr = JSON.stringify(appData); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `backup_${formattedDate}.json`; link.click(); }} 
                        className="py-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all"
                      >
                          <IconDownload className="w-6 h-6 text-blue-600"/>
                          <span className="font-black uppercase text-[9px] tracking-[2px] text-slate-500">Exportar JSON</span>
                      </motion.button>
                      <div className="relative">
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            className="w-full h-full py-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all"
                          >
                              <IconExport className="w-6 h-6 text-blue-600"/>
                              <span className="font-black uppercase text-[9px] tracking-[2px] text-slate-500">Importar JSON</span>
                          </motion.button>
                          <input type="file" accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { try { const json = JSON.parse(event.target?.result as string); dispatch({ type: 'SET_DATA', payload: json }); setActiveModal(null); } catch (err) { alert("Arquivo inválido"); } }; reader.readAsText(file); } }} />
                      </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-6">
                      <div className="space-y-3">
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => downloadTXT(appData, currentDate)} 
                            className="w-full py-5 bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                          >
                              <IconFileText className="w-6 h-6"/>
                              <span className="font-black uppercase text-[10px] tracking-[2px]">Exportar Relatório TXT</span>
                          </motion.button>
                          <div className="grid grid-cols-2 gap-3">
                              <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { const text = generateFullMonthReport(appData, currentDate); window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }} 
                                className="py-4 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                  <IconWhatsapp className="w-5 h-5"/>
                                  <span className="font-black uppercase text-[8px] tracking-[1px]">WhatsApp</span>
                              </motion.button>
                              <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { const text = generateFullMonthReport(appData, currentDate); window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank'); }} 
                                className="py-4 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                  <IconTelegram className="w-5 h-5"/>
                                  <span className="font-black uppercase text-[8px] tracking-[1px]">Telegram</span>
                              </motion.button>
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => exportToPDF(appData, currentDate)} 
                            className="w-full py-5 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                          >
                              <IconFilePdf className="w-6 h-6"/>
                              <span className="font-black uppercase text-[10px] tracking-[2px]">Exportar Relatório PDF</span>
                          </motion.button>
                          <div className="grid grid-cols-2 gap-3">
                              <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { const text = `Resumo do Relatório PDF de ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} gerado com sucesso!`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }} 
                                className="py-4 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                  <IconWhatsapp className="w-5 h-5"/>
                                  <span className="font-black uppercase text-[8px] tracking-[1px]">WhatsApp</span>
                              </motion.button>
                              <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { const text = `Resumo do Relatório PDF de ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} gerado com sucesso!`; window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank'); }} 
                                className="py-4 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                  <IconTelegram className="w-5 h-5"/>
                                  <span className="font-black uppercase text-[8px] tracking-[1px]">Telegram</span>
                              </motion.button>
                          </div>
                      </div>
                  </div>
              </div>
          </Modal>
      )}

      <AnimatePresence>
        {activeModal === 'settings' && (
            <Modal title="Configurações" onClose={() => setActiveModal(null)}>
                <div className="space-y-8 py-4">
                    <div className="flex flex-col items-center">
                        <div className="flex gap-4 items-end">
                            <div onClick={() => setCameraTarget({ category: activeCategory, item: 'profile' })} className="relative w-24 h-24 rounded-[22%] bg-slate-50 border-2 border-slate-100 overflow-hidden cursor-pointer shadow-inner flex items-center justify-center group">
                                {userProfile.profileImage ? <img src={userProfile.profileImage} className="w-full h-full object-cover" /> : <IconCamera className="w-8 h-8 text-slate-300"/>}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><IconCameraLens className="w-6 h-6 text-white"/></div>
                            </div>
                            <div className="relative">
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm"
                                >
                                    <IconGallery className="w-4 h-4"/>
                                </motion.button>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => setUserProfile({...userProfile, profileImage: event.target?.result as string});
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <p className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Foto de Perfil</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mb-2 block ml-2">Nome de Usuário</label>
                            <input type="text" value={userProfile.name} onChange={e => setUserProfile({...userProfile, name: e.target.value})} className="w-full py-5 px-8 rounded-3xl bg-slate-50 border border-slate-100 outline-none font-black text-sm text-slate-800 focus:bg-white transition-all shadow-inner" />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mb-2 block ml-2">CPF</label>
                            <input type="text" value={userProfile.cpf} onChange={e => setUserProfile({...userProfile, cpf: e.target.value})} className="w-full py-5 px-8 rounded-3xl bg-slate-50 border border-slate-100 outline-none font-black text-sm text-slate-800 focus:bg-white transition-all shadow-inner" />
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[4px] mb-4 block text-center">Ícone do Menu</label>
                            <div className="flex items-center justify-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[22%] bg-slate-50 border-2 border-slate-100 overflow-hidden shadow-inner flex items-center justify-center group cursor-pointer">
                                        <AppLogoIcon src={userProfile.menuButtonImage} className="w-full h-full" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><IconCameraLens className="w-5 h-5 text-white"/></div>
                                    </div>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { setUserProfile({...userProfile, menuButtonImage: event.target?.result as string}); }; reader.readAsDataURL(file); } }} />
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {isAdmin ? (
                                    <>
                                        <motion.button 
                                          whileTap={{ scale: 0.98 }}
                                          onClick={handleGenerateIcon}
                                          disabled={isGeneratingIcon}
                                          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[2px] text-[10px] transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.4)] border border-white/60 backdrop-blur-md ${isGeneratingIcon ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50/80 text-indigo-600 active:scale-95'}`}
                                        >
                                          <IconSparkles className={`w-4 h-4 ${isGeneratingIcon ? 'animate-spin' : ''}`} />
                                          {isGeneratingIcon ? 'Gerando Ícone...' : 'Gerar Ícone com IA'}
                                        </motion.button>
                                        
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                placeholder="DESCREVA O ÍCONE..." 
                                                value={iconPrompt}
                                                onChange={e => setIconPrompt(e.target.value)}
                                                className="w-full py-4 pl-6 pr-14 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black text-[10px] text-slate-800 placeholder-slate-300 focus:bg-white transition-all shadow-inner"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <div className="relative">
                                                    <motion.button 
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`p-2 rounded-xl transition-all ${iconRefImage ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                                                    >
                                                        <IconGallery className="w-4 h-4"/>
                                                    </motion.button>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (event) => setIconRefImage(event.target?.result as string);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {iconRefImage && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                                                <div className="w-6 h-6 rounded-md overflow-hidden border border-green-200">
                                                    <img src={iconRefImage} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Imagem de referência anexada</span>
                                                <button onClick={() => setIconRefImage(null)} className="ml-auto text-green-600 hover:text-red-500 transition-colors"><IconX className="w-3 h-3"/></button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <motion.button 
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowAdminLogin(true)}
                                        className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[2px] text-[10px] transition-all bg-slate-100 text-slate-600 border border-slate-200 active:scale-95"
                                    >
                                        <IconSettings className="w-4 h-4" />
                                        Opções do Administrador
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-4 ml-2">
                                    <IconSparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Assistente de IA Dinâmica</label>
                                </div>
                                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 space-y-4">
                                    <p className="text-[10px] font-black text-indigo-600/70 leading-relaxed uppercase tracking-wider">
                                        A IA estuda seu uso diário para sugerir melhorias na estrutura do app.
                                    </p>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Solicitar Alteração Estrutural</label>
                                        <textarea 
                                            value={aiAppRequest}
                                            onChange={e => setAiAppRequest(e.target.value)}
                                            placeholder="EX: ADICIONE UM CAMPO DE OBSERVAÇÃO EM CADA ITEM..."
                                            className="w-full h-24 py-4 px-6 rounded-2xl bg-white border border-indigo-100 outline-none font-black text-[10px] text-slate-800 placeholder-slate-200 focus:border-indigo-300 transition-all shadow-inner resize-none"
                                        />
                                    </div>

                                    <motion.button 
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isProcessingAiRequest || !aiAppRequest}
                                        onClick={() => {
                                            setIsProcessingAiRequest(true);
                                            setTimeout(() => {
                                                setIsProcessingAiRequest(false);
                                                addNotification('IA', `Solicitação de alteração enviada: "${aiAppRequest.substring(0, 30)}..."`);
                                                setAiAppRequest('');
                                            }, 2000);
                                        }}
                                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[2px] text-[10px] transition-all ${isProcessingAiRequest ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active:scale-95'}`}
                                    >
                                        {isProcessingAiRequest ? 'Processando...' : 'Aplicar Melhoria com IA'}
                                    </motion.button>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Sugestão Atual da IA</span>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-indigo-50 flex items-start gap-3">
                                            <IconInfo className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                                            <p className="text-[9px] font-black text-slate-500 leading-tight italic">
                                                "{aiSuggestion}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3 pt-4">
                        <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveModal(null)} 
                            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[3px] text-[10px] active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                        >
                            Salvar Perfil
                        </motion.button>
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setConfirmModal({ show: true, type: 'profile' })} 
                                className="py-3.5 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-black uppercase tracking-[2px] text-[8px] active:scale-95 transition-all"
                            >
                                Limpar Perfil
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setConfirmModal({ show: true, type: 'all' })} 
                                className="py-3.5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[2px] text-[8px] active:scale-95 transition-all shadow-md shadow-red-600/20"
                            >
                                Limpar Tudo
                            </motion.button>
                        </div>
                    </div>
                </div>
            </Modal>
        )}

        {activeModal === 'about' && (
            <Modal title="Sobre o App" onClose={() => setActiveModal(null)}>
                <div className="flex flex-col items-center py-6">
                    <div className="relative mb-8">
                        <CustomMenuIcon src={userProfile.menuButtonImage} className="w-32 h-32"/>
                    </div>
                    
                    <div className="text-center space-y-1 mb-10">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stream+ Control</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-px w-4 bg-slate-200"></span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[4px]">Versão 1.0.3</p>
                            <span className="h-px w-4 bg-slate-200"></span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-50/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                        
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[4px] mb-2">Desenvolvido por</p>
                                <p className="text-2xl font-black text-slate-800 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">Leo Luz</p>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-200/60 text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[2px] leading-relaxed max-w-[200px] mx-auto">
                                    SISTEMA INTELIGENTE DE GESTÃO<br/>E CONTROLE DE ATIVOS CLARO.
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600/20"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-600/40"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-600/20"></div>
                        </div>
                    </div>
                </div>
            </Modal>
        )}

        {activeModal === 'notifications' && (
            <Modal title="Notificações" onClose={() => setActiveModal(null)}>
                <div className="flex justify-end mb-4">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={clearNotifications}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl"
                    >
                        <IconTrash className="w-3 h-3"/>
                        Limpar
                    </motion.button>
                </div>
                <div className="space-y-3 max-h-[450px] overflow-y-auto no-scrollbar py-2">
                    {notifications
                      .filter(n => isAdmin || n.type !== 'IA')
                      .length > 0 ? notifications
                      .filter(n => isAdmin || n.type !== 'IA')
                      .map(n => (
                        <motion.div 
                            key={n.id} 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => markAsRead(n.id)}
                            className={`p-5 rounded-[2rem] border flex items-center gap-5 shadow-sm transition-all cursor-pointer ${n.read ? 'bg-white opacity-60 border-slate-50' : 'bg-slate-50 border-slate-100'}`}
                        >
                            <div className={`w-3 h-3 rounded-full shrink-0 ${n.read ? 'bg-slate-200' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{n.type}</span>
                                    <span className="text-[8px] font-black text-slate-400">{n.time}</span>
                                </div>
                                <p className="text-[11px] font-black text-slate-500 leading-tight">{n.details}</p>
                                {n.type === 'Erro' && !n.read && isAdmin && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Descreva a correção..." 
                                            className="w-full py-2 px-4 rounded-xl bg-white border border-slate-100 text-[9px] font-black outline-none focus:border-blue-200"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button 
                                            className="bg-blue-600 text-white py-2 rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addNotification('IA', 'Correção enviada para análise da IA...');
                                                markAsRead(n.id);
                                            }}
                                        >
                                            Corrigir com IA
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )) : <div className="text-center py-16"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma atividade</p></div>}
                </div>
            </Modal>
        )}

        {showAdminLogin && (
            <Modal title="Login Administrador" onClose={() => setShowAdminLogin(false)}>
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                            <input 
                                type="text" 
                                value={adminLoginData.user}
                                onChange={e => setAdminLoginData({...adminLoginData, user: e.target.value})}
                                onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                                className="w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black text-[10px] text-slate-800 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative">
                                <input 
                                    type={showAdminPassword ? "text" : "password"} 
                                    value={adminLoginData.pass}
                                    onChange={e => setAdminLoginData({...adminLoginData, pass: e.target.value})}
                                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                                    className="w-full py-4 pl-6 pr-14 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black text-[10px] text-slate-800 focus:bg-white transition-all"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showAdminPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAdminLogin}
                        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-[11px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        Entrar
                    </motion.button>
                </div>
            </Modal>
        )}
        {activeModal === 'calendar' && (
            <Modal title="Selecionar Data" onClose={() => setActiveModal(null)} hideHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between px-4">
                        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }} className="p-3 rounded-2xl bg-slate-50 text-slate-400 active:scale-95 transition-all"><IconChevronLeft className="w-6 h-6"/></button>
                        <span className="font-black uppercase text-[12px] tracking-[4px] text-slate-800">{viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }} className="p-3 rounded-2xl bg-slate-50 text-slate-400 active:scale-95 transition-all"><IconChevronRight className="w-6 h-6"/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="h-10 flex items-center justify-center text-[10px] font-black text-slate-300">{d}</div>)}
                        {(() => {
                            const year = viewDate.getFullYear(); const month = viewDate.getMonth(); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const days = [];
                            for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
                            for (let day = 1; day <= daysInMonth; day++) {
                                const d = new Date(year, month, day); const isToday = getFormattedDate(new Date()) === getFormattedDate(d); const isSelected = getFormattedDate(currentDate) === getFormattedDate(d);
                                const dayMonth = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}`; 
                                const holidays = HOLIDAYS_SP[dayMonth] || [];
                                const mainHoliday = holidays[0];
                                days.push(
                                  <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    key={day} 
                                    onClick={() => { setCurrentDate(d); setActiveModal(null); }} 
                                    className={`h-12 aspect-square rounded-full font-black text-[12px] transition-all relative flex flex-col items-center justify-center ${isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : mainHoliday ? `${mainHoliday.color} text-white shadow-md` : isToday ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 active:bg-slate-100'}`}
                                  >
                                    {holidays.length > 0 && (
                                      <div className="absolute -top-1 -right-1 flex -space-x-1">
                                        {holidays.slice(0, 2).map((h, i) => (
                                          <span key={i} className="text-[10px] drop-shadow-sm bg-white rounded-full w-4 h-4 flex items-center justify-center border border-slate-50">{h.icon}</span>
                                        ))}
                                      </div>
                                    )}
                                    <span>{day}</span>
                                    {(() => {
                                        const dateStr = getFormattedDate(d);
                                        const dayData = appData[dateStr];
                                        const hasActive = dayData && Object.values(dayData as DailyData).some(items => (items as EquipmentItem[]).some(isItemActive));
                                        return hasActive && !isSelected && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />;
                                    })()}
                                  </motion.button>
                                );
                            }
                            return days;
                        })()}
                    </div>
                </div>
            </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const CountBadge = ({ count }: { count: number }) => {
    const [isChanging, setIsChanging] = useState(false);
    const prevCount = useRef(count);

    useEffect(() => {
        if (prevCount.current !== count) {
            setIsChanging(true);
            const timer = setTimeout(() => setIsChanging(false), 1000);
            prevCount.current = count;
            return () => clearTimeout(timer);
        }
    }, [count]);

    if (count === 0) return null;

    return (
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
                scale: isChanging ? [1, 1.8, 1] : 1,
                backgroundColor: isChanging ? "#22c55e" : "#dc2626",
                opacity: 1,
                boxShadow: isChanging 
                    ? [
                        "0 0 0px rgba(34, 197, 94, 0)",
                        "0 0 40px rgba(34, 197, 94, 1)",
                        "0 0 15px rgba(34, 197, 94, 0.8)"
                      ]
                    : [
                        "0 0 0px rgba(239, 68, 68, 0)",
                        "0 0 15px rgba(239, 68, 68, 0.5)",
                        "0 0 5px rgba(239, 68, 68, 0.3)"
                      ]
            }}
            transition={{ 
                duration: 0.6,
                scale: { duration: 0.6, times: [0, 0.5, 1], ease: "easeInOut" },
                backgroundColor: { duration: 0.6 },
                boxShadow: {
                    duration: isChanging ? 0.6 : 1.5,
                    repeat: isChanging ? 0 : Infinity,
                    repeatType: "reverse"
                }
            }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white flex items-center justify-center font-black text-[8px] border-2 border-white z-20 pointer-events-none"
        >
            {count}
        </motion.div>
    );
};

const EquipmentItemRow = ({ category, item, onUpdate, onDelete, onGallery, onCamera, deleteMode, selectedForDelete, onToggleSelect }: any) => {
    const serialRef = useRef<HTMLInputElement>(null);
    const catColor = getCategoryColor(category);

    const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 10);
        onUpdate({ ...item, contract: value });
        if (value.length === 10 && serialRef.current) {
            serialRef.current.focus();
        }
    };

    const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 20);
        onUpdate({ ...item, serial: value });
    };

    const handlePaste = (e: React.ClipboardEvent, field: 'contract' | 'serial') => {
        e.preventDefault();
        const text = e.clipboardData.getData('text').trim();
        if (field === 'contract') {
            const value = text.slice(0, 10);
            onUpdate({ ...item, contract: value });
            if (value.length === 10 && serialRef.current) {
                serialRef.current.focus();
            }
        } else {
            const value = text.slice(0, 20);
            onUpdate({ ...item, serial: value }, value.length === 20);
        }
    };

    const isComplete = item.contract.length >= 10 || item.serial.length >= 20;

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, height: 0, scale: 0.95, y: 20 }} 
            animate={{ 
                opacity: 1, 
                height: 'auto', 
                scale: 1,
                y: 0,
                transition: { 
                    type: 'spring', 
                    damping: 25, 
                    stiffness: 400,
                    height: { duration: 0.4 }
                }
            }} 
            exit={{ 
                opacity: 0, 
                height: 0, 
                scale: 0.9,
                y: -20,
                transition: { duration: 0.3, ease: "easeInOut" }
            }} 
            className="overflow-hidden"
        >
            <div className={`flex gap-1.5 overflow-visible mb-1.5 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${isComplete && !deleteMode ? 'opacity-40 scale-[0.94] -translate-y-2 blur-[0.5px]' : ''}`}>
                <div className={`flex-1 p-1.5 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.03)] flex items-center gap-2 transition-all duration-300 overflow-visible ${deleteMode && selectedForDelete?.includes(item.id) ? 'bg-red-50 border border-red-100' : 'bg-white border border-slate-50'}`}>
                    {deleteMode && (
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onToggleSelect(item.id)} 
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all shrink-0 ${selectedForDelete?.includes(item.id) ? 'bg-red-600 text-white border-red-500 shadow-md' : 'bg-white text-red-500 border-slate-100 shadow-sm'}`}
                        >
                            <IconMinus className="w-3.5 h-3.5"/>
                        </motion.button>
                    )}
                    <div className="flex-1 flex gap-2 items-center overflow-visible px-1">
                        <span className="text-[8px] font-black text-slate-300 shrink-0 w-8 text-center">{new Date(item.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="CONTRATO" 
                                value={item.contract} 
                                onChange={handleContractChange} 
                                onPaste={(e) => handlePaste(e, 'contract')}
                                className={`w-[75px] py-2 px-1.5 rounded-xl border border-white/40 outline-none font-black text-[9px] bg-white/40 backdrop-blur-sm text-slate-800 placeholder-slate-200 transition-all text-center shadow-sm ${isComplete ? 'focus:border-slate-200' : `focus:border-${catColor.text.split('-')[1]}-200`}`} 
                            />
                            <input 
                                ref={serialRef}
                                type="text" 
                                placeholder="SERIAL" 
                                value={item.serial} 
                                onChange={handleSerialChange} 
                                onPaste={(e) => handlePaste(e, 'serial')}
                                className={`flex-1 py-2 px-1.5 rounded-xl border border-white/40 outline-none font-black text-[9px] bg-white/40 backdrop-blur-sm text-slate-800 placeholder-slate-200 transition-all text-center shadow-sm ${isComplete ? 'focus:border-slate-200' : `focus:border-${catColor.text.split('-')[1]}-200`}`} 
                            />
                        </div>
                        <div className="flex gap-1.5">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onCamera(item)} 
                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-white shadow-[0_0_0_1px_rgba(255,255,255,0.4)] backdrop-blur-md border border-white/60 ${catColor.bg}`}
                            >
                                <IconCameraLens className="w-4 h-4"/>
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onGallery(item)} 
                                className={`w-9 h-9 flex items-center justify-center rounded-xl border backdrop-blur-md transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.4)] ${item.photos.length > 0 ? 'bg-green-50/80 text-green-600 border-green-200 shadow-sm' : 'bg-white/40 text-slate-400 border-white/60 shadow-sm'}`}
                            >
                                <div className="relative">
                                    <IconGallery className="w-4 h-4"/>
                                    <CountBadge count={item.photos.length} />
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const EquipmentSection = ({ category, items, onUpdate, onDelete, onGallery, onCamera, deleteMode, selectedForDelete, onToggleSelect }: any) => {
    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {items.map((item: any) => (
                    <EquipmentItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} onGallery={onGallery} onCamera={onCamera} deleteMode={deleteMode} selectedForDelete={selectedForDelete} onToggleSelect={onToggleSelect} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const PhotoGalleryModal = ({ item, onClose }: any) => (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-100"
            >
                <IconChevronLeft className="w-4 h-4"/>
                <span className="text-[9px] font-black uppercase tracking-[1px]">Voltar</span>
            </motion.button>
            <span className="font-black text-slate-300 text-[10px] uppercase tracking-[8px]">GALERIA</span>
            <div className="w-20"></div> {/* Spacer to center the title */}
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pb-32">
            {item.photos.map((p: any, i: any) => (
                <div key={i} className="aspect-video rounded-[22%] overflow-hidden bg-white border border-slate-100 shadow-xl"><img src={p} className="w-full h-full object-contain" alt={`Equipment ${i}`} /></div>
            ))}
        </div>
    </div>
);

const Modal = ({ title, children, onClose, hideHeader }: any) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            onClick={onClose} 
        />
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-[360px] max-h-[85vh] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 overflow-hidden z-10 flex flex-col border border-white/40"
            onClick={(e) => e.stopPropagation()}
        >
            {!hideHeader && (
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 backdrop-blur-md rounded-xl text-slate-500 border border-white/60 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]"
                    >
                        <IconChevronLeft className="w-3 h-3"/>
                        <span className="text-[8px] font-black uppercase tracking-[0.5px]">Voltar</span>
                    </motion.button>
                    <h3 className="font-black uppercase tracking-[2px] text-[8px] text-slate-300">{title}</h3>
                    <div className="w-12"></div>
                </div>
            )}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {children}
            </div>
        </motion.div>
    </div>
);

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
