'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { 
    X, 
    Check, 
    RotateCw, 
    ZoomIn, 
    Maximize, 
    Image as ImageIcon,
    Crop as CropIcon,
    Monitor,
    Smartphone
} from 'lucide-react';
import { getCroppedImgBlob } from '@/utils/canvasUtils';
import { Button } from '@/components/common/Button';

const ASPECT_RATIOS = [
    { value: 1 / 1, text: '1:1', icon: <CropIcon size={16} /> },
    { value: 16 / 9, text: '16:9', icon: <Monitor size={16} /> },
    { value: 4 / 3, text: '4:3', icon: <ImageIcon size={16} /> },
    { value: 9 / 16, text: '9:16', icon: <Smartphone size={16} /> },
    { value: null, text: 'Free', icon: <Maximize size={16} /> },
];

export const ImageEditor = ({ imageSrc, onSave, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const blob = await getCroppedImgBlob(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            onSave(blob);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur border-b border-white/10">
                <div className="flex items-center gap-2">
                    <CropIcon className="text-white" size={20} />
                    <span className="text-white font-medium">Edit Image</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={onCancel}
                        disabled={loading}
                        className="!bg-white/10 !text-white hover:!bg-white/20 !border-transparent"
                    >
                        Cancel
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={handleSave}
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                    >
                        Save Copy
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 bg-[#1a1a1a] overflow-hidden">
                <div className="absolute inset-0 bottom-20">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        classes={{
                            containerClassName: "bg-[#1a1a1a]",
                            mediaClassName: "",
                        }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="bg-[#2a2a2a] border-t border-white/10 p-4 pb-8 space-y-4">
                
                {/* Aspect Ratio Selector */}
                <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                    {ASPECT_RATIOS.map((ratio) => (
                        <button
                            key={ratio.text}
                            onClick={() => setAspect(ratio.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                ${aspect === ratio.value 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {ratio.icon}
                            {ratio.text}
                        </button>
                    ))}
                </div>

                <div className="max-w-xl mx-auto grid grid-cols-2 gap-8 px-4">
                    {/* Zoom Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1"><ZoomIn size={12} /> Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1"><RotateCw size={12} /> Rotate</span>
                            <span>{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
