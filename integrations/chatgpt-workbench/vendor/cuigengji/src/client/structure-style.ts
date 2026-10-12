const dark=`color-scheme:dark;--dsw-alias-bg-base:#202624;--dsw-alias-label-primary:#e6e8e1;--dsw-alias-label-secondary:#b1b8ae;--dsw-alias-border-l1:#414a44;--dsw-alias-button-floating-fill:#29312d;--dsw-alias-state-business-primary:#7098ff;--dsw-alias-label-on-color:#fff;`;
export const structureStyles=`
.cuigengji .dashboard svg,.cuigengji .chronology-scroll svg{max-height:none;max-width:none;border:0;border-radius:0;}
.cuigengji .chronology-scroll svg,.cuigengji .chart-scroll svg{width:auto;height:auto;}
.cuigengji .chart-scroll .responsive-chart{width:100%;min-width:690px;height:auto;}
.cuigengji .story-plot{position:relative;}.cuigengji .story-plot>svg{position:absolute;left:0;top:0;}.cuigengji .story-fixed-labels{position:sticky;left:0;width:162px;z-index:2;background:var(--cg-paper);border-right:1px solid var(--cg-line);}.cuigengji .story-fixed-labels>small{position:absolute;top:20px;left:10px;font-size:12px;color:var(--cg-muted);}.cuigengji .story-fixed-labels button{position:absolute;left:6px;width:150px;background:none;border:none;text-align:left;font-size:12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.cuigengji .dashboard-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}.cuigengji .chart-wide{grid-column:auto;}
@container(max-width:899px){.cuigengji .dashboard-grid{grid-template-columns:minmax(0,1fr);}}
.cuigengji .chart-card{min-width:0;border:1px solid var(--cg-line);border-radius:14px;padding:16px;background:var(--cg-wash);}.cuigengji .chart-card .row{flex-wrap:wrap;}
.cuigengji .chart-card h3{margin:0 0 10px;}.cuigengji .chart-card label{font-size:12px;}.cuigengji .chart-card select{max-width:220px;}
.cuigengji .chart-scroll,.cuigengji .chronology-scroll{max-width:100%;overflow:auto;overscroll-behavior:contain;touch-action:pan-x pan-y;border-radius:10px;}
.cuigengji .chronology-scroll{max-height:70dvh;border:1px solid var(--cg-line);background:var(--cg-paper);}.cuigengji .chronology-scroll svg,.cuigengji .chart-scroll svg{display:block;flex:none;max-width:none;}
.cuigengji .responsive-chart{display:block;width:100%;min-width:690px;height:auto;}.cuigengji .goal-ring{display:block;width:240px;max-width:100%;margin:auto;}
.cuigengji .svg-action{cursor:pointer;outline:none;}.cuigengji .svg-action:hover{filter:brightness(1.15);}.cuigengji .svg-action:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .donut-layout{display:grid;grid-template-columns:minmax(110px,180px) minmax(100px,1fr);gap:12px;align-items:center;}.cuigengji .donut-layout svg{width:100%;}
.cuigengji .donut-key{display:flex;align-items:center;gap:8px;width:100%;font-size:12px;margin:4px 0;}.cuigengji .donut-key span{width:9px;height:9px;border-radius:50%;}.cuigengji .donut-key strong{margin-left:auto;}
.cuigengji .connected-workspace{min-height:0;display:flex;flex-direction:column;}.cuigengji .connected-scroll{overflow:auto;min-height:0;flex:1;}.cuigengji .connected-panel{padding:16px;min-width:0;}
.cuigengji .connected-panel>.row{flex-wrap:wrap;}.cuigengji .connected-nav{display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--cg-line);flex:none;}
.cuigengji .chart-tools{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center;font-size:12px;}.cuigengji .chart-tools>div{display:flex;align-items:center;gap:8px;}.cuigengji .chart-tools label{display:flex;flex-direction:row;align-items:center;gap:8px;}.cuigengji .chart-tools input{width:110px;}
.cuigengji .chart-hint{font-size:12px;}.cuigengji .chart-empty{padding:30px 16px;text-align:center;color:var(--cg-muted);border:1px dashed var(--cg-line);border-radius:10px;}
.cuigengji .inline-ledger{margin:16px;border:1px solid var(--cg-line);border-radius:12px;}.cuigengji .inline-ledger>summary{padding:14px;cursor:pointer;}.cuigengji .inline-ledger .structure-page{overflow:visible;}
.cuigengji .chapter-ribbon{display:grid;gap:6px;padding:10px 14px;border-bottom:1px solid var(--cg-line);background:var(--cg-wash);}.cuigengji .ribbon-track{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12px;}.cuigengji .ribbon-track>small{width:70px;color:var(--cg-muted);}.cuigengji .ribbon-track>span{color:var(--cg-muted);}.cuigengji .ribbon-track button{font-size:12px;max-width:100%;white-space:normal;padding:4px 8px;}.cuigengji .ribbon-track [data-kind=recover]{color:#42a592;}
.cuigengji .card-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;}.cuigengji .card-tags small{padding:2px 7px;border:1px solid var(--cg-line);border-radius:20px;}
.cuigengji .creation-profile{border:1px solid var(--cg-line);border-radius:12px;padding:12px;}.cuigengji .creation-profile h3{font-size:15px;margin:0 0 6px;}.cuigengji .creation-profile p{font-size:12px;margin:4px 0;}.cuigengji .creation-profile .structure-fields{margin:10px 0;gap:10px;}.cuigengji .creation-profile input{font-size:15px;}
@container(max-width:599px){.cuigengji .dashboard-grid{grid-template-columns:minmax(0,1fr);}.cuigengji .chart-card{padding:12px;}.cuigengji .connected-panel{padding:12px;}.cuigengji .creation-profile .structure-fields{grid-template-columns:repeat(2,minmax(0,1fr));}.cuigengji .creation-profile label{font-size:12px;}.cuigengji .chapter-ribbon{padding:8px 10px;}.cuigengji .ribbon-track>small{width:auto;min-width:54px;}}
.cuigengji .timeline-deleted-toggle{display:flex;flex-direction:row;align-items:center;gap:8px;margin:12px 0;}.cuigengji .timeline-deleted-toggle input{width:auto;min-width:0;}
.cuigengji .timeline-toolbar{flex-wrap:wrap;gap:8px;margin:12px 0;}.cuigengji .timeline-toolbar label{max-width:100%;}.cuigengji .timeline-toolbar select{max-width:100%;}
.cuigengji .story-timeline{list-style:none;margin:16px 0;padding:0 0 0 16px;border-left:2px solid var(--cg-line);}
.cuigengji .timeline-event{position:relative;border:1px solid var(--cg-line);border-radius:12px;margin:0 0 16px 6px;padding:14px;background:var(--cg-wash);overflow-wrap:anywhere;}
.cuigengji .timeline-event:before{content:'';position:absolute;width:10px;height:10px;border-radius:50%;left:-28px;top:24px;background:var(--cg-accent);}
.cuigengji .timeline-event .row{flex-wrap:wrap;}.cuigengji .timeline-event h3{margin:10px 0;}.cuigengji .timeline-event p{white-space:pre-wrap;}
.cuigengji .timeline-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}.cuigengji .timeline-links button{max-width:100%;white-space:normal;overflow-wrap:anywhere;text-align:left;}
.cuigengji .relation-legend{display:flex;flex-wrap:wrap;gap:6px 16px;padding:6px 0;font-size:12px;}.cuigengji .relation-change{border-left:4px solid;padding-left:12px;}
html[data-theme-preference=dark]{${dark}}
html[data-theme-preference=light]{color-scheme:light;--dsw-alias-bg-base:#fff;--dsw-alias-label-primary:#252936;--dsw-alias-label-secondary:#737780;--dsw-alias-border-l1:#dde0e6;--dsw-alias-button-floating-fill:#fff;--dsw-alias-state-business-primary:#4d6bfe;--dsw-alias-label-on-color:#fff;}
html[data-theme-preference=dark] body{background:#202624;color:#e6e8e1;}
html[data-theme-preference=light] body{background:#fff;color:#252936;}
@media(prefers-color-scheme:dark){html[data-theme-preference=system]:not([data-theme=light]){${dark}}html[data-theme-preference=system]:not([data-theme=light]) body{background:#202624;color:#e6e8e1;}}
.cuigengji .structure-page{padding:16px;overflow:auto;flex:1;min-height:0;}
.cuigengji .structure-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0;}
.cuigengji .structure-fields label{min-width:0;display:flex;flex-direction:column;gap:6px;}
.cuigengji .structure-fields textarea{min-height:80px;}
.cuigengji .structured-values{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:8px 16px;line-height:1.7;}
.cuigengji .structured-values dt{color:var(--cg-muted);}.cuigengji .structured-values dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;}
.cuigengji .structure-entry{border-bottom:1px solid var(--cg-line);padding:12px 0;overflow-wrap:anywhere;}
.cuigengji .structure-entry p{white-space:pre-wrap;margin:6px 0;}.cuigengji .structure-entry small{color:var(--cg-muted);}
.cuigengji .structure-entry .row{flex-wrap:wrap;}.cuigengji .structure-entry blockquote{margin:8px 0;padding:8px 12px;border-left:3px solid var(--cg-accent);white-space:pre-wrap;}
.cuigengji .structure-form{display:flex;flex-direction:column;gap:12px;}.cuigengji .structure-form label{display:flex;flex-direction:column;gap:6px;}
.cuigengji .stats-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0;}
.cuigengji .stats-grid strong{display:block;font-size:24px;}.cuigengji .stats-grid>div{padding:12px;background:var(--cg-wash);border-radius:10px;}
.cuigengji .chapter-stat{display:grid;grid-template-columns:minmax(0,1fr) 70px;gap:4px 12px;align-items:center;padding:10px 0;}
.cuigengji .chapter-stat button{border:0;text-align:left;background:none;overflow-wrap:anywhere;}.cuigengji .chapter-stat meter{grid-column:1/-1;width:100%;height:12px;accent-color:var(--cg-accent);}
.cuigengji .field-definition{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--cg-line);}.cuigengji .field-definition strong{flex:1;min-width:100px;}
.cuigengji .structure-checks{display:flex;flex-wrap:wrap;gap:8px;}.cuigengji .structure-checks label{display:flex;flex-direction:row;align-items:center;}
.cuigengji .chapter-materials-modal{width:min(760px,calc(100vw - 24px));overflow:hidden;}.cuigengji .chapter-materials-modal[open]{display:flex;flex-direction:column;}.cuigengji .chapter-materials-modal .utility-head{flex:none;}.cuigengji .chapter-materials-modal .utility-content{max-height:calc(100dvh - 130px);min-height:0;overflow:auto;}
@container(max-width:599px){.cuigengji .structure-fields{grid-template-columns:minmax(0,1fr);}.cuigengji .stats-grid{gap:6px;}.cuigengji .stats-grid strong{font-size:20px;}.cuigengji .structured-values{grid-template-columns:minmax(0,1fr);gap:4px;}.cuigengji .structured-values dd{margin-bottom:10px;}.cuigengji .navigation-tabs{flex-wrap:wrap;}.cuigengji .navigation-tabs button{flex:1 0 28%;}.cuigengji .chapter-materials-modal{position:fixed;inset:var(--cg-host-top,0px) var(--cg-host-right,0px) var(--cg-host-bottom,0px) var(--cg-host-left,0px);margin:0;width:auto;height:auto;max-width:none;max-height:none;border-radius:0;}.cuigengji .chapter-materials-modal .utility-content{flex:1;max-height:none;padding-bottom:calc(30px + env(safe-area-inset-bottom));}}
`;
