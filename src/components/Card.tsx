import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../app/store';
import { deleteCard, generateSubtasks } from '../features/board/boardSlice';

type CardProps = {
    id: string;
    title: string;
    listId: string;
    subtasks?: string;
};

const Card = ({ id, title, listId, subtasks }: CardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete this card?`)) {
            dispatch(deleteCard({ listId, cardId: id }));
        }
    }

    const handleAiClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(generateSubtasks({ cardId: id, title }));
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="card bg-base-100 shadow-md group"
        >
            <div className="card-body p-3 cursor-grab touch-none">
                <div className="flex justify-between items-start">
                    <div {...attributes} {...listeners} className="flex-grow">
                        <p>{title}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                        <button
                            onClick={handleAiClick}
                            className="btn btn-ghost btn-square btn-xs opacity-0 group-hover:opacity-100"
                            title="Generate sub-tasks with AI"
                        >
                            <Sparkles className="h-4 w-4 text-info" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="btn btn-ghost btn-square btn-xs opacity-0 group-hover:opacity-100"
                            title="Delete card"
                        >
                            <Trash2 className="h-4 w-4 text-error" />
                        </button>
                    </div>
                </div>

                {subtasks && (
                    <div className="text-sm mt-2 pt-2 border-t border-base-200 whitespace-pre-line">
                        {subtasks}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;