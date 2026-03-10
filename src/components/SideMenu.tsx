import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconCalendar, IconExport, IconSettings, IconInfo, AppLogoIcon 
} from './icons';
import { UserProfile } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuClick: (modal: string) => void;
  userProfile: UserProfile;
  isAdmin?: boolean;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onMenuClick, userProfile, isAdmin }) => {
  const menuItems = [
    { id: 'calendar', label: 'CALENDÁRIO', sub: 'ACESSAR CALENDÁRIO', icon: IconCalendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'export', label: 'RELATÓRIOS', sub: 'ACESSAR RELATÓRIOS', icon: IconExport, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'settings', label: 'CONFIGURAÇÕES', sub: 'ACESSAR CONFIGURAÇÕES', icon: IconSettings, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'about', label: 'SOBRE O APP', sub: 'ACESSAR SOBRE O APP', icon: IconInfo, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-slate-50 z-[60] shadow-2xl p-6 flex flex-col"
          >
            <div className="flex flex-col items-center mb-12 mt-4">
              <AppLogoIcon 
                src={userProfile.menuButtonImage} 
                className="w-16 h-16 mb-6" 
              />
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                  Controle de<br />Equipamentos
                </h2>
                <div className="w-12 h-1 bg-blue-600/30 mx-auto mt-3 rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {menuItems.map((item) => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  key={item.id}
                  onClick={() => {
                    onMenuClick(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_0_0_1px_rgba(255,255,255,0.4)] border border-white/60 active:scale-[0.98] transition-all group"
                >
                  <div className={`w-12 h-12 rounded-[22%] ${item.bg} flex items-center justify-center ${item.color} group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner border border-white/60`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-[2px]">{item.sub}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col items-center">
              {isAdmin && (
                <div className="mb-4 px-4 py-1.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  <span className="text-[8px] font-black text-white uppercase tracking-[2px]">Administrador Ativo</span>
                </div>
              )}
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-[6px] mb-1">
                {userProfile.name || 'LEO LUZ'}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
