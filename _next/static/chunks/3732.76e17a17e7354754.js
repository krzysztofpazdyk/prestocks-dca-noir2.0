"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3732],{43732:(e,r,t)=>{t.r(r),t.d(r,{PasskeyStatusScreen:()=>g,PasskeyStatusScreenView:()=>h,default:()=>g});var i=t(95155),a=t(88885),n=t(12115),o=t(51862),s=t(51774),l=t(37857),c=t(69704),d=t(73532),u=t(45054),p=t(50023);let h=({status:e,passkeySignupFlow:r=!1,error:t,onRetry:n})=>(0,i.jsx)(p.S,{title:(()=>{switch(e){case"loading":return"Waiting for passkey";case"success":return"Success";case"error":return"Something went wrong"}})(),subtitle:(0,i.jsx)(v,{children:(()=>{switch(e){case"loading":return r?"Please follow prompts to register your passkey.":"Please follow prompts to verify your passkey.\nYou will have to sign up with another method first to register a passkey for your account.";case"success":return"You've successfully logged in with your passkey.";case"error":if(t instanceof l.b){if(t.privyErrorCode===l.a.CANNOT_LINK_MORE_OF_TYPE)return"Cannot link more passkeys to account.";if(t.privyErrorCode===l.a.PASSKEY_NOT_ALLOWED)return"Passkey request timed out or rejected by user.\nYou will have to sign up with another method first to register a passkey for your account."}return"An unknown error occurred.\nYou will have to sign up with another method first to register a passkey for your account."}})()}),icon:a.A,iconVariant:"loading",iconLoadingStatus:{success:"success"===e,fail:"error"===e},primaryCta:"error"===e&&n?{label:"Retry",onClick:n}:"success"===e?{label:"Continue",disabled:!0}:void 0,watermark:!0}),g={component:()=>{let{data:e,setModalData:r,navigate:t}=(0,d.u)(),a=(0,s.a)(),{loginWithPasskey:o,signupWithPasskey:p,closePrivyModal:g,createAnalyticsEvent:v}=(0,c.u)(),{user:y,logout:f,ready:x,authenticated:m}=(0,s.u)(),{passkeySignupFlow:b}=e?.passkeyAuthModalData??{},w=s.Q-500,[k,j]=(0,n.useState)("loading"),[S,E]=(0,n.useState)(null),I=(0,n.useRef)([]),C=e=>{I.current=[e,...I.current]};(0,n.useEffect)(()=>()=>{I.current.forEach(e=>clearTimeout(e)),I.current=[]},[]);let A=async()=>{j("loading");try{b?await p():await o(),j("success")}catch(e){if(e?.privyErrorCode===l.a.USER_DOES_NOT_EXIST)return void t("AccountNotFoundScreen");if(e?.privyErrorCode===l.a.ALLOWLIST_REJECTED)return void t("AllowlistRejectionScreen");if(e?.privyErrorCode===l.a.USER_LIMIT_REACHED)return void t("UserLimitReachedScreen");E(e),j("error")}};return(0,n.useEffect)(()=>{if(x&&m&&"success"===k&&y){if(a?.legal.requireUsersAcceptTerms&&!y.hasAcceptedTerms)return void C(setTimeout(()=>{t("AffirmativeConsentScreen")},w));if(!(0,u.s)(y,a?.embeddedWallets))return void C(setTimeout(()=>{g({shouldCallAuthOnSuccess:!0,isSuccess:!0})},s.Q));C(setTimeout(()=>{r({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),v({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"PasskeyStatusScreen"}}),f()},callAuthOnSuccessOnClose:!0}}),t("EmbeddedWalletOnAccountCreateScreen")},w))}},[x,m,y,k]),(0,n.useEffect)(()=>{A()},[]),(0,i.jsx)(h,{status:k,passkeySignupFlow:b,error:S,onRetry:A})}},v=o.I4.span`
  white-space: pre-wrap;
