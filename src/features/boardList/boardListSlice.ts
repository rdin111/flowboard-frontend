import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

interface BoardSummary {
    _id: string;
    title: string;
}

interface BoardListState {
    items: BoardSummary[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BoardListState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchAllBoards = createAsyncThunk('boardList/fetchAll', async () => {
    const response = await apiClient.get('/boards');
    return response.data;
});

export const createNewBoard = createAsyncThunk(
    'boardList/createNew',
    async (title: string) => {
        const response = await apiClient.post('/boards', { title });
        return response.data;
    }
);

export const deleteBoard = createAsyncThunk(
    'boardList/deleteBoard',
    async (boardId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/boards/${boardId}`);
            return boardId; // Return the ID of the deleted board on success
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

const boardListSlice = createSlice({
    name: 'boardList',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllBoards.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllBoards.fulfilled, (state, action: PayloadAction<BoardSummary[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllBoards.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch boards';
            })
            .addCase(createNewBoard.fulfilled, (state, action: PayloadAction<BoardSummary>) => {
                state.items.push(action.payload);
            })
            .addCase(deleteBoard.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter(board => board._id !== action.payload);
            });
    },
});

export default boardListSlice.reducer;