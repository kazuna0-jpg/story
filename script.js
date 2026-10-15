const ADMIN_PASSWORD = "P@$$w0rd.Chris27";
let isAdminLoggedIn = false;
let currentReadingBookId = null;

// Initial Default Database Structure
let booksDatabase = [
    {
        id: "book-1",
        title: "Sword Art Online: Ang Kwento ng Pagkabuhay",
        author: "Kirito_Dev",
        tag: "action",
        coverColor: "#1d4ed8",
        views: 142,
        chapters: [
            { title: "Kabanata 1: Ang Simula ng Link Start", content: "Maligayang pagdating sa mundo ng Aincrad. Isang mundong gawa sa bakal at digital code kung saan ang kamatayan sa laro ay nangangahulugan ng tunay na katapusan..." }
        ],
        comments: [
            { id: "comment-1", username: "Asuna_Fan", text: "Napakaganda naman ng panimula na ito! Excited na ako sa susunod." }
        ]
    },
    {
        id: "book-2",
        title: "The Millionaire's Irresistible Enemy",
        author: "Misha_Write",
        tag: "romance",
        coverColor: "#be123c",
        views: 89,
        chapters: [
            { title: "Chapter 1: The Unexpected Encounter", content: "Nagkatagpo ang kanilang mga mata sa gitna ng mataong siyudad..." }
        ],
        comments: []
    }
];

function initLibrary() {
    const savedData = localStorage.getItem('wattpad_books_data_v2');
    if (savedData) {
        booksDatabase = JSON.parse(savedData);
    }
    renderLibraryGrid();
    populateBookDropdown();
}

function renderLibraryGrid() {
    const featuredGrid = document.getElementById('featured-grid');
    const newReleasesGrid = document.getElementById('newreleases-grid');
    
    featuredGrid.innerHTML = "";
    newReleasesGrid.innerHTML = "";

    booksDatabase.forEach((book, index) => {
        const cardHTML = `
            <div class="book-card" onclick="openBookReader('${book.id}')">
                <div class="book-cover" style="background: linear-gradient(135deg, ${book.coverColor}, #000000);">
                    <div class="book-cover-title">${book.title}</div>
                </div>
                <div class="book-info-title">${book.title}</div>
                <div class="book-info-author">ni ${book.author}</div>
                <div style="font-size: 11px; opacity: 0.6; margin-top: 2px;">👁️ ${book.views || 0} views</div>
                <span class="tag-badge">#${book.tag}</span>
            </div>
        `;

        if (index % 2 === 0) {
            featuredGrid.innerHTML += cardHTML;
        } else {
            newReleasesGrid.innerHTML += cardHTML;
        }
    });
}

