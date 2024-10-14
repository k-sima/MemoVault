const tabBar = document.getElementById('tab-bar');
const contentArea = document.getElementById('content-area');
const addTabButton = document.getElementById('add-tab');
const createNoteButton = document.getElementById('create-note');
const createFolderButton = document.getElementById('create-folder');
const searchFileButton = document.getElementById('search-file');
const toggleThemeButton = document.getElementById('toggle-theme');
const folderList = document.getElementById('folder-list');
const createNoteWithDateButton = document.getElementById('create-note-with-date');

const sidebar = document.querySelector('.sidebar');
const toggleSidebarButton = document.getElementById('toggle-sidebar');
const sidebarContent = document.getElementById('sidebar-content');

toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // Меняем значок треугольника в зависимости от состояния боковой панели
    if (sidebar.classList.contains('collapsed')) {
        toggleSidebarButton.textContent = '◀';  // Треугольник влево (разворачивание)
    } else {
        toggleSidebarButton.textContent = '▶';  // Треугольник вправо (сворачивание)
    }
});

let tabCount = 0;
let noteCount = 0;
let folderCount = 0;
let notes = {};
let folders = {};
let draggedNote = null;
let activeTab = null;
let todayNoteCreated = false;

// Список ID открытых вкладок
let openTabs = new Set();

// Переключение темы
toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
});

// Добавление новой вкладки
function addTab(noteId) {
    if (noteId && openTabs.has(noteId)) {
        const existingTab = [...tabBar.children].find(tab => tab.textContent.includes(noteId));
        if (existingTab) {
            setActiveTab(existingTab);  // Делаем активной уже открытую вкладку
        }
        return;
    }

    tabCount++;
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.id = `tab-${tabCount}`;
    tab.innerHTML = `<p>${noteId || 'Новая вкладка'}</p><button onclick="removeTab(${tabCount}, '${noteId}')">&times;</button>`;

    tab.addEventListener('click', () => {
        switchContent(noteId);
        setActiveTab(tab);  // Делаем вкладку активной
    });

    tabBar.insertBefore(tab, addTabButton);

    switchContent(noteId);  // Загружаем содержимое вкладки
    setActiveTab(tab);

    if (noteId) {
        openTabs.add(noteId);
    }
}

// Устанавливаем активную вкладку
function setActiveTab(tab) {
    if (activeTab) {
        activeTab.classList.remove('active');  // Убираем активное состояние с предыдущей вкладки
    }
    activeTab = tab;
    activeTab.classList.add('active');  // Добавляем активное состояние новой вкладке
}

// Удаляем вкладку
function removeTab(id, noteId) {
    const tab = document.getElementById(`tab-${id}`);
    tab.remove();

    if (noteId) {
        openTabs.delete(noteId);
    }

    if (tabBar.children.length === 1) {
        contentArea.innerHTML = '<p>Ни один файл не открыт</p>';
        activeTab = null;
    } else {
        const lastTab = tabBar.children[tabBar.children.length - 2];
        lastTab.click();  // Активируем последнюю вкладку
        setActiveTab(lastTab);
    }
}

// Переключаем содержимое вкладки
function switchContent(noteId) {
    if (noteId) {
        contentArea.innerHTML = `<textarea>${notes[noteId] || ''}</textarea>`;
        const textarea = contentArea.querySelector('textarea');
        textarea.addEventListener('input', () => {
            notes[noteId] = textarea.value;
        });
    } else {
        contentArea.innerHTML = '<p>Вкладка без заметки</p>';
    }
}

// Добавление заметки в боковую панель
function addNoteToSidebar(noteId) {
    const li = document.createElement('li');
    li.className = 'note';
    li.textContent = noteId;
    li.draggable = true; // Разрешаем перетаскивание

    li.addEventListener('dragstart', (e) => {
        draggedNote = noteId;
        e.dataTransfer.setData('text', noteId);  // Передаем id заметки
    });

    li.addEventListener('dragend', () => {
        draggedNote = null;
    });

    li.addEventListener('click', () => {
        addTab(noteId);  // Открываем вкладку при клике
    });

    // Добавляем возможность изменения названия заметки
    li.addEventListener('dblclick', () => {
        const newName = prompt("Введите новое название заметки:", noteId);
        if (newName && !notes[newName]) {
            notes[newName] = notes[noteId]; // Копируем содержимое
            delete notes[noteId]; // Удаляем старую заметку
            li.textContent = newName; // Меняем текст
        } else {
            alert("Заметка с таким названием уже существует или название пустое!");
        }
    });

    folderList.appendChild(li);
}

