# ClimaPulse - User Management Mini Web App

This project is a small front-end web application built for ClimaPulse.
The goal was to create a simple and user-friendly interface for managing users retrieved from a mock JSON server.

It includes the ability to list users, filter them, search through the dataset, paginate the results, view detailed information on a separate page, create new users, and delete existing ones.

---

## Features

### 1. User List Overview

- Displays all users in a grid layout

- Supports clicking on a user to view detailed information

- Shows key fields such as name, email, phone, type, status, company info…

### 2. Pagination

- Dynamically generated based on dataset size

- Supports previous/next buttons and direct page navigation

- Ellipsis (...) for cleaner long-range pagination

  Note: There are a few small bugs in the pagination logic that I plan to fix in the next iteration (see “Known Issues”).

### 3. Search

- Full-text search across multiple fields: name, email, phone, type, status, company name, address, etc.

### 4. Filtering

- Filters by user type (Service, Connect…)

- Filters by status (Active, Inactive, Deactivated)

- “All” option + logic to disable/enable combinations cleanly

- Filters interact with the search and pagination

### 5. Create New User

- Modal form to add a new user

- Automatically assigns a new ID

- Inserts user into the JSON server and refreshes UI

### 6. User Details Page

- View complete profile of a selected user

- Delete user directly from detail page

---

## Work in Progress

### Pagination bugs

Some parts of the pagination behavior still need refinement (edge cases, re-rendering after filtering, next/previous jumps).
These are known issues and will be fixed in the next update.

### Editing User Details

The “Edit” button is already present in the UI, but the feature is not yet implemented.
This functionality is currently under development.

---

## Project Structure

climapulse/
├── api/
│ ├── db.json
│ ├── package.json
│ └── package-lock.json
├── frontend/
│ ├── designs/
│ ├── js/
│ │ ├── listUsers.js
│ │ └── userDetail.js
│ ├── index.html
│ ├── user.html
│ ├── style.css
│ ├── package.json
│ └── package-lock.json
└── README.md

---

## Tech Stack

- HTML, CSS, JavaScript (Vanilla)
- JSON Server for mock API
- Google Fonts + Material Symbols

---

## How to Run the Project

### 1. Install dependencies

Inside the **api** folder:

```bash
npm install
```

### 2. Start the JSON server

```bash
npx json-server --watch db.json --port 3000
```

or

```bash
npm run dev
```

The API will be available at: <http://localhost:3000/users>

### 3. Open the frontend

Simply open index.html in a browser.

---

## Next Steps

- Fix pagination inconsistencies
- Implement editing user details
- Improve form validation
- Add smoother UI transitions
- Adapt the web-app for smaller screens by making it fully responsive on mobile devices (use media queries, fluid layouts, flexible units, and test on common devices).