function openBookReader(bookId) {
    currentReadingBookId = bookId;
    const book = booksDatabase.find(b => b.id === bookId);
    
    if (!book) return;

    if (!book.views) book.views = 0;
    book.views++;
    saveDatabaseSilently();

    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-reader').classList.remove('hidden');

    document.getElementById('reader-book-title').innerText = book.title;
    document.getElementById('reader-book-author').innerText = `Isinulat ni: ${book.author}`;
    document.getElementById('reader-book-views').innerText = `👁️ ${book.views} views`;

    const chaptersContainer = document.getElementById('reader-chapters-container');
    chaptersContainer.innerHTML = "";

    if (book.chapters.length === 0) {
        chaptersContainer.innerHTML = "<p style='color: #64748b;'>Wala pang inilalathalang kabanata ang may-akda sa librong ito.</p>";
    } else {
        book.chapters.forEach(ch => {
            chaptersContainer.innerHTML += `
                <div class="chapter-view-box">
                    <h3>${ch.title}</h3>
                    <p>${ch.content.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        });
    }

    renderComments(book);
    window.scrollTo(0, 0);
}

// 💬 RENDER COMMENTS + DYNAMIC ADMIN DELETE BUTTON
function renderComments(book) {
    const listContainer = document.getElementById('comments-list-container');
    const countDisplay = document.getElementById('comments-count');
    
    if (!book.comments) book.comments = [];
    
    countDisplay.innerText = book.comments.length;
    listContainer.innerHTML = "";

    if (book.comments.length === 0) {
        listContainer.innerHTML = "<p style='color: #64748b; font-size: 14px;'>Wala pang komento rito. Ika'y maging una!</p>";
        return;
    }

    book.comments.forEach(c => {
        // 🛡️ Kung ang Admin ay naka-login, magpapakita ang Delete button [1]
        let deleteButtonHTML = "";
        if (isAdminLoggedIn) {
            deleteButtonHTML = `<button onclick="deleteComment('${c.id}')" style="background-color: #ef4444; color: white; font-size: 11px; padding: 3px 8px; margin-top: 8px; float: right;">🗑️ Burahin</button>`;
        }

        listContainer.innerHTML += `
            <div class="single-comment" style="overflow: hidden;">
                ${deleteButtonHTML}
                <div class="comment-user">👤 ${c.username}</div>
                <p class="comment-text-content">${c.text}</p>
            </div>
        `;
    });
}

// ➕ SUBMIT NEW USER COMMENT
function submitComment() {
    const usernameInput = document.getElementById('comment-username').value.trim();
    const textInput = document.getElementById('comment-text').value.trim();

    if (!usernameInput || !textInput) {
        alert("Pakisulat ang iyong pangalan at komento bago mag-submit!");
        return;
    }

    const book = booksDatabase.find(b => b.id === currentReadingBookId);
    if (book) {
        if (!book.comments) book.comments = [];
        
        book.comments.push({
            id: "comment-" + Date.now(), // Gumawa ng natatanging ID para sa komento
            username: usernameInput,
            text: textInput
        });

        saveDatabaseSilently();
        renderComments(book);

        document.getElementById('comment-text').value = "";
    }
}

// 🗑️ ADMIN ACTION: DELETE SPECIFIC COMMENT [1]
function deleteComment(commentId) {
    if (!isAdminLoggedIn) {
        alert("Error: Admin lamang ang may pahintulot na magbura!");
        return;
    }

    const konfirmasyon = confirm("Sigurado ka bang nais mong burahin ang komentong ito?");
    if (!konfirmasyon) return;

    const book = booksDatabase.find(b => b.id === currentReadingBookId);
    if (book && book.comments) {
        // Alisin ang komento na tumutugma sa commentId [1]
        book.comments = book.comments.filter(c => c.id !== commentId);
        
        saveDatabaseSilently();
        renderComments(book); // I-refresh ang listahan sa screen
    }
}

function goBackHome() {
    document.getElementById('view-reader').classList.add('hidden');
    document.getElementById('view-home').classList.remove('hidden');
    renderLibraryGrid();
}

// ADMIN DASHBOARD UTILITIES
function toggleDevMode() {
    if (!isAdminLoggedIn) {
        let entry = prompt("Ilagay ang Admin/Developer Password upang makapagdagdag ng libro:");
        if (entry === ADMIN_PASSWORD) {
            isAdminLoggedIn = true;
            document.getElementById('dev-panel').classList.remove('hidden');
            document.getElementById('dev-mode-btn').innerText = "🔓 Admin Logout";
            populateBookDropdown();
            
            // Kung kasalukuyang nagbabasa, i-refresh ang comment zone para lumabas ang delete buttons [1]
            if (currentReadingBookId) {
                const book = booksDatabase.find(b => b.id === currentReadingBookId);
                if (book) renderComments(book);
            }
        } else if (entry !== null) {
            alert("Maling Password! Access Denied.");
        }
    } else {
        isAdminLoggedIn = false;
        document.getElementById('dev-panel').classList.add('hidden');
        document.getElementById('dev-mode-btn').innerText = "🔒 Admin Login";
        
        // I-refresh ang comments upang itago muli ang delete buttons kapag nag-logout ang admin [1]
        if (currentReadingBookId) {
            const book = booksDatabase.find(b => b.id === currentReadingBookId);
            if (book) renderComments(book);
        }
    }
}

function switchDevTab(tabType) {
    if (tabType === 'book') {
        document.getElementById('form-new-book').classList.remove('hidden');
        document.getElementById('form-new-chapter').classList.add('hidden');
    } else {
        document.getElementById('form-new-book').classList.add('hidden');
        document.getElementById('form-new-chapter').classList.remove('hidden');
    }
}

function createNewBook() {
    const title = document.getElementById('new-book-title').value.trim();
    const author = document.getElementById('new-book-author').value.trim();
    const tag = document.getElementById('new-book-tag').value.trim();
    const color = document.getElementById('new-book-color').value;

    if (!title || !author || !tag) {
        alert("Paki-puno lahat ng patlang!");
        return;
    }

    const newBookObj = {
        id: "book-" + Date.now(),
        title: title,
        author: author,
        tag: tag.toLowerCase(),
        coverColor: color,
        views: 0,
        chapters: [],
        comments: []
    };

    booksDatabase.push(newBookObj);
    saveDatabase();
    
    document.getElementById('new-book-title').value = "";
    document.getElementById('new-book-author').value = "";
    document.getElementById('new-book-tag').value = "";
    alert(`🎉 Nailathala ang aklat na "${title}"!`);
}

function addChapterPage() {
    const targetBookId = document.getElementById('select-target-book').value;
    const chTitle = document.getElementById('chapter-title').value.trim();
    const chContent = document.getElementById('chapter-content').value.trim();

    if (!chTitle || !chContent) {
        alert("Pakisulat ang pamagat at nilalaman!");
        return;
    }

    const book = booksDatabase.find(b => b.id === targetBookId);
    if (book) {
        book.chapters.push({ title: chTitle, content: chContent });
        saveDatabase();

