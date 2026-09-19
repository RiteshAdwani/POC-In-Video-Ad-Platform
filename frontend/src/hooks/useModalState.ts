import { useCallback, useState } from 'react';

/**
 * @description Manages the open/closed boolean for a modal, so components don't each
 * roll their own `useState` + open/close callbacks for the same thing.
 */
export const useModalState = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, handleOpen, handleClose };
};
