import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {type AppDispatch, type RootState, store} from '../app/store';
import {
    fetchBoard,
    updateCardOrder,
    moveCard,
    addNewList,
    reorderLists,
    updateListOrder,
    generateListWithAI
} from '../features/board/boardSlice';
import List from '../components/List';
import Card from '../components/Card';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, X, Sparkles } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

const BoardPage = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    useSocket(boardId);

    const board = useSelector((state: RootState) => state.board.data);
    const boardStatus = useSelector((state: RootState) => state.board.status);
    const error = useSelector((state: RootState) => state.board.error);
    const aiStatus = useSelector((state: RootState) => state.board.aiStatus);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const aiModalRef = useRef<HTMLDialogElement>(null);

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
        setActiveDragItem(null);
        if (!over || !board || active.id === over.id) {
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

            if(!destinationListId || (sourceListId === destinationListId && store.getState().board.data?.lists.find(l => l._id === sourceListId)?.cards.findIndex(c => c._id === activeId) === destinationIndex)) return;

            dispatch(updateCardOrder({ cardId: activeId, sourceListId, destinationListId, destinationIndex }));
            dispatch(moveCard({ cardId: activeId, sourceListId, destinationListId, destinationIndex }));
        }
    };

    const handleAddList = () => {
        if (newListTitle.trim() && board) {
            dispatch(addNewList({ boardId: board._id, title: newListTitle }));
            setNewListTitle("");
            setIsAddingList(false);
        }
    };

    const handleGenerateAiList = () => {
        if (aiPrompt.trim()) {
            dispatch(generateListWithAI(aiPrompt));
            setAiPrompt("");
            aiModalRef.current?.close();
        }
    };

    let content;
    if (boardStatus === 'loading' || boardStatus === 'idle') {
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
        <div className="relative min-h-[calc(100vh-4rem)]">
            <div className="overflow-x-auto h-full">
                <h1 className="text-3xl font-bold p-4 pb-0">{board?.title || 'Board'}</h1>
                {content}
            </div>

            <div className="absolute bottom-6 right-6">
                <button className="btn btn-primary btn-circle shadow-lg" onClick={() => aiModalRef.current?.showModal()} title="Generate list with AI">
                    <Sparkles className="h-6 w-6" />
                </button>
            </div>

            <dialog ref={aiModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Generate a New List with AI</h3>
                    <p className="py-2">Describe a goal or topic, and AI will create a list with tasks for you.</p>
                    <div className="py-4">
                        <textarea
                            className="textarea textarea-bordered w-full"
                            placeholder="e.g., 'Plan a new marketing campaign' or 'Organize my weekly chores'"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.g.target.value)}
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="modal-action">
                        <form method="dialog"><button className="btn" disabled={aiStatus === 'loading'}>Cancel</button></form>
                        <button className="btn btn-primary" onClick={handleGenerateAiList} disabled={aiStatus === 'loading'}>
                            {aiStatus === 'loading' && <span className="loading loading-spinner"></span>}
                            Generate
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </div>
    );
};

export default BoardPage;