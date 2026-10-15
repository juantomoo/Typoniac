/**
 * Tema Visual "OSU! Light Edition"
 * Diseñado bajo principios de ergonomía visual infantil para evitar estrés escotópico,
 * saturación de contraste oscuro y sobreestimulación dopaminérgica.
 */
export const THEME = {
  // Lienzo y Fondos
  bgCanvas: '#F8FAFC',       // Blanco crema/lavanda ultra suave
  bgSurface: '#FFFFFF',      // Superficie limpia cristalina
  bgCard: 'rgba(255, 255, 255, 0.85)',
  bgGlass: 'rgba(255, 255, 255, 0.65)',
  borderSoft: 'rgba(226, 232, 240, 0.8)',
  
  // Elementos Cromáticos de Alto Contraste
  primaryCyan: '#00C2E0',    // Guías de flujo y tracks de aproximación
  softPink: '#FF6B8B',       // Columna izquierda meñique y acentos
  mintGreen: '#20C997',      // Ventana PERFECT y dedo anular izquierdo
  warmYellow: '#FFC107',     // Downbeats e iluminación medio derecho
  coralRed: '#FF5252',       // Dedo índice izquierdo y anclaje F
  navyBlue: '#3B82F6',       // Dedo índice derecho y anclaje J
  softOrange: '#FB8C00',     // Dedo anular derecho
  softViolet: '#9C27B0',     // Dedo meñique derecho
  thumbGray: '#94A3B8',      // Pulgares (Barra espaciadora)

  // Juicios de Precisión
  perfect: '#10B981',        // Verde esmeralda brillante
  great: '#3B82F6',          // Azul cielo brillante
  miss: '#94A3B8',           // Gris suave (cero timbres punitivos estruendosos)

  // Sombras y Luces
  glowSoft: '0 8px 32px rgba(0, 194, 224, 0.15)',
  glowFingers: '0 0 20px',

  // Tipografía
  fontHeading: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif',
  fontBody: '"Plus Jakarta Sans", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", monospace'
};

export type ThemeColors = typeof THEME;
