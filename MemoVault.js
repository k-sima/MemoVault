const tabBar = document.getElementById('tab-bar');
const contentArea = document.getElementById('content-area');
const createNoteButton = document.getElementById('create-note');
const createFolderButton = document.getElementById('create-folder');
const searchFileButton = document.getElementById('search-file');
const toggleThemeButton = document.getElementById('toggle-theme');
const folderList = document.getElementById('folder-list');
const createNoteWithDateButton = document.getElementById('create-note-with-date');


const userIcon = document.getElementById('user-icon');
const userMenu = document.getElementById('user-menu');
const usernameDisplay = document.getElementById('username-display');
const settingsButton = document.getElementById('settings-button');
const logoutButton = document.getElementById('logout-button');
const settingsModal = document.getElementById('settings-modal');
const passwordModal = document.getElementById('password-modal');
const closeSettingsButton = document.getElementById('close-settings');
const editUsernameButton = document.getElementById('edit-username-button');
const editEmailButton = document.getElementById('edit-email-button');
const editPasswordButton = document.getElementById('edit-password-button');
const confirmPasswordChangeButton = document.getElementById('confirm-password-change');
const closePasswordModalButton = document.getElementById('close-password-modal');

const sidebar = document.querySelector('.sidebar');
const toggleSidebarButton = document.getElementById('toggle-sidebar');
const sidebarContent = document.getElementById('sidebar-content');

toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');

    if (sidebar.classList.contains('collapsed')) {
        toggleSidebarButton.textContent = '◀';
    } else {
        toggleSidebarButton.textContent = '▶';
    }
});

let tabCount = 0;
let noteCount = 0;
let notes = {};
let folders = {};
let currentFolder = null; // Текущая открытая папка
let draggedNote = null;
let activeTab = null;
let todayNoteCreated = false;
let openTabs = new Set();
let isFolderOpen = false; // Флаг, открыта ли папка

toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
});

function addTab(noteId, isFolder = false) {
    if (noteId && openTabs.has(noteId)) {
        const existingTab = [...tabBar.children].find(tab => tab.textContent.includes(noteId));
        if (existingTab) {
            setActiveTab(existingTab);
        }
        return;
    }

    tabCount++;
    const tab = document.createElement('div');
    let btn = document.createElement('button');
    btn.dataset['tabCount'] = tabCount;
    btn.dataset['noteId'] = noteId;
    btn.innerHTML = '&times;';
    btn.addEventListener('click', removeTab)
    tab.className = 'tab';
    tab.id = `tab-${tabCount}`;
    tab.innerHTML = `<p>${noteId || 'Новая вкладка'}</p>`;
    tab.appendChild(btn);

    tab.addEventListener('click', (evt) => {
        switchContent(noteId, isFolder);
        setActiveTab(tab);
    });

    tabBar.appendChild(tab);
    switchContent(noteId, isFolder);
    setActiveTab(tab);

    if (noteId) {
        openTabs.add(noteId);
    }

    if (isFolder) {
        isFolderOpen = true; // Устанавливаем флаг, что папка открыта
    }
}

function setActiveTab(tab) {
    if (activeTab) {
        activeTab.classList.remove('active');
    }
    activeTab = tab;
    activeTab.classList.add('active');
}

function removeTab(evt) {
    evt.stopPropagation();
    let id = evt.target.dataset['tabCount'];
    let noteId = evt.target.dataset['noteId'];
    const tab = document.getElementById(`tab-${id}`);

    // Удаляем вкладку
    tab.remove();

    // Удаляем заметку из открытых вкладок, но не из папки
    if (noteId) {
        openTabs.delete(noteId);
    }

    // Если все вкладки закрыты, показываем сообщение, что ни один файл не открыт
    if (tabBar.children.length === 0) {
        contentArea.innerHTML = '<p>Создайте папку или заметку!</p>';
        activeTab = null;
        isFolderOpen = false; // Сбрасываем флаг, так как ничего не открыто
    } else {
        const lastTab = tabBar.children[tabBar.children.length - 1];
        lastTab.click(); // Открываем последнюю открытую вкладку
        setActiveTab(lastTab);
    }
}



