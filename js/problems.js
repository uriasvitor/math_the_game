import { digitStages, maxDigitsByScenario } from './config.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randWithDigits(minDigits, maxDigits) {
  const safeMin = Math.max(1, Math.min(minDigits, maxDigits));
  const safeMax = Math.max(safeMin, maxDigits);
  const digits = randInt(safeMin, safeMax);
  const lower = Math.pow(10, digits - 1);
  const upper = Math.pow(10, digits) - 1;
  return randInt(lower, upper);
}

export class ProblemGenerator {
  constructor() {}

  currentStageIndex(elapsedSeconds) {
    if (elapsedSeconds >= 120) return 2;
    if (elapsedSeconds >= 60) return 1;
    return 0;
  }

  currentDigitRange(scenario, elapsedSeconds) {
    const stage = digitStages[this.currentStageIndex(elapsedSeconds)] || digitStages[0];
    const cap = maxDigitsByScenario[scenario] ?? stage.max;
    const min = Math.min(stage.min, cap);
    const max = Math.max(min, Math.min(stage.max, cap));
    return { min, max };
  }

  next(scenario, elapsedSeconds) {
    const digits = this.currentDigitRange(scenario, elapsedSeconds);
    const operations = {
      add: () => {
        const a = randWithDigits(digits.min, digits.max);
        const b = randWithDigits(digits.min, digits.max);
        return { label: `${a} + ${b}`, answer: a + b };
      },
      sub: () => {
        const a = randWithDigits(digits.min, digits.max);
        const b = randWithDigits(digits.min, digits.max);
        const bigger = Math.max(a, b);
        const smaller = Math.min(a, b);
        return { label: `${bigger} - ${smaller}`, answer: bigger - smaller };
      },
      mul: () => {
        const a = randWithDigits(digits.min, digits.max);
        const b = randWithDigits(digits.min, digits.max);
        return { label: `${a} x ${b}`, answer: a * b };
      },
      div: () => {
        const divisor = Math.max(2, randWithDigits(digits.min, digits.max));
        const result = Math.max(2, randWithDigits(digits.min, digits.max));
        const dividend = divisor * result;
        return { label: `${dividend} / ${divisor}`, answer: result };
      }
    };
    return operations[scenario]();
  }
}
