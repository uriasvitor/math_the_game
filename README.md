# Math Defender

Math Defender é um jogo de digitação e prática matemática no navegador, feito em JavaScript puro e THREE.js para renderização de sprites. Defenda a base digitando as respostas antes que os inimigos cheguem à barreira orbital.

**Principais recursos / Key Features**

- Menu principal com acesso rápido aos modos: Soma, Subtração, Multiplicação, Divisão, Raiz, Potenciação, Porcentagem, Decimais.
- Modos especiais: Treinamento (configurável), Sandbox (spawn manual), Recuperação (pratique o que mais erra).
- Mods: Auto Reset, One-Strike, Auto Restart on Loss.
- Persistência local de recordes e erros (localStorage).
- Áudio leve para feedback de ações.

**Como jogar / Quick Start**

Abra `index.html` em um navegador moderno. Para evitar problemas de CORS/ESM, use um servidor local:

```bash
# Python 3 recomendado
python -m http.server 8000
# depois acesse http://localhost:8000
```

**Navegação / Navigation**

- Menu principal: Iniciar Jogo (modos principais), Cenário (Treinamento, Sandbox, Recuperação), Settings (mods), Score (placar).
- Use o teclado ou clique para responder.
- `M` abre o painel de mods.
- `'` reinicia e inicia o jogo imediatamente.
- `F` abre a seleção de modos.

**Modos de Jogo / Game Modes**

- Soma, Subtração, Multiplicação, Divisão, Raiz Quadrada, Potenciação, Porcentagem, Decimais: cada um com problemas próprios.
- Treinamento: escolha operação e número de dígitos, vida infinita.
- Sandbox: spawn manual de entidades para testar.
- Recuperação: só aparece no menu Cenário, foca nos problemas que você mais erra (após 10 erros).

**Mods**

- Auto Reset: reinicia automaticamente após perder.
- One-Strike: perdeu uma vida, fim de jogo.
- Auto Restart on Loss: reinicia só se perder.

**Persistência / Persistence**

- Recordes e erros salvos em localStorage.
- "Resetar tudo" apaga todo o progresso.

**Dicas / Tips**

- Use o modo Sandbox para testar sons e labels.
- Para popular o modo Recuperação, erre o mesmo problema várias vezes em modos normais.

**Personalização / Customization**

- Para adicionar operações, edite `js/problems.js` e `js/config.js`.
- Para mudar o limiar de recuperação, altere `THRESHOLD` em `js/storage.js`.

---

## GitHub Pages

