"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[216],{49579:(e,r,i)=>{i.d(r,{S:()=>j});var t=i(95155),a=i(12115),n=i(51862),s=i(57445),o=i(10308),l=i(97677),c=i(98590);let d=n.I4.div`
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
`,j=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(u,{...r,children:e})}),I=n.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,S=(0,n.I4)(o.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,C=n.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,z=({step:e})=>e?(0,t.jsx)(I,{children:(0,t.jsx)(C,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:a,iconLoadingStatus:n,showBack:s,onBack:o,showInfo:l,onInfo:c,showClose:d,onClose:u,step:g,headerTitle:v,eyebrow:b,...w})=>(0,t.jsxs)(p,{...w,children:[(0,t.jsx)(h,{backFn:s?o:void 0,infoFn:l?c:void 0,onClose:d?u:void 0,title:v,eyebrow:b,closeable:d}),(i||a||e||r)&&(0,t.jsxs)(x,{children:[i||a?(0,t.jsx)(j.Icon,{icon:i,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(f,{children:[e&&(0,t.jsx)(m,{children:e}),r&&(0,t.jsx)(y,{children:r})]})]}),g&&(0,t.jsx)(z,{step:g})]}),(j.Body=a.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,t.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,t.jsx)(A,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,t.jsx)(R,{...r,children:e}),j.Watermark=()=>(0,t.jsx)(S,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(w,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,t.jsx)(k,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(s.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(b,{$variant:r,children:(0,t.jsx)(c.N,{size:"64px"})}):(0,t.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let A=n.I4.div`
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
`,R=n.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>s});var t=i(95155),a=i(97677),n=i(49579);let s=({primaryCta:e,secondaryCta:r,helpText:i,footerText:s,watermark:o=!0,children:l,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(a.B,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(a.B,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,t.jsx)(n.S.Header,{...c}),l?(0,t.jsx)(n.S.Body,{children:l}):null,i||d||o?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,d?(0,t.jsx)(n.S.Actions,{children:d}):null,o?(0,t.jsx)(n.S.Watermark,{}):null]}):null,s?(0,t.jsx)(n.S.FooterText,{children:s}):null]})}},50216:(e,r,i)=>{i.r(r),i.d(r,{CaptchaScreen:()=>u,CaptchaScreenView:()=>d,default:()=>u});var t=i(95155),a=i(52484),n=i(62791),s=i(12115),o=i(54479),l=i(73532),c=i(50023);let d=({status:e,title:r,description:i,userIntentRequired:o,retriesRemaining:l,hasSelectedCta:d,onContinue:u,onRetry:p})=>{let h=(0,s.useMemo)(()=>{switch(e){case"loading":default:return;case"success":return o?{label:d?"Continuing...":"Continue",onClick:u,disabled:d,loading:d}:void 0;case"error":return l>0?{label:"Retry",onClick:p}:void 0}},[e,d,u,p]),g=(0,s.useMemo)(()=>({loading:"loading",ready:"subtle",disabled:"subtle",success:"success",error:"error"})[e]||"loading",[e]);return(0,t.jsx)(c.S,{icon:"loading"===e||"ready"===e?void 0:"success"===e?a.A:n.A,iconVariant:g,title:r,subtitle:i,primaryCta:h,watermark:!0})},u={component:()=>{let{lastScreen:e,data:r,navigate:i,setModalData:a}=(0,l.u)(),{status:n,token:c,waitForResult:u,reset:p,execute:h}=(0,o.a)(),g=(0,s.useRef)([]),v=e=>{g.current=[e,...g.current]},[x,f]=(0,s.useState)(!0);(0,s.useEffect)(()=>(v(setTimeout(f,1e3,!1)),()=>{g.current.forEach(e=>clearTimeout(e)),g.current=[]}),[]);let[m,y]=(0,s.useState)(""),[b,w]=(0,s.useState)("Checking that you are a human..."),[k,j]=(0,s.useState)(!1),[I,S]=(0,s.useState)(3),C=r?.captchaModalData,z=async r=>{try{await C?.callback(r),C?.onSuccessNavigateTo&&i(C?.onSuccessNavigateTo,!1)}catch(r){if(r instanceof o.C)return;a({errorModalData:{error:r,previousScreen:e||"LandingScreen"}}),i(C?.onErrorNavigateTo||"ErrorScreen",!1)}};return(0,s.useEffect)(()=>{"success"===n?v(setTimeout(async()=>{let e=await u();!e||C?.userIntentRequired||z(e)},1e3)):"ready"===n&&v(setTimeout(()=>{"ready"===n&&h()},500))},[n]),(0,s.useEffect)(()=>{if(!x)switch(n){case"success":y("Success!"),w("CAPTCHA passed successfully."),C?.userIntentRequired||setTimeout(()=>{j(!0),z(c)},2e3);break;case"loading":y(""),w("Checking that you are a human...");break;case"error":y("Something went wrong"),w(I<=0?"If you use an adblocker or VPN, try disabling and re-attempting.":"You did not pass CAPTCHA. Please try again.")}},[n,x,k]),(0,t.jsx)(d,{status:n,title:m,description:b,userIntentRequired:C?.userIntentRequired,retriesRemaining:I,hasSelectedCta:k,onContinue:()=>{j(!0),z(c)},onRetry:async()=>{if(I<=0)return;S(e=>e-1),p(),h();let e=await u();!e||C?.userIntentRequired||z(e)}})}}},52484:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},62791:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},78340:(e,r,i)=>{i.d(r,{A:()=>l});var t=i(12115);let a=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,i)=>i?i.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},n=(...e)=>e.filter((e,r,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===r).join(" ").trim();var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:i=2,absoluteStrokeWidth:a,className:o="",children:l,iconNode:c,...d},u)=>(0,t.createElement)("svg",{ref:u,...s,width:r,height:r,stroke:e,strokeWidth:a?24*Number(i)/Number(r):i,className:n("lucide",o),...!l&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(l)?l:[l]])),l=(e,r)=>{let i=(0,t.forwardRef)(({className:i,...s},l)=>(0,t.createElement)(o,{ref:l,iconNode:r,className:n(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...s}));return i.displayName=a(e),i}},98590:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(95155),a=i(51862);let n=({size:e,centerIcon:r})=>(0,t.jsx)(s,{$size:e,children:(0,t.jsxs)(o,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(l,{children:r}):null]})}),s=a.I4.div`
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