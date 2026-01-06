
import React, { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Não foi possível acessar a câmera.");
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex flex-col items-center justify-center">
          <div className="w-64 h-80 border-2 border-dashed border-green-500 rounded-lg"></div>
          <p className="text-white text-xs mt-4 bg-black/50 px-2 py-1 rounded">Alinhe o rótulo aqui</p>
        </div>
      </div>
      
      <div className="mt-8 flex gap-6 items-center">
        <button 
          onClick={onClose}
          className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <button 
          onClick={capture}
          className="w-20 h-20 rounded-full bg-white border-8 border-gray-300 flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-full border-2 border-gray-100 bg-white"></div>
        </button>
        
        <div className="w-14"></div>
      </div>
    </div>
  );
};

export default CameraCapture;
