const ENUM = {
    STORAGE_KEY : 'BOOKSELF',
    RENDER_EVENT : 'render-book',
    DELETED_EVENT : 'deleted-book',
    MOVED_EVENT : 'moved-book'
}

// array of books
const books = [];

/**
 * Represents to check storage
**/
function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser not supported for storage');
        return false;
    }
    return true;
}

/**
 * Represents to load data from storage and push on array books
**/
function loadDataFromStorage() {
    const data = JSON.parse(localStorage.getItem(ENUM.STORAGE_KEY));
    if (data !== null) {
        for (const item of data) {
            books.push(item);
        }
    }
    document.dispatchEvent(new Event(ENUM.RENDER_EVENT));
};

/**
 * Represents to save storage session data.
**/
function saveStorageSessionData() {
    if (isStorageExist()) {
        const parsedJSON = JSON.stringify(books);
        localStorage.setItem(ENUM.STORAGE_KEY, parsedJSON);
        document.dispatchEvent(new Event(ENUM.RENDER_EVENT));
    }
};

/**
 * Represents to save the form data.
**/
function saveAddData() {
    const bookTitle = document.getElementById("title").value;
    const bookAuthor = document.getElementById("author").value;
    const bookYear = document.getElementById("year").value;
    const bookIsRead = document.getElementById("isRead").value === 'true' ? true : false;

    const booksObject = {
        id: +new Date(),
        title: bookTitle,
        author: bookAuthor,
        year: Number(bookYear),
        isRead: Boolean(bookIsRead)
    }
    books.push(booksObject);

    bookTitle.value = null;
    bookAuthor.value = null;
    bookYear.value = null;
    bookIsRead.value = null;
    document.dispatchEvent(new Event(ENUM.RENDER_EVENT));
    saveStorageSessionData();
    resetForm();
};

function resetForm ()
{
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("year").value = "";
}

document.addEventListener("DOMContentLoaded", function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }
    const formAddBook = document.getElementById("formAddBook");
    formAddBook.addEventListener("submit", function (event)  {
        event.preventDefault();
        saveAddData();
    });


    const formSearchBook = document.getElementById("formSearchBook");
    formSearchBook.addEventListener("submit",function (event) {
        event.preventDefault();
        searchBookByTitle();
    });


    const resetBtn = document.querySelector(".reset-button");
    resetBtn.addEventListener("click",function (event)  {
        document.getElementById("findBookId").value = "";
        searchBookByTitle();
        event.preventDefault();
    });
});

function searchBookByTitle() {
    const bookItemsAvailable = document.getElementsByClassName("card");
    const searchFormInput = document.getElementById("findBookId").value;

    for (let i = 0; i < bookItemsAvailable.length; i++) {
        const itemTitle = bookItemsAvailable[i].querySelector(".title");
        if (itemTitle.textContent.toLowerCase().includes(searchFormInput)) {
            bookItemsAvailable[i].classList.remove("hidden-card");
        } else {
            bookItemsAvailable[i].classList.add("hidden-card"); 
        }
    }
    
}



/**
 * Represents to GENERATE BOOKS TO READ OR UNREAD.
 * then call a function
**/
document.addEventListener(ENUM.RENDER_EVENT, function () {
    const unfinishedReadBook = document.getElementById("unreadBooks");
    unfinishedReadBook.innerHTML = "";

    const finishedReadBook = document.getElementById("readBooks");
    finishedReadBook.innerHTML = "";

    for (let i = 0; i < books.length; i++) {
        const bookElement = generateBookElement(books[i]);
        if (books[i].isRead) {
            finishedReadBook.append(bookElement);
        } else {
            unfinishedReadBook.append(bookElement);
        }
    }
});


/**
 * Represents to genereate book element to generateBookElement.
 * then call a function
 * @param {object} bookObject 
 * @returns object
 */
