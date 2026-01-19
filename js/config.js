export const TOTAL_TIME = 180; // 3 minutos
export const STORAGE_KEY = 'mathDefenderHighScores';

export const digitStages = [
  { min: 1, max: 1 },   // comeca com 1 algarismo
  { min: 2, max: 2 },   // fica 2 algarismos
  { min: 4, max: 10 }   // vai ate 4-10 algarismos
];

export const maxDigitsByScenario = {
  add: 10,
  sub: 10,
  mul: 6, // limitar para manter resultados seguros
  div: 6
};

export const scenarios = {
  add: { name: 'Soma', spawn: 1.8, speed: 45 },
  sub: { name: 'Subtracao', spawn: 2.0, speed: 50 },
  mul: { name: 'Multiplicacao', spawn: 2.0, speed: 55 },
  div: { name: 'Divisao', spawn: 2.1, speed: 48 }
};

export function formatTime(seconds) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const m = String(Math.floor(clamped / 60)).padStart(2, '0');
  const s = String(clamped % 60).padStart(2, '0');
  return `${m}:${s}`;
}
