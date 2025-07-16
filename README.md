# Flowboard - A Real-Time Kanban Board (Frontend)

Welcome to the frontend for Flowboard, a modern, full-stack Kanban-style task management application built with React and TypeScript. This application provides a seamless, real-time, and interactive user experience for managing workflows.

**[Live Demo](https://www.flowboard.me/)**

## Key Features

- **Interactive Kanban Boards:** Create and manage multiple project boards.
- **Drag-and-Drop:** Intuitively reorder cards and lists with a smooth, modern drag-and-drop interface powered by `dnd-kit`.
- **Real-Time Collaboration:** Changes made by one user are instantly reflected for all other users viewing the same board, thanks to WebSocket integration with `socket.io-client`.
- **Dynamic Content Management:** Add, edit, and delete boards, lists, and cards on the fly.
- **Responsive Design:** A clean, responsive UI built with Tailwind CSS and DaisyUI that works great on all screen sizes.
- **Dark Mode:** Includes a theme-toggling feature for user preference.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router 
- **Styling:** Tailwind CSS & DaisyUI
- **Drag & Drop:** Dnd Kit
- **Real-Time:** Socket.io Client
- **API Communication:** Axios

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/rdin111/flowboard-frontend.git](https://github.com/rdin111/flowboard-frontend.git)
    cd flowboard-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the base URL for your backend API.
    ```env
    VITE_API_BASE_URL=http://localhost:5001/api
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.
