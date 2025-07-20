import { ServerCog } from 'lucide-react';

const ColdStartSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center p-10 gap-4 text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <div className="max-w-md">
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                    <ServerCog className="h-6 w-6" />
                    Server is Waking Up
                </h2>
                <p className="text-base-content/70 mt-2">
                    Our free-tier service spins down during inactivity. Please wait a moment while it starts. This can take up to 30 seconds.
                </p>
            </div>
        </div>
    );
};

export default ColdStartSpinner;