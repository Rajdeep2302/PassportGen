import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Palette, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CropStepProps {
    imageUrl: string;
    onCropComplete: (croppedBlobUrl: string, bgColor: string) => void;
}

const ASPECT_RATIO = 3.5 / 4.5;
const TARGET_WIDTH = 413;
const TARGET_HEIGHT = 531;

const PRESET_COLORS = [
    '#ffffff', // White
    '#8ed1e7ff', // Light Blue
    '#85a2dcff', // Passport Blue
    '#9c9c9cff', // Light Gray
    '#f3f58bff', // Slate
    '#f79b9bff', // Light Red
];

export function CropStep({ imageUrl, onCropComplete }: CropStepProps) {
    const [crop, setCrop] = useState<Crop>();
    const [bgColor, setBgColor] = useState(PRESET_COLORS[0]);

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

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, ASPECT_RATIO, width, height),
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

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
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
            TARGET_WIDTH,
            TARGET_HEIGHT
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
                    <p className="text-sm text-gray-500">Lock size 3.5 x 4.5</p>
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
                        aspect={ASPECT_RATIO}
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
