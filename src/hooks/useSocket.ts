import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import type {AppDispatch} from '../app/store';
import { fetchBoard } from '../features/board/boardSlice';

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

export const useSocket = (boardId: string | undefined) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (!boardId) return;

        // Connect to the socket server
        const socket: Socket = io(VITE_API_URL);

        // Join the specific board's room
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('join_board', boardId);
        });

        // Listen for our custom 'board_updated' event from the server
        socket.on('board_updated', (data) => {
            console.log('Board update received!', data.message);
            // When an update happens, refetch the board data to get the latest state
            dispatch(fetchBoard(boardId));
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Clean up the connection when the component unmounts
        return () => {
            socket.emit('leave_board', boardId);
            socket.disconnect();
        };
    }, [boardId, dispatch]);
};