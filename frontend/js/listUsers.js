'use strict';

// Elements
const userGridContainer = document.querySelector('.user-overview__grid');
const paginationContainer = document.querySelector('.pagination');
const paginationPages = document.querySelector('.pagination__pages');
const btnPrev = document.querySelector('.pagination__arrow--prev');
const btnNext = document.querySelector('.pagination__arrow--next');
const filters = document.querySelector('.filters');
const searchInput = document.querySelector('#filters__search');
const allDropdownMenus = document.querySelectorAll('.dropdown');
const applyFilters = document.querySelector('.filters__apply-btn');
const createNew = document.querySelector('.user-overview__create-btn');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const closeModalBtn = document.querySelector('.close-modal');
const defaultCloseModal = document.querySelector('.default--close-modal');
const form = document.querySelector('#create-user-form');
const usersPerPage = 10; // Number of users to show per page
let maxVisibleButtons = 5; // Max number of visible pagination buttons
let currentPage = 1;

//////////////////////////////////////////////////////////////
// Getting the DATA from the the JSON server

const getUserData = function (url, errorMsg = 'Something went wrong!') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMsg} ${response.status}`);
    return response.json();
  });
};

//------------------------------------------------------------------
// Calculation of the total number of pages
const totalPages = function (userData, numUserPerPage) {
  return Math.ceil(userData.length / numUserPerPage);
};

//----------------------------------------------------------------
// Setup of the search bar

const searchUserData = function (userData) {
  const search = searchInput.value.trim().toLowerCase();

  // If search is empty → return the original data (no filtering)
  if (!search) return userData;

  return userData.filter(user => {
    return (
      user.type?.toLowerCase().includes(search) ||
      user.status?.toLowerCase().includes(search) ||
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.includes(search) ||
      user.companyName?.toLowerCase().includes(search) ||
      user.country?.toLowerCase().includes(search) ||
      user.city?.toLowerCase().includes(search) ||
      user.postalCode?.toString().includes(search) ||
      user.address?.toLowerCase().includes(search) ||
      user.vatNumber?.toLowerCase().includes(search)
    );
  });
};

//----------------------------------------------------------------
// Setup of the logic behind the checkboxes of the 2 filters

document.addEventListener('change', function (e) {
  const filterContainer = e.target.closest('[data-filter]');
  if (!filterContainer) return;

  const checkboxes = filterContainer.querySelectorAll('input[type="checkbox"]');
  const allCheckbox = filterContainer.querySelector('input[value="all"]');
  const specificCheckboxes = Array.from(checkboxes).filter(
    cb => cb.value !== 'all'
  );

  // Case 1: "All" is checked --> disable specific options
  if (e.target.value === 'all') {
    specificCheckboxes.forEach(cb => {
      cb.checked = false;
      cb.disabled = e.target.checked;
    });
  } else {
    allCheckbox.checked = false;
    specificCheckboxes.forEach(cb => (cb.disabled = false));
    if (specificCheckboxes.every(cb => cb.checked)) {
      allCheckbox.checked = true;
      specificCheckboxes.forEach(cb => {
        cb.checked = false;
        cb.disabled = true;
      });
    }
  }
});

//----------------------------------------------------------------
// Setup of the filters

// --- Helper to update filters from checkboxes
const getSelectedOptions = function (checkboxes) {
  return Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
};

const resetToAll = function (checkboxes, selectedOptionsArray) {
  checkboxes[0].checked = true;
  selectedOptionsArray.length = 0;
  selectedOptionsArray.push('all');
};

const noneSelected = function (checkboxes) {
  Array.from(checkboxes).every(cb => !cb.checked);
};

// --- Global filter state
let selectedOptionsType = [];
let selectedOptionsState = [];

// --- Core filtering logic
const filterUserData = function (userData) {
  const selectedFilters = {
    status: selectedOptionsState,
    type: selectedOptionsType,
  };

  return userData.filter(user =>
    Object.entries(selectedFilters).every(([key, selectedValues]) =>
      !selectedValues.length || selectedValues.includes('all')
        ? true
        : selectedValues.includes(user[key])
    )
  );
};

// --- Handle filter application
applyFilters.addEventListener('click', function () {
  const checkboxesType = document.querySelectorAll('input[name="type"]');
  const checkboxesState = document.querySelectorAll('input[name="status"]');

  const noType = noneSelected(checkboxesType);
  const noState = noneSelected(checkboxesState);
  const bothNone = noType && noState;

  if (bothNone || (checkboxesType[0].checked && checkboxesState[0].checked)) {
    resetToAll(checkboxesType, selectedOptionsType);
    resetToAll(checkboxesState, selectedOptionsState);
  } else if (noType || checkboxesType[0].checked) {
    resetToAll(checkboxesType, selectedOptionsType);
    selectedOptionsState = getSelectedOptions(checkboxesState);
  } else if (noState || checkboxesState[0].checked) {
    resetToAll(checkboxesState, selectedOptionsState);
    selectedOptionsType = getSelectedOptions(checkboxesType);
  } else {
    selectedOptionsType = getSelectedOptions(checkboxesType);
    selectedOptionsState = getSelectedOptions(checkboxesState);
  }

  // --- After filters are updated, refresh user table and pagination
  getUserData('http://localhost:3000/users').then(userData => {
    const filteredData = searchUserData(filterUserData(userData));
    // displayUserTable(filteredData);
    const totPages = totalPages(filteredData, usersPerPage);
    if (currentPage > totPages) currentPage = totPages || 1;
    displayUserTable(filteredData);
    createPageLinks(
      filteredData,
      updatePagination(currentPage, totPages),
      totPages
    );
    activatePage(currentPage);
  });

  // --- Hide all dropdown menus
  Array.from(allDropdownMenus).forEach(menu => menu.classList.add('hidden'));
});

//------------------------------------------------------------------
// Create New User

createNew.addEventListener('click', function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
});

defaultCloseModal.addEventListener('click', function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
});

// Collecting form data and sending the new user to the JSON server and refreshing the table and pagination

form.addEventListener('submit', async e => {
  e.preventDefault();

  const newUser = Object.fromEntries(new FormData(form));

  // Fetch current users
  const users = await fetch('http://localhost:3000/users').then(res =>
    res.json()
  );

  // Assign new id at the end
  newUser.id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 0;

  // Add user to JSON server
  await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  });

  // Refresh the table and pagination
  const updatedUsers = await fetch('http://localhost:3000/users').then(res =>
    res.json()
  );
  displayUserTable(updatedUsers);
  const totPages = totalPages(updatedUsers, usersPerPage);
  // if (currentPage > totPages) currentPage = totPages || 1;
  createPageLinks(
    updatedUsers,
    updatePagination(currentPage, totPages),
    totPages
  );
  activatePage(currentPage);

  // Close modal and overlay and reset form
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
  form.reset();
});

//------------------------------------------------------------------
// Function to build and display the user table

const displayUserTable = function (data) {
  const start = (currentPage - 1) * usersPerPage;
  const end = currentPage * usersPerPage;
  const titlesHtml = `
      <p class="grid-titles">Name</p>
      <p class="grid-titles">Phone</p>
      <p class="grid-titles">Type</p>
      <p class="grid-titles">State</p>
      <p class="grid-titles">Company</p>`;
  const userHtml = data
    .slice(start, end)
    .map(
      user => `
        <div class="grid-items" data-user-id ="${user.id}">
          <p><strong>${user.firstName} ${user.lastName}</strong></p>
          <p>${user.email}</p>
        </div>
        <p class="grid-items" data-user-id = "${user.id}">${user.phone}</p>
        <div class="grid-items">
          <p class="user-type user-type--${user.type}" data-user-id = "${user.id}">${user.type}</p>
        </div>
        <div class="grid-items">
          <p class="user-status user-status--${user.status}" data-user-id = "${user.id}">${user.status}</p>
        </div>
        <div class="grid-items">
          <p data-user-id = "${user.id}">
          <strong>${user.companyName}</strong></p>
          <p>${user.address}</p>
        </div>
    `
    )
    .join('');
  const html = titlesHtml + userHtml;
  userGridContainer.innerHTML = html;
};

//------------------------------------------------------------------
// Function to create the navigation buttons

const createPageLinks = function (userData, [start, end], totNumPages) {
  // First, remove all page links
  document.querySelectorAll('.page-link').forEach(link => link.remove());
  document.querySelectorAll('.ellipsis')?.forEach(ell => ell.remove());
  // Insert ellipsis
  if (start > 0) {
    paginationPages.insertAdjacentHTML(
      'beforeend',
      `<p class="ellipsis">...</p>`
    );
  }
  // Create the page links
  for (let i = start; i <= end; i++) {
    paginationPages.insertAdjacentHTML(
      'beforeend',
      `<button class="page-link" data-page="${i + 1}">${i + 1}</button>`
    );
  }
  // Insert ellipsis
  if (end < totNumPages - 2) {
    paginationPages.insertAdjacentHTML(
      'beforeend',
      `<p class="ellipsis">...</p>`
    );
  }
  // Add last page link
  paginationPages.insertAdjacentHTML(
    'beforeend',
    `<button class="page-link" data-page="${totNumPages}">${totNumPages}</button>`
  );
};

//------------------------------------------------------------------
// Function to activate the current navigation button

const activatePage = function (page) {
  // Deactivate all page links
  document
    .querySelectorAll('.page-link')
    .forEach(link => link.classList.remove('page-active'));
  // Activate proper page link
  const activeLink = document.querySelector(`.page-link[data-page="${page}"]`);
  if (activeLink) activeLink.classList.add('page-active');
};

//------------------------------------------------------------------
// Function to update the pagination

const updatePagination = function (curPage, totNumPages) {
  if (maxVisibleButtons > totNumPages) {
    maxVisibleButtons = totNumPages;
  }

  const half = Math.floor(maxVisibleButtons / 2);
  let start = curPage - half;
  let end = curPage + half - 1;

  if (start < 1) {
    start = 0;
    end = maxVisibleButtons - 2;
  }

  if (end > totNumPages - 2) {
    end = totNumPages - 2;
    start = end - maxVisibleButtons + 2;
  }

  return [start, end];
};

//----------------------------------------------------------------
// Display current page

const displayPage = function () {
  getUserData('http://localhost:3000/users').then(userData => {
    const filteredData = filterUserData(userData);
    displayUserTable(filteredData);
    const totPages = totalPages(filteredData, usersPerPage);
    // if (currentPage > totPages) currentPage = totPages || 1;
    createPageLinks(
      filteredData,
      updatePagination(currentPage, totPages),
      totPages
    );
    activatePage(currentPage);
  });
};
displayPage();

//----------------------------------------------------------------
// Navigating through the pages
paginationPages.addEventListener('click', function (e) {
  currentPage = Number(e.target.dataset.page);
  activatePage(currentPage);
  // Update pagination
  getUserData('http://localhost:3000/users').then(userData => {
    displayPage();
    const filteredData = filterUserData(userData);
    // displayUserTable(filteredData);
    const totPages = totalPages(filteredData, usersPerPage);
    if (currentPage > totPages) currentPage = totPages || 1;
    displayUserTable(filteredData);
    createPageLinks(
      filteredData,
      updatePagination(currentPage, totPages),
      totPages
    );
    activatePage(currentPage);
  });
});

btnNext.addEventListener('click', function () {
  getUserData('http://localhost:3000/users').then(userData => {
    const filteredData = filterUserData(userData);
    const totPages = totalPages(filteredData, usersPerPage);
    if (currentPage === totPages) {
      return;
    } else {
      currentPage++;
    }
  });

  activatePage(currentPage);
  // Update pagination
  getUserData('http://localhost:3000/users').then(userData => {
    displayPage();
    const filteredData = filterUserData(userData);
    displayUserTable(filteredData);
    const totPages = totalPages(filteredData, usersPerPage);
    createPageLinks(
      filteredData,
      updatePagination(currentPage, totPages),
      totPages
    );
    activatePage(currentPage);
  });
});

btnPrev.addEventListener('click', function () {
  if (currentPage === 1) {
    return;
  } else {
    currentPage--;
  }
  activatePage(currentPage);
  // Update pagination
  getUserData('http://localhost:3000/users').then(userData => {
    displayPage();
    const filteredData = filterUserData(userData);
    displayUserTable(filteredData);
    const totPages = totalPages(filteredData, usersPerPage);
    createPageLinks(
      filteredData,
      updatePagination(currentPage, totPages),
      totPages
    );
    activatePage(currentPage);
  });
});

//----------------------------------------------------------------
// Dropdown menus

filters.addEventListener('click', function (e) {
  const clicked = e.target.closest('.filters__label');
  if (!clicked) return;
  const dropdown = clicked.nextElementSibling;
  dropdown.classList.toggle('hidden');
});

//----------------------------------------------------------------

/////////////////////////////////////////////////////////////////
// Go to User Detail Page

userGridContainer.addEventListener('click', function (e) {
  e.preventDefault();
  const clicked = e.target.closest('.grid-items');
  if (!clicked) return;
  // Redirection to User Detail page
  window.location.href = `./user.html?id=${clicked.dataset.userId}`;
});
