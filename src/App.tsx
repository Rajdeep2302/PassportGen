import { useState, useRef } from 'react';
import { UploadStep } from './components/UploadStep';
import { ProcessingStep } from './components/ProcessingStep';
import { CropStep } from './components/CropStep';
import { ExportStep } from './components/ExportStep';
import { AdjustmentStep } from './components/AdjustmentStep';
import { HelpModal } from './components/HelpModal';
import { RestoreStep } from './components/RestoreStep';
import { Camera, HelpCircle, Palette, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type Step = 'upload' | 'processing' | 'crop' | 'adjust' | 'export';

function App() {
  const [appMode, setAppMode] = useState<'passport' | 'restore'>('passport');
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [showHelp, setShowHelp] = useState(false);

  // State for flow
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [transparentImageUrl, setTransparentImageUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#ffffff');
  const [finalAdjustedImageUrl, setFinalAdjustedImageUrl] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Refs for GSAP
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial App Load Animations
    const tl = gsap.timeline();

    tl.from(headerRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }).from(mainRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out'
    }, "-=0.4");
  }, []);

  // Animate route/step changes
  useGSAP(() => {
    if (stepContainerRef.current) {
      gsap.fromTo(stepContainerRef.current,
        { opacity: 0, scale: 0.98, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [currentStep, appMode]);

  const handleUpload = (file: File) => {
    setOriginalFile(file);
    setCurrentStep('processing');
    setErrorStatus(null);
  };

  const handleProcessingComplete = (url: string) => {
    setTransparentImageUrl(url);
    setCurrentStep('crop');
  };

  const handleProcessingError = (err: string) => {
    setErrorStatus(err);
    setCurrentStep('upload');
  };

  const handleCropComplete = (url: string, bgColor: string) => {
    setCroppedImageUrl(url);
    setSelectedBgColor(bgColor);
    setCurrentStep('adjust');
  };

  const handleAdjustComplete = (url: string) => {
    setFinalAdjustedImageUrl(url);
    setCurrentStep('export');
  };

  const resetApp = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setOriginalFile(null);
        setTransparentImageUrl(null);
        setCroppedImageUrl(null);
        setFinalAdjustedImageUrl(null);
        setErrorStatus(null);
        setCurrentStep('upload');
      }
    });

    if (stepContainerRef.current) {
      tl.to(stepContainerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in'
      });
    } else {
      tl.play();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header ref={headerRef} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-gray-400">
              PassportGen
            </h1>
          </div>
          <div className="flex items-center gap-4">

            {/* Dual Mode Toggle */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner hidden sm:flex pointer-events-auto">
              <button
                onClick={() => setAppMode('passport')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${appMode === 'passport' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-105'}`}
              >
                <RefreshCw className={`w-4 h-4 ${appMode === 'passport' ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '3s' }} /> ID Photo
              </button>
              <button
                onClick={() => setAppMode('restore')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${appMode === 'restore' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-105'}`}
              >
                <Palette className="w-4 h-4" /> Restore Auto
              </button>
            </div>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all hover:scale-105"
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </button>
            {appMode === 'passport' && (
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full shadow-sm bg-white dark:bg-slate-900 hidden md:block">
                {currentStep.toUpperCase()} STEP
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">

        {/* Error Banner */}
        {errorStatus && appMode === 'passport' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-2xl shadow-sm text-center font-medium alert animate-in slide-in-from-top-4 fade-in">
            {errorStatus}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center" ref={stepContainerRef}>
          {appMode === 'restore' ? (
            <div className="w-full">
              <RestoreStep onBack={() => setAppMode('passport')} />
            </div>
          ) : (
            <>
              {currentStep === 'upload' && (
                <div className="w-full">
                  <UploadStep onUpload={handleUpload} />
                </div>
              )}

              {currentStep === 'processing' && originalFile && (
                <div className="w-full">
                  <ProcessingStep
                    imageFile={originalFile}
                    onProcessed={handleProcessingComplete}
                    onError={handleProcessingError}
                  />
                </div>
              )}

              {currentStep === 'crop' && transparentImageUrl && (
                <div className="w-full">
                  <CropStep
                    imageUrl={transparentImageUrl}
                    onCropComplete={handleCropComplete}
                  />
                </div>
              )}

              {currentStep === 'adjust' && croppedImageUrl && (
                <div className="w-full">
                  <AdjustmentStep
                    imageUrl={croppedImageUrl}
                    bgColor={selectedBgColor}
                    onComplete={handleAdjustComplete}
                  />
                </div>
              )}

              {currentStep === 'export' && finalAdjustedImageUrl && (
                <div className="w-full">
                  <ExportStep
                    processedImageBlobUrl={finalAdjustedImageUrl}
                    onReset={resetApp}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-400 dark:text-slate-600 font-medium">
        Fast, private, and runs entirely in your browser.
      </footer>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
