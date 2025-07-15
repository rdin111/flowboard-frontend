import './App.css'

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {/* Suspense provides a fallback while lazy components load */}
                <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
}

export default App;






