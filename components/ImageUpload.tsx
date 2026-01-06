
import React, { useState } from 'react';
import CameraCapture from './CameraCapture';

interface ImageUploadProps {
  onImagesReady: (images: string[]) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesReady, disabled }) => {
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Cast Array.from result to File[] to ensure 'file' is correctly typed as Blob/File in forEach
    const filesArray = Array.from(files).slice(0, 2 - images.length) as File[];
    
    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImages(prev => {
          const newImages = [...prev, result].slice(0, 2);
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCapture = (capturedImage: string) => {
    setImages(prev => {
      const newImages = [...prev, capturedImage].slice(0, 2);
      return newImages;
    });
    setShowCamera(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = () => {
    if (images.length > 0) {
      onImagesReady(images);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Capturar Rótulo
      </h2>
      
      <p className="text-sm text-gray-500 mb-6">
        Tire uma foto dos <span className="font-semibold text-gray-700">Ingredientes</span> e da <span className="font-semibold text-gray-700">Tabela Nutricional</span>. Máximo de 2 fotos.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden group">
            <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        {images.length < 2 && (
          <div className="flex flex-col gap-2">
            <button 
              disabled={disabled}
              onClick={() => setShowCamera(true)}
              className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50/30 transition-all group disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-gray-300 group-hover:text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              <span className="text-xs font-medium text-gray-500 group-hover:text-green-600">Câmera</span>
            </button>
            <label className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
              <input 
                type="file" 
                accept="image/*" 
                multiple={images.length === 0}
                onChange={handleFileUpload} 
                className="hidden" 
                disabled={disabled}
              />
              <svg className="w-8 h-8 text-gray-300 group-hover:text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Arquivo</span>
            </label>
          </div>
        )}
      </div>

      <button 
        onClick={startAnalysis}
        disabled={images.length === 0 || disabled}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          images.length > 0 
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Analisar Agora
      </button>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ImageUpload;
