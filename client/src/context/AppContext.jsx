import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();

    const { user } = useUser();
    const { getToken, isLoaded } = useAuth(); // isLoaded ensures Clerk is ready

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState(null)

    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('/api/rooms')
            if (data.success) {
                setRooms(data.rooms)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Tracks if the backend check has finished so the UI doesn't flash
    const [userDataLoaded, setUserDataLoaded] = useState(false);

    const fetchUser = async (retryCount = 0) => {
        try {
            // 1. Explicitly wait for the token to exist
            const token = await getToken();
            if (!token) return;

            // 2. Fetch the user data
            const { data } = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setIsOwner(data.role === "hotelOwner");
                setSearchedCities(data.recentSearchedCities);
                setUserDataLoaded(true); // Data successfully loaded
            }

        } catch (error) {
            // 3. Catch the 401 error (Webhook Race Condition)
            if (error.response && error.response.status === 401) {
                // If the user isn't in the DB yet, retry up to 3 times
                if (retryCount < 3) {
                    console.log(`User not in DB yet. Retrying... (${retryCount + 1}/3)`);
                    setTimeout(() => fetchUser(retryCount + 1), 3000);
                } else {
                    toast.error("Failed to sync account. Please refresh the page.");
                    setUserDataLoaded(true); // Stop loading even on failure
                }
            } else {
                // Handle standard errors (like 500 server errors)
                toast.error(error.response?.data?.message || error.message);
                setUserDataLoaded(true); // Stop loading on error
            }
        }
    };

    useEffect(() => {
        // Only run if the user exists AND Clerk has finished loading
        if (isLoaded && user) {
            fetchUser();
        }
    }, [user, isLoaded]);

    useEffect(() => {
        fetchRooms()
    }, [])
    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        axios,
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        userDataLoaded,
        rooms,
        setRooms
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);