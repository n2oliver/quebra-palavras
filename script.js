
// Word lists per language. We'll read <html lang="xx"> and pick the appropriate list.
const wordsByLang = {
    pt: [
        ["CASA", "VIDA", "PAZ", "SONHO", "LIVRO"],
        ["CASA", "VIDA", "PAZ"]
    ],
    en: [
        ["HOME", "LIFE", "PEACE", "DREAM", "BOOK"],
        ["HOME", "LIFE", "PEACE"]
    ]
};

// Provide fallbacks for other languages supported by the gtranslate widget.
// If we don't have a translated set, fall back to Portuguese list to avoid showing empty content.
const extraLangFallbacks = ['fr','it','es','ru','ro','sr','zh','ja','nl','bn','id','ur'];
extraLangFallbacks.forEach(code => { if (!wordsByLang[code]) wordsByLang[code] = wordsByLang.pt; });

function getInitialWordsForLang() {
    const lang = (document.documentElement.lang || navigator.language || 'pt').split('-')[0];
    const candidate = wordsByLang[lang] || wordsByLang.pt;
    return candidate; // return the array-of-arrays for this language
}

let listaPalavras = getInitialWordsForLang();
let palavras = listaPalavras[0];

// Helper: shuffle in-place
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const extras = "ABCDEFGHIJKLMNOPQRSTUVWXZ".split("");

// Try to place words into a 5x5 grid so they are immediately formable (horizontally or vertically).
function buildGridWithPlacements(words, size = 5) {
    // grid cells initialized to null (empty)
    const grid = Array(size * size).fill(null);
    const placedWords = [];
    const placedPositions = {}; // word -> array of indices

    const wordsToTry = [...words];
    shuffle(wordsToTry);

    for (const word of wordsToTry) {
        const w = String(word).toUpperCase();
        const len = w.length;
        if (len > size) continue; // cannot place

        let placed = false;
        // try some random attempts
        for (let attempt = 0; attempt < 50 && !placed; attempt++) {
            const horiz = Math.random() < 0.5;
            const maxRow = horiz ? size - 1 : size - len;
            const maxCol = horiz ? size - len : size - 1;
            const row = Math.floor(Math.random() * (maxRow + 1));
            const col = Math.floor(Math.random() * (maxCol + 1));

            // compute indices
            const indices = [];
            let ok = true;
            for (let k = 0; k < len; k++) {
                const r = row + (horiz ? 0 : k);
                const c = col + (horiz ? k : 0);
                const idx = r * size + c;
                const cell = grid[idx];
                if (cell === null || cell === w[k]) {
                    indices.push(idx);
                } else {
                    ok = false;
                    break;
                }
            }
            if (!ok) continue;

            // place the word
            for (let k = 0; k < len; k++) {
                grid[indices[k]] = w[k];
            }
            placed = true;
            placedWords.push(w);
            placedPositions[w] = indices;
        }
    }

    // Fill remaining nulls with random extras
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === null) grid[i] = extras[Math.floor(Math.random() * extras.length)];
    }

    // Choose an empty cell (for sliding) that is NOT part of any placed word when possible
    const occupied = new Set(Object.values(placedPositions).flat());
    let emptyIdx = null;
    const candidates = [];
    for (let i = 0; i < grid.length; i++) if (!occupied.has(i)) candidates.push(i);
    if (candidates.length > 0) {
        emptyIdx = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
        // fallback: pick a random index and remove any placed word that used it
        emptyIdx = Math.floor(Math.random() * grid.length);
        for (const w of Object.keys(placedPositions)) {
            if (placedPositions[w].includes(emptyIdx)) {
                // unmark this word as placed
                const idx = placedWords.indexOf(w);
                if (idx !== -1) placedWords.splice(idx, 1);
                delete placedPositions[w];
            }
        }
    }
    grid[emptyIdx] = '';

    return { grid, placedWords, placedPositions };
}

// Build initial grid with placements
const buildResult = buildGridWithPlacements(palavras, 5);
let grid = buildResult.grid;
// Keep track of which words were actually placed (formáveis)
const palavrasColocadas = buildResult.placedWords || [];

// Scramble the grid by simulating valid sliding moves from the placed state
function scrambleGrid(gridArr, size = 5) {
    const moves = 50; // número de movimentos aleatórios
    let currentGrid = [...gridArr];
    let emptyIdx = currentGrid.indexOf('');
    
    if (emptyIdx === -1) {
        emptyIdx = Math.floor(Math.random() * currentGrid.length);
        currentGrid[emptyIdx] = '';
    }

    function neighbors(idx) {
        const r = Math.floor(idx / size), c = idx % size;
        const res = [];
        if (r > 0) res.push((r - 1) * size + c);
        if (r < size - 1) res.push((r + 1) * size + c);
        if (c > 0) res.push(r * size + (c - 1));
        if (c < size - 1) res.push(r * size + (c + 1));
        return res;
    }

    // Faz vários movimentos aleatórios
    for (let i = 0; i < moves; i++) {
        const neigh = neighbors(emptyIdx);
        const pick = neigh[Math.floor(Math.random() * neigh.length)];
        currentGrid[emptyIdx] = currentGrid[pick];
        currentGrid[pick] = '';
        emptyIdx = pick;
    }

    return currentGrid;
}

// scramble initial grid so it does not come solved
grid = scrambleGrid(grid, 5);

