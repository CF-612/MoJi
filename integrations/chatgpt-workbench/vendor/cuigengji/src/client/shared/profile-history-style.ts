export const profileHistoryStyles = `
.cuigengji .material-library-toolbar{display:grid;grid-template-columns:auto minmax(180px,430px) auto;align-items:center;justify-content:space-between;gap:20px;padding:12px 20px;flex:none;border-bottom:1px solid var(--cg-line);background:var(--cg-paper)}
.cuigengji .material-library-views{display:flex;align-items:center;gap:3px;padding:3px;border:1px solid var(--cg-line);border-radius:9px;background:var(--cg-wash)}
.cuigengji .material-library-views button{display:flex;align-items:center;gap:6px;min-height:32px;padding:6px 11px;border:0;border-radius:6px;background:transparent;color:var(--cg-muted);font-size:12px}
.cuigengji .material-library-views button[aria-pressed=true]{background:var(--cg-paper);color:var(--cg-accent);box-shadow:0 1px 4px #183c6410}
.cuigengji .material-library-views .app-icon{width:15px;height:15px}
.cuigengji .material-library-query{display:flex;align-items:center;min-width:0;border:1px solid var(--cg-line);border-radius:9px;background:color-mix(in srgb,var(--cg-wash) 50%,var(--cg-paper));height:38px;overflow:hidden}
.cuigengji .material-library-query:focus-within{border-color:var(--cg-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--cg-accent) 8%,transparent)}
.cuigengji .material-library-search{display:flex;align-items:center;gap:8px;flex:1;min-width:0;margin:0;padding:0 11px}
.cuigengji .material-library-search>.app-icon{width:15px;height:15px;flex:none;color:var(--cg-muted)}
.cuigengji .material-library-search input{flex:1;min-width:0;width:100%;height:36px;min-height:36px;padding:0;border:0;outline:none;background:transparent;box-shadow:none;font-size:12px}
.cuigengji .material-library-search input:focus-visible{outline:0;box-shadow:none}
.cuigengji .material-library-search input::placeholder{color:var(--cg-muted);font-size:12px;opacity:.8}
.cuigengji .material-library-search button{padding:0;width:24px;min-height:24px;flex:none;border:0;background:transparent;font-size:16px;color:var(--cg-muted)}
.cuigengji .material-library-query>select{flex:none;min-width:94px;width:94px;min-height:26px;height:26px;border:0;border-left:1px solid var(--cg-line);border-radius:0;padding:0 9px;background:transparent;font-size:12px;color:var(--cg-ink)}
.cuigengji .material-library-actions{display:flex;align-items:center;gap:7px}
.cuigengji .material-library-actions .tool-trigger{display:flex;align-items:center;gap:6px;min-height:37px;padding:7px 11px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);font-size:12px;clip-path:none}
.cuigengji .material-library-actions .tool-trigger.primary{border-color:var(--cg-accent);background:var(--cg-accent);color:var(--dsw-alias-label-on-color,#fff)}
.cuigengji .material-library-actions .tool-trigger:hover{box-shadow:0 2px 8px #153b6210}
.cuigengji .material-tools-label{font-size:11px;color:var(--cg-muted);margin:12px 10px 0;font-weight:500}
.cuigengji .material-tools-label:first-child{margin-top:0}
.cuigengji .material-tools-legend{padding:10px;border-top:1px solid var(--cg-line);font-size:12px}
@container(max-width:720px){
 .cuigengji .material-library-toolbar{grid-template-columns:auto auto;gap:10px;padding:10px 14px}.cuigengji .material-library-query{grid-column:1/-1;grid-row:2}.cuigengji .material-library-actions{justify-self:end}.cuigengji .material-library-views button{padding:6px 10px}
}

.cuigengji .material-panel[hidden],.cuigengji .profile-records[hidden]{display:none!important}
.cuigengji .material-detail{min-width:0;container-type:inline-size}
.cuigengji .material-identity{display:flex;align-items:center;gap:18px;margin:0 0 24px}
.cuigengji .material-identity>div{min-width:0}
.cuigengji .material-identity small{color:var(--cg-muted);font-size:11px;letter-spacing:.06em}
.cuigengji .material-identity h2{margin:5px 0 6px;line-height:1.3;font-size:26px;overflow-wrap:anywhere}
.cuigengji .material-identity .profile-avatar{width:64px;height:64px;margin:0;border:1px solid var(--cg-line);box-shadow:0 3px 12px #153b6210;flex:none}
.cuigengji .material-identity-meta{color:var(--cg-muted);font-size:11px}
.cuigengji .material-nav{display:flex;gap:4px;padding:5px;margin:0 0 24px;border:1px solid var(--cg-line);border-radius:11px;background:color-mix(in srgb,var(--cg-wash) 65%,var(--cg-paper));min-width:0}
.cuigengji .material-nav button{position:relative;flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 7px;min-height:38px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--cg-muted);font-size:12px;white-space:nowrap;line-height:1.4}
.cuigengji .material-nav button .app-icon{width:15px;height:15px;flex:none}
.cuigengji .material-nav button[aria-selected=true]{background:var(--cg-paper);border-color:color-mix(in srgb,var(--cg-line) 60%,transparent);box-shadow:0 2px 5px #153b6209;color:var(--cg-accent);font-weight:600}
.cuigengji .material-nav button:hover{color:var(--cg-accent)}
.cuigengji .material-draft-dot{width:5px;height:5px;border-radius:50%;background:var(--cg-accent);flex:none}
.cuigengji .material-panel{min-width:0;outline:none}
.cuigengji .material-panel:focus-visible{outline:2px solid var(--cg-accent);outline-offset:4px;border-radius:8px}
.cuigengji .material-subnav{display:flex;gap:5px;border-bottom:1px solid var(--cg-line);padding:0 0 9px;margin:18px 0}
.cuigengji .material-subnav button{min-height:29px;padding:5px 10px;border:0;border-radius:6px;background:transparent;color:var(--cg-muted);font-size:11px}
.cuigengji .material-subnav button[aria-selected=true]{background:var(--cg-wash);color:var(--cg-accent);font-weight:600}
.cuigengji .material-detail .material-detail-note{padding:11px 14px;margin:0 0 20px;font-size:11px;border-radius:8px}
.cuigengji .material-detail-note summary{cursor:pointer;color:var(--cg-muted)}
.cuigengji .material-detail-note p{margin:10px 0 0;line-height:1.85}
.cuigengji .material-detail .document-summary{margin:14px 0 24px;font-size:14px}
.cuigengji .material-detail .document-body{font-size:14px;line-height:1.9}
.cuigengji .material-management,.cuigengji .profile-related{padding:18px;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper)}
.cuigengji .material-management-actions{display:flex;gap:10px;flex-wrap:wrap}
.cuigengji .material-management-actions button{border-radius:7px;font-size:12px}
.cuigengji .profile-related .related-entry{padding:10px 0;margin:0;border-top:1px solid var(--cg-line);font-size:12px}
.cuigengji .profile-related .related-entry button{font-size:12px;min-height:30px;border-radius:6px}
.cuigengji .profile-related .profile-block-heading>button{font-size:11px;min-height:30px;border-radius:6px}
.cuigengji .profile-organization{margin:0 0 20px;padding:13px 16px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);font-size:12px}
.cuigengji .profile-organization summary{cursor:pointer;font-size:12px;font-weight:600}
.cuigengji .profile-organization .profile-count{margin-left:6px}
.cuigengji .profile-organization p{font-size:11px;line-height:1.8}
.cuigengji .profile-chapters{font-size:12px;line-height:1.8;margin-bottom:20px}
.cuigengji .profile-chapters>p{color:var(--cg-muted);font-size:11px}
.cuigengji .profile-field-fold{padding:12px 14px;border:1px solid var(--cg-line);border-radius:9px;background:var(--cg-paper)}
.cuigengji .profile-field-fold summary{cursor:pointer;font-size:12px;font-weight:550}
.cuigengji .profile-field-fold summary small{float:right;font-size:10px;color:var(--cg-muted);font-weight:400}
.cuigengji .profile-field-fold[open] summary{padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--cg-line)}
.cuigengji .profile-records button.profile-person-link{border:0;padding:0;background:transparent;font-size:14px;font-weight:650;min-height:24px;text-align:left}
.cuigengji .profile-records button.profile-person-link:hover{color:var(--cg-accent)}
@container(max-width:520px){
 .cuigengji .material-identity{gap:13px;margin-bottom:18px}.cuigengji .material-identity .profile-avatar{width:52px;height:52px}.cuigengji .material-identity h2{font-size:23px}
 .cuigengji .material-nav{gap:1px;padding:3px;margin-bottom:19px;border-radius:9px}.cuigengji .material-nav button{font-size:12px;padding:8px 4px;gap:3px;min-height:40px}.cuigengji .material-nav button>.app-icon{display:none}
 .cuigengji .material-management,.cuigengji .profile-related{padding:14px 12px}
}

.cuigengji .profile-records{border:0;padding:0;margin:0;container-type:inline-size}
.cuigengji .profile-block-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;flex-wrap:wrap}
.cuigengji .profile-block-heading h3,.cuigengji .profile-block-heading h4{display:flex;align-items:center;gap:8px;margin:0;font-size:15px;line-height:1.6;font-weight:650;letter-spacing:.02em}
.cuigengji .profile-block-heading h3>.app-icon,.cuigengji .profile-block-heading h4>.app-icon{width:17px;height:17px;color:var(--cg-muted)}
.cuigengji .profile-count{display:inline-grid;place-items:center;font:500 10px/1.2 system-ui;min-width:20px;min-height:20px;padding:0 5px;border-radius:6px;color:var(--cg-muted);background:var(--cg-wash)}
.cuigengji .profile-actions{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.cuigengji .profile-records button.profile-action{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--cg-muted);padding:5px 9px;min-height:30px;font-size:11px;line-height:1.4;font-weight:500;flex:none}
.cuigengji .profile-records button.profile-action .app-icon{width:14px;height:14px}
.cuigengji .profile-records button.profile-action:hover:not(:disabled){background:var(--cg-wash);color:var(--cg-accent)}
.cuigengji .profile-records button.profile-action.primary-soft{color:var(--cg-accent);background:var(--cg-wash);border-color:color-mix(in srgb,var(--cg-accent) 18%,transparent)}
.cuigengji .profile-caption{font-size:11px;line-height:1.7;color:var(--cg-muted);margin:-5px 0 16px}
.cuigengji .profile-fields-panel{padding:20px;border:1px solid var(--cg-line);border-radius:14px;background:var(--cg-paper);box-shadow:0 3px 16px #172f4a04;margin-bottom:26px}
.cuigengji .profile-fields-panel .profile-block-heading{margin-bottom:12px}
.cuigengji .profile-fields-panel .structure-fields{border:0;padding:0;min-width:0;margin:20px 0 4px;gap:20px 18px;grid-template-columns:repeat(2,minmax(0,1fr))}
.cuigengji .profile-fields-panel .structure-fields label{font-size:12px;font-weight:550;color:var(--cg-ink);gap:8px;line-height:1.6;margin:0}
.cuigengji .profile-fields-panel .structure-fields input,.cuigengji .profile-fields-panel .structure-fields select,.cuigengji .profile-fields-panel .structure-fields textarea{box-sizing:border-box;width:100%;min-width:0;border:1px solid color-mix(in srgb,var(--cg-line) 85%,var(--cg-muted));border-radius:8px;background:color-mix(in srgb,var(--cg-paper) 70%,var(--cg-wash));color:var(--cg-ink);font-size:13px;padding:9px 11px;line-height:1.6;min-height:39px;transition:border-color .15s,box-shadow .15s}
.cuigengji .profile-fields-panel .structure-fields :is(input,select,textarea):focus-visible{outline:0;border-color:var(--cg-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--cg-accent) 12%,transparent)}
.cuigengji .profile-fields-panel .structure-fields :is(input,textarea)::placeholder{color:var(--cg-muted);opacity:.65;font-size:11px}
.cuigengji .profile-fields-panel .structure-fields .profile-field-long{grid-column:1/-1;padding-top:4px}
.cuigengji .profile-field-long .markdown-field-head{margin-bottom:8px}
.cuigengji .profile-field-long .markdown-field-head [role=group]{border:0;padding:2px;background:var(--cg-wash);border-radius:6px}
.cuigengji .profile-field-long .markdown-field-head button{min-height:23px;padding:3px 7px;font-size:10px;border-radius:4px;color:var(--cg-muted)}
.cuigengji .profile-field-long .markdown-field-head button[aria-pressed=true]{background:var(--cg-paper);color:var(--cg-accent);box-shadow:0 1px 3px #0000000a}
.cuigengji .profile-fields-panel .structure-fields textarea{min-height:108px;resize:vertical}
.cuigengji .profile-fields-panel .structured-values{margin:16px 0 0;padding:0;gap:10px 20px;font-size:12px}
.cuigengji .profile-fields-panel .savebar{margin:18px -20px -20px;padding:12px 20px;border-top:1px solid var(--cg-line);border-radius:0 0 14px 14px;background:var(--cg-paper);gap:10px;font-size:11px}
.cuigengji .profile-empty{margin:4px 0;padding:16px 18px;border:1px dashed var(--cg-line);border-radius:10px;color:var(--cg-muted);font-size:12px;line-height:1.8;background:color-mix(in srgb,var(--cg-paper) 65%,transparent)}
.cuigengji .profile-relations{padding:0 0 20px;margin:0 0 20px;border:0;border-bottom:1px solid var(--cg-line)}
.cuigengji .profile-relation-card{padding:16px;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper);margin:10px 0;box-shadow:0 2px 8px #172f4a03}
.cuigengji .profile-relation-header{display:flex;align-items:center;gap:12px;min-width:0}
.cuigengji .profile-relation-person{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
.cuigengji .profile-relation-person>.cast-face{width:38px;height:38px;border:1px solid var(--cg-line);font-size:16px}
.cuigengji .profile-relation-identity{display:flex;flex-direction:column;gap:5px;min-width:0}
.cuigengji .profile-relation-name{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}
.cuigengji .profile-relation-name strong{font-size:14px;font-weight:650;overflow-wrap:anywhere}
.cuigengji .profile-relation-status{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:5px;background:color-mix(in srgb,var(--relation-tone) 9%,var(--cg-paper));color:var(--cg-ink);font-size:11px;line-height:1.5;overflow-wrap:anywhere}
.cuigengji .profile-relation-status:before{content:'';width:5px;height:5px;flex:none;border-radius:50%;background:var(--relation-tone)}
.cuigengji .profile-relation-identity small{color:var(--cg-muted);font-size:10px;line-height:1.6}
.cuigengji .profile-relation-description{font-size:12px;margin:12px 0 0;padding:10px 12px;border-radius:7px;background:var(--cg-wash);line-height:1.8}
.cuigengji .profile-relation-description summary{cursor:pointer;color:var(--cg-muted)}
.cuigengji .profile-relation-description .markdown-reading{margin-top:8px}
.cuigengji .profile-change-list{padding:12px 0 0;margin:14px 0 0;border-top:1px solid var(--cg-line)}
.cuigengji .profile-change-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.cuigengji .profile-change-heading>span{font-size:10px;letter-spacing:.05em;color:var(--cg-muted)}
.cuigengji .profile-change-row{display:grid;grid-template-columns:8px minmax(0,1fr) auto;gap:10px;align-items:center;position:relative;padding:9px 0}
.cuigengji .profile-change-row>i{width:6px;height:6px;border-radius:50%;background:var(--cg-accent);box-shadow:0 0 0 3px var(--cg-wash)}
.cuigengji .profile-change-content{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.cuigengji .profile-records button.profile-event-link{border:0;background:transparent;color:var(--cg-ink);font-size:12px;font-weight:550;text-align:left;min-height:24px;padding:0;white-space:normal;overflow-wrap:anywhere}
.cuigengji .profile-records button.profile-event-link:hover{color:var(--cg-accent);text-decoration:underline;text-underline-offset:3px}
.cuigengji .profile-change-content>.app-icon{width:12px;height:12px;color:var(--cg-muted);opacity:.65}
.cuigengji .profile-change-result{font-size:11px;color:var(--cg-accent);background:var(--cg-wash);padding:3px 8px;border-radius:5px;overflow-wrap:anywhere}
.cuigengji .profile-plan-label{font-size:9px;color:var(--cg-muted);padding-left:5px}
.cuigengji .profile-activity{margin:0 0 24px;padding:0 0 22px;border-bottom:1px solid var(--cg-line)}
.cuigengji .profile-event-list{list-style:none;margin:18px 0 0;padding:0}
.cuigengji .profile-event-item{position:relative;padding:0 0 14px 25px;margin:0}
.cuigengji .profile-event-item:before{content:'';position:absolute;left:5px;top:11px;bottom:-8px;width:1px;background:var(--cg-line)}
.cuigengji .profile-event-item:last-child:before{display:none}
.cuigengji .profile-event-item:after{content:'';position:absolute;left:1px;top:17px;width:7px;height:7px;border:1.5px solid var(--cg-accent);border-radius:50%;background:var(--cg-paper)}
.cuigengji .profile-event-card{padding:13px 16px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper)}
.cuigengji .profile-event-card header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.cuigengji .profile-event-meta{display:flex;align-items:center;gap:8px;color:var(--cg-muted);font-size:10px}
.cuigengji .profile-event-meta small{font-size:10px;opacity:.75}
.cuigengji .profile-event-card p{font-size:12px;line-height:1.85;color:var(--cg-muted);white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0}
.cuigengji .profile-review-note{display:inline-block;font-size:10px;color:var(--cg-accent);margin-top:8px;padding:3px 7px;border-radius:5px;background:var(--cg-wash)}
@container(max-width:520px){
 .cuigengji .profile-fields-panel{padding:15px 12px;border-radius:11px}.cuigengji .profile-block-heading{gap:10px}.cuigengji .profile-fields-panel .profile-actions{width:100%;justify-content:flex-start}
 .cuigengji .profile-fields-panel .structure-fields{grid-template-columns:minmax(0,1fr);gap:17px}.cuigengji .profile-fields-panel .structure-fields .profile-field-long{grid-column:1}
 .cuigengji .profile-fields-panel .savebar{margin:16px -12px -15px;padding:10px 12px}.cuigengji .profile-relation-card{padding:13px 12px}.cuigengji .profile-relation-person{gap:8px}
 .cuigengji .profile-relation-person>.cast-face{width:32px;height:32px}.cuigengji .profile-relation-name{gap:5px}.cuigengji .profile-event-item{padding-left:19px}.cuigengji .profile-event-card{padding:12px}
}

@container(max-width:600px){
 .cuigengji .material-library-toolbar{padding:4px 8px;gap:4px}
 .cuigengji .material-library-views button,.cuigengji .material-library-actions .tool-trigger{min-height:36px}
 .cuigengji .material-library-query>select{height:36px;min-height:36px}
}
`;
