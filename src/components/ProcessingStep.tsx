import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ProcessingStepProps {
    imageFile: File;
    onProcessed: (transparentImageUrl: string) => void;
    onError: (error: string) => void;
}

export function ProcessingStep({ imageFile, onProcessed, onError }: ProcessingStepProps) {
    const [progress, setProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<SVGSVGElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Initial fade and slide up
        tl.fromTo(containerRef.current,
            { y: 40, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }
        );

        // Continuous pulse for the background glow
        gsap.to(glowRef.current, {
            scale: 1.5,
            opacity: 0.6,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
        });

        // Add a slight scaling bounce to the loader icon
        gsap.to(iconRef.current, {
            scale: 1.1,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: 'power1.inOut'
        });
    }, { scope: containerRef });

    useEffect(() => {
        let isMounted = true;

        async function processImage() {
            try {
                const formData = new FormData();
                formData.append('image_file', imageFile);
                formData.append('size', 'auto');

                const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
                if (!apiKey) {
                    throw new Error("Remove.bg API Key goes not exist! Please check your .env file.");
                }

                const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                    method: 'POST',
                    headers: {
                        'X-Api-Key': apiKey,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.statusText} - ${errorText}`);
                }

                const blob = await response.blob();

                if (!isMounted) return;

                const url = URL.createObjectURL(blob);
                setProgress(100);
                setTimeout(() => {
                    if (isMounted) onProcessed(url);
                }, 500);
            } catch (error: any) {
                if (!isMounted) return;
                console.error(error);
                onError(error.message || 'Failed to remove background.');
            }
        }

        // A fake progress animation for better UX while the heavy API request runs
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 95) return 95; // Stop at 95% until actually done
                return p + Math.random() * 5;
            });
        }, 500);

        processImage();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [imageFile, onProcessed, onError]);

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
            <div ref={containerRef} className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 w-full relative overflow-hidden">
                {/* Decorative background glow */}
                <div ref={glowRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

                <Loader2 ref={iconRef} className="w-16 h-16 text-blue-600 animate-spin relative z-10" />

                <div className="text-center relative z-10 w-full">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Removing Background...
                    </h2>
                    <p className="text-gray-500 mb-6 text-sm">
                        AI is magically separating you from the background. This usually takes a few seconds.
                    </p>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
