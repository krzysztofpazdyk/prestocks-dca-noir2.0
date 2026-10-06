"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8309],{49579:(e,r,t)=>{t.d(r,{S:()=>k});var i=t(95155),a=t(12115),n=t(51862),l=t(57445),o=t(10308),s=t(97677),c=t(98590);let d=n.I4.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=n.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,n.I4)(s.M)`
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
`,x=n.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,m=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,y=n.I4.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,f=n.I4.p`
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
`,k=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(p,{...r,children:e})}),C=n.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,I=(0,n.I4)(o.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=n.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,z=({step:e})=>e?(0,i.jsx)(C,{children:(0,i.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:t,iconVariant:a,iconLoadingStatus:n,showBack:l,onBack:o,showInfo:s,onInfo:c,showClose:d,onClose:p,step:g,headerTitle:v,eyebrow:b,...w})=>(0,i.jsxs)(u,{...w,children:[(0,i.jsx)(h,{backFn:l?o:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:v,eyebrow:b,closeable:d}),(t||a||e||r)&&(0,i.jsxs)(x,{children:[t||a?(0,i.jsx)(k.Icon,{icon:t,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(m,{children:[e&&(0,i.jsx)(y,{children:e}),r&&(0,i.jsx)(f,{children:r})]})]}),g&&(0,i.jsx)(z,{step:g})]}),(k.Body=a.forwardRef(({children:e,...r},t)=>(0,i.jsx)(g,{ref:t,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,i.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,i.jsx)(W,{...r,children:e}),k.Watermark=()=>(0,i.jsx)(I,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,i.jsx)(j,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(l.C,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(c.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let A=n.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=n.I4.div`
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
`,W=n.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,t)=>{t.d(r,{S:()=>l});var i=t(95155),a=t(97677),n=t(49579);let l=({primaryCta:e,secondaryCta:r,helpText:t,footerText:l,watermark:o=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(a.B,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(a.B,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),s?(0,i.jsx)(n.S.Body,{children:s}):null,t||d||o?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,o?(0,i.jsx)(n.S.Watermark,{}):null]}):null,l?(0,i.jsx)(n.S.FooterText,{children:l}):null]})}},62791:(e,r,t)=>{t.d(r,{A:()=>i});let i=(0,t(78340).A)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},68309:(e,r,t)=>{t.r(r),t.d(r,{EmbeddedWalletOnAccountCreateScreen:()=>x,EmbeddedWalletOnAccountCreateView:()=>v,default:()=>x});var i=t(95155),a=t(62791),n=t(12115),l=t(31794),o=t(51774),s=t(33031),c=t(37857),d=t(69704),p=t(54479),u=t(73532),h=t(29441),g=t(50023);let v=({errorMessage:e,onClose:r})=>(0,i.jsx)(g.S,e?{title:"Something went wrong",subtitle:e,icon:a.A,iconVariant:"error",primaryCta:{label:"Close",onClick:r},watermark:!0}:{title:"Creating your wallet",subtitle:"Please wait...",iconVariant:"loading",watermark:!1}),x={component:()=>{let{setModalData:e,navigate:r,data:t,onUserCloseViaDialogOrKeybindRef:a}=(0,u.u)(),g=(0,o.a)(),[x,m]=(0,n.useState)(""),{embeddedWallets:y}=(0,o.a)(),{authenticated:f,user:b}=(0,o.u)(),{closePrivyModal:w,walletProxy:j,client:k}=(0,d.u)(),{onSuccess:C,onFailure:I,callAuthOnSuccessOnClose:S,shouldCreateEth:z,shouldCreateSol:A}=t.createWallet,E=(0,h.u)(),W=b?E(p.W)?.shouldCreateWallet({user:b}):void 0,$=!!b&&(0,p.s)(b,g.embeddedWallets.ethereum.createOnLogin,W),O=!!b&&(0,p.g)(b,g.embeddedWallets.solana.createOnLogin,W),N="legacy-embedded-wallets-only"===g.embeddedWallets.mode&&!0===g?.embeddedWallets.requireUserOwnedRecoveryOnCreate,[R,T]=(0,n.useState)(null),{create:F}=(0,p.n)(),U=z??$,B=A??O,L=new s.R(async()=>{let e=await k.getAccessToken();if(b&&e&&j)try{let e,t=await (0,l.J3)(b.id,"ethereum"),i=await (0,l.J3)(b.id,"solana");if(U&&B)e=await F({chainType:"ethereum",walletIndex:0,latestUser:b,idempotencyKey:t}),e=await F({chainType:"solana",walletIndex:0,latestUser:e.user,idempotencyKey:i});else if(B)e=await F({chainType:"solana",walletIndex:0,latestUser:b,idempotencyKey:i});else{if(!U)return void w({shouldCallAuthOnSuccess:S});e=await F({chainType:"ethereum",walletIndex:0,latestUser:b,idempotencyKey:t})}T(e),r("EmbeddedWalletCreatedScreen")}catch(e){m(e.message)}});return(0,n.useEffect)(()=>f&&b?N?(e({...t,createWallet:{...t.createWallet,shouldCreateEth:U,shouldCreateSol:B},recoverySelection:{...t?.recoverySelection,isInAccountCreateFlow:!0,shouldCreateEth:U,shouldCreateSol:B}}),r((0,p.v)({walletAction:"create",showAutomaticRecovery:!1,availableRecoveryMethods:y.userOwnedRecoveryOptions,legacySetWalletPasswordFlow:!1,isResettingPassword:!1}))):void L.execute():(r("LandingScreen"),void I(Error("User must be authenticated before creating a Privy wallet"))),[N,f]),a.current=()=>null,(0,i.jsx)(v,{errorMessage:x||void 0,onClose:()=>{R?(C(R),w({shouldCallAuthOnSuccess:S})):(I(new c.k("User wallet creation failed")),w({shouldCallAuthOnSuccess:!1}))}})}}},78340:(e,r,t)=>{t.d(r,{A:()=>s});var i=t(12115);let a=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,t)=>t?t.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},n=(...e)=>e.filter((e,r,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===r).join(" ").trim();var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,i.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:a,className:o="",children:s,iconNode:c,...d},p)=>(0,i.createElement)("svg",{ref:p,...l,width:r,height:r,stroke:e,strokeWidth:a?24*Number(t)/Number(r):t,className:n("lucide",o),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,i.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let t=(0,i.forwardRef)(({className:t,...l},s)=>(0,i.createElement)(o,{ref:s,iconNode:r,className:n(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...l}));return t.displayName=a(e),t}},98590:(e,r,t)=>{t.d(r,{N:()=>n});var i=t(95155),a=t(51862);let n=({size:e,centerIcon:r})=>(0,i.jsx)(l,{$size:e,children:(0,i.jsxs)(o,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),l=a.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,o=a.I4.div`
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