function switchContent(noteId, isFolder = false) {
    if (isFolder) {
        contentArea.innerHTML = `<h2>${noteId}</h2><ul id="notes-list-${noteId}"></ul>`;
        const notesList = document.getElementById(`notes-list-${noteId}`);

        if (folders[noteId]) {
            folders[noteId].forEach(noteId => {
                addNoteToSidebar(noteId, noteId); // Добавляем заметки в список текущей папки
            });
        } else {
            contentArea.innerHTML += '<p>Создай папку или заметку!</p>';
        }
    } else if (noteId && notes[noteId] !== undefined) {
        contentArea.innerHTML = `<textarea>${notes[noteId]}</textarea>`;
        const textarea = contentArea.querySelector('textarea');
        textarea.addEventListener('input', () => {
            notes[noteId] = textarea.value; // Обновляем заметку при вводе
        });
        textarea.focus(); // Устанавливаем фокус на текстовое поле
    } else {
        contentArea.innerHTML = '<p>Создай папку или заметку!</p>';
    }
}

function addNoteToSidebar(noteId, isInsideFolder = false) {
    const li = document.createElement('li');
    li.className = 'note';
    li.textContent = noteId; // Значок уже добавлен при создании заметки
    li.draggable = true;

    li.addEventListener('dragstart', (e) => {
        draggedNote = noteId;
        e.dataTransfer.setData('text', noteId);
    });

    li.addEventListener('dragend', () => {
        draggedNote = null;
    });

    // При клике на заметку открываем её
    li.addEventListener('click', () => {
        addTab(noteId); // Открываем вкладку с заметкой
    });

    li.addEventListener('dblclick', () => {
        const newName = prompt("Введите новое название заметки:", noteId.replace(" 📝", ""));
        if (newName && !notes[newName]) {
            notes[newName] = notes[noteId.replace(" 📝", "")];
            delete notes[noteId.replace(" 📝", "")];
            li.textContent = `${newName} 📝`; // Добавляем значок к новому названию
        } else {
            alert("Заметка с таким названием уже существует или название пустое!");
        }
    });

    if (isInsideFolder) {
        const folderNotesList = document.getElementById(`notes-list-${currentFolder}`); // Используем currentFolder
        if (folderNotesList) {
            folderNotesList.appendChild(li); // Добавляем заметку в список заметок текущей папки
        } else {
            console.error(`Элемент с id "notes-list-${currentFolder}" не найден`);
            alert(`Не удалось добавить заметку в папку "${currentFolder}", так как она не существует.`);
        }
    } else {
        // Если заметка создается вне папки, добавляем её в боковую панель
        folderList.appendChild(li); // Добавляем заметку в боковую панель
    }
}



function appendFolder(folderName) {
    const li = document.createElement('li');
    li.className = 'folder';
    li.textContent = `${folderName} 📁`; // Добавляем значок к названию папки

    li.addEventListener('click', (e) => {
        e.stopPropagation(); // предотвращаем всплытие события
        currentFolder = folderName; // обновляем текущую папку
        addTab(folderName, true); // Открываем вкладку папки
    });

    folderList.appendChild(li);
}

createFolderButton.addEventListener('click', () => {
    const folderName = prompt("Введите название папки:");
    if (folderName) {
        folders[folderName] = [];
        appendFolder(folderName);
    }
});

createNoteButton.addEventListener('click', () => {
    if (!isFolderOpen || !currentFolder) {
        alert("Сначала создайте папку, прежде чем создавать заметку!");
        return; // Выход из функции, если папка не создана
    }

    const noteId = prompt("Введите название заметки:");
    if (noteId && !notes[noteId]) {
        noteCount++;
        notes[noteId] = ''; // Создаем новую пустую заметку

        // Добавляем заметку в текущую папку и в боковую панель
        folders[currentFolder].push(noteId); // Добавляем заметку в текущую папку
        addNoteToSidebar(`${noteId} 📝`, true); // Добавляем значок к заметке
        // Не открываем вкладку с новой заметкой, чтобы она открывалась только при щелчке
    } else {
        alert("Заметка с таким названием уже существует или название пустое!");
    }
});



createNoteWithDateButton.addEventListener('click', () => {
    if (!todayNoteCreated) {
        const today = new Date().toLocaleDateString();
        if (!notes[today]) {
            notes[today] = '';
            addNoteToSidebar(today);
            addTab(today);

            // Если мы находимся в папке, добавляем заметку в папку
            if (isFolderOpen && currentFolder) {
                folders[currentFolder].push(today);
            }

            todayNoteCreated = true;
        } else {
            alert("Заметка с сегодняшней датой уже создана!");
        }
    }
});