Jogue online: [math-the-game (GitHub Pages)](https://uriasvitor.github.io/math_planet_defender/)

---

**ENGLISH**

Math Defender is a browser-based typing/math game. Defend the base by typing answers before enemies reach the barrier.

**Main features**

- Main menu: quick access to all modes (Addition, Subtraction, Multiplication, Division, Square Root, Power, Percentage, Decimals).
- Special modes: Training (configurable), Sandbox (manual spawn), Recovery (practice your most missed problems).
- Mods: Auto Reset, One-Strike, Auto Restart on Loss.
- Local persistence for best scores and failures (localStorage).
- Lightweight audio feedback.

**How to play**

- Open `index.html` in a modern browser (use a local server for best results).
- Main menu: Start Game (main modes), Scenario (Training, Sandbox, Recovery), Settings (mods), Score (highscores).
- Use keyboard or click to answer.
- `M` opens mods panel.
- `'` restarts and starts the game instantly.
- `F` opens mode selection.

**Game Modes**

- Addition, Subtraction, Multiplication, Division, Square Root, Power, Percentage, Decimals: each with its own problems.
- Training: choose operation and digits, infinite life.
- Sandbox: manual spawn for testing.
- Recovery: only in Scenario menu, focuses on your most missed problems (after 10 misses).

**Mods**

- Auto Reset: auto-restart after loss.
- One-Strike: lose on first hit.
- Auto Restart on Loss: restart only if you lose.

**Persistence**

- Highscores and failures saved in localStorage.
- "Reset all" erases all progress.

**Tips**

- Use Sandbox to test sounds and labels.
- To fill Recovery, miss the same problem several times in normal modes.

**Customization**

- To add operations, edit `js/problems.js` and `js/config.js`.
- To change recovery threshold, edit `THRESHOLD` in `js/storage.js`.

**Contributing**

- Fork the repo, make changes and open a PR. Keep diffs focused: separate visual changes from gameplay logic.

# Math Defender 🚀🧮

Live demo: https://uriasvitor.github.io/math_the_game/

Math Defender is a browser-based typing + math-practice game built with JavaScript and THREE.js. Defend the base by typing answers to arithmetic problems before enemies reach the orbital barrier.

---

## 📣 Badges

| Feature      |                                                      Status |
| ------------ | ----------------------------------------------------------: |
| GitHub Pages | ✅ [Live demo](**https://uriasvitor.github.io/math_the_game/**) |

---

## 🌟 Overview (Português)

Math Defender é um jogo de digitação / prática de matemática para navegador. Digite respostas para os problemas que aparecem nos inimigos antes que eles alcancem a barreira da base.

- Modos: Soma, Subtração, Multiplicação, Divisão, Raiz Quadrada, Treino, Sandbox e Recuperação.
- Mods: Reinício automático, One-Strike, e Reinício automático apenas ao perder.
- Persistência: recordes e histórico de erros via localStorage.

### ▶️ Como jogar

- Abra o site (link acima) ou rode um servidor local e abra `index.html`.
- Use a caixa de entrada no painel inferior para digitar respostas; pressione Enter ou clique em "Atirar".
- `Niveis` abre o seletor de modos; `Mods` abre o painel de modificadores.

### ⚙️ Arquivos importantes

- `index.html` — interface e painéis
- `main.js` — ligação entre UI e lógica
- `js/game.js` — loop do jogo, spawn e regras
- `js/problems.js` — gerador de problemas
- `js/renderer.js` — renderização (THREE.js)
- `js/storage.js` — persistência (recordes e falhas)

---

## 🌟 Overview (English)

Math Defender is a browser typing / math-practice game. Type the answers to the math problems displayed on enemies before they reach your base.

- Modes: Addition, Subtraction, Multiplication, Division, Square Root, Training, Sandbox and Recovery.
- Mods: Auto Restart, One-Strike, Auto Restart on Loss.
- Persistence: best scores and miss history stored in localStorage.

### ▶️ How to play

- Open the live demo link above or serve the project locally and open `index.html`.
- Type answers in the terminal input and hit Enter or click `Atirar`.
- Use `Niveis` to pick a mode and `Mods` to toggle modifiers.

### ⚙️ Important files

- `index.html` — UI and panels
- `main.js` — UI wiring and session handling
- `js/game.js` — main gameplay loop and spawn logic
- `js/problems.js` — problem generator
- `js/renderer.js` — rendering helpers (THREE.js)
- `js/storage.js` — persistence and failure tracking

---

## ✅ Recovery mode & persistence details

- Failures are recorded when an enemy reaches the barrier (not during `train` or `sandbox`).
- Recovery picks problems with repeated misses (default threshold = 10). Successful solves in Recovery decrement that counter.
- To clear saved data use the "Resetar tudo" button (confirmation modal will show).

---

## 🛠 Development & customization

- Serve locally:

```bash
python -m http.server 8000
# open http://localhost:8000
```

- Change recovery threshold: edit `getTopFailures()` in `js/storage.js`.
- Add operations in `js/problems.js`.

---

## 📄 License

This repo contains original code. Add a license (MIT/Apache) if you want to publish it.

---

If you want, I can: add a short `DEVELOPMENT.md`, show top failures inside the UI, or provide a translated GitHub Pages description. Which one next?
