export const trackPalette=['#587bd4','#249b8b','#a073ce','#ca9546','#c86f91','#578eac'];
export const trackColor=(track,index)=>!track.color||track.color==='#5182cc'?trackPalette[index%trackPalette.length]:track.color;
export const cardStates={idea:{label:'讨论中',color:'#c39745'},selected:{label:'准备采用',color:'#6688dc'},written:{label:'已写入正文',color:'#279a7e'},dropped:{label:'暂不采用',color:'#8b8d9f'}};
