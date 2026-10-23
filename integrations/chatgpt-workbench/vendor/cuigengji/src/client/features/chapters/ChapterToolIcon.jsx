import React from 'react';

/** Editor-only pictograms: one silhouette per action, with color supplied by the menu. */
export const chapterToolIcons = {
 search: <><path d="M10 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M7 7h6M7 11h3"/><circle cx="16" cy="15" r="4"/><path d="m19 18 3 3"/></>,
 copy: <><path d="M8 6V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/><rect x="3" y="7" width="13" height="15" rx="2"/><path d="M7 12h5M7 16h5"/></>,
 undo: <><path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14"/><path d="M11 17h6"/></>,
 materials: <><path d="M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15M5 8h4M5 12h4M15 8h4M15 12h4"/></>,
 discussion: <><path d="M20 15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3l4 4v-4ZM2 9v10a2 2 0 0 0 2 2h4M8 7h10M8 11h6"/></>,
 speed: <><path d="M5 20a10 10 0 1 1 14 0M3 12h2M6 5l2 2M12 2v3M18 5l-2 2M21 12h-2"/><path d="m12 15 4-6-6 4a2 2 0 0 0 2 2Z"/></>,
 quick: <><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M9 7V4h6V2M6 11h.01M10 11h.01M14 11h.01M18 11h.01M6 15h.01M10 15h.01M14 15h.01M18 15h.01M8 18h8"/></>,
 share: <><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 18 6-6 4 4 4-6 5 7"/></>,
 history: <><path d="M3 5v5h5M3 10a9 9 0 1 1 1 8M12 7v5l4 3"/></>,
 review: <><path d="M13 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M7 9h4M7 14h4M7 18h9"/><path d="m18 2 1.4 3.6L23 7l-3.6 1.4L18 12l-1.4-3.6L13 7l3.6-1.4Z"/></>,
 type: <><path d="M2 5h13M8.5 5v15M5 20h7M14 10h8M18 10v10M16 20h4"/></>,
 layout: <><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M3 7h18M8 7v15M12 11h5M12 15h5M12 19h3"/></>,
 format: <><path d="M3 4h18M11 9h10M11 14h10M3 20h18M3 9l4 3-4 3"/></>,
 settings: <><path d="M4 3v7M4 14v7M12 3v12M12 19v2M20 3v3M20 10v11M2 10h4v4H2ZM10 15h4v4h-4ZM18 6h4v4h-4Z"/></>,
 backup: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v7c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12v7c0 1.7 4 3 9 3s9-1.3 9-3v-7"/></>,
 export: <><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M13 3v6h6M13 3l6 6M10 14h12m-3-3 3 3-3 3"/></>,
 trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
 restore: <><path d="M4 10a9 9 0 1 1 0 7M4 4v6h6M9 14l3-3 3 3M12 11v8"/></>,
 rename: <><path d="m4 16 12-12a2.8 2.8 0 0 1 4 4L8 20l-5 1ZM14 6l4 4M13 21h8"/></>,
};
export function ChapterToolIcon({name}) {
 return <svg className="app-icon chapter-tool-icon" data-chapter-icon={name} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{chapterToolIcons[name]}</svg>;
}
