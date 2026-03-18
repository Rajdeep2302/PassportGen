import { useState } from 'react';
import { X, Globe } from 'lucide-react';

interface HelpModalProps {
    onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
    const [lang, setLang] = useState<'en' | 'bn'>('en');

    const content = {
        en: {
            title: "How to use PassportGen",
            steps: [
                "1. Upload a clear, front-facing photo of yourself.",
                "2. Wait for the secure backend AI to automatically remove the background.",
                "3. Crop your photo to the standard 3.5 x 4.5 cm proportion and pick a background color.",
                "4. Fine-tune your photo's brightness, contrast, and saturation.",
                "5. Select your paper size, adjust the number of copies, and easily Print or Download your ready-to-use passport sheet!"
            ],
            dev: "Developed by Rajdeep Pal"
        },
        bn: {
            title: "কীভাবে PassportGen ব্যবহার করবেন",
            steps: [
                "১. আপনার নিজের একটি পরিষ্কার এবং সামনের দিক থেকে তোলা ছবি আপলোড করুন।",
                "২. মূল পটভূমিটি স্বয়ংক্রিয়ভাবে অপসারণ করার জন্য নিরাপদ AI-এর জন্য অপেক্ষা করুন।",
                "৩. আপনার ছবিটিকে ৩.৫ x ৪.৫ সেমি অনুপাতে ক্রপ করুন এবং পটভূমির রঙ নির্বাচন করুন।",
                "৪. আপনার ছবির উজ্জ্বলতা (Brightness), বৈসাদৃশ্য (Contrast), এবং স্যাচুরেশন (Saturation) ঠিক করুন।",
                "৫. আপনার কাগজের আকার নির্বাচন করুন, কপির সংখ্যা ঠিক করুন, এবং সরাসরি প্রিন্ট বা ডাউনলোড করুন!"
            ],
            dev: "ডেভেলপার: Rajdeep Pal"
        }
    };

    const current = content[lang];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{current.title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                            className="flex items-center gap-2 text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'en' ? 'বাংলা-তে পড়ুন' : 'Read in English'}
                        </button>
                    </div>

                    <ul className="space-y-4">
                        {current.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-gray-600 dark:text-gray-300">
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {current.dev}
                    </p>
                </div>
            </div>
        </div>
    );
}
