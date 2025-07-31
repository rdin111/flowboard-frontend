import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { arrayMove } from '@dnd-kit/sortable';
import { type RootState } from '../../app/store';

// --- INTERFACES ---
interface Card {
    _id: string;
    title: string;
    list: string;
    subtasks?: string;
}

interface List {
    _id: string;
    title: string;
    cards: Card[];
}

interface Board {
    _id: string;
    title: string;
    lists: List[];
}

interface BoardState {
    data: Board | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BoardState = {
    data: null,
    status: 'idle',
    error: null,
};

// --- ASYNC THUNKS ---

export const fetchBoard = createAsyncThunk(
    'board/fetchBoard',
    async (boardId: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/boards/${boardId}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const addNewCard = createAsyncThunk(
    'board/addNewCard',
    async ({ listId, title }: { listId: string; title: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/cards', { listId, title });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const moveCard = createAsyncThunk(
    'board/moveCard',
    async (args: { cardId: string; sourceListId: string; destinationListId: string; destinationIndex: number }, { rejectWithValue }) => {
        try {
            const { cardId, ...moveData } = args;
            await apiClient.patch(`/cards/${cardId}/move`, moveData);
            return args;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const addNewList = createAsyncThunk(
    'board/addNewList',
    async ({ boardId, title }: { boardId: string; title: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/lists', { boardId, title });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateListTitle = createAsyncThunk(
    'board/updateListTitle',
    async ({ listId, title }: { listId: string; title: string }) => {
        const response = await apiClient.patch(`/lists/${listId}`, { title });
        return response.data;
    }
);

export const deleteList = createAsyncThunk(
    'board/deleteList',
    async (listId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/lists/${listId}`);
            return listId;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const deleteCard = createAsyncThunk(
    'board/deleteCard',
    async ({ listId, cardId }: { listId: string; cardId: string }, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/cards/${cardId}`);
            return { listId, cardId };
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const reorderLists = createAsyncThunk(
    'board/reorderLists',
    async ({ boardId, orderedListIds }: { boardId: string; orderedListIds: string[] }, { rejectWithValue }) => {
        try {
            await apiClient.patch(`/boards/${boardId}/reorder-lists`, { orderedListIds });
            return { orderedListIds };
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const generateListWithAI = createAsyncThunk(
    'board/generateListWithAI',
    async (prompt: string, { dispatch, getState, rejectWithValue }) => {
        try {
            const { data: board } = (getState() as RootState).board;
            if (!board) {
                return rejectWithValue('No board selected.');
            }

            const response = await apiClient.post('/ai/generate-list', { prompt });
            const { listTitle, cardTitles } = response.data;

            const newListAction = await dispatch(
                addNewList({ boardId: board._id, title: listTitle })
            );

            if (addNewList.rejected.match(newListAction)) {
                return rejectWithValue('Failed to create new list.');
            }
            const newList = newListAction.payload as List;

            for (const cardTitle of cardTitles) {
                await dispatch(addNewCard({ listId: newList._id, title: cardTitle }));
            }

            return "Successfully generated list and cards!";
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to generate content with AI.');
        }
    }
);


const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        updateCardOrder: (state, action: PayloadAction<{ cardId: string, sourceListId: string, destinationListId: string, destinationIndex: number }>) => {
            if (!state.data) return;
            const { cardId, sourceListId, destinationListId, destinationIndex } = action.payload;
            const sourceList = state.data.lists.find(list => list._id === sourceListId);
            if (!sourceList) return;
            const cardIndex = sourceList.cards.findIndex(card => card._id === cardId);
            if (cardIndex === -1) return;
            const [movedCard] = sourceList.cards.splice(cardIndex, 1);
            const destinationList = state.data.lists.find(list => list._id === destinationListId);
            if (destinationList) {
                destinationList.cards.splice(destinationIndex, 0, movedCard);
                movedCard.list = destinationList._id;
            }
        },
        updateListOrder: (state, action: PayloadAction<{ activeId: string, overId: string }>) => {
            if (!state.data) return;
            const { activeId, overId } = action.payload;
            const oldIndex = state.data.lists.findIndex(l => l._id === activeId);
            const newIndex = state.data.lists.findIndex(l => l._id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                state.data.lists = arrayMove(state.data.lists, oldIndex, newIndex);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoard.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchBoard.fulfilled, (state, action: PayloadAction<Board>) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchBoard.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(addNewCard.fulfilled, (state, action: PayloadAction<Card>) => {
                const list = state.data?.lists.find(l => l._id === action.payload.list);
                if (list) { list.cards.push(action.payload); }
            })
            .addCase(addNewList.fulfilled, (state, action: PayloadAction<List>) => {
                if (state.data) { state.data.lists.push({ ...action.payload, cards: [] }); }
            })
            .addCase(updateListTitle.fulfilled, (state, action: PayloadAction<List>) => {
                if (state.data) {
                    const listIndex = state.data.lists.findIndex(l => l._id === action.payload._id);
                    if (listIndex !== -1) { state.data.lists[listIndex].title = action.payload.title; }
                }
            })
            .addCase(deleteList.fulfilled, (state, action: PayloadAction<string>) => {
                if (state.data) { state.data.lists = state.data.lists.filter(list => list._id !== action.payload); }
            })
            .addCase(deleteCard.fulfilled, (state, action: PayloadAction<{ listId: string; cardId: string }>) => {
                if (state.data) {
                    const list = state.data.lists.find(l => l._id === action.payload.listId);
                    if (list) { list.cards = list.cards.filter(c => c._id !== action.payload.cardId); }
                }
            })
            .addCase(generateListWithAI.pending, (_state) => { // Renamed state to _state
                console.log("AI generation in progress...");
            })
            .addCase(generateListWithAI.rejected, (state, action) => {
                console.error("AI generation failed:", action.payload);
                state.error = action.payload as string;
            })
            .addCase(moveCard.rejected, (_state, action) => { console.error("Failed to move card:", action.payload); })
            .addCase(reorderLists.rejected, (_state, action) => { console.error("Failed to reorder lists:", action.payload); });
    },
});

export const { updateCardOrder, updateListOrder } = boardSlice.actions;
export default boardSlice.reducer;