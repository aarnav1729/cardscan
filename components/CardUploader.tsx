
import React, { useRef, useState } from 'react';
import { ensurePuterLoaded } from "../services/geminiService";
import { ScanStatus } from '../types';

interface CardUploaderProps {
  onCapture: (imageUrl: string) => void;
  status: ScanStatus;
  error: string | null;
}

export const CardUploader: React.FC<CardUploaderProps> = ({ onCapture, status, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const ensurePuterSignedIn = async () => {
    const puter = await ensurePuterLoaded();
    // Optional but recommended: sign-in on user gesture to avoid popup blockers
    if (puter?.auth?.isSignedIn && !puter.auth.isSignedIn()) {
      await puter.auth.signIn({ attempt_temp_user_creation: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(imageUrl);
        stopCamera();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">New Scan</h3>
          <p className="text-gray-500">Capture or upload any business card to instantly extract its details with high precision.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
             onClick={async () => {
              try {
                await ensurePuterSignedIn();
                fileInputRef.current?.click();
              } catch (e) {
                console.error(e);
                alert("Please allow popups to sign in to Puter, then try again.");
              }
            }}
            
              disabled={status === ScanStatus.SCANNING || isCameraActive}
              className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Image</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />

            {!isCameraActive ? (
              <button
                onClick={startCamera}
                disabled={status === ScanStatus.SCANNING}
                className="flex-1 gradient-bg text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Live Capture</span>
              </button>
            ) : (
              <button
                onClick={capturePhoto}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Take Photo</span>
              </button>
            )}
          </div>
          
          {isCameraActive && (
            <button 
              onClick={stopCamera}
              className="text-sm text-red-500 hover:underline w-full text-center"
            >
              Cancel Camera
            </button>
          )}

          {status === ScanStatus.SCANNING && (
            <div className="flex items-center space-x-3 text-indigo-600 font-medium animate-pulse">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Gemini AI is analyzing your card...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
          {isCameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-center p-8">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-400 font-medium">Capture Preview</p>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};
