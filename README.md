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
## v0.8.3 (2026-01-20)
- Fixed incorrect theme on the review panel.
- Fixed admin panel sending wrong data to update the game board size.
- Fixed authStore doesnt correct update signInState for admins.
- 
## v0.8.2 (2026-01-20)
- Aded timer to majority of game modes.

## v0.8.1 (2026-01-20)
- Fixed Admin panel statistic page text color error
- Fixed Admin panel displaying wrong data for user management
- Fixed API routing error for user management
- Simplified game management to direct buttons

## v0.8.0 (2026-01-19)
- Added ability to send reviews for all games

## v0.7.2 (2026-01-19)
- Added fetch gameboard Size and timer for games.
- Fixed missing dependecies causing bug in chat windows.

## v0.7.1 (2026-01-19)

- Fixed unable to create new chat.
- Fixed unable to open up chat window after click on a chat.
- Fixed problem with not displaying default avatar when avatar is null on chat and search page.

## v0.7.0 (2026-01-19)

- Added Caro 5 Game.
- Added Caro 4 Game.
- Added Tic Tac Toe Game.
- Added Snake Game.
- Added Match 3 Game.
- Added Memory Matching Game.
- Change UI selection of all games in home menu.
- Added Mode selection for all games.

## v0.6.2 (2026-01-18)

- Added achievements and ranking page to the user page.
- Added ability to open a direct chat to anyone.
- Fixed handling of message to be able to handle direct chat without prior conversation.
- Decorated the UI of the chat window.
- Fixed scrolling problem with the chat UI.

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
