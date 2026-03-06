import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Recycle, Leaf, ArrowLeft, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategoryColor } from '../utils/categoryColors';

export function Result() {
  const navigate = useNavigate();
  const { currentScan } = useApp();

  useEffect(() => {
    if (!currentScan) {
      navigate('/');
    }
  }, [currentScan, navigate]);

  if (!currentScan) return null;

  const categoryColor = getCategoryColor(currentScan.category);

  const categoryLabels: Record<string, string> = {
    recyclable: 'Recyclable ♻️',
    'non-recyclable': 'Non recyclable',
    glass: 'Verre',
    plastic: 'Plastique',
    paper: 'Papier',
    metal: 'Métal',
    compost: 'Compost',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    recyclable: <Recycle className="w-6 h-6" />,
    'non-recyclable': <AlertCircle className="w-6 h-6" />,
    glass: <CheckCircle2 className="w-6 h-6" />,
    plastic: <Recycle className="w-6 h-6" />,
    paper: <Recycle className="w-6 h-6" />,
    metal: <Recycle className="w-6 h-6" />,
    compost: <Leaf className="w-6 h-6" />,
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour</span>
      </motion.button>

      {/* Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Image */}
        {currentScan.imageUrl && (
          <div className="relative h-64 bg-gray-100">
            <img
              src={currentScan.imageUrl}
              alt={currentScan.objectName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Success badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </motion.div>
          </div>
        )}

        <div className="p-6">
          {/* Object name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentScan.objectName}
            </h2>
            <p className="text-gray-500 text-lg mb-6">{currentScan.material}</p>
          </motion.div>

          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md"
              style={{
                backgroundColor: categoryColor.light,
                color: categoryColor.text,
              }}
            >
              {categoryIcons[currentScan.category]}
              <span className="font-bold">{categoryLabels[currentScan.category]}</span>
            </div>
          </motion.div>

          {/* Advice Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: categoryColor.light }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: categoryColor.bg }}
              >
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1" style={{ color: categoryColor.text }}>
                  Conseil écologique
                </h3>
                <p className="text-sm" style={{ color: categoryColor.text }}>
                  {currentScan.advice}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/correction')}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-semibold">Corriger</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Recycle className="w-5 h-5" />
              <span className="font-semibold">Nouveau scan</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Info tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center"
      >
        <p className="text-sm text-blue-800">
          💡 <strong>Astuce :</strong> Si la détection est incorrecte, utilisez le bouton "Corriger" pour améliorer l'IA
        </p>
      </motion.div>
    </div>
  );
}