function generateBookElement(bookObject) {

    const elementBookTitle = document.createElement("p");
    elementBookTitle.classList.add("title");
    elementBookTitle.innerHTML = `Book Title : ${bookObject.title}<br> <span>Published Year : ${bookObject.year}</span>`;

    const elementBookAuthor = document.createElement("p");
    elementBookAuthor.innerText = ` Author By : ${bookObject.author}`;

    const descContainer = document.createElement("div");
    descContainer.classList.add("header-card");
    descContainer.append(elementBookTitle, elementBookAuthor);

    const actionContent = document.createElement("div");
    actionContent.classList.add("action-card");

    const container = document.createElement("div");
    container.classList.add("card","margin-top20");
    container.append(descContainer);
    container.setAttribute("id", `book-${bookObject.id}`);

    if (bookObject.isRead) {
        const returnBtn = document.createElement("button");
        returnBtn.classList.add("return-btn");
        returnBtn.innerHTML = `<i class='fa fa-arrow-left'></i> mark as not yet read `;

        returnBtn.addEventListener("click", function (event) {
            addBookToUnfinished(bookObject.id);
            event.preventDefault();
        });

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("remove-btn","margin-top10");
        deleteButton.innerHTML = `<i class="fa fa-trash"></i> remove from book list`;

        deleteButton.addEventListener("click",function (event)  {
            deleteBookAction(bookObject.id);
            event.preventDefault();
        });

        actionContent.append(returnBtn, deleteButton);
        container.append(actionContent);
    } else {
        const finishBtn = document.createElement("button");
        finishBtn.classList.add("finish-btn");
        finishBtn.innerHTML = `<i class="fa fa-check"></i> mark as already read `;

        finishBtn.addEventListener("click", function(event)  {
            moveBookToFinished(bookObject.id);
            event.preventDefault();
        });

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("remove-btn","margin-top10");
        deleteButton.innerHTML = `<i class="fa fa-trash"></i> remove from book list`;

        deleteButton.addEventListener("click", function(event)  {
            deleteBookAction(bookObject.id);
            event.preventDefault();
        });

        actionContent.append(finishBtn, deleteButton);
        container.append(actionContent);
    }
    return container;
}

/**
 * Represents to delete book object from array  books.
 * then call a function
 * @param object bookId 
 * @returns call function
 */
function deleteBookAction(bookId) {
    const bookTarget = findBookByIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(ENUM.RENDER_EVENT));
    deleteDataBook();
};

/**
 * Represents to delete book object from array  books.
 * then call a function
 * @param object bookId 
 * @returns call function
 */
function deleteDataBook() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(ENUM.STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(ENUM.DELETED_EVENT));
    }
};
/**
 * Represents to find book by index.id properties
 * then call a function
 * @param object bookId 
 * @returns call function
 */
function findBookByIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
};
/**
 * Represents to add book to finished book with moving method from unfinished properties false become true.
 * then call a function changeData
 * @param {object} bookId 
 * @returns {object} selected bookitem 
 */
function moveBookToFinished(bookId) {
    const bookTarget = findBookById(bookId);
    if (bookTarget == null) return;

    bookTarget.isRead = true;
    document.dispatchEvent(new Event(ENUM.RENDER_EVENT));
    changeData();
};

/**
 * Represents to find book from bookId
 * @param {object} bookId 
 * @returns 
 */
function findBookById(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
};
/**
 * Represents to check storage, if exixst then parsed the array books from existing .
 * then call a function
 */
function changeData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(ENUM.STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(ENUM.MOVED_EVENT));
    }
};

/**
 * Represents to move data from isRead true, become isRead false
 * @param {object} bookId 
 * @returns 
 */
function addBookToUnfinished(bookId) {
    const bookTarget = findBookById(bookId);

    if (bookTarget == null) return;

    bookTarget.isRead = false;
    document.dispatchEvent(new Event(ENUM.RENDER_EVENT));
    changeData();
};

/**
* Represents to find data with 
* @param {object} bookId 
* @returns object 
*/
function findBookById(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
};

