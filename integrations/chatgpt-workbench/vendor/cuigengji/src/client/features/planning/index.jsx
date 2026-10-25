import React from 'react';
import {UnifiedPlanning} from './UnifiedPlanning.jsx';
import {LegacyPlanningArchive} from './LegacyPlanningArchive.jsx';
export function Planning(props){return <><LegacyPlanningArchive {...props}/><UnifiedPlanning {...props}/></>;}
