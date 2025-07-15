import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type {AppDispatch, RootState} from '../app/store';
import {
    fetchBoard,
    updateCardOrder,
    moveCard,
    addNewList,
    reorderLists,
    updateListOrder
} from '../features/board/boardSlice';
import List from '../components/List';
import Card from '../components/Card';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, X } from 'lucide-react';

const BoardPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const board = useSelector((state: RootState) => state.board.data);
    const boardStatus = useSelector((state: RootState) => state.board.status);
    const error = useSelector((state: RootState) => state.board.error);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");

    useEffect(() => {
        if (boardId) {
            dispatch(fetchBoard(boardId));
        }
    }, [boardId, dispatch]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const type = active.data.current?.type;
        let item;
        if (type === 'List') {
            item = board?.lists.find(l => l._id === active.id);
        } else {
            item = board?.lists.flatMap(l => l.cards).find(c => c._id === active.id);
        }
        setActiveDragItem({ ...item, type });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !board || active.id === over.id) {
            setActiveDragItem(null);
            return;
        }

        const isListDrag = active.data.current?.type === 'List';

        if (isListDrag) {
            const activeId = active.id.toString();
            const overId = over.id.toString();

            dispatch(updateListOrder({ activeId, overId }));

            const updatedLists = store.getState().board.data?.lists;
            if (updatedLists) {
                const orderedListIds = updatedLists.map(l => l._id);
                dispatch(reorderLists({ boardId: board._id, orderedListIds }));
            }
        } else {
            const activeId = active.id.toString();
            const overId = over.id.toString();
            const sourceCard = board.lists.flatMap(l => l.cards).find(c => c._id === activeId);
            if (!sourceCard) return;

            const sourceListId = sourceCard.list;
            let destinationListId = over.data.current?.sortable?.containerId || "";
            let destinationIndex = 0;

            const destinationList = board.lists.find(l => l.cards.some(c => c._id === overId) || l._id === overId);
            if (destinationList) {
                destinationListId = destinationList._id;
                const overCardIndex = destinationList.cards.findIndex(c => c._id === overId);
                destinationIndex = overCardIndex !== -1 ? overCardIndex : destinationList.cards.length;
            }

            if(!destinationListId) return;

            dispatch(updateCardOrder({ cardId: activeId, sourceListId, destinationListId, destinationIndex }));
            dispatch(moveCard({ cardId: activeId, sourceListId, destinationListId, destinationIndex }));
        }

        setActiveDragItem(null);
    };

    const handleAddList = () => {
        if (newListTitle.trim() && board) {
            dispatch(addNewList({ boardId: board._id, title: newListTitle }));
            setNewListTitle("");
            setIsAddingList(false);
        }
    };

    let content;
    if (boardStatus === 'loading') {
        content = <div className="p-4 text-center"><span className="loading loading-spinner loading-lg"></span></div>;
    } else if (boardStatus === 'succeeded' && board) {
        const listIds = board.lists.map(list => list._id);
        content = (
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragItem(null)} collisionDetection={closestCorners}>
                <div className="flex items-start gap-4 p-4">
                    <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
                        {board.lists.map(list => (
                            <List
                                key={list._id}
                                listId={list._id}
                                title={list.title}
                                cards={list.cards}
                            />
                        ))}
                    </SortableContext>
                    <div className="w-80 flex-shrink-0">
                        {isAddingList ? (
                            <div className="bg-base-200 p-2 rounded-lg">
                                <input
                                    type="text"
                                    placeholder="Enter list title..."
                                    className="input input-bordered w-full"
                                    value={newListTitle}
                                    onChange={(e) => setNewListTitle(e.target.value)}
                                    autoFocus
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <button onClick={handleAddList} className="btn btn-primary btn-sm">Add list</button>
                                    <button onClick={() => setIsAddingList(false)} className="btn btn-ghost btn-sm">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingList(true)} className="btn btn-ghost w-full bg-white/10">
                                <Plus className="h-4 w-4" /> Add another list
                            </button>
                        )}
                    </div>
                </div>
                <DragOverlay>
                    {activeDragItem?.type === 'List' && activeDragItem && (
                        <List listId={activeDragItem._id} title={activeDragItem.title} cards={activeDragItem.cards} />
                    )}
                    {activeDragItem?.type !== 'List' && activeDragItem && (
                        <Card id={activeDragItem._id} title={activeDragItem.title} listId={activeDragItem.list} />
                    )}
                </DragOverlay>
            </DndContext>
        );
    } else if (boardStatus === 'failed') {
        content = <div className="p-4 text-center text-error">{error}</div>;
    }

    return (
        <div className="overflow-x-auto h-[calc(100vh-4rem)]">
            <h1 className="text-3xl font-bold p-4 pb-0">{board?.title || 'Board'}</h1>
            {content}
        </div>
    );
};

export default BoardPage;