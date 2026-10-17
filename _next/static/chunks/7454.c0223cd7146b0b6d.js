"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7454],{16137:(e,r,i)=>{i.d(r,{L:()=>n});var t=i(51862);let n=t.I4.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},18959:(e,r,i)=>{i.d(r,{W:()=>a});var t=i(95155),n=i(41550),o=i(51862);let a=({children:e,theme:r,className:i})=>(0,t.jsxs)(l,{$theme:r,className:i,children:[(0,t.jsx)(n.A,{width:"16px",height:"16px",color:"var(--privy-color-icon-warning)",strokeWidth:2,style:{flexShrink:0}}),(0,t.jsx)(s,{$theme:r,children:e})]}),l=o.I4.div`
  display: flex;
  gap: 0.5rem;
  background-color: var(--privy-color-warn-bg);
  border: 1px solid var(--privy-color-border-warning);
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow: clip;
  width: 100%;
`,s=o.I4.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
  flex: 1;
  text-align: left;
  font-feature-settings:
    'calt' 0,
    'kern' 0;
`},41550:(e,r,i)=>{i.d(r,{A:()=>n});var t=i(12115);let n=t.forwardRef(function({title:e,titleId:r,...i},n){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},i),e?t.createElement("title",{id:r},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))})},45073:(e,r,i)=>{i.r(r),i.d(r,{EmbeddedWalletKeyExportScreen:()=>f,EmbeddedWalletKeyExportView:()=>u,constructWalletExportIframeUrl:()=>y,default:()=>f,supportsSeedPhraseExport:()=>x});var t=i(95155),n=i(12115),o=i(51862),a=i(80158),l=i(18959),s=i(55134),d=i(51774),c=i(69704),p=i(73532),h=i(50023);let u=({address:e,hideWalletAddress:r,accessToken:i,appConfigTheme:n,onClose:o,exportButtonProps:a,onBack:d})=>(0,t.jsx)(h.S,{title:"Export wallet",subtitle:(0,t.jsxs)(t.Fragment,{children:["Copy either your private key or seed phrase to export your wallet."," ",(0,t.jsx)("a",{href:"https://privy-io.notion.site/Transferring-your-account-9dab9e16c6034a7ab1ff7fa479b02828",target:"blank",rel:"noopener noreferrer",children:"Learn more"})]}),onClose:o,onBack:d,showBack:!!d,watermark:!0,children:(0,t.jsxs)(g,{children:[(0,t.jsx)(l.W,{theme:n,children:"Never share your private key or seed phrase with anyone."}),!r&&(0,t.jsx)(s.W,{title:"Your wallet",address:e,showCopyButton:!0}),(0,t.jsx)("div",{style:{width:"100%"},children:i&&a&&(0,t.jsx)(v,{accessToken:i,dimensions:{height:"44px"},...a})})]})}),g=o.I4.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;function x({chainType:e,imported:r,isUnifiedWallet:i}){return!r&&(i?"ethereum"===e||"bitcoin-taproot"===e||"pearl"===e:"ethereum"===e)}function v(e){let[r,i]=(0,n.useState)(e.dimensions.width),[o,a]=(0,n.useState)(!1),[l,s]=(0,n.useState)(void 0),d=(0,n.useRef)(null);(0,n.useEffect)(()=>{if(d.current&&void 0===r){let{width:e}=d.current.getBoundingClientRect();i(e)}let e=getComputedStyle(document.documentElement);s({background:e.getPropertyValue("--privy-color-background"),background2:e.getPropertyValue("--privy-color-background-2"),foreground3:e.getPropertyValue("--privy-color-foreground-3"),foregroundAccent:e.getPropertyValue("--privy-color-foreground-accent"),accent:e.getPropertyValue("--privy-color-accent"),accentDark:e.getPropertyValue("--privy-color-accent-dark"),success:e.getPropertyValue("--privy-color-success"),colorScheme:e.getPropertyValue("color-scheme")})},[]);let c=x({chainType:e.chainType,imported:e.imported,isUnifiedWallet:e.isUnifiedWallet});return(0,t.jsx)("div",{ref:d,children:r&&(0,t.jsxs)(m,{children:[(0,t.jsx)("iframe",{style:{position:"absolute",zIndex:1,opacity:+!!o,transition:"opacity 50ms ease-in-out",pointerEvents:o?"auto":"none"},onLoad:()=>setTimeout(()=>a(!0),1500),width:r,height:e.dimensions.height,allow:"clipboard-write self *",src:y({origin:e.origin,appId:e.appId,appClientId:e.appClientId,walletId:e.walletId,entropyId:e.entropyId,entropyIdVerifier:e.entropyIdVerifier,hdWalletIndex:e.hdWalletIndex,chainType:e.chainType,accessToken:e.accessToken,clientAnalyticsId:e.clientAnalyticsId,width:r,palette:l,isUnifiedWallet:e.isUnifiedWallet,exportSeedPhrase:c})}),(0,t.jsx)(b,{children:"Loading..."}),c&&(0,t.jsx)(b,{children:"Loading..."})]})})}let f={component:()=>{let[e,r]=(0,n.useState)(null),{authenticated:i,user:o}=(0,d.u)(),{closePrivyModal:a,createAnalyticsEvent:l,clientAnalyticsId:s,client:h}=(0,c.u)(),g=(0,d.a)(),{data:x,onUserCloseViaDialogOrKeybindRef:v}=(0,p.u)(),{onFailure:f,onSuccess:y,origin:m,appId:b,appClientId:w,entropyId:j,entropyIdVerifier:I,walletId:k,hdWalletIndex:C,chainType:z,address:A,uiOptions:S,isUnifiedWallet:E,imported:T,showBackButton:W}=x.keyExport,$=e=>{a({shouldCallAuthOnSuccess:!1}),f("string"==typeof e?Error(e):e)},B=()=>{a({shouldCallAuthOnSuccess:!1}),y(),l({eventName:"embedded_wallet_key_export_completed",payload:{walletAddress:A}})};return(0,n.useEffect)(()=>{if(!i)return $("User must be authenticated before exporting their wallet");h.getAccessToken().then(r).catch($)},[i,o]),v.current=B,(0,t.jsx)(u,{address:A,hideWalletAddress:S?.hideWalletAddress,accessToken:e,appConfigTheme:g.appearance.palette.colorScheme,onClose:B,isLoading:!e,onBack:W?B:void 0,exportButtonProps:e?{origin:m,appId:b,appClientId:w,clientAnalyticsId:s,entropyId:j,entropyIdVerifier:I,walletId:k,hdWalletIndex:C,isUnifiedWallet:E,imported:T,chainType:z}:void 0})}};function y({origin:e,appId:r,appClientId:i,walletId:t,entropyId:n,entropyIdVerifier:o,hdWalletIndex:l,chainType:s,accessToken:d,clientAnalyticsId:c,width:p,palette:h,isUnifiedWallet:u,exportSeedPhrase:g}){return(0,a.j)({origin:e,path:`/apps/${r}/embedded-wallets/export`,query:u?{v:"1-unified",wallet_id:t,chain_type:s,client_id:i,width:`${p}px`,caid:c,phrase_export:g,...h}:{v:"1",entropy_id:n,entropy_id_verifier:o,hd_wallet_index:l,chain_type:s,client_id:i,width:`${p}px`,caid:c,phrase_export:g,...h},hash:{token:d}})}let m=o.I4.div`
  overflow: visible;
  position: relative;
  height: 44px;
  display: flex;
  gap: 12px;
`,b=o.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--privy-border-radius-md);
  background-color: var(--privy-color-background-2);
  color: var(--privy-color-foreground-3);
