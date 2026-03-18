import { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ExportStepProps {
    processedImageBlobUrl: string;
    onReset: () => void;
}

type SheetSize = 'full' | 'half' | 'third';

const SHEET_DIMENSIONS = {
    full: { width: 2480, height: 3508, label: 'Full A4' },
    half: { width: 1240, height: 3508, label: '1/2 A4' },
    third: { width: 826, height: 3508, label: '1/3 A4' },
};

const PHOTO_WIDTH = 350;
const PHOTO_HEIGHT = 450;
const GAP = 40;

export function ExportStep({ processedImageBlobUrl, onReset }: ExportStepProps) {
    const [copies, setCopies] = useState(8);
    const [sheetSize, setSheetSize] = useState<SheetSize>('full');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const settingsPanelRef = useRef<HTMLDivElement>(null);
    const previewPanelRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Reveal the main container
        tl.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );

        // Stagger settings panel children
        if (settingsPanelRef.current) {
            tl.fromTo(settingsPanelRef.current.children,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
                "-=0.3"
            );
        }

        // Slide up preview panel
        tl.fromTo(previewPanelRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1)' },
            "-=0.4"
        );
    }, { scope: containerRef });

    useEffect(() => {
        const drawGrid = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const currentDim = SHEET_DIMENSIONS[sheetSize];

            // Update canvas dims internally
            canvas.width = currentDim.width;
            canvas.height = currentDim.height;

            // Reset canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, currentDim.width, currentDim.height);

            const img = new Image();
            img.onload = () => {
                let maxCols = Math.floor((currentDim.width + GAP) / (PHOTO_WIDTH + GAP));
                let currentGap = GAP;

                if (sheetSize === 'half') {
                    maxCols = 3;
                    currentGap = 47;
                } else if (sheetSize === 'third') {
                    maxCols = 2;
                    currentGap = 42;
                }

                const startX = 40;
                const startY = 50; // Top margin

                let count = 0;
                let row = 0;
                let col = 0;

                while (count < copies) {
                    if (col >= maxCols) {
                        col = 0;
                        row++;
                    }
                    const x = startX + col * (PHOTO_WIDTH + Math.max(0, currentGap));
                    const y = startY + row * (PHOTO_HEIGHT + GAP);

                    // If we run out of vertical space on one sheet, we stop.
                    if (y + PHOTO_HEIGHT > currentDim.height - 100) {
                        break;
                    }

                    // Draw cutting border (optional thin border)
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x - 1, y - 1, PHOTO_WIDTH + 2, PHOTO_HEIGHT + 2);

                    // Draw the photo
                    ctx.drawImage(img, x, y, PHOTO_WIDTH, PHOTO_HEIGHT);

                    col++;
                    count++;
                }

                // Animate canvas update
                if (canvasRef.current) {
                    gsap.fromTo(canvasRef.current, { scale: 0.98, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power1.out' });
                }
            };
            img.src = processedImageBlobUrl;
        };

        drawGrid();
    }, [processedImageBlobUrl, copies, sheetSize]);

    const handleDownloadJPG = () => {
        if (!canvasRef.current) return;
        gsap.fromTo('.btn-jpg', { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        const url = canvasRef.current.toDataURL('image/jpeg', 1.0);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passport_sheet_${copies}_copies_${sheetSize}.jpg`;
        a.click();
    };

    const handleDownloadPDF = () => {
        if (!canvasRef.current) return;
        gsap.fromTo('.btn-pdf', { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);

        // Use landscape mode if the height is less than the width (i.e., half or third size)
        const orientation = sheetSize === 'full' ? 'p' : 'l';
        const pdf = new jsPDF(orientation, 'mm', 'a4');

        // PDF width & height in mm
        const pdfWidth = pdf.internal.pageSize.getWidth();
        // Maintain the canvas aspect ratio on the PDF page
        const pdfHeight = (canvasRef.current.height * pdfWidth) / canvasRef.current.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`passport_sheet_${copies}_copies_${sheetSize}.pdf`);
    };

    const handlePrint = () => {
        if (!canvasRef.current) return;
        gsap.fromTo('.btn-print', { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        const imgData = canvasRef.current.toDataURL('image/jpeg', 1.0);

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Passport Photos</title>
                        <style>
                            @media print {
                                @page { margin: 0; size: auto; }
                                body { margin: 0; padding: 0; display: block; background: #fff; }
                                img { 
                                    max-width: 100vw;
                                    max-height: 100vh;
                                    object-fit: contain;
                                    display: block;
                                    margin: 0;
                                    page-break-after: avoid;
                                    page-break-before: avoid;
                                    page-break-inside: avoid;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imgData}" onload="window.print(); window.close();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div ref={containerRef} className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start justify-center p-4">

            {/* Settings Side */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                <div ref={settingsPanelRef} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                        Print Layout
                    </h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sheet Size
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {(Object.keys(SHEET_DIMENSIONS) as SheetSize[]).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        setSheetSize(size);
                                        // Auto-set the recommended copies based on user requirement
                                        if (size === 'half') setCopies(3);
                                        else if (size === 'third') setCopies(2);
                                        else setCopies(8); // Reset to something sensible for full A4
                                    }}
                                    className={`py-2 text-sm font-semibold rounded-lg transition-all ${sheetSize === size
                                        ? 'bg-blue-600 text-white shadow-md scale-105'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-[1.02]'
                                        }`}
                                >
                                    {SHEET_DIMENSIONS[size].label}
                                </button>
                            ))}
                        </div>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Number of Copies (Max 30)
                        </label>
                        <div className="flex items-center gap-4 mb-6">
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={copies}
                                onChange={(e) => {
                                    const val = Math.max(1, Math.min(30, Number(e.target.value)));
                                    setCopies(val);
                                }}
                                className="w-full p-3 font-semibold text-lg bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all focus:scale-[1.02]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleDownloadJPG}
                            className="btn-jpg w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Download JPG
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="btn-pdf w-full py-4 bg-white dark:bg-gray-800 border-2 border-orange-500 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            <FileText className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Download PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="btn-print w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            <Printer className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Print Now
                        </button>
                    </div>

                    <button
                        onClick={onReset}
                        className="w-full mt-6 py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Start Over
                    </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl text-sm text-blue-800 dark:text-blue-300 transition-transform hover:scale-[1.02]">
                    <p className="font-semibold mb-2">Printing Tips:</p>
                    <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-400">
                        <li>Print on high-quality A4 glossy photo paper.</li>
                        <li>In your printer settings, select <strong>"Actual Size"</strong> or <strong>"Scale 100%"</strong> to preserve exactly 3.5x4.5cm.</li>
                        <li>Cut along the thin gray borders using scissors or a paper trimmer.</li>
                    </ul>
                </div>
            </div>

            {/* Preview Side */}
            <div
                ref={previewPanelRef}
                className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-3xl shadow-inner p-6 flex flex-col items-center justify-center overflow-auto max-h-[85vh] border border-gray-200 dark:border-gray-800"
            >
                <p className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-widest">
                    A4 Print Preview
                </p>
                <div className="bg-white shadow-2xl transition-all flex justify-center items-start overflow-auto rounded-md">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto max-w-full drop-shadow-md origin-top"
                        style={{ maxWidth: 'min(100%, 600px)', height: 'auto', border: '1px solid #e5e7eb' }}
                    />
                </div>
            </div>

        </div>
    );
}
