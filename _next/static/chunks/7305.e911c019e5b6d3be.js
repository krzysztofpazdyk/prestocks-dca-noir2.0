"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7305],{7894:(e,r,t)=>{t.d(r,{T:()=>a});var i=t(95155);function a(e){return(0,i.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",...e,children:[(0,i.jsx)("rect",{width:"512",height:"512",rx:"15%",fill:"#37aee2"}),(0,i.jsx)("path",{fill:"#c8daea",d:"M199 404c-11 0-10-4-13-14l-32-105 245-144"}),(0,i.jsx)("path",{fill:"#a9c9dd",d:"M199 404c7 0 11-4 16-8l45-43-56-34"}),(0,i.jsx)("path",{fill:"#f6fbfe",d:"M204 319l135 99c14 9 26 4 30-14l55-258c5-22-9-32-24-25L79 245c-21 8-21 21-4 26l83 26 190-121c9-5 17-3 11 4"})]})}},45054:(e,r,t)=>{t.d(r,{s:()=>a});var i=t(54479);let a=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.g)(e,r.solana.createOnLogin)},49579:(e,r,t)=>{t.d(r,{S:()=>S});var i=t(95155),a=t(12115),n=t(51862),o=t(57445),l=t(10308),s=t(97677),c=t(98590);let d=n.I4.div`
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
`,g=(0,n.I4)(s.M)`
  margin: 0 -8px;
`,h=n.I4.div`
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
`,x=n.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,m=n.I4.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=n.I4.p`
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
`,j=n.I4.div`
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
`,S=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(u,{...r,children:e})}),k=n.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,I=(0,n.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,T=n.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,A=({step:e})=>e?(0,i.jsx)(k,{children:(0,i.jsx)(T,{pct:Math.min(100,e.current/e.total*100)})}):null;S.Header=({title:e,subtitle:r,icon:t,iconVariant:a,iconLoadingStatus:n,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:u,step:h,headerTitle:v,eyebrow:b,...w})=>(0,i.jsxs)(p,{...w,children:[(0,i.jsx)(g,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?u:void 0,title:v,eyebrow:b,closeable:d}),(t||a||e||r)&&(0,i.jsxs)(x,{children:[t||a?(0,i.jsx)(S.Icon,{icon:t,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(m,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),h&&(0,i.jsx)(A,{step:h})]}),(S.Body=a.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",S.Footer=({children:e,...r})=>(0,i.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),S.Actions=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),S.HelpText=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),S.FooterText=({children:e,...r})=>(0,i.jsx)(R,{...r,children:e}),S.Watermark=()=>(0,i.jsx)(I,{}),S.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,i.jsx)(j,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(o.C,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(c.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=n.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,C=n.I4.div`
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
`,R=n.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,t)=>{t.d(r,{S:()=>o});var i=t(95155),a=t(97677),n=t(49579);let o=({primaryCta:e,secondaryCta:r,helpText:t,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(a.B,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(a.B,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),s?(0,i.jsx)(n.S.Body,{children:s}):null,t||d||l?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,l?(0,i.jsx)(n.S.Watermark,{}):null]}):null,o?(0,i.jsx)(n.S.FooterText,{children:o}):null]})}},87305:(e,r,t)=>{t.r(r),t.d(r,{TelegramAuthScreen:()=>h,TelegramAuthScreenView:()=>g,default:()=>h});var i=t(95155),a=t(12115),n=t(54479),o=t(51774),l=t(37857),s=t(69704),c=t(73532),d=t(45054),u=t(50023),p=t(7894);let g=({success:e,errorMessage:r,onRetry:t})=>{let a=e?"Successfully connected with Telegram":r?r.message:"Verifying connection to Telegram";return(0,i.jsx)(u.S,{title:a,subtitle:e?"You're good to go!":r?r.detail:"Just a few moments more",icon:p.T,iconVariant:"loading",iconLoadingStatus:{success:e,fail:!!r},secondaryCta:r?.retryable&&t?{label:"Retry",onClick:t}:void 0,watermark:!0})},h={component:()=>{let{authenticated:e,logout:r,ready:t,user:u}=(0,o.u)(),{setModalData:p,navigate:h,resetNavigation:v,data:x}=(0,c.u)(),f=(0,o.a)(),{initLoginWithTelegram:m,loginWithTelegram:y,updateWallets:b,setReadyToTrue:w,closePrivyModal:j,createAnalyticsEvent:S,getAuthMeta:k}=(0,s.u)(),[I,T]=(0,a.useState)(!1),[A,E]=(0,a.useState)(void 0),C=(0,n.a)();async function R(){try{let r=await async function(){let r;if(!e){if(C.enabled&&"error"===C.status)throw new n.C(C.error,null,l.a.CAPTCHA_FAILURE);return C.enabled&&"success"!==C.status&&(C.execute(),r=await C.waitForResult()),r}}();await y({captchaToken:r}),T(!0),w(!0)}catch(t){if(t?.privyErrorCode===l.a.ALLOWLIST_REJECTED)return E(void 0),v(),void h("AllowlistRejectionScreen");if(t?.privyErrorCode===l.a.USER_LIMIT_REACHED)return console.error(new l.j(t).toString()),E(void 0),v(),void h("UserLimitReachedScreen");if(t?.privyErrorCode===l.a.USER_DOES_NOT_EXIST)return E(void 0),v(),void h("AccountNotFoundScreen");if(t?.privyErrorCode===l.a.ACCOUNT_TRANSFER_REQUIRED&&t.data?.data?.nonce)return E(void 0),v(),p({accountTransfer:{nonce:t.data?.data?.nonce,account:t.data?.data?.subject,telegramAuthResult:k()?.telegramAuthResult,telegramWebAppData:k()?.telegramWebAppData,displayName:t.data?.data?.account?.displayName,linkMethod:"telegram",embeddedWalletAddress:t.data?.data?.otherUser?.embeddedWalletAddress}}),void h("LinkConflictScreen");let{retryable:e,detail:r}=(0,n.l)(t);E({retryable:e,detail:r,message:"Authentication failed"})}}return(0,a.useEffect)(()=>{R()},[]),(0,a.useEffect)(()=>{if(!(t&&e&&I&&u))return;if(f?.legal.requireUsersAcceptTerms&&!u.hasAcceptedTerms){let e=setTimeout(()=>{h("AffirmativeConsentScreen")},o.Q);return()=>clearTimeout(e)}if((0,d.s)(u,f.embeddedWallets)){let e=setTimeout(()=>{p({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),S({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,provider:"telegram",screen:"TelegramAuthScreen"}}),r()},callAuthOnSuccessOnClose:!0}}),h("EmbeddedWalletOnAccountCreateScreen")},o.Q);return()=>clearTimeout(e)}b();let i=setTimeout(()=>j({shouldCallAuthOnSuccess:!0,isSuccess:!0}),o.Q);return()=>clearTimeout(i)},[t,e,I,u]),(0,i.jsx)(g,{success:I,errorMessage:A,onRetry:A?.retryable?async()=>{try{E(void 0),x?.telegramAuthModalData?.seamlessAuth||await m(void 0,x?.login?.disableSignup),await R()}catch(t){let{retryable:e,detail:r}=(0,n.l)(t);E({retryable:e,detail:r,message:"Authentication failed"})}}:void 0})},isCaptchaRequired:!0,isShownBeforeReady:!0}},98590:(e,r,t)=>{t.d(r,{N:()=>n});var i=t(95155),a=t(51862);let n=({size:e,centerIcon:r})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),o=a.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=a.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=a.I4.div`
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