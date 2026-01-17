# Introduction

This repository contains the front end for the web development final project.

# Collaborators

- Nguyen Thien Nhan (Dev) - 23120064
- Vo Thien Nhan (Dev) - 23120066
- Tan Loc (Dev) - 23120057
- Nhat Khang (Dev) - 23120050

# How to setup

1. Open up the terminal and type in

```bash
git clone https://github.com/NichikouGN/web-project-frontend.git
```

2. After that, run

```bash
npm install
```

3. Change the .env file to point to the backend

```js
VITE_API_URL = "http://localhost:4000"; //default
```

4. Start up the server

```bash
npm run dev
```

# Version

## v0.6.1 (2026-01-18)

- Added ability to change user information.
- Fixed user search functions to properly display visuals.
- Fixed user page to properly fetch and show user info.
- Fixed user friend request to show request state.
- Fixed profile page to properly show user info.

## v0.6.0 (2026-01-17)

- Added Free Play Game.
- Clean up Auth Store code to fit with the Backend data.
- Clean up User Store code to fit with the Backend data.
- Clean up the Profile page and decorate some elements.
- Changes to the element sizing to make contents more visible.
- Change route for friend request notifications.

## v0.5.0 (2026-01-04)

- Added a signin for admins (no signup)
- Added route guard for admin panel
- Added a home page for admin panel
- Added statistics for the admin panel
- Added user management for admin panel
- Added game management for admin panel
-

## v0.4.0 (2025-12-27)

- Added add friend functionality
- Some more api route for achievements on the profile page.
-

## v0.3.0 (2025-12-27)

- Added chat function.
- Added route guarding for chat.
- Some changes for the navbar UI.

## v0.2.0 (2025-12-26)

- Added animation to the signin page, signup page and the main layout.
- Added /profile page and /user page to user specific information. (on hold for now due to have not yet decided what games that will be made)
- Decorate some of the UI of the layout as well as the signin and signou page.

## v0.1.0 (2025-12-26)

- Setup the core components (buttons, layout, toast), stores (auth, user, theme) and colors variables.
- Simple Navbar, Footer.
- Sign in and sign up page.
- Support for light/dark theme.
- Setup a simple Not Found page.

## v0.0.0 (2025-12-26)

- First Commit

```

```
