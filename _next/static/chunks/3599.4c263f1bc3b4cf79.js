"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3599],{23782:(e,r,t)=>{t.d(r,{e:()=>i});function i(e){return e.charAt(0).toUpperCase()+e.slice(1)}},45054:(e,r,t)=>{t.d(r,{s:()=>n});var i=t(54479);let n=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.g)(e,r.solana.createOnLogin)},49579:(e,r,t)=>{t.d(r,{S:()=>k});var i=t(95155),n=t(12115),o=t(51862),a=t(57445),s=t(10308),l=t(97677),c=t(98590);let d=o.I4.div`
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
`,u=o.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,g=(0,o.I4)(l.M)`
  margin: 0 -8px;
`,h=o.I4.div`
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
`,v=o.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,m=o.I4.div`
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
`,x=o.I4.p`
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
`,E=o.I4.div`
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
`,k=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(p,{...r,children:e})}),S=o.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,j=(0,o.I4)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,A=o.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,I=({step:e})=>e?(0,i.jsx)(S,{children:(0,i.jsx)(A,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:t,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:p,step:h,headerTitle:v,eyebrow:b,...w})=>(0,i.jsxs)(u,{...w,children:[(0,i.jsx)(g,{backFn:a?s:void 0,infoFn:l?c:void 0,onClose:d?p:void 0,title:v,eyebrow:b,closeable:d}),(t||n||e||r)&&(0,i.jsxs)(m,{children:[t||n?(0,i.jsx)(k.Icon,{icon:t,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(y,{children:e}),r&&(0,i.jsx)(x,{children:r})]})]}),h&&(0,i.jsx)(I,{step:h})]}),(k.Body=n.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,i.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,i.jsx)(_,{...r,children:e}),k.Watermark=()=>(0,i.jsx)(j,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,i.jsx)(E,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.C,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(c.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let T=o.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,C=o.I4.div`
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
`,_=o.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},75131:(e,r,t)=>{t.d(r,{A:()=>n});var i=t(12115);let n=i.forwardRef(function({title:e,titleId:r,...t},n){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?i.createElement("title",{id:r},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"}))})},98590:(e,r,t)=>{t.d(r,{N:()=>o});var i=t(95155),n=t(51862);let o=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),a=n.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=n.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=n.I4.div`
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
`},99949:(e,r,t)=>{t.r(r),t.d(r,{OAuthStatusScreen:()=>E,OAuthStatusScreenView:()=>w,default:()=>E});var i=t(95155),n=t(12115),o=t(51774),a=t(63874),s=t(75131),l=t(46797),c=t(7894),d=t(37857),p=t(69704),u=t(73532),g=t(45054),h=t(50023),v=t(23782),m=t(54479);let f=({style:e})=>(0,i.jsx)(s.A,{style:{color:"var(--privy-color-error)",...e}}),y={google:{name:"Google",component:a.G},discord:{name:"Discord",component:a.D},github:{name:"Github",component:a.b},linkedin:{name:"LinkedIn",component:a.L},twitter:{name:"Twitter",component:a.a},spotify:{name:"Spotify",component:a.S},instagram:{name:"Instagram",component:a.I},tiktok:{name:"Tiktok",component:a.T},line:{name:"LINE",component:l.L},twitch:{name:"Twitch",component:l.T},apple:{name:"Apple",component:a.A},telegram:{name:"Telegram",component:c.T}},x=({iconUrl:e,...r})=>n.createElement("svg",{width:"33",height:"32",viewBox:"0 0 33 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...r},n.createElement("foreignObject",{x:"2",y:"2",width:"29",height:"28"},n.createElement("img",{src:e,width:"29",height:"28",style:{display:"block",objectFit:"contain",borderRadius:"4px"},alt:"Provider icon"}))),b=(e,r)=>{if(e in y)return y[e];if((0,o.i)(e)&&r){let t=r.find(r=>r.provider===e);if(t)return{name:t.provider_display_name,component:e=>n.createElement(x,{...e,iconUrl:t.provider_icon_url})}}return{name:"Unknown",component:f}},w=({providerName:e,ProviderLogo:r,success:t,errorMessage:n,onRetry:o})=>{let a=t?`Successfully connected with ${e}`:n?n.message:`Verifying connection to ${e}`;return(0,i.jsx)(h.S,{title:a,subtitle:t?"You're good to go!":n?n.detail:"Just a few moments more",icon:r,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!n},secondaryCta:n?.retryable&&o?{label:"Retry",onClick:o}:void 0,watermark:!0})},E={component:()=>{let{authenticated:e,logout:r,ready:t,user:a}=(0,o.u)(),{setModalData:s,navigate:l,resetNavigation:c}=(0,u.u)(),h=(0,o.a)(),{getAuthMeta:f,initLoginWithOAuth:y,loginWithOAuth:x,updateWallets:E,setReadyToTrue:k,closePrivyModal:S,createAnalyticsEvent:j}=(0,p.u)(),[A,I]=(0,n.useState)(!1),[T,C]=(0,n.useState)(void 0),_=f()?.provider||"google",{name:O,component:N}=b(_,h.customOAuthProviders);return(0,n.useEffect)(()=>{x(_).then(()=>{I(!0),k(!0)}).catch(e=>{if(k(!1),e?.privyErrorCode===d.a.ALLOWLIST_REJECTED)return C(void 0),c(),void l("AllowlistRejectionScreen");if(e?.privyErrorCode===d.a.USER_LIMIT_REACHED)return console.error(new d.j(e).toString()),C(void 0),c(),void l("UserLimitReachedScreen");if(e?.privyErrorCode===d.a.USER_DOES_NOT_EXIST)return C(void 0),c(),void l("AccountNotFoundScreen");if(e?.privyErrorCode===d.a.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce)return C(void 0),c(),s({accountTransfer:{nonce:e.data?.data?.nonce,account:e.data?.data?.subject,displayName:e.data?.data?.account?.displayName,linkMethod:f()?.provider,embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress,oAuthUserInfo:e.data?.data?.otherUser?.oAuthUserInfo}}),void l("LinkConflictScreen");let{retryable:r,detail:t}=function(e,r,t){let i={detail:"",retryable:!1},n=(0,v.e)(r);if(e?.privyErrorCode===d.a.LINKED_TO_ANOTHER_USER&&(i.detail="This account has already been linked to another user."),e?.privyErrorCode===d.a.INVALID_CREDENTIALS&&(i.retryable=!0,i.detail="Something went wrong. Try again."),e.privyErrorCode===d.a.OAUTH_USER_DENIED&&(i.detail=`Retry and check ${n} to finish connecting your account.`,i.retryable=!0),e?.privyErrorCode===d.a.TOO_MANY_REQUESTS&&(i.detail="Too many requests. Please wait before trying again."),e?.privyErrorCode===d.a.TOO_MANY_REQUESTS&&e.message.includes("provider rate limit")){let e=b(r,t).name;i.detail=`Request limit reached for ${e}. Please wait a moment and try again.`}if(e?.privyErrorCode===d.a.OAUTH_ACCOUNT_SUSPENDED){let e=b(r,t).name;i.detail=`Your ${e} account is suspended. Please try another login method.`}return e?.privyErrorCode===d.a.CANNOT_LINK_MORE_OF_TYPE&&(i.detail="You cannot authorize more than one account for this user."),e?.privyErrorCode===d.a.OAUTH_UNEXPECTED&&r.startsWith("privy:")&&(i.detail="Something went wrong. Please try again."),i}(e,_,h.customOAuthProviders);C({retryable:r,detail:t,message:"Authentication failed"})}).finally(()=>{(0,m.k)()})},[O,_]),(0,n.useEffect)(()=>{if(t&&e&&A&&a){if(h?.legal.requireUsersAcceptTerms&&!a.hasAcceptedTerms){let e=setTimeout(()=>{l("AffirmativeConsentScreen")},o.Q);return()=>clearTimeout(e)}if((0,g.s)(a,h.embeddedWallets)){let e=setTimeout(()=>{s({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),j({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,provider:_,screen:"OAuthStatusScreen"}}),r()},callAuthOnSuccessOnClose:!0}}),l("EmbeddedWalletOnAccountCreateScreen")},o.Q);return()=>clearTimeout(e)}{let e=setTimeout(()=>S({shouldCallAuthOnSuccess:!0,isSuccess:!0}),o.Q);return E(),()=>clearTimeout(e)}}},[t,e,A,a]),(0,i.jsx)(w,{providerName:O,ProviderLogo:N,success:A,errorMessage:T,onRetry:T?.retryable?()=>{(0,m.k)(),y(_),C(void 0)}:void 0})},isShownBeforeReady:!0}}}]);