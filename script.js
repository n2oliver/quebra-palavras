
// Palavras para o grid 5x5
let listaPalavras = [
    ["CASA", "VIDA", "PAZ", "SONHO", "LIVRO"],
    ["CASA", "VIDA", "PAZ"]
];
let palavras = listaPalavras[0];
let letras = palavras.join("").split("");
if (letras.length > 24) {
    palavras = listaPalavras[1];
    letras = palavras.join("").split("");
}
const extras = "ABCDEFGHIJKLMNOPQRSTUVWXZ".split("");
while (letras.length < 24) {
    letras.push(extras[Math.floor(Math.random() * extras.length)]);
}
// Se sobrar, remove letras até ficar com 24
while (letras.length > 24) {
    letras.pop();
}
letras.push(""); // espaço vazio
// embaralha
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffle(letras);
let grid = letras;

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
    // Verifica e mostra as palavras que podem ser formadas
    const wordEl = document.getElementById('word');
    let formed = [];
    const size = 5; // grid 5x5
    // Função para verificar se palavra está em sequência sem espaços
    function verificaSequencia(arr, palavra) {
        for (let i = 0; i <= arr.length - palavra.length; i++) {
            let trecho = arr.slice(i, i + palavra.length);
            if (trecho.join("") === palavra && !trecho.includes("")) {
                return true;
            }
        }
        return false;
    }
    // Verifica horizontal e vertical
    let encontradaPalavra = {};
    palavras.forEach(palavra => encontradaPalavra[palavra] = false);
    // Horizontal
    for (let i = 0; i < size; i++) {
        let linha = grid.slice(i * size, (i + 1) * size);
        palavras.forEach(palavra => {
            if (verificaSequencia(linha, palavra)) {
                encontradaPalavra[palavra] = true;
            }
        });
    }
    // Vertical
    for (let i = 0; i < size; i++) {
        let coluna = [];
        for (let j = 0; j < size; j++) {
            coluna.push(grid[j * size + i]);
        }
        palavras.forEach(palavra => {
            if (verificaSequencia(coluna, palavra)) {
                encontradaPalavra[palavra] = true;
            }
        });
    }
    palavras.forEach(palavra => {
        if (encontradaPalavra[palavra] && !palavrasEncontradas.includes(palavra)) {
            palavrasEncontradas.push(palavra);
        }
    });
    palavras.forEach(palavra => {
        if (palavrasEncontradas.includes(palavra)) {
            formed.push(`<span style='color:green'>✔️ ${palavra}</span>`);
        } else {
            formed.push(`<span style='color:#333'>${palavra}</span>`);
        }
    });
    wordEl.innerHTML = '<b>Palavras para encontrar:</b> ' + formed.join(", ");
}
window.onload = async () => {
    await renderGrid();
    document.getElementById('reiniciar').textContent = 'Reiniciar';
    document.querySelector('.fa-spinner').style.display = 'none';
}