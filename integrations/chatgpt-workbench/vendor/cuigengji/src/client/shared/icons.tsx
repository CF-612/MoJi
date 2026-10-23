import React from 'react';

export type IconName = 'type' | 'history' | 'download' | 'trash' | 'undo' | 'message' | 'more-horizontal' | 'locate' | 'more' | 'list' | 'canvas' | 'home' | 'refresh' | 'settings' | 'filter' | 'edit' | 'about' | 'person' | 'world' | 'search' | 'book' | 'arrow' | 'chevron' | 'plus' | 'flag' | 'bookmark' | 'route' | 'folder' | 'format';
const paths: Record<IconName, React.ReactNode> = {
  type:<><path d="M3 5h12M9 5v15M5 20h8M14 11h7M17.5 11v9"/></>,
  history:<><path d="M3 5v5h5M3.5 10a9 9 0 1 1 .5 6M12 7v5l3 2"/></>,
  download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
  trash:<><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
  undo:<><path d="m8 4-5 5 5 5M3 9h11a6 6 0 0 1 0 12h-3"/></>,
  message:<path d="M4 4h16v12H9l-5 4V4Z"/>,
  'more-horizontal':<><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
  locate:<><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></>,
  more:<><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></>,
  list:<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
  canvas:<><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h7a2 2 0 0 1 2 2v7"/></>,
  format:<><path d="M4 5h16M8 10h12M4 15h16M4 20h12M3 9l3 2-3 2"/></>,
  book:<><path d="M4 3h14v18H4zM7 3v18M10 7h5"/></>,
  arrow:<path d="M4 12h15m-6-6 6 6-6 6"/>,
  chevron:<path d="m9 5 7 7-7 7"/>,
  plus:<path d="M12 4v16M4 12h16"/>,
  flag:<><path d="M5 21V4m0 0c4-4 9 4 14 0v10c-5 4-10-4-14 0"/></>,
  bookmark:<path d="M6 3h12v18l-6-4-6 4Z"/>,
  route:<><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h8a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h8"/></>,
  folder:<path d="M3 6h7l2 3h9v11H3Z"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h5v-6h4v6h5V9"/></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.5 6.5A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.5 5.5"/></>,
  settings: <><path d="m9 3-1 3-3 1 .3 3L3 12l2.3 2-.3 3 3 1 1 3h6l1-3 3-1-.3-3 2.3-2-2.3-2 .3-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4"/><circle cx="8" cy="6" r="2"/><circle cx="15" cy="12" r="2"/></>,
  edit: <><path d="m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-3-3L5 16Z"/></>,
  about: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
  person: <><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>,
  world: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z"/></>,
};

export function Icon({name}: {name: IconName}) {
  return <svg className="app-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
