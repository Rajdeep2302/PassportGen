import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Palette, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CropStepProps {
    imageUrl: string;
    onCropComplete: (croppedBlobUrl: string, bgColor: string) => void;
}

// High resolution constants for passport photos
// Standard: 300 DPI for professional quality
// 1 inch = 2.54 cm, so 1 cm = 300 DPI / 2.54 ≈ 118.11 pixels
const DPI = 300;
const INCH_TO_CM = 2.54;
const CM_TO_PIXELS = DPI / INCH_TO_CM;
const DEFAULT_WIDTH_CM = 2.5;
const DEFAULT_HEIGHT_CM = 3.5;

const PRESET_COLORS = [
    '#8ed1e7ff', // Light Blue
    '#ffffff', // White
    '#85a2dcff', // Passport Blue
    '#9c9c9cff', // Light Gray
    '#f3f58bff', // Slate
    '#f79b9bff', // Light Red
];

export function CropStep({ imageUrl, onCropComplete }: CropStepProps) {
    const [crop, setCrop] = useState<Crop>();
    const [bgColor, setBgColor] = useState(PRESET_COLORS[0]);
    const [widthCm, setWidthCm] = useState(DEFAULT_WIDTH_CM);
    const [heightCm, setHeightCm] = useState(DEFAULT_HEIGHT_CM);

    // GSAP Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const imagePanelRef = useRef<HTMLDivElement>(null);
    const toolsPanelRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Slide image panel from left
        tl.fromTo(imagePanelRef.current,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );

        // Slide tools panel from right
        tl.fromTo(toolsPanelRef.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
            "-=0.4"
        );
    }, { scope: containerRef });

    // Update crop when aspect ratio changes
    useEffect(() => {
        if (crop && imgRef.current) {
            const { width, height } = imgRef.current;
            const aspectRatio = widthCm / heightCm;
            const newCrop = centerCrop(
                makeAspectCrop({ unit: '%', width: 90 }, aspectRatio, width, height),
                width,
                height
            );
            setCrop(newCrop);
        }
    }, [widthCm, heightCm]);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const aspectRatio = widthCm / heightCm;
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, aspectRatio, width, height),
            width,
            height
        );
        setCrop(initialCrop);

        // Slight pop when image loads
        gsap.fromTo(e.currentTarget, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' });
    };

    const handleApplyCrop = async () => {
        if (!imgRef.current || !crop) return;

        // Button click animation
        gsap.to('.apply-btn', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

        // Calculate target dimensions from cm
        const targetWidth = Math.round(widthCm * CM_TO_PIXELS);
        const targetHeight = Math.round(heightCm * CM_TO_PIXELS);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Calculate crop parameters
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            targetWidth,
            targetHeight
        );

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error('Canvas is empty'));
            }, 'image/png');
        });

        setTimeout(() => {
            onCropComplete(URL.createObjectURL(blob), bgColor);
        }, 300); // slight delay for animation
    };

    return (
        <div ref={containerRef} className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center p-4 overflow-hidden">

            {/* Original Image Side */}
            <div ref={imagePanelRef} className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col items-center border border-gray-100 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 w-full text-center">
                    <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-gray-100">Crop Subject</h2>
                    <p className="text-sm text-gray-500">Lock size {widthCm} × {heightCm} cm</p>
                </div>

                <div className="p-4 relative w-full flex justify-center bg-checkered bg-[length:20px_20px] dark:bg-gray-800">
                    <style>{`
            .bg-checkered {
              background-image: 
                linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), 
                linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb);
              background-position: 0 0, 10px 10px;
            }
            @media (prefers-color-scheme: dark) {
               .bg-checkered {
                  background-image: 
                    linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151), 
                    linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151);
                }
            }
          `}</style>

                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={widthCm / heightCm}
                        className="max-h-[60vh] object-contain shadow-sm border border-gray-200"
                    >
                        <img
                            ref={imgRef}
                            src={imageUrl}
                            onLoad={onImageLoad}
                            className="max-h-[60vh] object-contain opacity-0" // starts invisible for gsap
                            alt="Subject without background"
                        />
                    </ReactCrop>
                </div>
            </div>

            {/* Editor Controls Side */}
            <div ref={toolsPanelRef} className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl flex flex-col gap-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Palette className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Background Color</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => {
                                    setBgColor(color);
                                    gsap.fromTo(`button[title="${color}"]`, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
                                }}
                                className="w-full aspect-square rounded-xl border-2 transition-transform hover:scale-105 flex items-center justify-center relative overflow-hidden"
                                style={{ backgroundColor: color, borderColor: bgColor === color ? '#2563eb' : '#e5e7eb' }}
                                title={color}
                            >
                                {bgColor === color && <Check className="w-6 h-6 text-blue-600 drop-shadow-md" />}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 items-center mt-2 group relative">
                        <label className="text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                            Pick Any:
                        </label>
                        <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full h-10 p-0 border-0 rounded cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch-wrapper]:rounded-lg [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg shadow-inner"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl flex flex-col gap-4 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Crop Size (cm)</h3>
                    
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Width
                            </label>
                            <input
                                type="number"
                                value={widthCm}
                                onChange={(e) => setWidthCm(parseFloat(e.target.value) || DEFAULT_WIDTH_CM)}
                                step="0.1"
                                min="0.5"
                                max="20"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Height
                            </label>
                            <input
                                type="number"
                                value={heightCm}
                                onChange={(e) => setHeightCm(parseFloat(e.target.value) || DEFAULT_HEIGHT_CM)}
                                step="0.1"
                                min="0.5"
                                max="20"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setWidthCm(DEFAULT_WIDTH_CM);
                            setHeightCm(DEFAULT_HEIGHT_CM);
                        }}
                        className="w-full py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Reset to Default (2.5 × 3.5)
                    </button>
                </div>

                <button
                    onClick={handleApplyCrop}
                    className="apply-btn w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                    <Check className="w-5 h-5" />
                    Apply & Continue
                </button>
            </div>
        </div >
    );
}