`},45054:(e,r,t)=>{t.d(r,{s:()=>a});var i=t(54479);let a=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.g)(e,r.solana.createOnLogin)},49579:(e,r,t)=>{t.d(r,{S:()=>j});var i=t(95155),a=t(12115),n=t(51862),o=t(57445),s=t(10308),l=t(97677),c=t(98590);let d=n.I4.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=n.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,n.I4)(l.M)`
  margin: 0 -8px;
`,g=n.I4.div`
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
`,v=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,y=n.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,x=n.I4.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=n.I4.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,b=n.I4.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"warning":return"var(--privy-color-warn)";case"error":return"var(--privy-color-error-bg)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,w=n.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,k=n.I4.div`
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
`,j=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(u,{...r,children:e})}),S=n.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,E=(0,n.I4)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,I=n.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,i.jsx)(S,{children:(0,i.jsx)(I,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:a,iconLoadingStatus:n,showBack:o,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:u,step:g,headerTitle:v,eyebrow:b,...w})=>(0,i.jsxs)(p,{...w,children:[(0,i.jsx)(h,{backFn:o?s:void 0,infoFn:l?c:void 0,onClose:d?u:void 0,title:v,eyebrow:b,closeable:d}),(t||a||e||r)&&(0,i.jsxs)(y,{children:[t||a?(0,i.jsx)(j.Icon,{icon:t,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(x,{children:e}),r&&(0,i.jsx)(m,{children:r})]})]}),g&&(0,i.jsx)(C,{step:g})]}),(j.Body=a.forwardRef(({children:e,...r},t)=>(0,i.jsx)(g,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(z,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(E,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,i.jsx)(k,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(o.C,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(c.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let A=n.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,z=n.I4.div`
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
`,T=n.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,t)=>{t.d(r,{S:()=>o});var i=t(95155),a=t(97677),n=t(49579);let o=({primaryCta:e,secondaryCta:r,helpText:t,footerText:o,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(a.B,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(a.B,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),l?(0,i.jsx)(n.S.Body,{children:l}):null,t||d||s?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,s?(0,i.jsx)(n.S.Watermark,{}):null]}):null,o?(0,i.jsx)(n.S.FooterText,{children:o}):null]})}},78340:(e,r,t)=>{t.d(r,{A:()=>l});var i=t(12115);let a=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,t)=>t?t.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},n=(...e)=>e.filter((e,r,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===r).join(" ").trim();var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let s=(0,i.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:a,className:s="",children:l,iconNode:c,...d},u)=>(0,i.createElement)("svg",{ref:u,...o,width:r,height:r,stroke:e,strokeWidth:a?24*Number(t)/Number(r):t,className:n("lucide",s),...!l&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,i.createElement)(e,r)),...Array.isArray(l)?l:[l]])),l=(e,r)=>{let t=(0,i.forwardRef)(({className:t,...o},l)=>(0,i.createElement)(s,{ref:l,iconNode:r,className:n(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...o}));return t.displayName=a(e),t}},88885:(e,r,t)=>{t.d(r,{A:()=>i});let i=(0,t(78340).A)("fingerprint-pattern",[["path",{d:"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",key:"1nerag"}],["path",{d:"M14 13.12c0 2.38 0 6.38-1 8.88",key:"o46ks0"}],["path",{d:"M17.29 21.02c.12-.6.43-2.3.5-3.02",key:"ptglia"}],["path",{d:"M2 12a10 10 0 0 1 18-6",key:"ydlgp0"}],["path",{d:"M2 16h.01",key:"1gqxmh"}],["path",{d:"M21.8 16c.2-2 .131-5.354 0-6",key:"drycrb"}],["path",{d:"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",key:"1tidbn"}],["path",{d:"M8.65 22c.21-.66.45-1.32.57-2",key:"13wd9y"}],["path",{d:"M9 6.8a6 6 0 0 1 9 5.2v2",key:"1fr1j5"}]])},98590:(e,r,t)=>{t.d(r,{N:()=>n});var i=t(95155),a=t(51862);let n=({size:e,centerIcon:r})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),o=a.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=a.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=a.I4.div`
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
`,c=a.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=a.I4.div`
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