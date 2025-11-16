'use strict';

// Elements
const userDetailsCard = document.querySelector('.user-details');

// Extract id from URL

const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

// Fetching the user data from id

const displayUserDetail = function (userData) {
  const html = `
      <header class="user-header">
        <div class="user-info-group">
          <h1 class="user-name">${userData.firstName} ${userData.lastName}</h1>
          <p class="user-type user-type--${userData.type}">${userData.type}</p>
          <p class="user-status user-status--${userData.status}">${userData.status}</p>
        </div>
        <button class="user-btn user-btn--delete">Delete user</button>
      </header>

      <section class="user-info user-info--personal">
        <header class="user-info-header">
          <h2 class="user-info-title">Personal information</h2>
          <button class="user-info-btn user-info-btn--edit">
          <span class="glyphicon-trash">&#x1F58A</span>
          <p>Edit</p></button>
        </header>
        <div class="info-item">
          <p class="info-label">First Name</p>
          <p class="info-value">${userData.firstName}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Last Name</p>
          <p class="info-value">${userData.lastName}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Email</p>
          <p class="info-value">${userData.email}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Phone</p>
          <p class="info-value">${userData.phone}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Bio</p>
          <p class="info-value">${userData.bio}</p>
        </div>
      </section>

      <section class="user-info user-info--company">
        <header class="user-info-header">
          <h2 class="user-info-title">Personal information</h2>
          <button class="user-info-btn user-info-btn--edit">
          <span class="glyphicon-trash">&#x1F58A</span>
          <p>Edit</p></button>
        </header>
        <div class="info-item">
          <p class="info-label">Name</p>
          <p class="info-value">${userData.companyName}</p>
        </div>
        <div class="info-item">
          <p class="info-label">VAT</p>
          <p class="info-value">${userData.vatNumber}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Country</p>
          <p class="info-value">${userData.country}</p>
        </div>

        <div class="info-item">
          <p class="info-label">City</p>
          <p class="info-value">${userData.city}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Postal Code</p>
          <p class="info-value">${userData.postalCode}</p>
        </div>
        <div class="info-item">
          <p class="info-label">Street</p>
          <p class="info-value">${userData.address}</p>
        </div>
      </section>
   `;
  userDetailsCard.innerHTML = html;
};

fetch(`http://localhost:3000/users/${userId}`)
  .then(response => response.json())
  .then(userData => {
    displayUserDetail(userData);

    // Deleting User
    const userDelete = document.querySelector('.user-btn--delete');
    userDelete.addEventListener('click', async function () {
      const confirmDelete = confirm(
        'Are you sure you want to delete this user?'
      );
      if (!confirmDelete) return;

      try {
        // Delete the user from JSON server
        await fetch(`http://localhost:3000/users/${userId}`, {
          method: 'DELETE',
        });

        // Redirect back to main user list page
        window.location.href = 'index.html';
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Something went wrong. Please try again.');
      }
    });
  });

// Editing User Details
