import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface UploadStepProps {
    onUpload: (file: File) => void;
}

export function UploadStep({ onUpload }: UploadStepProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            // Add a quick success pop before transitioning away
            gsap.to(dropzoneRef.current, {
                scale: 0.9,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                onComplete: () => onUpload(acceptedFiles[0])
            });
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1
    });

    useGSAP(() => {
        // Entry animation for texts
        gsap.fromTo(containerRef.current?.children[0] as Element,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
        );

        // Continuous floating animation for the cloud icon
        gsap.to(iconRef.current, {
            y: -10,
            duration: 1.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }, { scope: containerRef });

    // Animate drag state changes
    useGSAP(() => {
        if (isDragActive) {
            gsap.to(dropzoneRef.current, { scale: 1.05, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', duration: 0.3, ease: 'power2.out' });
            gsap.to(iconRef.current, { scale: 1.2, duration: 0.3, ease: 'back.out(2)' });
        } else {
            gsap.to(dropzoneRef.current, { scale: 1, borderColor: '', backgroundColor: '', duration: 0.3, ease: 'power2.out', clearProps: 'borderColor,backgroundColor' });
            gsap.to(iconRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
        }
    }, [isDragActive]);

    return (
        <div ref={containerRef} className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Passport Photo Generator
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Upload a photo to automatically remove the background, crop to Indian Passport size, and generate an A4 print sheet.
                </p>
            </div>

            <div
                {...getRootProps()}
                ref={dropzoneRef}
                className={`w-full p-12 border-2 border-dashed rounded-3xl transition-shadow duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center gap-4 hover:shadow-xl ${isDragActive ? 'border-blue-500 shadow-xl' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md'}`}
            >
                <input {...getInputProps()} />
                <div ref={iconRef} className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full text-blue-600 dark:text-blue-400 shadow-inner">
                    <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {isDragActive ? 'Drop your photo here' : 'Drag & drop your photo here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        or click to browse files
                    </p>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <ImageIcon size={14} /> Supports JPG, PNG, WEBP
                </div>
            </div>
        </div>
    );
}
