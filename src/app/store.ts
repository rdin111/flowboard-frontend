import { configureStore } from '@reduxjs/toolkit'
import boardReducer from '../features/board/boardSlice';
import boardListReducer from '../features/boardList/boardListSlice';

export const store = configureStore({
    reducer: {
        board: boardReducer,
        boardList: boardListReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch