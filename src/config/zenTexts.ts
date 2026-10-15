/**
 * Biblioteca de Textos Cosy y Relajantes para Modo Zen (Fundamentados en Cero Estrés)
 * Textos con significado, literatura infantil, naturaleza y frases formativas en español.
 */

export interface ZenTextItem {
  id: string;
  category: 'fabulistas' | 'principito' | 'naturaleza' | 'filosofia_cosy';
  categoryTitle: string;
  title: string;
  author: string;
  wordCount: number;
  text: string;
  calmPalette: {
    accent: string;
    bgSoft: string;
  };
}

export const ZEN_TEXTS: ZenTextItem[] = [
  // =========================================================================
  // NATURALEZA Y BOSQUES
  // =========================================================================
  {
    id: 'zen_robledal',
    category: 'naturaleza',
    categoryTitle: '🌱 Naturaleza y Tierra',
    title: 'El Susurro del Robledal',
    author: 'Bosque Andino',
    wordCount: 38,
    text: 'Bajo la sombra fresca de los robles antiguos, las hojas doradas caen despacio sobre el camino de piedra. El viento suave canta entre las ramas altas y recuerda que cada arbol comenzo como una semilla paciente.',
    calmPalette: {
      accent: '#10B981',
      bgSoft: 'rgba(16, 185, 129, 0.08)'
    }
  },
  {
    id: 'zen_barichara',
    category: 'naturaleza',
    categoryTitle: '🌱 Naturaleza y Tierra',
    title: 'Tierra Amarilla de Barichara',
    author: 'Caminos de Tapia',
    wordCount: 36,
    text: 'Las piedras tibias guardan la luz del sol al atardecer. El olor a tierra cocida y flores de jazmin flota en las calles blancas, donde el tiempo camina sin prisa y el silencio abraza el horizonte.',
    calmPalette: {
      accent: '#F59E0B',
      bgSoft: 'rgba(245, 158, 11, 0.08)'
    }
  },
  {
    id: 'zen_rio',
    category: 'naturaleza',
    categoryTitle: '🌱 Naturaleza y Tierra',
    title: 'El Canto del Agua',
    author: 'Manantial de Montaña',
    wordCount: 34,
    text: 'El arroyo claro salta entre guijarros redondos con un murmullo cristalino. Los peces pequenos juegan con los reflejos del cielo azul, recordandonos fluir con suavidad y calmar nuestras aguas interiores.',
    calmPalette: {
      accent: '#00C2E0',
      bgSoft: 'rgba(0, 194, 224, 0.08)'
    }
  },

  // =========================================================================
  // EL PRINCIPITO
  // =========================================================================
  {
    id: 'zen_principito_zorro',
    category: 'principito',
    categoryTitle: '🦊 El Principito',
    title: 'Lo Esencial es Invisible a los Ojos',
    author: 'Antoine de Saint-Exupéry',
    wordCount: 42,
    text: 'No se ve bien sino con el corazon. Lo esencial es invisible a los ojos. El tiempo que perdiste por tu rosa hace que tu rosa sea tan importante. Eres responsable para siempre de aquello que has domesticado.',
    calmPalette: {
      accent: '#EC4899',
      bgSoft: 'rgba(236, 72, 153, 0.08)'
    }
  },
  {
    id: 'zen_principito_estrellas',
    category: 'principito',
    categoryTitle: '🦊 El Principito',
    title: 'Estrellas que Saben Reír',
    author: 'Antoine de Saint-Exupéry',
    wordCount: 39,
    text: 'Todas las personas tienen estrellas, pero no significan lo mismo para todos. Para los que viajan, son guias. Para otros, pequenas luces. Para ti, todas las estrellas sabran reir cuando mires el cielo de noche.',
    calmPalette: {
      accent: '#8B5CF6',
      bgSoft: 'rgba(139, 92, 246, 0.08)'
    }
  },

  // =========================================================================
  // FÁBULAS Y FILOSOFÍA COSY
  // =========================================================================
  {
    id: 'zen_tortuga',
    category: 'fabulistas',
    categoryTitle: '🐢 Fábulas Clásicas',
    title: 'Paso a Paso de la Tortuga',
    author: 'Esopo',
    wordCount: 37,
    text: 'Poco a poco, con paso constante y respiracion serena, la tortuga avanzo por el sendero verde. No miro atras ni busco correr, pues comprendio que la constancia y la calma siempre llegan a buen puerto.',
    calmPalette: {
      accent: '#3B82F6',
      bgSoft: 'rgba(59, 130, 246, 0.08)'
    }
  },
  {
    id: 'zen_nido',
    category: 'filosofia_cosy',
    categoryTitle: '🪶 Calma Interior',
    title: 'El Arte de Respirar al Teclear',
    author: 'Typoniac Zen',
    wordCount: 40,
    text: 'Tus dedos son como plumas ligeras sobre la madera. Cuando escribes sin prisa, las palabras florecen solas en la pantalla. Respira hondo, relaja los hombros y disfruta el compas cristalino que nace de tus manos.',
    calmPalette: {
      accent: '#06B6D4',
      bgSoft: 'rgba(6, 182, 212, 0.08)'
    }
  }
];
