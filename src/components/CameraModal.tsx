import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { IconX, IconCamera, IconCameraLens, IconChevronLeft } from './icons';
import BarcodeScanner from 'react-qr-barcode-scanner';

interface CameraModalProps {
  target: any;
  onClose: () => void;
  onCapture: (data: string, type: 'qr' | 'photo') => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ target, onClose, onCapture }) => {
  const [mode, setMode] = useState<'qr' | 'photo'>('qr');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'photo') {
      startCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(data, 'photo');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onClose} 
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20"
        >
          <IconChevronLeft className="w-4 h-4"/>
          <span className="text-[9px] font-black uppercase tracking-[1px]">Voltar</span>
        </motion.button>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode('qr')}
            className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'qr' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/60'}`}
          >
            QR/Barcode
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode('photo')}
            className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'photo' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/60'}`}
          >
            Foto
          </motion.button>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onClose} 
          className="p-3 bg-white/20 rounded-full text-white active:scale-95 transition-all"
        >
          <IconX className="w-6 h-6"/>
        </motion.button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {mode === 'qr' ? (
          <div className="w-full h-full">
            <BarcodeScanner
              onUpdate={(err, result) => {
                if (result) {
                  onCapture(result.getText(), 'qr');
                }
              }}
              facingMode="environment"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-blue-500 rounded-3xl relative">
                <div className="absolute inset-0 animate-pulse bg-blue-500/10 rounded-3xl"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-[scan_2s_linear_infinite]"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={takePhoto}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border-8 border-white/20"
              >
                <div className="w-14 h-14 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <IconCameraLens className="w-6 h-6 text-slate-900"/>
                </div>
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black/80 backdrop-blur-xl text-center">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">
          {mode === 'qr' ? 'Aponte para o código de barras' : 'Capture uma foto do equipamento'}
        </p>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};
