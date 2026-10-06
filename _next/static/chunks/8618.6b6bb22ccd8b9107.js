"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8618],{8618:(e,r,i)=>{i.r(r),i.d(r,{DelegatedActionsConsentScreen:()=>x,DelegatedActionsConsentScreenView:()=>g,default:()=>x});var t=i(95155),n=i(13545),a=i(52484);let o=(0,i(78340).A)("cloud-upload",[["path",{d:"M12 13v8",key:"1l5pq0"}],["path",{d:"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",key:"1pljnt"}],["path",{d:"m8 17 4-4 4 4",key:"1quai1"}]]);var l=i(12115),s=i(55134),c=i(51774),d=i(37857),p=i(69704),h=i(73532),u=i(50023);let g=({appName:e,address:r,success:i,error:l,onAccept:c,onDecline:d,onClose:p})=>(0,t.jsx)(u.S,i||l?{title:l?"Something went wrong":"Success!",subtitle:l?"Please try again.":`You've successfully granted delegated action permissions to ${e}.`,icon:l?n.A:a.A,iconVariant:l?"error":"success",onBack:p,watermark:!0}:{title:"Enable offline access",subtitle:`By confirming, ${e} will be able to use your wallet for you even when you're not around. You can revoke this later.`,icon:o,primaryCta:{label:"Accept",onClick:c},secondaryCta:{label:"Not now",onClick:d},onBack:p,watermark:!0,children:(0,t.jsx)(s.W,{address:r,title:"Wallet"})}),x={component:()=>{let{data:e}=(0,h.u)(),r=(0,c.a)(),{closePrivyModal:i}=(0,p.u)(),[n,a]=(0,l.useState)(!1),[o,s]=(0,l.useState)(),{address:u,onDelegate:x,onSuccess:v,onError:m}=e.delegatedActions.consent,f=async()=>{n?v():m(o??new d.P("User declined delegating actions.")),i({shouldCallAuthOnSuccess:!1})};return(0,l.useEffect)(()=>{if(!n&&!o)return;let e=setTimeout(f,c.T);return()=>clearTimeout(e)},[n,o]),(0,t.jsx)(g,{appName:r.name,address:u,success:n,error:o,onAccept:async()=>{try{await x(),a(!0)}catch(e){s(e)}},onDecline:()=>{f()},onClose:f})}}},13545:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},16137:(e,r,i)=>{i.d(r,{L:()=>n});var t=i(51862);let n=t.I4.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},49579:(e,r,i)=>{i.d(r,{S:()=>k});var t=i(95155),n=i(12115),a=i(51862),o=i(57445),l=i(10308),s=i(97677),c=i(98590);let d=a.I4.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,h=a.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,a.I4)(s.M)`
  margin: 0 -8px;
`,g=a.I4.div`
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
`,x=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=a.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,m=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=a.I4.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=a.I4.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,b=a.I4.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"warning":return"var(--privy-color-warn)";case"error":return"var(--privy-color-error-bg)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,w=a.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,j=a.I4.div`
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
`,k=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(p,{...r,children:e})}),I=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,a.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,A=a.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,t.jsx)(I,{children:(0,t.jsx)(A,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:i,iconVariant:n,iconLoadingStatus:a,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:p,step:g,headerTitle:x,eyebrow:b,...w})=>(0,t.jsxs)(h,{...w,children:[(0,t.jsx)(u,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:x,eyebrow:b,closeable:d}),(i||n||e||r)&&(0,t.jsxs)(v,{children:[i||n?(0,t.jsx)(k.Icon,{icon:i,variant:n,loadingStatus:a}):null,!(!e&&!r)&&(0,t.jsxs)(m,{children:[e&&(0,t.jsx)(f,{children:e}),r&&(0,t.jsx)(y,{children:r})]})]}),g&&(0,t.jsx)(C,{step:g})]}),(k.Body=n.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,t.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,t.jsx)(S,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,t.jsx)($,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),k.Watermark=()=>(0,t.jsx)(z,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(w,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(o.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(b,{$variant:r,children:(0,t.jsx)(c.N,{size:"64px"})}):(0,t.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=a.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,$=a.I4.div`
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
`,E=a.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>o});var t=i(95155),n=i(97677),a=i(49579);let o=({primaryCta:e,secondaryCta:r,helpText:i,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,t.jsx)(n.B,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,t.jsx)(n.B,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,t.jsx)(a.S.Header,{...c}),s?(0,t.jsx)(a.S.Body,{children:s}):null,i||d||l?(0,t.jsxs)(a.S.Footer,{children:[i?(0,t.jsx)(a.S.HelpText,{children:i}):null,d?(0,t.jsx)(a.S.Actions,{children:d}):null,l?(0,t.jsx)(a.S.Watermark,{}):null]}):null,o?(0,t.jsx)(a.S.FooterText,{children:o}):null]})}},52484:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},55134:(e,r,i)=>{i.d(r,{W:()=>b});var t=i(95155),n=i(94514),a=i(67635),o=i(12115),l=i(51862),s=i(97677),c=i(98910),d=i(16137),p=i(67385),h=i(68753);let u=(0,l.I4)(h.B)`
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
`,m=(0,l.I4)(d.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,f=(0,l.I4)(c.E)`
  margin-top: 0.25rem;
