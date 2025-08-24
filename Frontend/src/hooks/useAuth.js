import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// This custom hook provides a function to protect actions
export const useAuth = () => {
    const navigate = useNavigate();

    const checkAuthAndProceed = (callback) => {
        const token = localStorage.getItem('token');

        if (token) {
            // If token exists, user is logged in, so proceed with the action
            callback();
        } else {
            // If no token, user is not logged in
            toast.info('Please log in to continue.');
            navigate('/login');
        }
    };

    return { checkAuthAndProceed };
};