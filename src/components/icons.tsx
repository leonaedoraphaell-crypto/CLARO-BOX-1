import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Minus, Undo2, Search, Camera, Image as Gallery, X, Share2, ChevronLeft, ChevronRight, 
  FileSpreadsheet, Mail, Layers, ChevronDown, Bell, Aperture, Settings, Download, Calendar, 
  Info, Sun, Moon, Save, Box, Speaker, Tv, Cpu, Trash2, Cloud, CloudOff,
  Send, FileText, FileCode, Eye, EyeOff
} from 'lucide-react';

export const IconPlus = Plus;
export const IconMinus = Minus;
export const IconUndo = Undo2;
export const IconSearch = Search;
export const IconCamera = Camera;
export const IconGallery = Gallery;
export const IconX = X;
export const IconShare = Share2;
export const IconChevronLeft = ChevronLeft;
export const IconChevronRight = ChevronRight;
export const IconFileExcel = FileSpreadsheet;
export const IconFileText = FileText;
export const IconFilePdf = FileCode;
export const IconWhatsapp = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
export const IconTelegram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 6.598 5.346 11.944 11.944 11.944 6.598 0 11.944-5.346 11.944-11.944C23.888 5.346 18.542 0 11.944 0Zm5.206 8.191-1.881 8.869c-.141.631-.516.788-1.044.491l-2.869-2.115-1.384 1.331c-.153.153-.282.282-.581.282l.206-2.924 5.322-4.808c.231-.206-.05-.32-.359-.115L8.1 13.51l-2.834-.886c-.616-.192-.628-.616.128-.911l11.071-4.271c.513-.186.96.12.785.749Z"/>
  </svg>
);
export const IconEmail = Mail;
export const IconStack = Layers;
export const IconChevronDown = ChevronDown;
export const IconBell = Bell;
export const IconSettings = Settings;
export const IconExport = Download;
export const IconCalendar = Calendar;
export const IconInfo = Info;
export const IconSun = Sun;
export const IconMoon = Moon;
export const IconSave = Save;
export const IconDownload = Download;
export const IconBox = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="18" cy="12" r="1" fill="currentColor" />
    <path d="M6 12h4" />
  </svg>
);

export const IconSpeaker = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M18 8a3 3 0 0 1 0 8" />
    <path d="M21 5a6 6 0 0 1 0 14" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const IconRemote = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <circle cx="12" cy="6" r="1" fill="currentColor" />
    <rect x="10" y="10" width="4" height="2" rx="0.5" />
    <rect x="10" y="14" width="4" height="2" rx="0.5" />
    <rect x="10" y="18" width="4" height="2" rx="0.5" />
  </svg>
);

export const IconCameraLens = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const IconChip = Cpu;
export const IconTrash = Trash2;
export const IconCloud = Cloud;
export const IconCloudOff = CloudOff;
export const IconEye = Eye;
export const IconEyeOff = EyeOff;

export const AppLogoIcon = ({ className, src }: { className?: string; src?: string }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden rounded-[22%] shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-white/20 bg-slate-950 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none z-20"></div>
      {src && !imgError ? (
        <img 
          src={src} 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <ClaroBoxBrand />
      )}
    </div>
  );
};

export const ClaroBoxBrand = ({ className }: { className?: string }) => (
  <div className={`w-full h-full flex items-center justify-center p-2.5 ${className}`}>
    <div className="relative w-full aspect-square bg-slate-950 rounded-[35%] shadow-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40 pointer-events-none z-20"></div>
      
      {/* Claro Logo & Text */}
      <div className="flex flex-col items-center gap-0.5 mb-1.5 relative z-10">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#ee2e24] rounded-full flex items-center justify-center shadow-sm border border-white/5">
             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span className="text-[6px] font-black text-white tracking-[0.5px] uppercase">Claro</span>
        </div>
        <span className="text-[5px] font-bold text-white/60 tracking-[3px] uppercase">Box</span>
      </div>
 
      {/* Front Panel */}
      <div className="w-[75%] h-6 bg-slate-900/60 rounded-lg border border-white/5 shadow-inner flex items-center justify-between px-2.5 relative z-10">
        {/* Power Button (Left) */}
        <div className="w-2 h-2 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center shadow-sm">
          <div className="w-0.5 h-0.5 rounded-full bg-slate-600"></div>
        </div>
        
        {/* Pulsing LED (Right) */}
        <motion.div 
          animate={{ 
            opacity: [0.3, 1, 0.3],
            boxShadow: [
              '0 0 8px rgba(34, 197, 94, 0.3)',
              '0 0 15px rgba(34, 197, 94, 0.6)',
              '0 0 8px rgba(34, 197, 94, 0.3)'
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-1.5 h-1.5 rounded-full bg-[#22c55e] border border-white/5"
        />
      </div>
      
      {/* Streaming Label */}
      <div className="absolute bottom-1.5 text-[3.5px] font-black text-blue-500/40 uppercase tracking-[1.5px]">Streaming Box</div>
    </div>
  </div>
);

export const CustomMenuIcon = ({ className, isChristmas, src }: { className?: string; isChristmas?: boolean; src?: string }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-full rounded-[22%] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-slate-200 bg-slate-950">
        {src && !imgError ? (
          <img 
            src={src} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <ClaroBoxBrand />
        )}
      </div>
      {isChristmas && (
        <span className="absolute -top-2 -right-2 text-2xl drop-shadow-md">🎅</span>
      )}
    </div>
  );
};

export const LoadingBoxIcon = () => (
  <div className="relative w-20 h-20">
    <div className="absolute inset-0 bg-blue-500/10 rounded-[22%] blur-2xl animate-pulse"></div>
    <div className="relative w-full h-full bg-slate-950 rounded-[22%] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <ClaroBoxBrand className="scale-110" />
    </div>
  </div>
);
