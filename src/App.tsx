import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { apiInstance } from './api/apiInstance.ts';
import './App.css';

function App() {
    const [count, setCount] = useState(0);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchComments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response:any = await apiInstance.api.apiLayersCommentsList('123');
            setComments(response.data);
        } catch (err: any) {
            setError(err.message || 'Error occurred while fetching comments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        console.log("Hello");
        console.log(error);
        console.log(loading);
        console.log(comments)
    }, []);

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;
