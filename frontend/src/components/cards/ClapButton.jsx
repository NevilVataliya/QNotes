import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clapService from '../../services/clapService';
import { useSelector } from 'react-redux';
import { FaHeart, FaHandsClapping } from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa';

function ClapButton({ noteId }) {
    const [totalClaps, setTotalClaps] = useState(0);
    const [userClaps, setUserClaps] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [clapAnimation, setClapAnimation] = useState(false);
    const isAuthenticated = useSelector((state) => state.auth.status);
    
    const MAX_CLAPS_PER_USER = 50;

    // Fetch clap data on component mount
    useEffect(() => {
        fetchClapData();
    }, [noteId]);

    const fetchClapData = async () => {
        try {
            const result = await clapService.getClaps(noteId);
            if (result.success) {
                setTotalClaps(result.data.totalClaps || 0);
                setUserClaps(result.data.userClaps || 0);
            }
        } catch (error) {
            console.error('Error fetching clap data:', error);
        }
    };

    const handleClap = async () => {
        if (!isAuthenticated) {
            alert('Please log in to clap for this note');
            return;
        }

        if (userClaps >= MAX_CLAPS_PER_USER) {
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        setClapAnimation(true);

        try {
            const result = await clapService.incrementClap(noteId);
            if (result.success) {
                setTotalClaps(prev => prev + 1);
                setUserClaps(prev => prev + 1);
                
                setTimeout(() => setClapAnimation(false), 300);
            }
        } catch (error) {
            console.error('Error incrementing clap:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecrementClap = async () => {
        if (!isAuthenticated || userClaps <= 0 || isLoading) return;

        setIsLoading(true);

        try {
            const result = await clapService.decrementClap(noteId);
            if (result.success) {
                setTotalClaps(prev => prev - 1);
                setUserClaps(prev => prev - 1);
            }
        } catch (error) {
            console.error('Error decrementing clap:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getClapButtonClass = () => {
        let baseClass = "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ";
        
        if (!isAuthenticated) {
            baseClass += "border-surface-300 dark:border-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed ";
        } else if (userClaps >= MAX_CLAPS_PER_USER) {
            baseClass += "border-primary-500 bg-primary-50 text-primary-700 cursor-not-allowed ";
        } else {
            baseClass += "border-primary-500 text-primary-700 hover:bg-primary-50 cursor-pointer ";
        }

        if (clapAnimation) {
            baseClass += "scale-110 ";
        }

        return baseClass;
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handleClap}
                disabled={isLoading || !isAuthenticated || userClaps >= MAX_CLAPS_PER_USER}
                className={getClapButtonClass()}
                title={
                    !isAuthenticated 
                        ? "Please log in to clap"
                        : userClaps >= MAX_CLAPS_PER_USER 
                        ? "Maximum claps reached (50)"
                        : "Clap for this note"
                }
            >
                <FaHandsClapping 
                    className={`text-xl ${clapAnimation ? 'animate-bounce text-primary-500' : ''}`} 
                />
                <span className="font-semibold">
                    {totalClaps.toLocaleString()}
                </span>
            </button>
            {isAuthenticated && userClaps > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-surface-600 dark:text-surface-300">
                        Your claps: {userClaps}/{MAX_CLAPS_PER_USER}
                    </span>
                    <button
                        onClick={handleDecrementClap}
                        disabled={isLoading}
                        className="px-2 py-1 text-sm text-brand-red hover:text-brand-red border border-brand-red/30 hover:border-brand-red/60 rounded transition-colors duration-200 flex items-center"
                        title="Remove one clap"
                    >
                        <FaMinus className="w-3 h-3" />
                    </button>
                </div>
            )}
            {clapAnimation && (
                <div className="absolute pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <FaHeart
                            key={i}
                            className="absolute text-xl text-brand-red animate-bounce"
                            style={{
                                left: `${Math.random() * 40 - 20}px`,
                                top: `${-Math.random() * 30 - 10}px`,
                                animationDelay: `${i * 100}ms`,
                                animationDuration: '600ms'
                            }}
                        />
                    ))}
                </div>
            )}
            {isAuthenticated && userClaps > 0 && (
                <div className="flex-1 max-w-xs">
                    <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2">
                        <div 
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(userClaps / MAX_CLAPS_PER_USER) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

ClapButton.propTypes = {
    noteId: PropTypes.string.isRequired
};

export default ClapButton;