`,y=(0,l.I4)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,b=({errMsg:e,balance:r,address:i,className:l,title:s,showCopyButton:c=!1})=>{let[d,h]=(0,o.useState)(!1);return(0,o.useEffect)(()=>{if(d){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)("div",{children:[s&&(0,t.jsx)(m,{children:s}),(0,t.jsx)(u,{className:l,$state:e?"error":void 0,children:(0,t.jsxs)(g,{children:[(0,t.jsxs)(x,{children:[(0,t.jsx)(p.A,{address:i,showCopyIcon:!1}),void 0!==r&&(0,t.jsx)(v,{children:r})]}),c&&(0,t.jsx)(y,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(i).then(()=>h(!0)).catch(console.error)},size:"sm",children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(n.A,{size:14})]}:{children:["Copy",(0,t.jsx)(a.A,{size:14})]})})]})}),e&&(0,t.jsx)(f,{children:e})]})}},67385:(e,r,i)=>{i.d(r,{A:()=>d});var t=i(95155),n=i(94514),a=i(67635),o=i(12115),l=i(51862),s=i(4104),c=i(97677);let d=({address:e,showCopyIcon:r,url:i,className:l})=>{let[d,g]=(0,o.useState)(!1);function x(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>g(!0)).catch(console.error)}return(0,o.useEffect)(()=>{if(d){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)(p,i?{children:[(0,t.jsx)(u,{title:e,className:l,href:`${i}/address/${e}`,target:"_blank",children:(0,s.c)(e)}),r&&(0,t.jsx)(c.S,{onClick:x,size:"sm",style:{gap:"0.375rem"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(n.A,{size:16})]}:{children:["Copy",(0,t.jsx)(a.A,{size:16})]})})]}:{children:[(0,t.jsx)(h,{title:e,className:l,children:(0,s.c)(e)}),r&&(0,t.jsx)(c.S,{onClick:x,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(n.A,{size:14})]}:{children:["Copy",(0,t.jsx)(a.A,{size:14})]})})]})},p=l.I4.span`
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
`},67635:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},68753:(e,r,i)=>{i.d(r,{B:()=>a,a:()=>n});var t=i(51862);let n=(0,t.AH)`
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
`,a=t.I4.div`
  ${n}
`},78340:(e,r,i)=>{i.d(r,{A:()=>s});var t=i(12115);let n=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,i)=>i?i.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},a=(...e)=>e.filter((e,r,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===r).join(" ").trim();var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:i=2,absoluteStrokeWidth:n,className:l="",children:s,iconNode:c,...d},p)=>(0,t.createElement)("svg",{ref:p,...o,width:r,height:r,stroke:e,strokeWidth:n?24*Number(i)/Number(r):i,className:a("lucide",l),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let i=(0,t.forwardRef)(({className:i,...o},s)=>(0,t.createElement)(l,{ref:s,iconNode:r,className:a(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...o}));return i.displayName=n(e),i}},94514:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98590:(e,r,i)=>{i.d(r,{N:()=>a});var t=i(95155),n=i(51862);let a=({size:e,centerIcon:r})=>(0,t.jsx)(o,{$size:e,children:(0,t.jsxs)(l,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(s,{children:r}):null]})}),o=n.I4.div`
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
`,c=n.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=n.I4.div`
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