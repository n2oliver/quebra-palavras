// ===============================
// 1. LISTAS DE PALAVRAS POR IDIOMA
// ===============================
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

// Idiomas extras compatíveis com gTranslate — fallback para português
const extraLangFallbacks = ['fr','it','es','ru','ro','sr','zh','ja','nl','bn','id','ur'];
extraLangFallbacks.forEach(code => { if (!wordsByLang[code]) wordsByLang[code] = wordsByLang.pt; });

function getInitialWordsForLang() {
    const lang = (document.documentElement.lang || navigator.language || 'pt').split('-')[0];
    const candidate = wordsByLang[lang] || wordsByLang.pt;
    return candidate;
}

// Inicialização
let listaPalavras = getInitialWordsForLang();
let palavras = listaPalavras[0];

// ===============================
// 2. FUNÇÕES DE APOIO
// ===============================
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const extras = "ABCDEFGHIJKLMNOPQRSTUVWXZ".split("");

// ===============================
// 3. CONSTRUÇÃO DO GRID
// ===============================
function buildGridWithPlacements(words, size = 5) {
    const grid = Array(size * size).fill(null);
    const placedWords = [];
    const placedPositions = {};

    const wordsToTry = [...words];
    shuffle(wordsToTry);

    for (const word of wordsToTry) {
        const w = String(word).toUpperCase();
        const len = w.length;
        if (len > size) continue;

        let placed = false;
        for (let attempt = 0; attempt < 50 && !placed; attempt++) {
            const horiz = Math.random() < 0.5;
            const maxRow = horiz ? size - 1 : size - len;
            const maxCol = horiz ? size - len : size - 1;
            const row = Math.floor(Math.random() * (maxRow + 1));
            const col = Math.floor(Math.random() * (maxCol + 1));

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

            for (let k = 0; k < len; k++) {
                grid[indices[k]] = w[k];
            }
            placed = true;
            placedWords.push(w);
            placedPositions[w] = indices;
        }
    }

    // Preenche vazios
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === null) grid[i] = extras[Math.floor(Math.random() * extras.length)];
    }

    // Define espaço vazio
    const occupied = new Set(Object.values(placedPositions).flat());
    let emptyIdx = null;
    const candidates = [];
    for (let i = 0; i < grid.length; i++) if (!occupied.has(i)) candidates.push(i);
    if (candidates.length > 0) {
        emptyIdx = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
        emptyIdx = Math.floor(Math.random() * grid.length);
        for (const w of Object.keys(placedPositions)) {
            if (placedPositions[w].includes(emptyIdx)) {
                const idx = placedWords.indexOf(w);
                if (idx !== -1) placedWords.splice(idx, 1);
                delete placedPositions[w];
            }
        }
    }
    grid[emptyIdx] = '';

    return { grid, placedWords, placedPositions };
}

// ===============================
// 4. EMBARALHAMENTO
// ===============================
function scrambleGrid(gridArr, size = 5) {
    const moves = 50;
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

    for (let i = 0; i < moves; i++) {
        const neigh = neighbors(emptyIdx);
        const pick = neigh[Math.floor(Math.random() * neigh.length)];
        currentGrid[emptyIdx] = currentGrid[pick];
        currentGrid[pick] = '';
        emptyIdx = pick;
    }

    return currentGrid;
}

// ===============================
// 5. GARANTE LETRAS NECESSÁRIAS
// ===============================
function ensureLettersForWords(words, gridArr) {
    const size = gridArr.length;
    const letrasDisponiveis = gridArr.reduce((acc, letra) => {
        if (letra && letra !== '') acc[letra] = (acc[letra] || 0) + 1;
        return acc;
    }, {});

    const letrasNecessarias = {};
    words.forEach(palavra => {
        palavra.split('').forEach(letra => {
            letrasNecessarias[letra] = (letrasNecessarias[letra] || 0) + 1;
        });
    });

    for (const [letra, qtd] of Object.entries(letrasNecessarias)) {
        const falta = qtd - (letrasDisponiveis[letra] || 0);
        for (let i = 0; i < falta; i++) {
            let idx = gridArr.findIndex(c => !letrasNecessarias[c] && c !== '');
            if (idx === -1) idx = Math.floor(Math.random() * size);
            gridArr[idx] = letra;
        }
    }

    return gridArr;
}