`},49579:(e,r,i)=>{i.d(r,{S:()=>I});var t=i(95155),n=i(12115),o=i(51862),a=i(57445),l=i(10308),s=i(97677),d=i(98590);let c=o.I4.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=o.I4.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,h=o.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,o.I4)(s.M)`
  margin: 0 -8px;
`,g=o.I4.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;

  /* Enable scrolling */
  overflow-y: auto;

  /* Hide scrollbar but keep functionality when scrollable */
  /* Add padding for focus outline space, offset with negative margin */
  padding: 3px;
  margin: -3px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-gutter: stable both-edges;
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* Gradient effect for scroll indication */
  ${({$colorScheme:e})=>"light"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":"dark"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
`,x=o.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=o.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=o.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,y=o.I4.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=o.I4.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,b=o.I4.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"warning":return"var(--privy-color-warn)";case"error":return"var(--privy-color-error-bg)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,w=o.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,j=o.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 82px;

  > div {
    position: relative;
  }

  > div > :first-child {
    position: relative;
  }

  > div > :last-child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`,I=({children:e,...r})=>(0,t.jsx)(c,{children:(0,t.jsx)(p,{...r,children:e})}),k=o.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,o.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,z=o.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,A=({step:e})=>e?(0,t.jsx)(k,{children:(0,t.jsx)(z,{pct:Math.min(100,e.current/e.total*100)})}):null;I.Header=({title:e,subtitle:r,icon:i,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:d,showClose:c,onClose:p,step:g,headerTitle:x,eyebrow:b,...w})=>(0,t.jsxs)(h,{...w,children:[(0,t.jsx)(u,{backFn:a?l:void 0,infoFn:s?d:void 0,onClose:c?p:void 0,title:x,eyebrow:b,closeable:c}),(i||n||e||r)&&(0,t.jsxs)(v,{children:[i||n?(0,t.jsx)(I.Icon,{icon:i,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,t.jsxs)(f,{children:[e&&(0,t.jsx)(y,{children:e}),r&&(0,t.jsx)(m,{children:r})]})]}),g&&(0,t.jsx)(A,{step:g})]}),(I.Body=n.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",I.Footer=({children:e,...r})=>(0,t.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),I.Actions=({children:e,...r})=>(0,t.jsx)(S,{...r,children:e}),I.HelpText=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),I.FooterText=({children:e,...r})=>(0,t.jsx)(T,{...r,children:e}),I.Watermark=()=>(0,t.jsx)(C,{}),I.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(w,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(a.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(b,{$variant:r,children:(0,t.jsx)(d.N,{size:"64px"})}):(0,t.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=o.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=o.I4.div`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 13px;
    line-height: 20px;

    & a {
      text-decoration: underline;
    }
  }
