import { motion } from 'motion/react';
import { Recycle, TrendingUp, Award, Leaf, Droplet, TreePine } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { getCategoryColor } from '../utils/categoryColors';

export function Dashboard() {
  const { scans } = useApp();

  // Calculate statistics
  const totalScans = scans.length;
  const categoryCounts = scans.reduce((acc, scan) => {
    acc[scan.category] = (acc[scan.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for pie chart
  const pieData = Object.entries(categoryCounts).map(([category, count], index) => ({
    name: category,
    value: count,
    color: getCategoryColor(category).bg,
    id: `${category}-${index}`, // Add unique ID
  }));

  // Calculate environmental impact (mock calculation)
  const co2Saved = totalScans * 0.5; // kg of CO2
  const waterSaved = totalScans * 10; // liters
  const treesSaved = Math.floor(totalScans / 10);

  // Mock weekly data
  const weeklyData = [
    { day: 'Lun', count: 3 },
    { day: 'Mar', count: 5 },
    { day: 'Mer', count: 2 },
    { day: 'Jeu', count: 7 },
    { day: 'Ven', count: 4 },
    { day: 'Sam', count: 6 },
    { day: 'Dim', count: 3 },
  ];

  // Badges system
  const badges = [
    { 
      id: 'beginner', 
      name: 'Débutant', 
      icon: '🌱', 
      unlocked: totalScans >= 1,
      description: 'Premier scan réalisé'
    },
    { 
      id: 'eco-warrior', 
      name: 'Éco-guerrier', 
      icon: '♻️', 
      unlocked: totalScans >= 10,
      description: '10 déchets triés'
    },
    { 
      id: 'planet-hero', 
      name: 'Héros planétaire', 
      icon: '🌍', 
      unlocked: totalScans >= 50,
      description: '50 déchets triés'
    },
    { 
      id: 'eco-master', 
      name: 'Maître écolo', 
      icon: '🏆', 
      unlocked: totalScans >= 100,
      description: '100 déchets triés'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Suivez votre impact écologique</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Recycle className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">{totalScans}</div>
          <div className="text-sm text-emerald-100">Déchets triés</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Droplet className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">{waterSaved}L</div>
          <div className="text-sm text-blue-100">Eau économisée</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-lime-500 to-green-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Leaf className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">{co2Saved}kg</div>
          <div className="text-sm text-lime-100">CO₂ économisé</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition par catégorie</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {pieData.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gray-700 capitalize">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Recycle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune donnée disponible</p>
              <p className="text-sm">Scannez vos premiers déchets !</p>
            </div>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Activité hebdomadaire</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Badges & Récompenses</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`text-center p-4 rounded-xl border-2 transition-all ${
                badge.unlocked
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="text-sm font-bold text-gray-900 mb-1">{badge.name}</div>
              <div className="text-xs text-gray-500">{badge.description}</div>
              {badge.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2"
                >
                  <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Débloqué
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Impact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <TreePine className="w-8 h-8" />
          <h3 className="text-xl font-bold">Votre impact écologique</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{co2Saved} kg</div>
            <div className="text-sm text-emerald-100">de CO₂ économisé</div>
            <div className="text-xs text-emerald-50 mt-2">
              Équivalent à {Math.floor(co2Saved * 2)} km en voiture
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{waterSaved} L</div>
            <div className="text-sm text-emerald-100">d'eau économisée</div>
            <div className="text-xs text-emerald-50 mt-2">
              Équivalent à {Math.floor(waterSaved / 10)} douches
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{treesSaved}</div>
            <div className="text-sm text-emerald-100">arbres sauvés</div>
            <div className="text-xs text-emerald-50 mt-2">
              Grâce à votre recyclage
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}