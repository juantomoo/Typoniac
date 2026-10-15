# 🎮 TYPONIAC — OSU! Light Edition
> **Videojuego Rítmico de Mecanografía al Tacto para Niños de 5 a 10 Años**  
> *Sincronización motora, bio-mecánica dactilar estricta, estética cristalina anti-estrés y neuro-gamificación ética.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Ultra--Low_Latency-success.svg)](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)
[![OSU! Light](https://img.shields.io/badge/Aesthetic-OSU!_Light-00C2E0.svg)](#)

---

## 🌟 1. Concepto y Visión

**Typoniac** es un videojuego de mecanografía rítmica para PC diseñado desde la neuropedagogía y la ergonomía infantil. Inspirado en la estética **"OSU! Light Edition"** (fondos pasteles luminosos, notas concéntricas de cristal y pistas de flujo sin sobrecarga sensorial), el juego entrena los circuitos motores del cerebelo y los ganglios basales para automatizar la mecanografía al tacto (*touch typing*), liberando la memoria de trabajo prefrontal en los niños para el pensamiento crítico y la redacción creativa.

```
                    [ APPROACH RING ]
                           |
                        (  O  )  ---> [ Círculo de Impacto Cromático ]
                           |
                     [ FLOW TRACK ]  ---> Pistas de cristal en 4/4
                           |
       ========================================= [ Línea de Impacto Rítmico ]
```

---

## 🧠 2. Fundamentos Neuropedagógicos

El diseño de **Typoniac** se basa en el marco teórico de *TeclaMágica* y la literatura científica sobre desarrollo motor infantil:

1. **Modelo de Tres Etapas de Fitts & Posner:**
   * **Fase Cognitiva (5–7 años / 1.º Primaria):** Hilera Guía central (`A-S-D-F / J-K-L-Ñ`), alternancia bimanual simétrica. Meta: **5–10 WPM** con **85%–90%** de precisión.
   * **Fase Asociativa (7–9 años / 2.º y 3.er Grado):** Incorporación de hileras superior e inferior, bigramas frecuentes y tecla `Shift`. Meta: **10–22 WPM** con **90%–92%** de precisión.
   * **Fase Autónoma (9–10 años / 4.º y 5.º Grado):** Mecanografía a ciegas fluida, números, símbolos y eliminación de la subvocalización. Meta: **22–30+ WPM** con **>95%** de precisión.

2. **Atenuación Visual Progresiva (*Visual Fade-Out*):**
   * **Nivel 1 (100% Opacidad):** Teclado virtual completo con letras visibles y manos holográficas translúcidas.
   * **Nivel 2 (50% Opacidad):** Las letras desaparecen de las teclas; únicamente permanecen los bloques cromáticos por zona dactilar.
   * **Nivel 3 (0% Opacidad / Modo Ciego):** El teclado y las manos desaparecen por completo. El jugador navega guiado por la propiocepción. Ante un error, el borde periférico de la pantalla emite un sutil pulso cromático del color del dedo omitido.

3. **Restricción Biomecánica y Detección Anti-"Hunt and Peck":**
   * Si el jugador intenta cruzar los dedos índices para presionar teclas de meñiques o anulares, el motor detecta la asimetría temporal en el intervalo ínter-tecla (IKI) dictada por la **Ley de Fitts** ($MT = a + b \log_2(2D/W)$). La penalización física de desplazamiento rompe la ventana temporal de los *stream beats*, garantizando la postura correcta.

4. **Higiene Digital y Neuro-Gamificación Ética (SDT):**
   * Recompensas intrínsecas basadas en la maestría acústica (tocar bien hace sonar la música limpia y cristalina).
   * **Cero patrones oscuros (*dark patterns*):** Sin contadores regresivos punitivos, sin alarmas estruendosas, sin rachas basadas en culpa (*guilt streaks*).
   * **Temporizador de 15 Minutos:** Pausa activa cada 15 min guiada por la rutina kinestésica *"¡Tiempo de Estrellas de Mar!"* para proteger muñecas y consolidar la memoria procedimental en el sistema nervioso.

---

## 🎨 3. Mapeo Biomecánico y Código Cromático

| Mano | Dedo Ejecutor | Color | Hex | Teclas Asignadas |
| :--- | :--- | :--- | :--- | :--- |
| **Izquierda** | Meñique | Rosa pastel | `#FF6B8B` | `Q, A, Z, 1, Shift Izq` |
| **Izquierda** | Anular | Verde menta | `#20C997` | `W, S, X, 2` |
| **Izquierda** | Mayor / Medio | Azul celeste | `#00C2E0` | `E, D, C, 3` |
| **Izquierda** | Índice | Rojo coral | `#FF5252` | `R, T, F, G, V, B, 4, 5` (Anclaje en **F**) |
| **Ambas** | Pulgares | Gris perla | `#64748B` | `Barra Espaciadora` |
| **Derecha** | Índice | Azul marino | `#3B82F6` | `Y, U, H, J, N, M, 6, 7` (Anclaje en **J**) |
| **Derecha** | Mayor / Medio | Amarillo cálido | `#FFC107` | `I, K, Coma (,), 8` |
| **Derecha** | Anular | Naranja suave | `#FB8C00` | `O, L, Punto (.), 9` |
| **Derecha** | Meñique | Violeta suave | `#9C27B0` | `P, Ñ, Guion (-), Enter, Shift Der` |

---

## 🎵 4. Repertorio Musical Curado y Normalizado (-16 LUFS)

Todas las pistas fueron procesadas con `yt-dlp` y `ffmpeg` en clips de 75 segundos normalizados a -16 LUFS para evitar sobreestimulación:

* **Fase Cognitiva (5 a 7 años):**
  1. *C418 – Subwoofer Lullaby* (Minecraft OST) — **70 BPM**
  2. *Koji Kondo – Dire, Dire Docks* (Super Mario 64) — **80 BPM**
* **Fase Asociativa (7 a 9 años):**
  3. *Joe Hisaishi – My Neighbor Totoro* (Studio Ghibli) — **90 BPM**
  4. *Coldplay – Viva La Vida* (Strings Quartet) — **98 BPM**
* **Fase Autónoma (9 a 10 años):**
  5. *Toby Fox – Once Upon a Time* (Undertale) — **110 BPM**
  6. *Daft Punk – Harder, Better, Faster, Stronger* — **123 BPM**

> **Motor Sintetizador Interactivo:** Typoniac cuenta además con un sintetizador FM de campana cristalina integrado en Web Audio API (<8 ms de latencia) y generador de acompañamiento armónico procedural que funciona 100% offline.

---

## ⚡ 5. Instalación y Uso

### Requisitos:
* Node.js v18+ y npm
* Python 3 + `yt-dlp` y `ffmpeg` (para el pipeline de descarga de audio)

### Ejecución en Modo Desarrollo:
```bash
git clone https://github.com/juantomoo/Typoniac.git
cd Typoniac
npm install
npm run dev
```
Abre en tu navegador: `http://localhost:3000`

### Compilación para Producción:
```bash
npm run build
npm run preview
```

### Actualizar o Descargar Nuevas Pistas Curadas:
```bash
python3 scripts/download_curated_audio.py
```

---

## 📐 6. Arquitectura Técnica de Software

```
Typoniac/
├── public/
│   └── audio/              # Canciones descargadas y normalizadas (-16 LUFS)
├── scripts/
│   └── download_curated_audio.py  # Pipeline yt-dlp + ffmpeg
└── src/
    ├── main.ts             # Bucle de juego a 120 FPS y orquestación
    ├── styles.css          # Estilos "OSU! Light", glassmorphism y modales
    ├── config/
    │   ├── theme.ts        # Tokens cromáticos y paleta anti-fatiga visual
    │   ├── keymap.ts       # Asignación biomecánica por dedo y columna
    │   └── songs.ts        # Catálogo de canciones y generador de beatmaps
    ├── core/
    │   ├── AudioEngine.ts  # Web Audio API (<8ms latencia, síntesis FM y filtros)
    │   ├── RhythmEngine.ts # Ventanas (PERFECT ±15ms, GREAT ±30ms, MISS) y anti-trampa
    │   ├── AdaptiveLogic.ts# Prioridad P(k) = w1*Ek + w2*(Lk/Lavg) y métricas Fitts & Posner
    │   └── HygieneTimer.ts # Cronómetro de 15 minutos y descansos activos
    ├── rendering/
    │   ├── CanvasRenderer.ts # Renderizador Canvas 2D HiDPI a 120 FPS
    │   ├── NoteRenderer.ts   # Círculos de impacto, approach rings y sliders
    │   └── HandGuide.ts      # Siluetas holográficas de manos y pulsos en F y J
    ├── state/
    │   └── GameState.ts    # Estado reactivo, WPM bruto/neto, combo y atenuación visual
    └── ui/
        ├── HUD.ts          # Encabezado glassmorphic, métricas en vivo y selector fade
        ├── SongSelect.ts   # Selector modal de canciones curadas por edad
        └── PauseModal.ts   # Pausa activa con ejercicios kinestésicos guiados
```

---

## 📄 Licencia y Uso
Desarrollado para fines de uso personal, privado y de investigación neuropedagógica.
