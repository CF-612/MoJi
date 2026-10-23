import React from 'react';
import {StoryCardFace} from '../../shared/StoryCard.tsx';
import type {CastPerson} from '../../shared/CastAvatars.tsx';
import type {NodeIndex,Point} from '../../../contracts/planning.ts';
export function SceneCard({node,point,selected,dragProps,inPort,outPort,busy,people=[],onOpen,onOpenPerson,onExpandCast}: {
  busy:boolean;node:NodeIndex;point:Point;selected:boolean;dragProps:React.HTMLAttributes<HTMLElement>;
  inPort:React.ButtonHTMLAttributes<HTMLButtonElement>;outPort:React.ButtonHTMLAttributes<HTMLButtonElement>;
  people?:CastPerson[];onOpen?:()=>void;onOpenPerson?:(nodeId:string)=>void;onExpandCast?:(node:NodeIndex)=>void;
}) {
  // 卡片不再常驻设置按钮：桌面右键、手机长按卡片即可打开含「快捷设置」的菜单，把右上角留给出场人物头像。
  return <section data-node-id={node.id} aria-label={node.title} {...dragProps} className={`planning-card scene-card state-${node.status} ${selected?'selected':''} ${node.status==='dropped'?'is-dropped':''}`} style={{left:point.x,top:point.y}}>
    <button {...inPort}/><button {...outPort}/>
    <StoryCardFace node={node} people={people} variant="canvas" onOpen={onOpen} onOpenPerson={onOpenPerson} onExpandCast={next=>onExpandCast?.(next as NodeIndex)}/>
  </section>;
}