`,T=o.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>a});var t=i(95155),n=i(97677),o=i(49579);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...d})=>{let c=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,o=i.variant||"primary";return(0,t.jsx)(n.B,{...i,variant:o,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,o=i.variant||"secondary";return(0,t.jsx)(n.B,{...i,variant:o,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(o.S,{id:d.id,className:d.className,children:[(0,t.jsx)(o.S.Header,{...d}),s?(0,t.jsx)(o.S.Body,{children:s}):null,i||c||l?(0,t.jsxs)(o.S.Footer,{children:[i?(0,t.jsx)(o.S.HelpText,{children:i}):null,c?(0,t.jsx)(o.S.Actions,{children:c}):null,l?(0,t.jsx)(o.S.Watermark,{}):null]}):null,a?(0,t.jsx)(o.S.FooterText,{children:a}):null]})}},55134:(e,r,i)=>{i.d(r,{W:()=>b});var t=i(95155),n=i(94514),o=i(67635),a=i(12115),l=i(51862),s=i(97677),d=i(98910),c=i(16137),p=i(67385),h=i(68753);let u=(0,l.I4)(h.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,g=l.I4.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,x=l.I4.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,v=l.I4.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,f=(0,l.I4)(c.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,y=(0,l.I4)(d.E)`
  margin-top: 0.25rem;