// ===============================
// 6. CRIAÇÃO E AJUSTE INICIAL DO GRID
// ===============================
const buildResult = buildGridWithPlacements(palavras, 5);
let grid = buildResult.grid;
const palavrasColocadas = buildResult.placedWords || [];

grid = scrambleGrid(grid, 5);
grid = ensureLettersForWords(palavras, grid);

// ===============================
// 7. RENDERIZAÇÃO E LÓGICA DO JOGO
// ===============================
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
    const emptyIdx = grid.indexOf('');
    const row = Math.floor(idx / 5), col = idx % 5;
    const emptyRow = Math.floor(emptyIdx / 5), emptyCol = emptyIdx % 5;
    if ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1) {
        grid[emptyIdx] = grid[idx];
        grid[idx] = '';
        renderGrid();
    }
}

let palavrasEncontradas = [];
function showWords() {
    const wordEl = document.getElementById('word');
    let formed = [];
    const size = 5;

    function verificaSequencia(arr, palavra) {
        for (let i = 0; i <= arr.length - palavra.length; i++) {
            let trecho = arr.slice(i, i + palavra.length);
            if (trecho.join("") === palavra && !trecho.includes("")) return true;
        }
        return false;
    }

    let encontradaPalavra = {};
    palavras.forEach(palavra => {
        let formada = false;
        for (let i = 0; i < size && !formada; i++) {
            let linha = grid.slice(i * size, (i + 1) * size);
            if (verificaSequencia(linha, palavra)) formada = true;
        }
        for (let i = 0; i < size && !formada; i++) {
            let coluna = [];
            for (let j = 0; j < size; j++) coluna.push(grid[j * size + i]);
            if (verificaSequencia(coluna, palavra)) formada = true;
        }
        if (formada && !palavrasEncontradas.includes(palavra)) {
            palavrasEncontradas.push(palavra);
        }
        const letrasNecessarias = palavra.split('').reduce((acc, letra) => {
            acc[letra] = (acc[letra] || 0) + 1;
            return acc;
        }, {});
        const letrasDisponiveis = grid.reduce((acc, letra) => {
            if (letra !== '') acc[letra] = (acc[letra] || 0) + 1;
            return acc;
        }, {});
        const formavel = Object.entries(letrasNecessarias).every(([letra, qtd]) =>
            (letrasDisponiveis[letra] || 0) >= qtd
        );
        encontradaPalavra[palavra] = formada || formavel;
    });

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

// ===============================
// 8. INICIALIZAÇÃO
// ===============================
window.onload = async () => {
    await renderGrid();
    const lang = (document.documentElement.lang || navigator.language || 'pt').split('-')[0];
    const restartLabel = (lang === 'en') ? 'Restart' : 'Reiniciar';
    document.getElementById('reiniciar').textContent = restartLabel;
    document.querySelector('.fa-spinner').style.display = 'none';
};

// ===============================
// 9. TROCA DE IDIOMA
// ===============================
const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
        if (m.attributeName === 'lang') {
            listaPalavras = getInitialWordsForLang();
            palavras = listaPalavras[0];
            const res = buildGridWithPlacements(palavras, 5);
            grid = res.grid;
            palavrasColocadas.length = 0;
            if (res.placedWords) palavrasColocadas.push(...res.placedWords);
            palavrasEncontradas = [];
            grid = scrambleGrid(grid, 5);
            grid = ensureLettersForWords(palavras, grid);
            renderGrid();
            const newLang = (document.documentElement.lang || navigator.language || 'pt').split('-')[0];
            document.getElementById('reiniciar').textContent = (newLang === 'en') ? 'Restart' : 'Reiniciar';
            break;
        }
    }
});
observer.observe(document.documentElement, { attributes: true });
