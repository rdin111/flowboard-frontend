import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
    // This hook catches the error thrown by the router
    const error = useRouteError();
    let errorMessage: string;

    // The isRouteErrorResponse function checks if the error is a response
    // object from a loader or action (e.g., 404 Not Found)
    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText || error.data?.message;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        errorMessage = "An unknown error occurred";
    }

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Oops!</h1>
                    <p className="py-6">Sorry, an unexpected error has occurred.</p>
                    <p className="text-error font-mono bg-base-300 p-2 rounded">
                        <i>{errorMessage}</i>
                    </p>
                    <Link to="/" className="btn btn-primary mt-6">Go Home</Link>
                </div>
            </div>
        </div>
    );
}