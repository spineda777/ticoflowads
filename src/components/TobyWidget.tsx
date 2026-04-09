import React from 'react';

const TobyWidget: React.FC = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div>
            <button 
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    borderRadius: '50%',
                    padding: '15px',
                    background: '#00A1FF',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
                onClick={toggleVisibility}
            >
                💬
            </button>
            {isVisible && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    width: '300px',
                    height: '400px',
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    background: '#fff',
                    overflow: 'hidden',
                }}>
                    <h2>Toby Assistant</h2>
                    <div>
                        {/* Chat functionality goes here */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TobyWidget;
