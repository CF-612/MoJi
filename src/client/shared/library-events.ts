const eventName = 'cuigengji:library-changed';
const channelName = 'cuigengji:library';

/** Refresh other mounted session panels without putting novel data in the bus. */
export function notifyLibraryChanged() {
  window.dispatchEvent(new Event(eventName));
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage('changed'); channel.close();
  }
}

export function subscribeLibraryChanges(refresh: () => void) {
  window.addEventListener(eventName, refresh);
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;
  if (channel) channel.onmessage = refresh;
  return () => {window.removeEventListener(eventName, refresh); channel?.close();};
}