`,m=(0,l.I4)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,b=({errMsg:e,balance:r,address:i,className:l,title:s,showCopyButton:d=!1})=>{let[c,h]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,t.jsxs)("div",{children:[s&&(0,t.jsx)(f,{children:s}),(0,t.jsx)(u,{className:l,$state:e?"error":void 0,children:(0,t.jsxs)(g,{children:[(0,t.jsxs)(x,{children:[(0,t.jsx)(p.A,{address:i,showCopyIcon:!1}),void 0!==r&&(0,t.jsx)(v,{children:r})]}),d&&(0,t.jsx)(m,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(i).then(()=>h(!0)).catch(console.error)},size:"sm",children:(0,t.jsxs)(t.Fragment,c?{children:["Copied",(0,t.jsx)(n.A,{size:14})]}:{children:["Copy",(0,t.jsx)(o.A,{size:14})]})})]})}),e&&(0,t.jsx)(y,{children:e})]})}},67385:(e,r,i)=>{i.d(r,{A:()=>c});var t=i(95155),n=i(94514),o=i(67635),a=i(12115),l=i(51862),s=i(4104),d=i(97677);let c=({address:e,showCopyIcon:r,url:i,className:l})=>{let[c,g]=(0,a.useState)(!1);function x(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>g(!0)).catch(console.error)}return(0,a.useEffect)(()=>{if(c){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,t.jsxs)(p,i?{children:[(0,t.jsx)(u,{title:e,className:l,href:`${i}/address/${e}`,target:"_blank",children:(0,s.c)(e)}),r&&(0,t.jsx)(d.S,{onClick:x,size:"sm",style:{gap:"0.375rem"},children:(0,t.jsxs)(t.Fragment,c?{children:["Copied",(0,t.jsx)(n.A,{size:16})]}:{children:["Copy",(0,t.jsx)(o.A,{size:16})]})})]}:{children:[(0,t.jsx)(h,{title:e,className:l,children:(0,s.c)(e)}),r&&(0,t.jsx)(d.S,{onClick:x,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,t.jsxs)(t.Fragment,c?{children:["Copied",(0,t.jsx)(n.A,{size:14})]}:{children:["Copy",(0,t.jsx)(o.A,{size:14})]})})]})},p=l.I4.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,h=l.I4.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,u=l.I4.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},67635:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},68753:(e,r,i)=>{i.d(r,{B:()=>o,a:()=>n});var t=i(51862);let n=(0,t.AH)`
  && {
    border-width: 1px;
    padding: 0.5rem 1rem;
  }

  width: 100%;
  text-align: left;
  border: solid 1px var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${e=>"error"===e.$state?"\n        border-color: var(--privy-color-error);\n        background: var(--privy-color-error-bg);\n      ":""}
`,o=t.I4.div`
  ${n}
`},78340:(e,r,i)=>{i.d(r,{A:()=>s});var t=i(12115);let n=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,i)=>i?i.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},o=(...e)=>e.filter((e,r,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===r).join(" ").trim();var a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:i=2,absoluteStrokeWidth:n,className:l="",children:s,iconNode:d,...c},p)=>(0,t.createElement)("svg",{ref:p,...a,width:r,height:r,stroke:e,strokeWidth:n?24*Number(i)/Number(r):i,className:o("lucide",l),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let i=(0,t.forwardRef)(({className:i,...a},s)=>(0,t.createElement)(l,{ref:s,iconNode:r,className:o(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...a}));return i.displayName=n(e),i}},94514:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98590:(e,r,i)=>{i.d(r,{N:()=>o});var t=i(95155),n=i(51862);let o=({size:e,centerIcon:r})=>(0,t.jsx)(a,{$size:e,children:(0,t.jsxs)(l,{children:[(0,t.jsx)(d,{}),(0,t.jsx)(c,{}),r?(0,t.jsx)(s,{children:r}):null]})}),a=n.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=n.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=n.I4.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  svg,
  img {
    width: calc(var(--spinner-size) * 0.4);
    height: calc(var(--spinner-size) * 0.4);
    border-radius: var(--privy-border-radius-full);
  }
`,d=n.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,c=n.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);
  animation: spin 1200ms linear infinite;

  && {
    border: 4px solid;
    border-color: var(--privy-color-icon-subtle) transparent transparent transparent;
    border-radius: 50%;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`},98910:(e,r,i)=>{i.d(r,{E:()=>n});var t=i(51862);let n=t.I4.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`}}]);