searchFileButton.addEventListener('click', () => {
    const searchTerm = prompt("Введите название файла для поиска:");
    if (searchTerm) {
        const found = Object.keys(notes).find(noteId => noteId.includes(searchTerm));
        if (found) {
            addTab(found);
        } else {
            alert("Файл не найден.");
        }
    }
});

// События для редактирования пользователя, настройки и выхода
editUsernameButton.addEventListener('click', () => {
    const newUsername = prompt('Введите новое имя пользователя:', usernameDisplay.textContent);
    if (newUsername) {
        usernameDisplay.textContent = newUsername;
        alert('Имя пользователя успешно изменено.');
    }
});

editEmailButton.addEventListener('click', () => {
    const emailInput = document.getElementById('email-input');
    const newEmail = prompt('Введите новый адрес электронной почты:', emailInput.value);

    if (newEmail !== null && validateEmail(newEmail)) {
        emailInput.value = newEmail;
        alert('Адрес электронной почты успешно изменён.');
    } else {
        alert('Неверный формат почты.');
    }
});

editPasswordButton.addEventListener('click', () => {
    passwordModal.style.display = 'block';
});

confirmPasswordChangeButton.addEventListener('click', () => {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword === confirmPassword) {
        alert('Пароль успешно изменён.');
        passwordModal.style.display = 'none';
    } else {
        alert('Пароли не совпадают.');
    }
});

closePasswordModalButton.addEventListener('click', () => {
    passwordModal.style.display = 'none';
});

settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

closeSettingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

logoutButton.addEventListener('click', () => {
    alert('Вы вышли из системы.');
    window.location.href = 'login.html'; // Пример перенаправления
});

userIcon.addEventListener('click', () => {
    userMenu.classList.toggle('open');
});

window.addEventListener('click', (event) => {
    if (!userIcon.contains(event.target)) {
        userMenu.classList.remove('open');
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}


editUsernameButton.addEventListener('click', () => {
    const usernameInput = document.getElementById('username');
    const newUsername = prompt('Введите новое имя пользователя:', usernameInput.value);
    
    if (newUsername !== null) { 
        usernameInput.value = newUsername; 
        alert('Имя пользователя успешно изменено.');
    }
});


editEmailButton.addEventListener('click', () => {
    const emailInput = document.getElementById('email');
    const newEmail = prompt('Введите новую почту:', emailInput.value);
    
    if (newEmail !== null && validateEmail(newEmail)) { 
        emailInput.value = newEmail; 
        alert('Почта успешно изменена.');
    } else {
        alert('Введите корректный email или нажмите отмену.');
    }
});


function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}


userIcon.addEventListener('click', () => {
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
});


settingsButton.addEventListener('click', () => {
    userMenu.style.display = 'none';
    settingsModal.style.display = 'flex';
});


closeSettingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});


logoutButton.addEventListener('click', () => {
    if (confirm('Уверены, что хотите выйти?')) {
        window.location.href = 'login.html';
    }
});


editPasswordButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
    passwordModal.style.display = 'flex';
});


confirmPasswordChangeButton.addEventListener('click', () => {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword === confirmNewPassword) {
        if (oldPassword === oldPassword) { 
            alert('Пароль успешно изменен');
            passwordModal.style.display = 'none';
            settingsModal.style.display = 'flex';
        } else {
            alert('Старый пароль введён неверно');
        }
    } else {
        alert('Новые пароли не совпадают');
    }
});


closePasswordModalButton.addEventListener('click', () => {
    passwordModal.style.display = 'none';
    settingsModal.style.display = 'flex';
});
const createNoteOutsideButton = document.getElementById('create-note-outside');

createNoteOutsideButton.addEventListener('click', () => {
    const noteId = prompt("Введите название заметки:");
    if (noteId && !notes[noteId]) {
        notes[noteId] = ''; // Создаем новую пустую заметку
        addNoteToSidebar(`${noteId} 📝`); // Добавляем значок к заметке
        addTab(noteId); // Открываем вкладку с новой заметкой
    } else {
        alert("Заметка с таким названием уже существует или название пустое!");
    }
});

