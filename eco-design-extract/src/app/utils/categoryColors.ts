export const categoryColors = {
  recyclable: {
    bg: '#10b981', // green-500
    light: '#d1fae5', // green-100
    text: '#065f46', // green-800
  },
  'non-recyclable': {
    bg: '#6b7280', // gray-500
    light: '#f3f4f6', // gray-100
    text: '#1f2937', // gray-800
  },
  glass: {
    bg: '#3b82f6', // blue-500
    light: '#dbeafe', // blue-100
    text: '#1e3a8a', // blue-900
  },
  plastic: {
    bg: '#eab308', // yellow-500
    light: '#fef9c3', // yellow-100
    text: '#713f12', // yellow-900
  },
  paper: {
    bg: '#f97316', // orange-500
    light: '#ffedd5', // orange-100
    text: '#7c2d12', // orange-900
  },
  metal: {
    bg: '#64748b', // slate-500
    light: '#f1f5f9', // slate-100
    text: '#1e293b', // slate-900
  },
  compost: {
    bg: '#84cc16', // lime-500
    light: '#ecfccb', // lime-100
    text: '#3f6212', // lime-900
  },
};

export function getCategoryColor(category: string) {
  return categoryColors[category as keyof typeof categoryColors] || categoryColors['non-recyclable'];
}