async function renderGrid() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = "";
    grid.forEach((letter, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell' + (letter === '' ? ' empty' : '');
        cell.textContent = letter;
        cell.setAttribute('data-idx', idx);
        cell.draggable = letter !== '';
        cell.addEventListener('dragstart', onDragStart);
        cell.addEventListener('dragend', onDragEnd);
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('drop', onDrop);
        cell.addEventListener('click', () => tryMove(idx));
        gridEl.appendChild(cell);
    });
    showWords();
    return true;
}

let draggedIdx = null;
function onDragStart(e) {
    draggedIdx = parseInt(e.target.getAttribute('data-idx'));
    e.target.classList.add('dragging');
}
function onDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedIdx = null;
}
function onDragOver(e) {
    e.preventDefault();
}
function onDrop(e) {
    const targetIdx = parseInt(e.target.getAttribute('data-idx'));
    if (grid[targetIdx] === '') {
        grid[targetIdx] = grid[draggedIdx];
        grid[draggedIdx] = '';
        renderGrid();
    }
}
function tryMove(idx) {
    // Move para espaço vazio adjacente
    const emptyIdx = grid.indexOf('');
    const row = Math.floor(idx / 5), col = idx % 5;
    const emptyRow = Math.floor(emptyIdx / 5), emptyCol = emptyIdx % 5;
    if ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1) {
        grid[emptyIdx] = grid[idx];
        grid[idx] = '';
        renderGrid();
    }
}
// Array para registrar palavras já encontradas
let palavrasEncontradas = [];
function showWords() {
    const wordEl = document.getElementById('word');
    let formed = [];
    const size = 5;

    // Função para verificar se uma palavra está formada em sequência
    function verificaSequencia(arr, palavra) {
        for (let i = 0; i <= arr.length - palavra.length; i++) {
            let trecho = arr.slice(i, i + palavra.length);
            if (trecho.join("") === palavra && !trecho.includes("")) {
                return true;
            }
        }
        return false;
    }

    // Verifica palavras formadas e palavras formáveis
    let encontradaPalavra = {};
    palavras.forEach(palavra => {
        // Primeiro verifica se a palavra está formada em sequência
        let formada = false;

        // Horizontal
        for (let i = 0; i < size && !formada; i++) {
            let linha = grid.slice(i * size, (i + 1) * size);
            if (verificaSequencia(linha, palavra)) {
                formada = true;
            }
        }

        // Vertical
        for (let i = 0; i < size && !formada; i++) {
            let coluna = [];
            for (let j = 0; j < size; j++) {
                coluna.push(grid[j * size + i]);
            }
            if (verificaSequencia(coluna, palavra)) {
                formada = true;
            }
        }

        // Se a palavra está formada, marca como encontrada
        if (formada && !palavrasEncontradas.includes(palavra)) {
            palavrasEncontradas.push(palavra);
        }

        // Verifica se a palavra é formável (tem todas as letras necessárias)
        const letrasNecessarias = palavra.split('').reduce((acc, letra) => {
            acc[letra] = (acc[letra] || 0) + 1;
            return acc;
        }, {});

        const letrasDisponiveis = grid.reduce((acc, letra) => {
            if (letra !== '') {
                acc[letra] = (acc[letra] || 0) + 1;
            }
            return acc;
        }, {});

        // Uma palavra é formável se todas as suas letras estão disponíveis em quantidade suficiente
        const formavel = Object.entries(letrasNecessarias).every(([letra, qtd]) => 
            (letrasDisponiveis[letra] || 0) >= qtd
        );

        encontradaPalavra[palavra] = formada || formavel;
    });

    // Exibe todas as palavras formáveis (que têm letras suficientes) ou já encontradas
    const exibidas = palavras.filter(p => encontradaPalavra[p] || palavrasEncontradas.includes(p));

    exibidas.forEach(palavra => {
        if (palavrasEncontradas.includes(palavra)) {
            formed.push(`<span style='color:green'>✔️ ${palavra}</span>`);
        } else {
            formed.push(`<span style='color:#333'>${palavra}</span>`);
        }
    });

    if (exibidas.length === 0) {
        wordEl.innerHTML = '<b>Palavras para encontrar:</b> nenhuma palavra formável';
    } else {
        wordEl.innerHTML = '<b>Palavras para encontrar:</b> ' + formed.join(", ");
    }
}
window.onload = async () => {
    await renderGrid();
    // localized restart label
    const lang = (document.documentElement.lang || navigator.language || 'pt').split('-')[0];
    const restartLabel = (lang === 'en') ? 'Restart' : 'Reiniciar';
    document.getElementById('reiniciar').textContent = restartLabel;
    document.querySelector('.fa-spinner').style.display = 'none';
}

// Watch for language changes and re-render with new words
const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
        if (m.attributeName === 'lang') {
            // rebuild word lists and grid for new language
            listaPalavras = getInitialWordsForLang();
            palavras = listaPalavras[0];
            // rebuild grid placing words contiguously
            const res = buildGridWithPlacements(palavras, 5);
            grid = res.grid;
            // track which words are actually colocadas (formáveis)
            palavrasColocadas.length = 0;
            if (res.placedWords) palavrasColocadas.push(...res.placedWords);
            // reset found list (language change)
            palavrasEncontradas = [];
            // scramble the grid
            grid = scrambleGrid(grid, 5);
            renderGrid();
            // update restart label
            const newLang = (document.documentElement.lang || navigator.language || 'pt').split('-')[0];
            document.getElementById('reiniciar').textContent = (newLang === 'en') ? 'Restart' : 'Reiniciar';
            break;
        }
    }
});
observer.observe(document.documentElement, { attributes: true });