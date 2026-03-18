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
    const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);

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

    // Apply filters to canvas preview real-time
    useEffect(() => {
        const drawPreview = () => {
            const canvas = canvasRef.current;
            const img = imgRef.current;
            if (!canvas || !img || !imgLoaded || img.naturalWidth === 0) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw solid background color (unaffected by filters)
            ctx.filter = 'none';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Apply CSS filters ONLY to the subject before drawing it
            const satValue = isBlackAndWhite ? 0 : saturation;
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${satValue}%)`;
            ctx.drawImage(img, 0, 0);
        };
        drawPreview();
    }, [brightness, contrast, saturation, isBlackAndWhite, imgLoaded, bgColor]);

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
        <div ref={containerRef} className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center p-4 overflow-hidden">

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
            <div ref={previewPanelRef} className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col items-center">
                <div className="p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 w-full text-center">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-gray-400">
                        Photo Adjustments
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Fine-tune lighting and colors</p>
                </div>
                <div className="p-8 w-full flex justify-center bg-gray-100/50 dark:bg-gray-900/50 min-h-[400px]">
                    {imgLoaded ? (
                        <canvas
                            ref={canvasRef}
                            className="max-h-[60vh] object-contain shadow-lg border-4 border-white dark:border-gray-800 rounded-xl bg-white"
                        />
                    ) : (
                        <div className="flex items-center justify-center animate-pulse text-gray-400">
                            Loading full resolution image...
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Controls Side */}
            <div ref={controlsPanelRef} className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Filters</h3>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Brightness */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                                <span>Brightness</span>
                                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">{brightness}%</span>
                            </label>
                            <input
                                type="range" min="50" max="150"
                                value={brightness} onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600 transition-all focus:scale-[1.02]"
                            />
                        </div>

                        {/* Contrast */}
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                                <span>Contrast</span>
                                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">{contrast}%</span>
                            </label>
                            <input
                                type="range" min="50" max="150"
                                value={contrast} onChange={(e) => setContrast(Number(e.target.value))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600 transition-all focus:scale-[1.02]"
                            />
                        </div>

                        {/* Saturation */}
                        <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isBlackAndWhite ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                                <span>Saturation</span>
                                <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">{saturation}%</span>
                            </label>
                            <input
                                type="range" min="0" max="200"
                                value={saturation} onChange={(e) => setSaturation(Number(e.target.value))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600 transition-all focus:scale-[1.02]"
                                disabled={isBlackAndWhite}
                            />
                        </div>

                        {/* Black & White Toggle */}
                        <div className="flex items-center justify-between mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Black & White Mode</span>
                            <button
                                onClick={() => setIsBlackAndWhite(!isBlackAndWhite)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${isBlackAndWhite ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span
                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-spring ${isBlackAndWhite ? 'translate-x-6' : ''}`}
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setBrightness(100); setContrast(100); setSaturation(100); setIsBlackAndWhite(false);
                            gsap.fromTo(canvasRef.current, { filter: 'blur(2px)' }, { filter: 'blur(0px)', duration: 0.3 });
                        }}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium self-center flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Reset Filters
                    </button>
                </div>

                <button
                    onClick={handleApply}
                    className="finish-btn w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Check className="w-5 h-5" />
                    Finish Adjustments
                </button>
            </div>
        </div>
    );
}
