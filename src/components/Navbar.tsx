import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

function Navbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="navbar bg-base-100 shadow-lg px-4 sticky top-0 z-50">
            {/* App Title */}
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl font-bold">
                    FlowBoard
                </Link>
            </div>

            {/* Empty center section */}
            <div className="navbar-center"></div>

            {/* Theme Toggle Button */}
            <div className="navbar-end">
                <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
                    {theme === "winter" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}

export default Navbar;