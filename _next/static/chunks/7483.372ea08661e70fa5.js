"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7483],{7483:(e,r,t)=>{t.r(r),t.d(r,{EmbeddedWalletConnectingScreen:()=>u,EmbeddedWalletConnectingView:()=>p,default:()=>u});var i=t(95155),n=t(62791),a=t(12115),o=t(54479),l=t(69704),s=t(73532),c=t(51774),d=t(50023);let p=({connectionFailed:e,onClose:r})=>(0,i.jsx)(d.S,e?{title:"Something went wrong",subtitle:"We're on it. Please try again later.",icon:n.A,iconVariant:"error",primaryCta:{label:"Close",onClick:r},watermark:!0}:{title:"Connecting to your wallet",subtitle:"Please wait...",iconVariant:"loading",showClose:!0,onClose:r,watermark:!1}),u={component:()=>{let{authenticated:e,user:r}=(0,c.u)(),{client:t,closePrivyModal:n,createAnalyticsEvent:d,walletProxy:u}=(0,l.u)(),{navigate:h,data:v,setModalData:g,onUserCloseViaDialogOrKeybindRef:x}=(0,s.u)(),y=(0,a.useMemo)(()=>Date.now(),[]),[f,m]=(0,a.useState)(!1),{onCompleteNavigateTo:b,onFailure:w,shouldForceMFA:j,entropyId:k,entropyIdVerifier:I,recoveryMethod:C,connectingWalletAddress:S,isUnifiedWallet:A=!1}=v?.connectWallet??{},z=e=>{f||(m(!0),w("string"==typeof e?Error(e):e))};(0,a.useEffect)(()=>{let r;return e?u?((async()=>{let e=await t.getAccessToken();if(!e)return z("User must be authenticated and have a Privy wallet before it can be connected");try{if(!A){if(!k||!I)return z("For on-device first-class chain wallets, entropyId and entropyIdVerifier are required");await u.connect({accessToken:e,entropyId:k,entropyIdVerifier:I})}j&&await u.verifyMfa({accessToken:e});let t=(Date.now()-y)/1e3;"EmbeddedWalletKeyExportScreen"===b&&t<1?r=setTimeout(()=>{h(b,!1)},1e3*(1-t)):h(b,!1)}catch(e){if((0,o.e)(e)&&"privy"===C){let e=await t.getAccessToken();if(!e)return z("User must be authenticated and have a Privy wallet before it can be recovered");try{d({eventName:"embedded_wallet_pinless_recovery_started",payload:{walletAddress:S}});let r=await u?.recover({accessToken:e,entropyId:k,entropyIdVerifier:I});r?.entropyId||z(Error("Unable to recover wallet")),b?h(b):n({shouldCallAuthOnSuccess:!1}),d({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:S}}),h(b)}catch(e){z("An error has occurred, please try again.")}}else(0,o.e)(e)&&"privy"!==C&&"privy-v2"!==C?(g({...v,recoverWallet:{entropyId:k,entropyIdVerifier:I,onCompleteNavigateTo:b,onFailure:w},recoveryOAuthStatus:{provider:C,action:"recover",isInAccountCreateFlow:!1,shouldCreateEth:!1,shouldCreateSol:!1}}),h((0,o.b)(C))):z(e)}})(),()=>clearTimeout(r)):void 0:z("User must be authenticated and have a Privy wallet before it can be connected")},[e,r,u]);let E=()=>{z("User exited before wallet could be connected"),n({shouldCallAuthOnSuccess:!1})};return x.current=E,(0,i.jsx)(p,{connectionFailed:f,onClose:E})}}},49579:(e,r,t)=>{t.d(r,{S:()=>k});var i=t(95155),n=t(12115),a=t(51862),o=t(57445),l=t(10308),s=t(97677),c=t(98590);let d=a.I4.div`
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
`,u=a.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,a.I4)(s.M)`
  margin: 0 -8px;
`,v=a.I4.div`
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
`,g=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=a.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,y=a.I4.div`
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
`,m=a.I4.p`
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
`,k=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(p,{...r,children:e})}),I=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,a.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=a.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,A=({step:e})=>e?(0,i.jsx)(I,{children:(0,i.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:t,iconVariant:n,iconLoadingStatus:a,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:p,step:v,headerTitle:g,eyebrow:b,...w})=>(0,i.jsxs)(u,{...w,children:[(0,i.jsx)(h,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:g,eyebrow:b,closeable:d}),(t||n||e||r)&&(0,i.jsxs)(x,{children:[t||n?(0,i.jsx)(k.Icon,{icon:t,variant:n,loadingStatus:a}):null,!(!e&&!r)&&(0,i.jsxs)(y,{children:[e&&(0,i.jsx)(f,{children:e}),r&&(0,i.jsx)(m,{children:r})]})]}),v&&(0,i.jsx)(A,{step:v})]}),(k.Body=n.forwardRef(({children:e,...r},t)=>(0,i.jsx)(v,{ref:t,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,i.jsx)(z,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,i.jsx)(N,{...r,children:e}),k.Watermark=()=>(0,i.jsx)(C,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,i.jsx)(j,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(o.C,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(c.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let z=a.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=a.I4.div`
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
`,N=a.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,t)=>{t.d(r,{S:()=>o});var i=t(95155),n=t(97677),a=t(49579);let o=({primaryCta:e,secondaryCta:r,helpText:t,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,a=t.variant||"primary";return(0,i.jsx)(n.B,{...t,variant:a,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,a=t.variant||"secondary";return(0,i.jsx)(n.B,{...t,variant:a,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,i.jsx)(a.S.Header,{...c}),s?(0,i.jsx)(a.S.Body,{children:s}):null,t||d||l?(0,i.jsxs)(a.S.Footer,{children:[t?(0,i.jsx)(a.S.HelpText,{children:t}):null,d?(0,i.jsx)(a.S.Actions,{children:d}):null,l?(0,i.jsx)(a.S.Watermark,{}):null]}):null,o?(0,i.jsx)(a.S.FooterText,{children:o}):null]})}},62791:(e,r,t)=>{t.d(r,{A:()=>i});let i=(0,t(78340).A)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},78340:(e,r,t)=>{t.d(r,{A:()=>s});var i=t(12115);let n=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,t)=>t?t.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},a=(...e)=>e.filter((e,r,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===r).join(" ").trim();var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,i.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:n,className:l="",children:s,iconNode:c,...d},p)=>(0,i.createElement)("svg",{ref:p,...o,width:r,height:r,stroke:e,strokeWidth:n?24*Number(t)/Number(r):t,className:a("lucide",l),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,i.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let t=(0,i.forwardRef)(({className:t,...o},s)=>(0,i.createElement)(l,{ref:s,iconNode:r,className:a(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...o}));return t.displayName=n(e),t}},98590:(e,r,t)=>{t.d(r,{N:()=>a});var i=t(95155),n=t(51862);let a=({size:e,centerIcon:r})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),o=n.I4.div`
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
`}}]);