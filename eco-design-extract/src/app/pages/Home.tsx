import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Upload, Sparkles, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { mockAIAnalysis } from '../utils/mockAI';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Home() {
  const navigate = useNavigate();
  const { addScan } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageCapture = async (file: File) => {
    setIsAnalyzing(true);
    
    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    
    try {
      // Simulate AI analysis
      const result = await mockAIAnalysis(imageUrl);
      
      // Add to scans
      addScan({
        ...result,
        id: Date.now().toString(),
        timestamp: new Date(),
        imageUrl,
      });
      
      // Navigate to result page
      navigate('/result');
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraClick = () => {
    // On mobile, this will open the camera
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment' as any;
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    // Open file picker for gallery
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-lg p-8 mb-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-green-300 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lime-200 to-emerald-300 rounded-full blur-2xl opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Scanner un déchet</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Prenez une photo de votre déchet pour découvrir comment le recycler correctement. L'IA vous guidera !
          </p>

          {/* Image preview */}
          <div className="mb-6 rounded-2xl overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758547343136-19d27f9cb57f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXN0ZSUyMHNvcnRpbmclMjBiaW5zfGVufDF8fHx8MTc3MjgwMTQyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Waste sorting"
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCameraClick}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-6 h-6" />
              <span className="font-semibold">Prendre une photo</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGalleryClick}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-3 bg-white border-2 border-emerald-500 text-emerald-700 px-6 py-4 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-6 h-6" />
              <span className="font-semibold">Importer une image</span>
            </motion.button>
          </div>

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-medium">Analyse en cours...</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"
      >
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold mb-2">Comment ça marche ?</h3>
            <ul className="space-y-2 text-sm text-emerald-50">
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">1.</span>
                <span>Prenez une photo nette de votre déchet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">2.</span>
                <span>L'IA identifie automatiquement l'objet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-bold">3.</span>
                <span>Suivez les conseils de recyclage adaptés</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