// Создание новой заметки
createNoteButton.addEventListener('click', () => {
    if (activeTab) {
        const noteId = prompt("Введите название заметки:");
        if (noteId && !notes[noteId]) {
            noteCount++;
            notes[noteId] = ''; // Создаем пустую заметку
            addNoteToSidebar(noteId);  // Добавляем в общий список заметок
            addTab(noteId);  // Добавляем вкладку с пустой заметкой
        } else {
            alert("Заметка с таким названием уже существует или название пустое!");
        }
    } else {
        alert("Сначала создайте вкладку!");
    }
});

// Создание папки
createFolderButton.addEventListener('click', () => {
    folderCount++;
    const folderName = prompt("Введите название папки:");
    if (folderName) {
        folders[folderName] = [];
        const li = document.createElement('li');
        li.className = 'folder';

        const toggleButton = document.createElement('span');
        toggleButton.textContent = '▶'; // Треугольник для сворачивания/разворачивания
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.marginRight = '5px';
        toggleButton.addEventListener('click', () => {
            const notesList = li.querySelector('.notes-list');
            if (notesList.style.display === 'none' || !notesList.style.display) {
                notesList.style.display = 'block'; // Разворачиваем
                toggleButton.textContent = '▼'; // Изменяем на ▼
            } else {
                notesList.style.display = 'none'; // Сворачиваем
                toggleButton.textContent = '▶'; // Изменяем на ▶
            }
        });

        li.textContent = folderName;
        li.prepend(toggleButton);

        const notesList = document.createElement('ul');
        notesList.className = 'notes-list';
        notesList.style.display = 'none'; // Изначально скрываем
        li.appendChild(notesList);

        // Добавляем возможность сброса заметки в папку
        li.addEventListener('dragover', (e) => {
            e.preventDefault();  // Позволяет сбросить элемент
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            const noteId = e.dataTransfer.getData('text');  // Получаем id перетаскиваемой заметки

            if (noteId && !folders[folderName].includes(noteId)) {
                folders[folderName].push(noteId);  // Добавляем заметку в папку
                removeNoteFromSidebar(noteId);  // Убираем заметку из общего списка
                addNoteToFolderList(folderName, noteId);  // Добавляем заметку в список папки
            }
        });

        folderList.appendChild(li);
    }
});

// Удаление заметки из общего списка
function removeNoteFromSidebar(noteId) {
    const noteElement = [...folderList.children].find(li => li.textContent.includes(noteId));
    if (noteElement) {
        noteElement.remove();
    }
}

// Добавление заметки в список внутри папки
function addNoteToFolderList(folderName, noteId) {
    const folderElement = [...folderList.children].find(li => li.textContent.includes(folderName));
    const notesList = folderElement.querySelector('.notes-list');
    const noteItem = document.createElement('li');
    noteItem.textContent = noteId;

    noteItem.addEventListener('click', () => {
        addTab(noteId);  // Открываем заметку при клике
    });

    notesList.appendChild(noteItem);
}

// Создание заметки с сегодняшней датой
createNoteWithDateButton.addEventListener('click', () => {
    if (!todayNoteCreated) {
        const today = new Date().toLocaleDateString();
        if (!notes[today]) {
            notes[today] = '';  // Создаем заметку с сегодняшней датой
            addNoteToSidebar(today);  // Добавляем в общий список заметок
            addTab(today);  // Открываем вкладку с новой заметкой
            todayNoteCreated = true;  // Флаг, что заметка с сегодняшней датой создана
        } else {
            alert("Заметка с сегодняшней датой уже создана!");
        }
    }
});

// Поиск файла по названию
searchFileButton.addEventListener('click', () => {
    const searchTerm = prompt("Введите название файла для поиска:");
    if (searchTerm) {
        const found = Object.keys(notes).find(noteId => noteId.includes(searchTerm));
        if (found) {
            addTab(found);  // Открываем вкладку с найденной заметкой
        } else {
            alert("Файл не найден!");
        }
    }
});

// Добавление новой вкладки без заметки
addTabButton.addEventListener('click', () => {
    addTab(null);
});
