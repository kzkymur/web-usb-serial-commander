import { useEffect, useCallback } from 'react';
import { useKeypressStore } from '../store/keypress';
import { useGeneralStatus } from '../store/general';

export const useKeyboardHandler = () => {
  const { mode, devices } = useGeneralStatus();
  const { keyCommands } = useKeypressStore();

  const handleKeyEvent = useCallback(
    async (e: KeyboardEvent, isKeyDown: boolean) => {
      console.log(e);
      if (mode !== 'keypress') return;
      const targetKeyCommands = keyCommands.filter(kc => kc.key === e.key);
      if (!targetKeyCommands) return;

      try {
        if (!isKeyDown) return;
        targetKeyCommands.forEach(tkc => {
          const d = devices.find(d => d.id === tkc.deviceId);
          d?.sendSCPICommand(tkc.command).catch(console.error);
        })
      } catch (err) {
        console.error('Command send failed:', err);
      }
    },
    [mode, devices, keyCommands]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyEvent(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKeyEvent(e, false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyEvent]);
};
