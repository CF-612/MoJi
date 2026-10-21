import type React from 'react';
export const Workbench: React.ComponentType<{sessionId: string; rpc: (action: string, args?: Record<string, unknown>) => Promise<unknown>}>;
export const LocaleContext: React.Context<unknown>;
export const CollaborationContext: React.Context<unknown>;
export function registerLocale(ctx: unknown): (key: string) => string;
