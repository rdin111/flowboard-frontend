import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../app/store';
import { deleteCard } from '../features/board/boardSlice';

// The 'subtasks' prop is no longer needed for this component's primary display
type CardProps = {
    id: string;
    title: string;
    listId: string;
};

const Card = ({ id, title, listId }: CardProps) => {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="card bg-base-100 shadow-md group"
        >
            <div className="card-body p-3 flex-row justify-between items-center">
                {/* This inner div is the dedicated "grab handle" */}
                <div {...attributes} {...listeners} className="flex-grow cursor-grab touch-none">
                    <p>{title}</p>
                </div>

                {/* The button is a sibling to the grab handle */}
                <button
                    onClick={handleDelete}
                    className="btn btn-ghost btn-square btn-xs opacity-0 group-hover:opacity-100"
                    title="Delete card"
                >
                    <Trash2 className="h-4 w-4 text-error" />
                </button>
            </div>
        </div>
    );
};

export default Card;