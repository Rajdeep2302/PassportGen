import { useState, useRef, useEffect } from 'react';
import { Sliders, Check, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface AdjustmentStepProps {
    imageUrl: string;
    bgColor: string;
    onComplete: (adjustedBlobUrl: string) => void;
}

export function AdjustmentStep({ imageUrl, bgColor, onComplete }: AdjustmentStepProps) {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [sharpness, setSharpness] = useState(100);
    const [exposure, setExposure] = useState(100);
    const [lightBalance, setLightBalance] = useState(100);
    const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
    const [currentBgColor, setCurrentBgColor] = useState(bgColor);

    // We use a small hack to ensure the canvas redraws when the image initially loads.
    const [imgLoaded, setImgLoaded] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // GSAP Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const previewPanelRef = useRef<HTMLDivElement>(null);
    const controlsPanelRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Slide preview panel from left
        tl.fromTo(previewPanelRef.current,
            { x: -40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }
        );

        // Slide and stagger controls from right
        if (controlsPanelRef.current) {
            tl.fromTo(controlsPanelRef.current.children,
                { x: 40, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
                "-=0.4"
            );
        }
    }, { scope: containerRef });

    // Auto change background to Light Gray when Black & White is toggled
    useEffect(() => {
        if (isBlackAndWhite) {
            setCurrentBgColor('#9c9c9cff'); // Light Gray
        } else {
            setCurrentBgColor(bgColor);
        }
    }, [isBlackAndWhite, bgColor]);

    // Apply filters to canvas preview real-time
    useEffect(() => {
        const drawPreview = () => {
            const canvas = canvasRef.current;
            const img = imgRef.current;
            if (!canvas || !img || !imgLoaded || img.naturalWidth === 0) return;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw solid background color (unaffected by filters)
            ctx.filter = 'none';
            ctx.fillStyle = currentBgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Apply CSS filters
            const satValue = isBlackAndWhite ? 0 : saturation;
            const exposureAdjusted = exposure / 100;
            const brightnessAdjusted = brightness * exposureAdjusted;
            const sharpnessAdjusted = 100 + (sharpness - 100) * 0.3;
            
            ctx.filter = `brightness(${brightnessAdjusted}%) contrast(${contrast}%) saturate(${satValue}%) contrast(${sharpnessAdjusted}%)`;
            ctx.drawImage(img, 0, 0);

            // Apply light balance through additional brightness adjustment
            if (lightBalance !== 100) {
                const lightBalanceAdjustment = (lightBalance - 100) * 0.5;
                ctx.filter = `brightness(${100 + lightBalanceAdjustment}%)`;
                ctx.globalAlpha = 0.3;
                ctx.drawImage(img, 0, 0);
                ctx.globalAlpha = 1.0;
            }
        };
        drawPreview();
    }, [brightness, contrast, saturation, sharpness, exposure, lightBalance, isBlackAndWhite, imgLoaded, currentBgColor]);

    const handleApply = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        gsap.to('.finish-btn', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

        const blob = await new Promise<Blob>((resolve, reject) => {
            // PNG to preserve high quality of the cropped passport photo
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error('Canvas is empty'));
            }, 'image/png');
        });

        setTimeout(() => {
            onComplete(URL.createObjectURL(blob));
        }, 200);
    };

    return (
        <div ref={containerRef} className="w-full flex flex-col gap-4 md:gap-8 items-stretch md:items-start justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-8 w-full max-w-full">
            
                <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Source Crop"
                    className="hidden"
                    crossOrigin="anonymous"
                    onLoad={() => {
                        setImgLoaded(true);
                        if (canvasRef.current) gsap.fromTo(canvasRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 });
                    }}
                />

                {/* Preview Side */}
                <div ref={previewPanelRef} className="w-full lg:flex-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden flex flex-col items-center border border-gray-100 dark:border-gray-700">
                    <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700 w-full text-center">
                        <h2 className="text-base sm:text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Photo Adjustments
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 md:mt-1">Fine-tune lighting and colors</p>
                    </div>
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] relative overflow-hidden">
                        {imgLoaded ? (
                            <>
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
                                </div>
                                <canvas
                                    ref={canvasRef}
                                    className="w-full max-w-[min(90vw,100%)] md:max-w-[min(70vw,100%)] lg:max-w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain shadow-lg md:shadow-2xl border-4 md:border-8 border-white dark:border-gray-700 rounded-lg md:rounded-2xl bg-white dark:bg-gray-800 relative z-10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-shadow duration-300"
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center animate-pulse text-gray-400 gap-2">
                                <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-2 animate-pulse"></div>
                                <p className="text-sm md:text-base">Loading full resolution image...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Controls Side */}
                <div ref={controlsPanelRef} className="w-full lg:w-96 flex flex-col gap-4 md:gap-5">
                    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-5 md:gap-6">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2 border-b border-gray-100 dark:border-gray-700 pb-3 md:pb-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-2 md:p-2.5 rounded-lg">
                                <Sliders className="w-4 md:w-5 h-4 md:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">Adjustments</h3>
                        </div>

                        <div className="flex flex-col gap-4 md:gap-6">
                            {/* Brightness */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                    <span>Brightness</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-mono">{brightness}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="150"
                                    value={brightness} onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="w-full h-2 md:h-2.5 bg-gradient-to-r from-gray-200 to-blue-200 dark:from-gray-600 dark:to-blue-600 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all focus:scale-[1.02]"
                                />
                            </div>

                            {/* Contrast */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                    <span>Contrast</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-mono">{contrast}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="150"
                                    value={contrast} onChange={(e) => setContrast(Number(e.target.value))}
                                    className="w-full h-2 md:h-2.5 bg-gradient-to-r from-gray-200 to-blue-200 dark:from-gray-600 dark:to-blue-600 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all focus:scale-[1.02]"
                                />
                            </div>

                            {/* Saturation */}
                            <div className={`flex flex-col gap-2 transition-opacity duration-300 ${isBlackAndWhite ? 'opacity-50 pointer-events-none' : ''}`}>
                                <label className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                    <span>Saturation</span>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-mono">{saturation}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="200"
                                    value={saturation} onChange={(e) => setSaturation(Number(e.target.value))}
                                    className="w-full h-2 md:h-2.5 bg-gradient-to-r from-gray-200 to-blue-200 dark:from-gray-600 dark:to-blue-600 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all focus:scale-[1.02]"
                                    disabled={isBlackAndWhite}
                                />
                            </div>

                            {/* Sharpness */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                    <span>Sharpness</span>
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-mono">{sharpness}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="200"
                                    value={sharpness} onChange={(e) => setSharpness(Number(e.target.value))}
                                    className="w-full h-2 md:h-2.5 bg-gradient-to-r from-gray-200 to-indigo-200 dark:from-gray-600 dark:to-indigo-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all focus:scale-[1.02]"
                                />
                            </div>

                            {/* Exposure */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                    <span>Exposure</span>
                                    <span className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-mono">{exposure}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="150"
                                    value={exposure} onChange={(e) => setExposure(Number(e.target.value))}
                                    className="w-full h-2 md:h-2.5 bg-gradient-to-r from-gray-200 to-violet-200 dark:from-gray-600 dark:to-violet-600 rounded-lg appearance-none cursor-pointer accent-violet-600 transition-all focus:scale-[1.02]"
                                />
                            </div>

                            {/* Light Balance */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center">
                                    <span>Light Balance</span>
                                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-mono">{lightBalance}%</span>
                                </label>
                                <input
                                    type="range" min="50" max="150"
                                    value={lightBalance} onChange={(e) => setLightBalance(Number(e.target.value))}
                                    className="w-full h-2 md:h-2.5 bg-gradient-to-r from-gray-200 to-amber-200 dark:from-gray-600 dark:to-amber-600 rounded-lg appearance-none cursor-pointer accent-amber-600 transition-all focus:scale-[1.02]"
                                />
                            </div>

                            {/* Black & White Toggle */}
                            <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-600">
                                <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Black & White</span>
                                <button
                                    onClick={() => setIsBlackAndWhite(!isBlackAndWhite)}
                                    className={`w-12 h-7 rounded-full transition-all relative border-2 ${isBlackAndWhite ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-300 dark:bg-gray-500 dark:border-gray-500'}`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ease-in-out ${isBlackAndWhite ? 'translate-x-5' : ''}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setBrightness(100); setContrast(100); setSaturation(100); 
                                setSharpness(100); setExposure(100); setLightBalance(100); 
                                setIsBlackAndWhite(false);
                                gsap.fromTo(canvasRef.current, { filter: 'blur(2px)' }, { filter: 'blur(0px)', duration: 0.3 });
                            }}
                            className="mt-3 md:mt-4 w-full py-2 md:py-2.5 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg"
                        >
                            <RefreshCw className="w-3.5 md:w-4 h-3.5 md:h-4" /> Reset All
                        </button>
                    </div>

                    <button
                        onClick={handleApply}
                        className="finish-btn w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-bold text-sm md:text-base rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 md:w-5 h-4 md:h-5" />
                        Finish Adjustments
                    </button>
                </div>
            </div>
        </div>
    );
}
