import { useState, useRef } from 'react';
import { Copy, CheckCircle, Sparkles, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface RestoreStepProps {
    onBack: () => void;
}

export function RestoreStep({ onBack }: RestoreStepProps) {
    const [copied, setCopied] = useState(false);

    // Animation refs
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const englishListRef = useRef<HTMLUListElement>(null);
    const bengaliListRef = useRef<HTMLUListElement>(null);
    const promptBoxRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Reveal header
        tl.fromTo(headerRef.current,
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        // Staggered reveal for English instructions
        if (englishListRef.current) {
            tl.fromTo(englishListRef.current.children,
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.2)' },
                "-=0.2"
            );
        }

        // Staggered reveal for Bengali instructions
        if (bengaliListRef.current) {
            tl.fromTo(bengaliListRef.current.children,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.2)' },
                "-=0.4"
            );
        }

        // Pop in the prompt box
        tl.fromTo(promptBoxRef.current,
            { y: 40, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
            "-=0.2"
        );

    }, { scope: containerRef });

    const promptText = `ACT AS: A professional museum-archivist and expert photo-restoration technician.

PRIMARY OPERATION: Perform a complete, non-destructive restoration and intelligent colorization of the attached reference image. The goal is to transform this faded, damaged vintage photo into a pristine, high-resolution, lifelike color photograph that looks as if it were taken today with modern equipment.

PHASE 1: DAMAGE REPAIR (INPAINTING & RECONSTRUCTION)
Identify and seamlessly remove all physical damage from the surface, including scratches, creases, tear lines, water spots, dust specks, and cracks.
Reconstruct any missing or heavily obscured details (like eyes, fabric weave, or architectural lines) using deep visual reasoning to ensure they remain true to the subject's identity and the historical era.

PHASE 2: CLARITY AND QUALITY ENHANCEMENT
Significantly sharpen the image to eliminate motion blur and softness.
Perform advanced face enhancement to bring clarity and fine detail to the eyes, skin texture, and hair of the subjects, ensuring they look natural and not "plastic."
Optimize contrast and exposure, balancing deep shadows and bright highlights to increase dynamic range.

PHASE 3: INTELLIGENT COLORIZATION
Colorize the entire photo using historically accurate and visually plausible natural, vibrant colors.
Apply accurate, realistic skin tones suitable for the subjects.
Intelligently deduce appropriate colors for clothing, foliage, sky, and man-made objects based on their texture and the era represented (e.g., natural green for trees, realistic blue for sky, plausible colors for vintage fashion).`;

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);

        // Button click animation
        gsap.fromTo('.copy-btn',
            { scale: 0.9 },
            { scale: 1, duration: 0.3, ease: 'back.out(2)' }
        );

        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div ref={containerRef} className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
            <div ref={headerRef} className="w-full mb-6 text-left">
                <button
                    onClick={onBack}
                    className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 mb-4 text-sm transition-transform hover:-translate-x-1"
                >
                    ← Back to Passport Generator
                </button>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500 flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                    How to Restore Old Photos using Gemini
                </h2>
                <p className="text-gray-500 mt-2 text-lg">
                    Follow these simple steps to manually restore and colorize your vintage photos.
                </p>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* English Instructions */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                        Detailed Guide (English)
                    </h3>
                    <ul ref={englishListRef} className="space-y-4 text-gray-600 dark:text-gray-300">
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">1</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">Open Google Gemini</strong>
                                Go to the <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold underline inline-flex items-center gap-1 transition-colors">Google Gemini website <ExternalLink className="w-3 h-3" /></a> and sign in with your Google account.
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">2</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">Copy the Magic Prompt</strong>
                                Click the <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-600">Copy Prompt</span> button below to automatically copy the expert instructions.
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">3</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">Upload and Paste</strong>
                                In the Gemini chat window, click the <strong className="text-gray-700 dark:text-gray-300">+</strong> icon to upload your old, faded, or damaged photo. Then, right-click and paste the prompt you copied into the message box.
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">4</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">Send and Download</strong>
                                Hit send. Gemini's AI will analyze the photo, repair scratches, and accurately colorize it based on the prompt. Once it generates the new image, you can click it to download the high-resolution result.
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Bengali Instructions */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                        বিস্তারিত নির্দেশিকা (বাংলা)
                    </h3>
                    <ul ref={bengaliListRef} className="space-y-4 text-gray-600 dark:text-gray-300 font-bengali">
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">১</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">গুগল জেমিনি (Google Gemini) খুলুন</strong>
                                প্রথমেই <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold underline inline-flex items-center gap-1 transition-colors">Google Gemini-এর ওয়েবসাইটে <ExternalLink className="w-3 h-3" /></a> যান এবং আপনার গুগল অ্যাকাউন্ট দিয়ে লগ-ইন করুন।
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">২</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">ম্যাজিক প্রম্পট কপি করুন</strong>
                                নিচের <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-600">Copy Prompt</span> বোতামে ক্লিক করুন। এতে বিশেষজ্ঞ নির্দেশাবলী (English text) স্বয়ংক্রিয়ভাবে কপি হয়ে যাবে।
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">৩</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">ছবি আপলোড এবং টেক্সট পেস্ট করুন</strong>
                                জেমিনির চ্যাট বক্সে <strong className="text-gray-700 dark:text-gray-300">+</strong> আইকনে ক্লিক করে আপনার পুরনো, অস্পষ্ট বা ক্ষতিগ্রস্ত ছবিটি আপলোড করুন। তারপর মেসেজ বক্সে রাইট-ক্লিক করে কপি করা টেক্সটটি পেস্ট করে দিন।
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm">৪</span>
                            <div>
                                <strong className="block text-gray-800 dark:text-gray-200">সেন্ড করুন এবং ডাউনলোড করুন</strong>
                                মেসেজ পাঠিয়ে দিন (Send)। জেমিনি (AI) আপনার ছবিটি বিশ্লেষণ করে দাগ মুছে ফেলবে এবং প্রম্পট অনুযায়ী সুন্দর রং যোগ করবে। নতুন ছবিটি তৈরি হলে সেটিতে ক্লিক করে হাই-রেজোলিউশনে ডাউনলোড করে নিন।
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div ref={promptBoxRef} className="w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-6 rounded-3xl shadow-inner border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2">
                        Magic Restoration Prompt
                    </h3>
                    <button
                        onClick={handleCopy}
                        className={`copy-btn flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-md
                            ${copied
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                    >
                        {copied ? (
                            <><CheckCircle className="w-4 h-4" /> Copied!</>
                        ) : (
                            <><Copy className="w-4 h-4" /> Copy Prompt</>
                        )}
                    </button>
                </div>
                <div className="relative">
                    <pre className="w-full bg-white dark:bg-gray-900 p-6 rounded-2xl text-gray-700 dark:text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap border border-gray-200 dark:border-gray-700 h-64 overflow-y-auto font-mono leading-relaxed shadow-sm">
                        {promptText}
                    </pre>
                </div>
            </div>
        </div>
    );
}
