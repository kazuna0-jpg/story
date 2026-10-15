// LocalStorage Keys
const BOOKS_KEY = 'lifetime_library_books';
const COMMENTS_KEY = 'lifetime_library_comments';

// Default initial books
const defaultBooks = [
  {
    id: 'b1',
    title: 'Noli Me Tangere',
    author: 'Dr. Jose Rizal',
    genre: 'Kasaysayan',
    desc: 'Isang nobelang naglalahad ng lipunang Pilipino noong panahon ng pananakop ng Espanyol.'
  },
  {
    id: 'b2',
    title: 'Ang Lihim ng AI at Coding',
    author: 'Juan Developer',
    genre: 'Teknolohiya',
    desc: 'Isang kapana-panabik na gabay sa mundo ng artificial intelligence at software engineering.'
  }
];

// App State
let books = JSON.parse(localStorage.getItem(BOOKS_KEY)) || defaultBooks;
let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
let currentGenreFilter = 'all';
let currentSearchTerm = '';
let currentActiveBookId = null;

// Save to LocalStorage
function saveData() {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

// Ensure default data is saved on first load
if (!localStorage.getItem(BOOKS_KEY)) saveData();

// ================= READERS PAGE LOGIC =================
const booksGrid = document.getElementById('books-grid');
const searchInput = document.getElementById('search-input');
const categoryBoxes = document.querySelectorAll('.cat-box');

if (booksGrid) {
  renderBooks();

  // Category Filter
  categoryBoxes.forEach(box => {
    box.addEventListener('click', () => {
      categoryBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      currentGenreFilter = box.dataset.genre;
      renderBooks();
    });
  });

  // Search Filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase();
      renderBooks();
    });
  }
}

function renderBooks() {
  if (!booksGrid) return;
  booksGrid.innerHTML = '';

  const filtered = books.filter(book => {
    const matchesGenre = currentGenreFilter === 'all' || book.genre === currentGenreFilter;
    const matchesSearch = book.title.toLowerCase().includes(currentSearchTerm) ||
                          book.author.toLowerCase().includes(currentSearchTerm);
    return matchesGenre && matchesSearch;
  });

  if (filtered.length === 0) {
    booksGrid.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1; text-align: center;">Walang nahanap na libro.</p>`;
    return;
  }

  filtered.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div>
        <span class="book-genre-badge">${escapeHtml(book.genre)}</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="book-author">ni ${escapeHtml(book.author)}</p>
        <p class="book-desc-preview">${escapeHtml(book.desc)}</p>
      </div>
      <button class="read-btn" data-id="${book.id}">Basahin at Mag-komento</button>
    `;
    booksGrid.appendChild(card);
  });
}

// Modal Reader & Comments
const readerModal = document.getElementById('reader-modal');
const closeModal = document.querySelector('.close-modal');
const modalBookDetails = document.getElementById('modal-book-details');
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

if (booksGrid) {
  booksGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('read-btn')) {
      openReaderModal(e.target.dataset.id);
    }
  });
}

function openReaderModal(bookId) {
  currentActiveBookId = bookId;
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  modalBookDetails.innerHTML = `
    <span class="book-genre-badge">${escapeHtml(book.genre)}</span>
    <h2 style="font-size: 1.5rem; margin-top: 5px; color: #f8fafc;">${escapeHtml(book.title)}</h2>
    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px;">May-akda: ${escapeHtml(book.author)}</p>
    <div style="background-color: #0f172a; padding: 15px; border-radius: 6px; border: 1px solid #334155; line-height: 1.6; font-size: 0.95rem;">
      ${escapeHtml(book.desc)}
    </div>
  `;

  renderComments(bookId);
  readerModal.style.display = 'flex';
}

if (closeModal) {
  closeModal.addEventListener('click', () => readerModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === readerModal) readerModal.style.display = 'none';
  });
}

function renderComments(bookId) {
  if (!commentsList) return;
  commentsList.innerHTML = '';
  const bookComments = comments[bookId] || [];

  if (bookComments.length === 0) {
    commentsList.innerHTML = `<p style="font-size: 0.85rem; color: #94a3b8; text-align: center;">Wala pang komento. Mag-iwan ng unang komento!</p>`;
    return;
  }

  bookComments.forEach(comm => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
      <div class="comment-content">
        <strong>${escapeHtml(comm.name)}</strong>
        <p>${escapeHtml(comm.text)}</p>
      </div>
      <button class="delete-comment-btn" data-commentid="${comm.id}">🗑️ Burahin</button>
    `;
    commentsList.appendChild(div);
  });
}

if (commentForm) {
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();

    if (!name || !text || !currentActiveBookId) return;

    if (!comments[currentActiveBookId]) comments[currentActiveBookId] = [];

    comments[currentActiveBookId].push({
      id: 'c_' + Date.now(),
      name: name,
      text: text
    });

    saveData();
    renderComments(currentActiveBookId);
    document.getElementById('comment-text').value = '';
  });
}

if (commentsList) {
  commentsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-comment-btn')) {
      const commentId = e.target.dataset.commentid;
      if (confirm('Sigurado ka bang gusto mong burahin ang komentong ito?')) {
        comments[currentActiveBookId] = comments[currentActiveBookId].filter(c => c.id !== commentId);
        saveData();
        renderComments(currentActiveBookId);
      }
    }
  });
}

// ================= DEVELOPER PAGE LOGIC =================
const addBookForm = document.getElementById('add-book-form');
const devBooksList = document.getElementById('dev-books-list');

if (addBookForm) {
  addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newBook = {
      id: 'b_' + Date.now(),
      title: document.getElementById('book-title').value.trim(),
      author: document.getElementById('book-author').value.trim(),
      genre: document.getElementById('book-genre').value,
      desc: document.getElementById('book-desc').value.trim()
    };

    books.push(newBook);
    saveData();
    renderDevBooks();

    addBookForm.reset();
    alert('Matagumpay na naidagdag at na-publish ang bagong libro!');
  });
}

function renderDevBooks() {
  if (!devBooksList) return;
  devBooksList.innerHTML = '';

  books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'dev-book-item';
    div.innerHTML = `
      <div>
        <strong>${escapeHtml(book.title)}</strong> (${escapeHtml(book.genre)})
        <p style="font-size: 0.8rem; color: #94a3b8;">ni ${escapeHtml(book.author)}</p>
      </div>
      <button class="delete-book-btn" data-id="${book.id}">Burahin ang Libro</button>
    `;
    devBooksList.appendChild(div);
  });
}

if (devBooksList) {
  renderDevBooks();

  devBooksList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-book-btn')) {
      const bookId = e.target.dataset.id;
      if (confirm('Sigurado ka bang gusto mong burahin ang librong ito sa system?')) {
        books = books.filter(b => b.id !== bookId);
        delete comments[bookId]; // Alisin din ang kaugnay na comments
        saveData();
        renderDevBooks();
      }
    }
  });
}

// Helper XSS Protection
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}