import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../app/store';
import { addNewCard, updateListTitle, deleteList } from '../features/board/boardSlice';
import Card from './Card';
import { X, Plus, Trash2 } from 'lucide-react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type CardData = {
    _id: string;
    title: string;
    subtasks?: string;
};

type ListProps = {
    listId: string;
    title: string;
    cards: CardData[];
};

const List = ({ listId, title, cards }: ListProps) => {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(title);

    const dispatch = useDispatch<AppDispatch>();
    const titleInputRef = useRef<HTMLInputElement>(null);
    const cardIds = cards.map(card => card._id);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: listId,
        data: {
            type: 'List',
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
        }
    }, [isEditingTitle]);

    const handleTitleBlur = () => {
        if (currentTitle.trim() && currentTitle !== title) {
            dispatch(updateListTitle({ listId, title: currentTitle }));
        } else {
            setCurrentTitle(title);
        }
        setIsEditingTitle(false);
    };

    const handleDeleteList = () => {
        if (window.confirm(`Are you sure you want to delete the "${title}" list and all its cards?`)) {
            dispatch(deleteList(listId));
        }
    };

    const handleAddCardClick = () => {
        if (newCardTitle.trim() === '') return;
        dispatch(addNewCard({ listId, title: newCardTitle }));
        setNewCardTitle('');
        setIsAddingCard(false);
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-base-300 w-80 rounded-lg shadow-xl p-3 flex flex-col flex-shrink-0">
            <div className="flex justify-between items-center mb-2 p-1">
                <div {...attributes} {...listeners} className="cursor-grab touch-none flex-grow">
                    {isEditingTitle ? (
                        <input
                            ref={titleInputRef}
                            type="text"
                            className="input input-bordered input-sm w-full"
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleBlur();
                                if (e.key === 'Escape') {
                                    setCurrentTitle(title);
                                    setIsEditingTitle(false);
                                }
                            }}
                        />
                    ) : (
                        <h2 onClick={() => setIsEditingTitle(true)} className="text-lg font-bold hover:bg-base-100 p-1 rounded-md">
                            {title}
                        </h2>
                    )}
                </div>
                <button onClick={handleDeleteList} className="btn btn-ghost btn-xs btn-square">
                    <Trash2 className="h-4 w-4 text-error" />
                </button>
            </div>

            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                    {cards.map(card => (
                        <Card
                            key={card._id}
                            id={card._id}
                            title={card.title}
                            listId={listId}
                            subtasks={card.subtasks}
                        />
                    ))}
                </div>
            </SortableContext>

            <div className="mt-4">
                {isAddingCard ? (
                    <div className="card bg-base-100 p-2">
                        <textarea
                            className="textarea textarea-bordered w-full"
                            placeholder="Enter a title for this card..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            autoFocus
                        ></textarea>
                        <div className="card-actions mt-2">
                            <button onClick={handleAddCardClick} className="btn btn-primary btn-sm">Add card</button>
                            <button onClick={() => setIsAddingCard(false)} className="btn btn-ghost btn-sm">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingCard(true)}
                        className="btn btn-ghost w-full justify-start"
                    >
                        <Plus className="h-4 w-4" /> Add a card
                    </button>
                )}
            </div>
        </div>
    );
};

export default List;