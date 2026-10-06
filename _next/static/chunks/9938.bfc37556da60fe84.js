"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9938],{19938:(e,r,i)=>{i.r(r),i.d(r,{ConnectLedgerScreen:()=>d,ConnectLedgerScreenComponent:()=>c,ConnectLedgerScreenView:()=>s,default:()=>d});var n=i(95155),t=i(51862),a=i(73532),o=i(50023);let l=e=>(0,n.jsx)("svg",{id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",viewBox:"-0.625 12.48 397.647 399.546",width:"2500",height:"674",preserveAspectRatio:"none",...e,children:(0,n.jsx)("g",{children:(0,n.jsx)("path",{fill:"#333745",d:"M 333.9 12.8 L 150.9 12.8 L 150.9 258.4 L 396.5 258.4 L 396.5 76.7 C 396.6 42.2 368.4 12.8 333.9 12.8 Z M 94.7 12.8 L 64 12.8 C 29.5 12.8 0 40.9 0 76.8 L 0 107.5 L 94.7 107.5 L 94.7 12.8 Z M 0 165 L 94.7 165 L 94.7 259.7 L 0 259.7 L 0 165 Z M 301.9 410.6 L 332.6 410.6 C 367.1 410.6 396.6 382.5 396.6 346.6 L 396.6 316 L 301.9 316 L 301.9 410.6 Z M 150.9 316 L 245.6 316 L 245.6 410.7 L 150.9 410.7 L 150.9 316 Z M 0 316 L 0 346.7 C 0 381.2 28.1 410.7 64 410.7 L 94.7 410.7 L 94.7 316 L 0 316 Z"})})}),s=({onContinueWithLedger:e,onContinueWithoutLedger:r,title:i="Using a hardware wallet?",subtitle:t="If you have a Ledger connected,\ncontinue to sign with Ledger"})=>(0,n.jsx)(o.S,{title:i,subtitle:(0,n.jsx)(g,{children:t}),primaryCta:{label:"Continue with Ledger",onClick:e},secondaryCta:{label:"Continue without Ledger",onClick:r},watermark:!0,children:(0,n.jsx)(p,{children:(0,n.jsx)(l,{style:{width:"48px",height:"48px"}})})});function c(){let{data:e,setModalData:r,navigate:i}=(0,a.u)();return(0,n.jsx)(s,{onContinueWithLedger:function(){r({...e,login:{...e?.login,isSigningInWithLedgerSolana:!0}}),i("ConnectionStatusScreen")},onContinueWithoutLedger:function(){r({...e,login:{...e?.login,isSigningInWithLedgerSolana:!1}}),i("ConnectionStatusScreen")}})}let d={component:c},p=t.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: var(--screen-space);
`,g=t.I4.span`
  white-space: pre-wrap;
`},49579:(e,r,i)=>{i.d(r,{S:()=>L});var n=i(95155),t=i(12115),a=i(51862),o=i(57445),l=i(10308),s=i(97677),c=i(98590);let d=a.I4.div`
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
`,g=a.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,a.I4)(s.M)`
  margin: 0 -8px;
`,u=a.I4.div`
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
`,f=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,m=a.I4.h3`
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
`,L=({children:e,...r})=>(0,n.jsx)(d,{children:(0,n.jsx)(p,{...r,children:e})}),k=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,I=(0,a.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,C=a.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,n.jsx)(k,{children:(0,n.jsx)(C,{pct:Math.min(100,e.current/e.total*100)})}):null;L.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:a,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:p,step:u,headerTitle:x,eyebrow:b,...w})=>(0,n.jsxs)(g,{...w,children:[(0,n.jsx)(h,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:x,eyebrow:b,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(v,{children:[i||t?(0,n.jsx)(L.Icon,{icon:i,variant:t,loadingStatus:a}):null,!(!e&&!r)&&(0,n.jsxs)(f,{children:[e&&(0,n.jsx)(m,{children:e}),r&&(0,n.jsx)(y,{children:r})]})]}),u&&(0,n.jsx)(S,{step:u})]}),(L.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(u,{ref:i,...r,children:e}))).displayName="Screen.Body",L.Footer=({children:e,...r})=>(0,n.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),L.Actions=({children:e,...r})=>(0,n.jsx)(z,{...r,children:e}),L.HelpText=({children:e,...r})=>(0,n.jsx)($,{...r,children:e}),L.FooterText=({children:e,...r})=>(0,n.jsx)(E,{...r,children:e}),L.Watermark=()=>(0,n.jsx)(I,{}),L.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(w,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(j,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(o.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(b,{$variant:r,children:(0,n.jsx)(c.N,{size:"64px"})}):(0,n.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let z=a.I4.div`
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
`},50023:(e,r,i)=>{i.d(r,{S:()=>o});var n=i(95155),t=i(97677),a=i(49579);let o=({primaryCta:e,secondaryCta:r,helpText:i,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,n.jsx)(t.B,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,n.jsx)(t.B,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,n.jsx)(a.S.Header,{...c}),s?(0,n.jsx)(a.S.Body,{children:s}):null,i||d||l?(0,n.jsxs)(a.S.Footer,{children:[i?(0,n.jsx)(a.S.HelpText,{children:i}):null,d?(0,n.jsx)(a.S.Actions,{children:d}):null,l?(0,n.jsx)(a.S.Watermark,{}):null]}):null,o?(0,n.jsx)(a.S.FooterText,{children:o}):null]})}},98590:(e,r,i)=>{i.d(r,{N:()=>a});var n=i(95155),t=i(51862);let a=({size:e,centerIcon:r})=>(0,n.jsx)(o,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(s,{children:r}):null]})}),o=t.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=t.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=t.I4.div`
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
`,c=t.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=t.I4.div`
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
`}}]);