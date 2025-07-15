import { configureStore } from '@reduxjs/toolkit'
import boardReducer from '../features/board/boardSlice';
import boardListReducer from '../features/boardList/boardListSlice';

export const store = configureStore({
    reducer: {
        board: boardReducer,
        boardList: boardListReducer,
    },
})

// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>

// Infer the `AppDispatch` type from the store itself. This is the likely missing line.
export type AppDispatch = typeof store.dispatch