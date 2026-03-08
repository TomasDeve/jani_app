import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';

// CONFIGURATION: Define the 5-digit codes for each of the 4 levels
const LEVELS = [
  { code: "31452", id: 1 },
  { code: "52143", id: 2 },
  { code: "24513", id: 3 },
  { code: "13254", id: 4 }
];

export default function EscapeRoom() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [code, setCode] = useState<string[]>(Array(5).fill(""));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on mount and level change
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [currentLevel, showLevelComplete]);

  // Handle auto-closing of error screen
  useEffect(() => {
    if (showErrorScreen) {
      const timer = setTimeout(() => {
        setShowErrorScreen(false);
        setCode(Array(5).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showErrorScreen]);

  // Handle auto-closing of level complete screen
  useEffect(() => {
    if (showLevelComplete) {
      const timer = setTimeout(() => {
        setShowLevelComplete(false);
        setCurrentLevel(prev => prev + 1);
        setCode(Array(5).fill(""));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLevelComplete]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character entered
    setCode(newCode);
    setError(false);

    // Move to next input if value is entered
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 5).split('');
    const newCode = [...code];
    pastedData.forEach((char, index) => {
      if (index < 5 && /^\d$/.test(char)) {
        newCode[index] = char;
      }
    });
    setCode(newCode);
    if (pastedData.length > 0) {
      const nextIndex = Math.min(pastedData.length, 4);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const checkCode = () => {
    const enteredCode = code.join('');
    const correctCode = LEVELS[currentLevel].code;

    if (enteredCode === correctCode) {
      if (currentLevel < LEVELS.length - 1) {
        setShowLevelComplete(true);
      } else {
        setIsUnlocked(true);
      }
      setError(false);
    } else {
      setError(true);
      setShowErrorScreen(true);
    }
  };

  // Auto-check when all fields are filled
  useEffect(() => {
    if (code.every(digit => digit !== "") && !showErrorScreen && !isUnlocked && !showLevelComplete) {
      const timer = setTimeout(() => {
        checkCode();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [code, showErrorScreen, isUnlocked, showLevelComplete]);

  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-green-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative font-mono">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="z-10 bg-black/40 backdrop-blur-md p-12 rounded-3xl border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <CheckCircle className="w-20 h-20 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 mb-4 font-mono tracking-tighter">
            ACESSO PERMITIDO
          </h1>
          <p className="text-xl md:text-2xl text-green-100 font-mono">
            Sistema desbloqueado, missão concluída!
          </p>
        </motion.div>
      </div>
    );
  }

  if (showLevelComplete) {
    return (
      <div className="min-h-screen bg-green-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative font-mono z-50">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#14532d,#14532d_20px,#052e16_20px,#052e16_40px)] opacity-20 pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.5 }}
          className="z-10 bg-black/60 backdrop-blur-md p-12 rounded-3xl border-4 border-green-600 shadow-[0_0_100px_rgba(34,197,94,0.6)] relative overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-4 border-green-400"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-green-500 mb-4 font-mono tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            PARABÉNS!
          </h1>
          <p className="text-xl md:text-2xl text-green-200 font-mono uppercase tracking-widest animate-pulse">
            Você passou para a próxima fase.
          </p>
          <p className="text-sm text-green-400 mt-6 font-mono">
            Carregando próximo nível...
          </p>
        </motion.div>
      </div>
    );
  }

  if (showErrorScreen) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative font-mono z-50">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#991b1b,#991b1b_20px,#7f1d1d_20px,#7f1d1d_40px)] opacity-20 pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.5 }}
          className="z-10 bg-black/60 backdrop-blur-md p-12 rounded-3xl border-4 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.6)] relative overflow-hidden"
        >
           {/* Hazard Stripes */}
           <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#fca5a5,#fca5a5_10px,#dc2626_10px,#dc2626_20px)]" />
           <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#fca5a5,#fca5a5_10px,#dc2626_10px,#dc2626_20px)]" />

          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-4 border-red-400"
          >
            <Lock className="w-16 h-16 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black text-red-500 mb-4 font-mono tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
            ACESSO NEGADO
          </h1>
          <p className="text-xl md:text-2xl text-red-200 font-mono uppercase tracking-widest animate-pulse">
            Código Incorreto detectado
          </p>
          <p className="text-sm text-red-400 mt-6 font-mono">
            Reiniciando sistema de segurança em 3 segundos...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051014] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0f2e2e] via-[#051014] to-black opacity-90" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
      
      {/* Toxic Green Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-green-500/10 blur-[100px] pointer-events-none" />

      {/* Content Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 w-full max-w-5xl flex flex-col items-center gap-4 md:gap-6"
      >
        {/* Class Info */}
        <div className="text-center space-y-1 shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-yellow-400 font-mono tracking-tight">
            Aula de Química — 3° ano
          </h2>
          <h3 className="text-lg md:text-xl text-yellow-600 font-mono">
            Professora Janielly
          </h3>
        </div>

        {/* Logo / Image Placeholder - Banner Format */}
        <div className="w-full max-w-3xl relative group shrink-0">
            {/* Placeholder for user image - Using a radioactive theme image */}
            <img 
              src="https://i.ibb.co/pvNcpkpS/Gemini-Generated-Image-2bstk32bstk32bst.png" 
              alt="Radioactive Escape Room Banner" 
              className="w-full h-auto rounded-xl border-2 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)] opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
        </div>

        <div className="text-center space-y-1 shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-green-400 font-mono flex items-center justify-center gap-2 uppercase tracking-widest">
            <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />
            Acesso Restrito
            <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />
          </h1>
          <p className="text-yellow-600/80 font-mono text-xs md:text-sm font-bold">
            NÍVEL DE RADIAÇÃO CRÍTICO. INSIRA O CÓDIGO DE CONTENÇÃO.
          </p>
          {/* Level Indicator */}
          <div className="mt-2 inline-block bg-yellow-500/20 border border-yellow-500/50 px-4 py-1 rounded text-yellow-400 font-bold tracking-widest">
            FASE {currentLevel + 1} DE {LEVELS.length}
          </div>
        </div>

        {/* Password Input Grid - Hazardous Style */}
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-black/80 backdrop-blur-sm p-4 md:p-6 rounded-xl border-2 border-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.15)] w-full max-w-2xl relative overflow-hidden"
        >
          {/* Hazard Stripes Top/Bottom */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_10px,#000_10px,#000_20px)] opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_10px,#000_10px,#000_20px)] opacity-80" />

          <div className="grid grid-cols-5 gap-3 md:gap-4 py-4 px-4 md:px-12">
            {code.map((digit, index) => (
              <div key={index} className="relative aspect-square w-full">
                <input
                  ref={el => inputRefs.current[index] = el}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-full h-full text-center text-3xl md:text-4xl font-bold rounded-md
                    bg-[#1a1a1a] border-2 outline-none transition-all duration-200 font-mono
                    ${error 
                      ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                      : 'border-green-800 text-green-400 focus:border-green-400 focus:shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                    }
                  `}
                />
                {/* Digital glow effect */}
                {!error && digit && (
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_10px_rgba(74,222,128,0.2)] rounded-md" />
                )}
              </div>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex justify-center h-8 items-center">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 text-black font-bold font-mono bg-red-500 px-4 py-1 rounded-sm border-2 border-red-700 shadow-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>ERRO: CÓDIGO INVÁLIDO</span>
                </motion.div>
              )}
              {!error && !isUnlocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-500/70 font-mono text-[10px] uppercase tracking-widest">
                    SISTEMA EM ESPERA...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer / Instructions */}
        <div className="text-yellow-600/60 text-[10px] font-mono text-center max-w-lg shrink-0 border-t border-yellow-900/30 pt-4 mt-2 w-full">
          <p className="uppercase tracking-widest mb-2">⚠️ Área de Risco Biológico ⚠️</p>
          <div className="flex flex-col items-center gap-1">
            <p className="text-yellow-500/40">Encontre os 5 dígitos para neutralizar a ameaça.</p>
            <p className="mt-2 text-[9px] opacity-50">
              Desenvolvido por <span className="text-yellow-500/60 font-bold">Dev Tomas Eugênio</span>
            </p>
            <p className="text-[9px] opacity-40">
              © {new Date().getFullYear()} Direitos reservados
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
