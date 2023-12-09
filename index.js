let currentUser = null;
let notesData = [];
let foldersData = [];

function showLoginSection() {
    clearInputFields();
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'block';
    document.getElementById('notes-section').style.display = 'none';
}

function showNotesSection() {
    clearInputFields();
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('notes-section').style.display = 'block';
}

function clearInputFields() {
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // user validation
    const storedPassword = localStorage.getItem(username);

    if (storedPassword && password === storedPassword) {
        currentUser = username;
        loadNotes();
        showNotesSection();
    } else {
        alert('Invalid credentials. Please check your username and password or register.');
    }
}

function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();

    // user registration
    if (username && password) {
        const existingUser = localStorage.getItem(username);
        if (!existingUser) {
            localStorage.setItem(username, password);
            currentUser = username;
            loadNotes();
            showNotesSection();
        } else {
            alert('Username already exists. Please choose a different username.');
        }
    } else {
        alert('Invalid registration. Please fill in all fields.');
    }
}

function logout() {
    currentUser = null;
    showLoginSection();
}

function loadNotes() {
    // notes loading
    notesData = JSON.parse(localStorage.getItem(currentUser + '-notes')) || [];
    if (!Array.isArray(notesData)) {
        notesData = [];
    }

    // folders loading
    foldersData = JSON.parse(localStorage.getItem(currentUser + '-folders')) || [];
    if (!Array.isArray(foldersData)) {
        foldersData = [];
    }

    renderFolders();
    renderNotes();
}

function saveNotes() {
    localStorage.setItem(currentUser + '-notes', JSON.stringify(notesData));
}

function saveFolders() {
    localStorage.setItem(currentUser + '-folders', JSON.stringify(foldersData));
}

function renderFolders() {
    const foldersSection = document.getElementById('folders-section');
    foldersSection.innerHTML = '';

    foldersData.forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.textContent = folder.name;
        folderElement.onclick = function() {
            renderNotesInFolder(folder.name);
        };

        const deleteFolderButton = document.createElement('button');
        deleteFolderButton.className = 'delete-folder-button';
        deleteFolderButton.textContent = 'Delete Folder';
        deleteFolderButton.onclick = function(event) {
            event.stopPropagation();
            deleteFolder(folder.name);
        };

        folderElement.appendChild(deleteFolderButton);
        foldersSection.appendChild(folderElement);
    });
}

function renderNotes() {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    notesData.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
                <p>${note.content}</p>
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="deleteNote(${note.id})">Delete</button>
            `;
        notesContainer.appendChild(noteElement);
    });

    saveNotes();
}

function renderNotesInFolder(folderName) {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    const filteredNotes = notesData.filter(note => note.folder === folderName);

    filteredNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
                <p>${note.content}</p>
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="deleteNote(${note.id})">Delete</button>
            `;
        notesContainer.appendChild(noteElement);
    });
}

function addFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        const newFolder = {
            name: folderName,
        };
        foldersData.push(newFolder);
        renderFolders();
        saveFolders();
    }
}

function addNote() {
    const contentInput = document.createElement('textarea');
    contentInput.placeholder = 'Enter your note...';

    const folderSelect = document.createElement('select');
    folderSelect.innerHTML = '<option value="">Select Folder</option>';

    foldersData.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.name;
        option.text = folder.name;
        folderSelect.appendChild(option);
    });

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        const content = contentInput.value.trim();
        const selectedFolder = folderSelect.value;

        if (content && selectedFolder) {
            const newNote = {
                id: notesData.length + 1,
                content,
                folder: selectedFolder,
            };
            notesData.push(newNote);
            renderNotes();
        } else {
            alert('Please enter content and select a folder.');
        }
    };

    displayInput(contentInput, folderSelect, saveButton);
}

function editNote(noteId) {
    const note = notesData.find(note => note.id === noteId);

    const contentInput = document.createElement('textarea');
    contentInput.value = note.content;

    const folderSelect = document.createElement('select');
    folderSelect.innerHTML = '<option value="">Select Folder</option>';

    foldersData.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.name;
        option.text = folder.name;
        folderSelect.appendChild(option);
    });

    folderSelect.value = note.folder;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        const newContent = contentInput.value.trim();
        const newFolder = folderSelect.value;

        if (newContent !== note.content || newFolder !== note.folder) {
            const editedNoteIndex = notesData.findIndex(note => note.id === noteId);
            notesData[editedNoteIndex].content = newContent;
            notesData[editedNoteIndex].folder = newFolder;
            renderNotes();
        }
    };

    displayInput(contentInput, folderSelect, saveButton);
}

function deleteNote(noteId) {
    notesData = notesData.filter(note => note.id !== noteId);
    renderNotes();
}

function deleteFolder(folderName) {
    foldersData = foldersData.filter(folder => folder.name !== folderName);
    notesData = notesData.filter(note => note.folder !== folderName);
    renderFolders();
    renderNotes();
    saveFolders();
    saveNotes();
}

function displayInput(contentInput, folderSelect, actionButton) {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';
    notesContainer.appendChild(contentInput);
    notesContainer.appendChild(folderSelect);
    notesContainer.appendChild(actionButton);
}

showLoginSection();