import {createContext,useContext} from 'react';
import {normalizeModules} from './registry.mjs';
export const ModuleContext=createContext<Record<string,boolean>>(normalizeModules());
export const useModules=()=>useContext(ModuleContext);
