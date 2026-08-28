import { useSocketContext } from '../context/SocketContext';

// Convenience hook exposing the socket connection state + helpers.
export function useSocket() {
  const ctx = useSocketContext();
  return ctx;
}

export default useSocket;
