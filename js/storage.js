const DEFAULT_BEST = { add: 0, sub: 0, mul: 0, div: 0 };

export class StorageManager {
  constructor(key) {
    this.key = key;
    this.best = { ...DEFAULT_BEST };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.best = { ...DEFAULT_BEST, ...parsed };
    } catch (err) {
      console.warn('Falha ao carregar recordes', err);
      this.best = { ...DEFAULT_BEST };
    }
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.best));
    } catch (err) {
      console.warn('Falha ao salvar recordes', err);
    }
  }

  getBest(scenario) {
    return this.best[scenario] ?? 0;
  }

  registerScore(scenario, score) {
    const current = this.getBest(scenario);
    const isNew = score > current;
    if (isNew) {
      this.best[scenario] = score;
      this.save();
    }
    return isNew;
  }
}
