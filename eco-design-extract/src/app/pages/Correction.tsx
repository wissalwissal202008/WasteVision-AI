import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategoryColor } from '../utils/categoryColors';
import { toast } from 'sonner';

export function Correction() {
  const navigate = useNavigate();
  const { currentScan, updateScan } = useApp();
  const [objectName, setObjectName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!currentScan) {
      navigate('/');
    } else {
      setObjectName(currentScan.objectName);
      setSelectedCategory(currentScan.category);
    }
  }, [currentScan, navigate]);

  if (!currentScan) return null;

  const categories = [
    { value: 'recyclable', label: 'Recyclable ♻️', icon: '♻️' },
    { value: 'plastic', label: 'Plastique', icon: '🟡' },
    { value: 'glass', label: 'Verre', icon: '🔵' },
    { value: 'paper', label: 'Papier', icon: '🟠' },
    { value: 'metal', label: 'Métal', icon: '⚪' },
    { value: 'compost', label: 'Compost', icon: '🟢' },
    { value: 'non-recyclable', label: 'Non recyclable', icon: '⚫' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objectName.trim() || !selectedCategory) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Update the scan
    updateScan(currentScan.id, {
      objectName: objectName.trim(),
      category: selectedCategory as any,
    });

    setIsSubmitted(true);
    toast.success('Merci pour votre correction ! L\'IA apprend de vos retours.');

    // Navigate back after a delay
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/result')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour au résultat</span>
      </motion.button>

      {/* Correction Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8"
      >
        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6"
            >
              <Check className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Correction envoyée !
            </h2>
            <p className="text-gray-600">
              Merci d'avoir contribué à améliorer WasteVision AI 🌱
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Corriger l'identification
              </h2>
              <p className="text-gray-600">
                Aidez-nous à améliorer la précision de l'IA en corrigeant les informations
              </p>
            </motion.div>

            {/* Image preview */}
            {currentScan.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6 rounded-2xl overflow-hidden"
              >
                <img
                  src={currentScan.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </motion.div>
            )}

            {/* Object name input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom correct de l'objet
              </label>
              <input
                type="text"
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                placeholder="Ex: Bouteille en plastique"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </motion.div>

            {/* Category selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Catégorie correcte
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((category, index) => {
                  const categoryColor = getCategoryColor(category.value);
                  const isSelected = selectedCategory === category.value;

                  return (
                    <motion.button
                      key={category.value}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-current shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: isSelected ? categoryColor.light : 'white',
                        color: isSelected ? categoryColor.text : '#374151',
                      }}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-xs font-semibold">{category.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-5 h-5" />
              <span className="font-semibold">Envoyer la correction</span>
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
