import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type {AppDispatch, RootState} from '../app/store';
import { fetchAllBoards, createNewBoard, deleteBoard } from '../features/boardList/boardListSlice';
import { Plus, Trash2, LayoutDashboard } from 'lucide-react';
import ColdStartSpinner from '../components/ColdStartSpinner';

const HomePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: boards, status, error } = useSelector((state: RootState) => state.boardList);
    const [newBoardTitle, setNewBoardTitle] = useState('');

    const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
    const createModalRef = useRef<HTMLDialogElement>(null);
    const deleteModalRef = useRef<HTMLDialogElement>(null);

    // State to manage showing the detailed "cold start" message
    const [showColdStartMessage, setShowColdStartMessage] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAllBoards());
        }
    }, [status, dispatch]);

    // This effect shows the cold start message if loading takes too long
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'loading') {
            // Set a timer to show the message after 3 seconds
            timer = setTimeout(() => {
                setShowColdStartMessage(true);
            }, 3000);
        } else {
            // If loading finishes, clear the timer and hide the message
            setShowColdStartMessage(false);
        }

        // Cleanup function to clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [status]);

    const handleCreateBoard = () => {
        if (newBoardTitle.trim()) {
            dispatch(createNewBoard(newBoardTitle));
            setNewBoardTitle('');
            createModalRef.current?.close();
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, boardId: string) => {
        e.preventDefault();
        setBoardToDelete(boardId);
        deleteModalRef.current?.showModal();
    };

    const confirmDelete = () => {
        if (boardToDelete) {
            dispatch(deleteBoard(boardToDelete));
            setBoardToDelete(null);
            deleteModalRef.current?.close();
        }
    };

    const renderContent = () => {
        if (status === 'loading' || status === 'idle') {
            // Show the detailed message if the flag is set, otherwise show a simple spinner
            return showColdStartMessage ? <ColdStartSpinner /> : (
                <div className="flex justify-center items-center p-10">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            );
        }

        if (status === 'failed') {
            return <p className="text-center text-error">Error: {error}</p>;
        }

        if (status === 'succeeded' && boards.length === 0) {
            return (
                <div className="hero mt-16">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <LayoutDashboard size={64} className="mx-auto text-base-content/30" />
                            <h1 className="text-3xl font-bold mt-4">Welcome to Flowboard</h1>
                            <p className="py-6">The simplest way to visualize your workflow. Create your first board to get started.</p>
                            <button className="btn btn-primary" onClick={() => createModalRef.current?.showModal()}>
                                <Plus className="h-4 w-4" /> Create Your First Board
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (status === 'succeeded' && boards.length > 0) {
            return (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {boards
                        .filter(board => board.title && board._id)
                        .map(board => (
                            <Link to={`/board/${board._id}`} key={board._id} className="card bg-base-200 hover:bg-base-300 transition-all group">
                                <div className="card-body">
                                    <div className="flex justify-between items-start">
                                        <h2 className="card-title">{board.title}</h2>
                                        <button onClick={(e) => handleDeleteClick(e, board._id)} className="btn btn-ghost btn-square btn-sm opacity-0 group-hover:opacity-100">
                                            <Trash2 className="h-4 w-4 text-error" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
            );
        }

        return null;
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Boards</h1>
                {status === 'succeeded' && boards.length > 0 && (
                    <button className="btn btn-primary" onClick={() => createModalRef.current?.showModal()}>
                        <Plus className="h-4 w-4" /> Create New Board
                    </button>
                )}
            </div>

            {renderContent()}

            <dialog ref={createModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create a new board</h3>
                    <div className="py-4">
                        <label className="label">
                            <span className="label-text">Board Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Project Phoenix"
                            className="input input-bordered w-full"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                        />
                    </div>
                    <div className="modal-action">
                        <form method="dialog"><button className="btn">Cancel</button></form>
                        <button className="btn btn-primary" onClick={handleCreateBoard}>Create</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>

            <dialog ref={deleteModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete Board</h3>
                    <p className="py-4">Are you sure you want to delete this board and all of its content? This action cannot be undone.</p>
                    <div className="modal-action">
                        <form method="dialog"><button className="btn">Cancel</button></form>
                        <button className="btn btn-error" onClick={confirmDelete}>Delete</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </div>
    );
};

export default HomePage;