let currentCard = null;
let currentBoardId = null;
window.onload = function() {
    loadBoards();
};
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.add-card-btn').forEach(button => {
        button.addEventListener('click', () => showAddCardModal(button.parentElement.querySelector('.card-container').id));
    });
    loadFromLocalStorage();
    updateChecklistButtons();
});

function showAddCardModal(boardId) {
    currentBoardId = boardId;
    document.getElementById('add-card-modal').style.display = 'block';
}

function closeAddCardModal() {
    document.getElementById('add-card-modal').style.display = 'none';
    document.getElementById('card-content').value = '';
    document.getElementById('card-image').value = '';
}

function addCard() {
    const cardContent = document.getElementById('card-content').value;
    const cardImage = document.getElementById('card-image').value;

    if (cardContent) {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.ondragstart = drag;
        card.id = `card-${Date.now()}`;
        
        card.innerHTML = `
            <div class="card-content">${cardContent}</div>
            ${cardImage ? `<img src="${cardImage}" alt="Card Image">` : ''}
            <button class="checklist-btn" onclick="openModal(event)">☑</button>
            <button class="delete-btn" onclick="deleteCard(event)">🗑</button>
            <div class="due-date"></div>
        `;

        document.getElementById(currentBoardId).appendChild(card);
        saveBoard(currentBoardId)
        closeAddCardModal();
        saveToLocalStorage();
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const card = document.getElementById(data);
    event.target.appendChild(card);
    updateChecklistButtons();
    saveBoard(event.target.id)
    saveToLocalStorage();
}

function openModal(event) {
    currentCard = event.target.parentElement;
    document.getElementById('checklist-modal').style.display = 'block';
    loadChecklist();
    loadDueDate();
}

function closeModal() {
    document.getElementById('checklist-modal').style.display = 'none';
    saveChecklist();
    saveDueDate();
    saveToLocalStorage();
}

function addChecklistItem() {
    const itemText = prompt('Enter checklist item:');
    if (itemText) {
        const item = document.createElement('li');
        item.innerHTML = `
            <input type="checkbox">
            ${itemText}
        `;
        document.getElementById('checklist').appendChild(item);
    }
}

function loadChecklist() {
    const checklist = currentCard.getAttribute('data-checklist');
    const checklistContainer = document.getElementById('checklist');
    checklistContainer.innerHTML = '';
    if (checklist) {
        const items = JSON.parse(checklist);
        items.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.innerHTML = `
                <input type="checkbox" ${item.checked ? 'checked' : ''}>
                ${item.text}
            `;
            checklistContainer.appendChild(itemElement);
        });
    }
}

function saveChecklist() {
    const items = [];
    document.querySelectorAll('#checklist li').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        items.push({
            text: item.textContent.trim(),
            checked: checkbox.checked
        });
    });
    currentCard.setAttribute('data-checklist', JSON.stringify(items));
    saveBoard(currentCard.parentElement.id);
}

function loadDueDate() {
    const dueDate = currentCard.getAttribute('data-due-date');
    const dueDateInput = document.getElementById('due-date');
    dueDateInput.value = dueDate ? dueDate : '';
}

function saveDueDate() {
    const dueDateInput = document.getElementById('due-date').value;
    currentCard.setAttribute('data-due-date', dueDateInput);
    const dueDateDisplay = currentCard.querySelector('.due-date');
    dueDateDisplay.textContent = dueDateInput;
    saveBoard(currentCard.parentElement.id);
}

function updateChecklistButtons() {
    document.querySelectorAll('.card').forEach(card => {
        const board = card.parentElement.id;
        const checklistBtn = card.querySelector('.checklist-btn');
        if (board) {
            checklistBtn.style.display = 'block';
        } else {
            checklistBtn.style.display = 'none';
        }
    });
}
function saveBoard(boardId) {
    const board = document.getElementById(boardId);
    localStorage.setItem(boardId, board.innerHTML);
}

function loadBoards() {
    const boards = ['todo', 'inprogress', 'done'];
    boards.forEach(board => {
        const boardData = localStorage.getItem(board);
        if (boardData) {
            document.getElementById(board).innerHTML = boardData;
        }
    });
    updateChecklistButtons();
}
function deleteCard(event) {
    const card = event.target.parentElement;
    card.remove();
    saveToLocalStorage();
}

function saveToLocalStorage() {
    const boards = {
        todo: [],
        inprogress: [],
        done: []
    };
    document.querySelectorAll('.card-container').forEach(container => {
        container.childNodes.forEach(card => {
            boards[container.id].push({
                id: card.id,
                content: card.querySelector('.card-content').innerHTML,
                image: card.querySelector('img') ? card.querySelector('img').src : '',
                checklist: card.getAttribute('data-checklist'),
                dueDate: card.getAttribute('data-due-date')
            });
        });
    });
    localStorage.setItem('boards', JSON.stringify(boards));
}

function loadFromLocalStorage() {
    const boards = JSON.parse(localStorage.getItem('boards'));
    if (boards) {
        Object.keys(boards).forEach(boardId => {
            const container = document.getElementById(boardId);
            boards[boardId].forEach(cardData => {
                const card = document.createElement('div');
                card.className = 'card';
                card.draggable = true;
                card.ondragstart = drag;
                card.id = cardData.id;

                card.innerHTML = `
                    <div class="card-content">${cardData.content}</div>
                    ${cardData.image ? `<img src="${cardData.image}" alt="Card Image">` : ''}
                    <button class="checklist-btn" onclick="openModal(event)">☑</button>
                    <button class="delete-btn" onclick="deleteCard(event)">🗑</button>
                    <div class="due-date">${cardData.dueDate || ''}</div>
                `;
                card.setAttribute('data-checklist', cardData.checklist);
                card.setAttribute('data-due-date', cardData.dueDate);

                container.appendChild(card);
            });
        });
    }
}

function searchCards() {
    const query = document.getElementById('search').value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const content = card.querySelector('.card-content').textContent.toLowerCase();
        if (content.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

}
function clearLocalStorage() {
    localStorage.clear();
    location.reload(); // Reload halaman setelah membersihkan Local Storage
}
