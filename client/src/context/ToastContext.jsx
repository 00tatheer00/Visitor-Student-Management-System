import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer.jsx';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'success', size = 'small', title }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, size, title }]);
    const duration = size === 'big' ? 4000 : 3000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = useCallback(
    (message, options = {}) => {
      addToast({ message, ...options });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};
