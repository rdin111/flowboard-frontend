import { Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
            <nav className="grid grid-flow-col gap-4">
                <a href="https://github.com/rdin111/flowboard-frontend" target="_blank" rel="noopener noreferrer" className="link link-hover">Frontend Repo</a>
                <a href="https://github.com/rdin111/flowboard-backend" target="_blank" rel="noopener noreferrer" className="link link-hover">Backend Repo</a>
            </nav>
            <nav>
                <div className="grid grid-flow-col gap-4">
                    <a href="https://github.com/rdin111/flowboard-frontend" target="_blank" rel="noopener noreferrer">
                        <Github className="h-6 w-6" />
                    </a>
                    <a href="https://github.com/rdin111/flowboard-backend" target="_blank" rel="noopener noreferrer">
                        <Github className="h-6 w-6" />
                    </a>
                </div>
            </nav>
            <aside>
                <p>Copyright © 2025 - All right reserved by Flowboard</p>
            </aside>
        </footer>
    );
};

export default Footer;