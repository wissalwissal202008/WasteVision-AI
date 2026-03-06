import { ScanResult } from '../context/AppContext';

const mockResults = [
  {
    objectName: 'Bouteille en plastique',
    material: 'Plastique PET',
    category: 'plastic' as const,
    advice: 'Placez dans la poubelle jaune. Pensez à retirer le bouchon et à rincer la bouteille.',
  },
  {
    objectName: 'Canette en aluminium',
    material: 'Aluminium',
    category: 'metal' as const,
    advice: 'Placez dans la poubelle jaune. 100% recyclable à l\'infini !',
  },
  {
    objectName: 'Bocal en verre',
    material: 'Verre',
    category: 'glass' as const,
    advice: 'Placez dans le conteneur à verre. Retirez le couvercle métallique.',
  },
  {
    objectName: 'Journal',
    material: 'Papier',
    category: 'paper' as const,
    advice: 'Placez dans la poubelle bleue. Évitez de le froisser pour faciliter le recyclage.',
  },
  {
    objectName: 'Épluchures de légumes',
    material: 'Organique',
    category: 'compost' as const,
    advice: 'Placez dans le bac à compost. Excellent pour enrichir la terre !',
  },
  {
    objectName: 'Sac plastique',
    material: 'Plastique souple',
    category: 'non-recyclable' as const,
    advice: 'Non recyclable dans la plupart des centres. Préférez les sacs réutilisables.',
  },
];

export async function mockAIAnalysis(imageData: string): Promise<Omit<ScanResult, 'id' | 'timestamp' | 'imageUrl'>> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a random mock result
  const result = mockResults[Math.floor(Math.random() * mockResults.length)];
  return result;
}
