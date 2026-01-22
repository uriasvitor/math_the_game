import {
  digitStages,
  digitStagesByScenario,
  maxDigitsByScenario,
} from "./config.js";

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

  getDigitStages(scenario) {
    return digitStagesByScenario[scenario] || digitStages;
  }

  currentStageIndex(elapsedSeconds) {
    if (elapsedSeconds >= 120) return 2;
    if (elapsedSeconds >= 60) return 1;
    return 0;
  }

  currentDigitRange(scenario, elapsedSeconds, fixedDigits) {
    if (Number.isFinite(fixedDigits)) {
      const digits = Math.max(1, Math.floor(fixedDigits));
      const cap = maxDigitsByScenario[scenario];
      const clamped = Number.isFinite(cap) ? Math.min(digits, cap) : digits;
      return { min: clamped, max: clamped };
    }
    const stages = this.getDigitStages(scenario);
    const maxStageIndex = Math.max(0, stages.length - 1);
    const stageIndex = Math.min(
      this.currentStageIndex(elapsedSeconds),
      maxStageIndex,
    );
    const stage = stages[stageIndex] || digitStages[0];
    const cap = maxDigitsByScenario[scenario] ?? stage.max;
    const min = Math.min(stage.min, cap);
    const max = Math.max(min, Math.min(stage.max, cap));
    return { min, max };
  }

  next(scenario, elapsedSeconds, options = {}) {
    const digits = this.currentDigitRange(
      scenario,
      elapsedSeconds,
      options.digits,
    );
    // balance: non-training modes limited to 1 digit
    if (scenario !== "train") {
      digits.min = 1;
      digits.max = 1;
    }
    const operations = {
      add: () => {
        const a = randWithDigits(digits.min, digits.max);
        const b = randWithDigits(digits.min, digits.max);
        return { label: `${a} + ${b}`, answer: a + b };
      },
      train: () => {
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
      },
      sqrt: () => {
        // generate a radicand (integer) that is unlikely to be a perfect square
        let n = randWithDigits(digits.min, digits.max);
        const isPerfect = (x) => Number.isInteger(Math.sqrt(x));
        let tries = 0;
        while (isPerfect(n) && tries < 20) {
          n += 1;
          tries += 1;
        }
        // answer is the square root (store with a few extra decimals for stability)
        const ans = Math.sqrt(n);
        return { label: `√${n}`, answer: Number(ans.toFixed(6)) };
      },
      pow: () => {
        // potenciação: choose small base and exponent to keep numbers reasonable
        const base = Math.max(
          2,
          randInt(2, Math.min(9, Math.pow(10, digits.max) - 1)),
        );
        const exp = Math.max(2, randInt(2, Math.min(4, digits.max)));
        const val = Math.pow(base, exp);
        return { label: `${base} ^ ${exp}`, answer: val };
      },
      percent: () => {
        // porcentagem: p% de N
        const p = Math.max(1, randInt(1, 100));
        const n = randWithDigits(digits.min, digits.max);
        const ans = (p / 100) * n;
        // show percentage with % symbol
        return { label: `${p}% de ${n}`, answer: Number(ans.toFixed(4)) };
      },
      decimal: () => {
        // generate two decimal numbers and add them (can be extended later)
        const aInt = randWithDigits(Math.max(1, digits.min - 1), digits.max);
        const bInt = randWithDigits(Math.max(1, digits.min - 1), digits.max);
        const a = Number((aInt + Math.random()).toFixed(2));
        const b = Number((bInt + Math.random()).toFixed(2));
        return { label: `${a} + ${b}`, answer: Number((a + b).toFixed(4)) };
      },
    };
    // allow training mode to specify an operation (e.g. 'sqrt', 'mul') via options.operation
    const op =
      scenario === "train" && options.operation ? options.operation : scenario;
    const handler = operations[op] || operations.add;
    return handler();
  }
}
