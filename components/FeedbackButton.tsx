import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const FeedbackButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 left-6 z-40 p-3 bg-white dark:bg-card text-primary rounded-full shadow-lg shadow-primary/20 hover:scale-110 transition-transform duration-200 border border-gray-100 dark:border-gray-800 group"
                title="Send Feedback"
            >
                <MessageSquarePlus size={24} className="group-hover:rotate-12 transition-transform" />
            </button>

            {isModalOpen && (
                <FeedbackModal onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};

export default FeedbackButton;
