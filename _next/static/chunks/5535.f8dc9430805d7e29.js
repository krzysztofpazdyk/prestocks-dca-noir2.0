"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5535],{15535:(e,r,t)=>{t.r(r),t.d(r,{FarcasterConnectStatusScreen:()=>F,FarcasterConnectStatusView:()=>E,default:()=>F});var i=t(95155),o=t(12115),a=t(67884),n=t(51862),l=t(57445),s=t(87674),c=t(80833),d=t(94514),h=t(67635),p=t(97677),u=t(16137),g=t(51774),x=t(37857),v=t(69704),f=t(73532),m=t(45054),y=t(50023),b=t(84310);let w=n.I4.div`
  width: 100%;
`,j=n.I4.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  height: 56px;
  background: ${e=>e.$disabled?"var(--privy-color-background-2)":"var(--privy-color-background)"};
  border: 1px solid var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);

  &:hover {
    border-color: ${e=>e.$disabled?"var(--privy-color-foreground-4)":"var(--privy-color-foreground-3)"};
  }
`,C=n.I4.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`,S=n.I4.span`
  display: block;
  font-size: 16px;
  line-height: 24px;
  color: ${e=>e.$disabled?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* Single-line truncation: as a flex item this would otherwise be floored at its
     min-content width, so min-width: 0 lets it shrink and the ellipsis land at the
     container edge. */
  min-width: 0;

  @media (min-width: 441px) {
    font-size: 14px;
    line-height: 20px;
  }
`,k=(0,n.I4)(S)`
  color: var(--privy-color-foreground-3);
  font-style: italic;
`,I=(0,n.I4)(u.L)`
  margin-bottom: 0.5rem;
`,$=(0,n.I4)(p.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
    flex-shrink: 0;
  }
`,z=({value:e,title:r,placeholder:t,className:a,showCopyButton:n=!0,truncate:l,maxLength:s=40,disabled:c=!1})=>{let[p,u]=(0,o.useState)(!1),g=l&&e?((e,r,t)=>{if((e=e.startsWith("https://")?e.slice(8):e).length<=t)return e;if("middle"===r){let r=Math.ceil(t/2)-2,i=Math.floor(t/2)-1;return`${e.slice(0,r)}...${e.slice(-i)}`}return`${e.slice(0,t-3)}...`})(e,l,s):e;return(0,o.useEffect)(()=>{if(p){let e=setTimeout(()=>u(!1),3e3);return()=>clearTimeout(e)}},[p]),(0,i.jsxs)(w,{className:a,children:[r&&(0,i.jsx)(I,{children:r}),(0,i.jsxs)(j,{$disabled:c,children:[(0,i.jsx)(C,{children:e?(0,i.jsx)(S,{$disabled:c,title:e,children:g}):(0,i.jsx)(k,{$disabled:c,children:t||"No value"})}),n&&e&&(0,i.jsx)($,{onClick:function(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>u(!0)).catch(console.error)},size:"sm",children:(0,i.jsxs)(i.Fragment,p?{children:["Copied",(0,i.jsx)(d.A,{size:14})]}:{children:["Copy",(0,i.jsx)(h.A,{size:14})]})})]})]})},E=({connectUri:e,loading:r,success:t,errorMessage:o,onBack:n,onClose:d,onOpenFarcaster:h})=>(0,i.jsx)(y.S,a.Fr||r?a.un?{title:o?o.message:"Sign in with Farcaster",subtitle:o?o.detail:"To sign in with Farcaster, please open the Farcaster app.",icon:b.F,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!o},primaryCta:e&&h?{label:"Open Farcaster app",onClick:h}:void 0,onBack:n,onClose:d,watermark:!0}:{title:o?o.message:"Signing in with Farcaster",subtitle:o?o.detail:"This should only take a moment",icon:b.F,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!o},onBack:n,onClose:d,watermark:!0,children:e&&a.Fr&&(0,i.jsx)(A,{children:(0,i.jsx)(s.O,{text:"Take me to Farcaster",url:e,color:"#8a63d2"})})}:{title:"Sign in with Farcaster",subtitle:"Scan with your phone's camera to continue.",onBack:n,onClose:d,watermark:!0,children:(0,i.jsxs)(T,{children:[(0,i.jsx)(L,{children:e?(0,i.jsx)(c.Q,{url:e,size:275,squareLogoElement:b.F}):(0,i.jsx)(V,{children:(0,i.jsx)(l.L,{})})}),(0,i.jsxs)(N,{children:[(0,i.jsx)(_,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),e&&(0,i.jsx)(z,{value:e,truncate:"end",maxLength:30,showCopyButton:!0,disabled:!0})]})]})}),F={component:()=>{let{authenticated:e,logout:r,ready:t,user:a}=(0,g.u)(),{lastScreen:n,navigate:l,navigateBack:s,setModalData:c}=(0,f.u)(),d=(0,g.a)(),{getAuthFlow:h,loginWithFarcaster:p,closePrivyModal:u,createAnalyticsEvent:y}=(0,v.u)(),[b,w]=(0,o.useState)(void 0),[j,C]=(0,o.useState)(!1),[S,k]=(0,o.useState)(!1),I=(0,o.useRef)([]),$=h(),z=$?.meta.connectUri;return(0,o.useEffect)(()=>{let e=Date.now(),r=setInterval(async()=>{let t=await $.pollForReady.execute(),i=Date.now()-e;if(t){clearInterval(r),C(!0);try{await p(),k(!0)}catch(r){let e={retryable:!1,message:"Authentication failed"};if(r?.privyErrorCode===x.a.ALLOWLIST_REJECTED)return void l("AllowlistRejectionScreen");if(r?.privyErrorCode===x.a.USER_LIMIT_REACHED)return console.error(new x.j(r).toString()),void l("UserLimitReachedScreen");if(r?.privyErrorCode===x.a.USER_DOES_NOT_EXIST)return void l("AccountNotFoundScreen");if(r?.privyErrorCode===x.a.LINKED_TO_ANOTHER_USER)e.detail=r.message??"This account has already been linked to another user.";else{if(r?.privyErrorCode===x.a.ACCOUNT_TRANSFER_REQUIRED&&r.data?.data?.nonce)return c({accountTransfer:{nonce:r.data?.data?.nonce,account:r.data?.data?.subject,displayName:r.data?.data?.account?.displayName,linkMethod:"farcaster",embeddedWalletAddress:r.data?.data?.otherUser?.embeddedWalletAddress,farcasterEmbeddedAddress:r.data?.data?.otherUser?.farcasterEmbeddedAddress}}),void l("LinkConflictScreen");r?.privyErrorCode===x.a.INVALID_CREDENTIALS?(e.retryable=!0,e.detail="Something went wrong. Try again."):r?.privyErrorCode===x.a.TOO_MANY_REQUESTS&&(e.detail="Too many requests. Please wait before trying again.")}w(e)}}else i>12e4&&(clearInterval(r),w({retryable:!0,message:"Authentication failed",detail:"The request timed out. Try again."}))},2e3);return()=>{clearInterval(r),I.current.forEach(e=>clearTimeout(e))}},[]),(0,o.useEffect)(()=>{if(t&&e&&S&&a){if(d?.legal.requireUsersAcceptTerms&&!a.hasAcceptedTerms){let e=setTimeout(()=>{l("AffirmativeConsentScreen")},g.Q);return()=>clearTimeout(e)}S&&((0,m.s)(a,d.embeddedWallets)?I.current.push(setTimeout(()=>{c({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),y({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"FarcasterConnectStatusScreen"}}),r()},callAuthOnSuccessOnClose:!0}}),l("EmbeddedWalletOnAccountCreateScreen")},g.Q)):I.current.push(setTimeout(()=>u({shouldCallAuthOnSuccess:!0,isSuccess:!0}),g.Q)))}},[S,t,e,a]),(0,i.jsx)(E,{connectUri:z,loading:j,success:S,errorMessage:b,onBack:n?s:void 0,onClose:u,onOpenFarcaster:()=>{z&&(window.location.href=z)}})}},A=n.I4.div`
  margin-top: 24px;
`,T=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,L=n.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,N=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,_=n.I4.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,V=n.I4.div`
  position: relative;
  width: 82px;
  height: 82px;
`},16137:(e,r,t)=>{t.d(r,{L:()=>o});var i=t(51862);let o=i.I4.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},45054:(e,r,t)=>{t.d(r,{s:()=>o});var i=t(54479);let o=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.g)(e,r.solana.createOnLogin)},49579:(e,r,t)=>{t.d(r,{S:()=>C});var i=t(95155),o=t(12115),a=t(51862),n=t(57445),l=t(10308),s=t(97677),c=t(98590);let d=a.I4.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,h=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=a.I4.div`
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
`,C=({children:e,...r})=>(0,i.jsx)(d,{children:(0,i.jsx)(h,{...r,children:e})}),S=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,a.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,I=a.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,$=({step:e})=>e?(0,i.jsx)(S,{children:(0,i.jsx)(I,{pct:Math.min(100,e.current/e.total*100)})}):null;C.Header=({title:e,subtitle:r,icon:t,iconVariant:o,iconLoadingStatus:a,showBack:n,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:x,eyebrow:b,...w})=>(0,i.jsxs)(p,{...w,children:[(0,i.jsx)(u,{backFn:n?l:void 0,infoFn:s?c:void 0,onClose:d?h:void 0,title:x,eyebrow:b,closeable:d}),(t||o||e||r)&&(0,i.jsxs)(v,{children:[t||o?(0,i.jsx)(C.Icon,{icon:t,variant:o,loadingStatus:a}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(m,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),g&&(0,i.jsx)($,{step:g})]}),(C.Body=o.forwardRef(({children:e,...r},t)=>(0,i.jsx)(g,{ref:t,...r,children:e}))).displayName="Screen.Body",C.Footer=({children:e,...r})=>(0,i.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),C.Actions=({children:e,...r})=>(0,i.jsx)(z,{...r,children:e}),C.HelpText=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),C.FooterText=({children:e,...r})=>(0,i.jsx)(F,{...r,children:e}),C.Watermark=()=>(0,i.jsx)(k,{}),C.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(w,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,i.jsx)(j,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(n.C,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(b,{$variant:r,children:(0,i.jsx)(c.N,{size:"64px"})}):(0,i.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let z=a.I4.div`
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
`,F=a.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,t)=>{t.d(r,{S:()=>n});var i=t(95155),o=t(97677),a=t(49579);let n=({primaryCta:e,secondaryCta:r,helpText:t,footerText:n,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,a=t.variant||"primary";return(0,i.jsx)(o.B,{...t,variant:a,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,a=t.variant||"secondary";return(0,i.jsx)(o.B,{...t,variant:a,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,i.jsx)(a.S.Header,{...c}),s?(0,i.jsx)(a.S.Body,{children:s}):null,t||d||l?(0,i.jsxs)(a.S.Footer,{children:[t?(0,i.jsx)(a.S.HelpText,{children:t}):null,d?(0,i.jsx)(a.S.Actions,{children:d}):null,l?(0,i.jsx)(a.S.Watermark,{}):null]}):null,n?(0,i.jsx)(a.S.FooterText,{children:n}):null]})}},67635:(e,r,t)=>{t.d(r,{A:()=>i});let i=(0,t(78340).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},78340:(e,r,t)=>{t.d(r,{A:()=>s});var i=t(12115);let o=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,t)=>t?t.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},a=(...e)=>e.filter((e,r,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===r).join(" ").trim();var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,i.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:o,className:l="",children:s,iconNode:c,...d},h)=>(0,i.createElement)("svg",{ref:h,...n,width:r,height:r,stroke:e,strokeWidth:o?24*Number(t)/Number(r):t,className:a("lucide",l),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,i.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let t=(0,i.forwardRef)(({className:t,...n},s)=>(0,i.createElement)(l,{ref:s,iconNode:r,className:a(`lucide-${o(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...n}));return t.displayName=o(e),t}},80833:(e,r,t)=>{t.d(r,{Q:()=>f});var i=t(95155),o=t(768),a=t(12115),n=t(51862),l=t(51774),s=t(4104);let c=e=>(0,i.jsx)("svg",{viewBox:"0 0 50 50",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:(0,i.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),d=(e,r,t,i,o)=>{for(let a=r;a<r+i;a++)for(let r=t;r<t+o;r++){let t=e?.[r];t&&t[a]&&(t[a]=0)}return e},h=({x:e,y:r,cellSize:t,bgColor:o,fgColor:a})=>(0,i.jsx)(i.Fragment,{children:[0,1,2].map(n=>(0,i.jsx)("circle",{r:t*(7-2*n)/2,cx:e+7*t/2,cy:r+7*t/2,fill:n%2!=0?o:a},`finder-${e}-${r}-${n}`))}),p=({cellSize:e,matrixSize:r,bgColor:t,fgColor:o})=>(0,i.jsx)(i.Fragment,{children:[[0,0],[(r-7)*e,0],[0,(r-7)*e]].map(([r,a])=>(0,i.jsx)(h,{x:r,y:a,cellSize:e,bgColor:t,fgColor:o},`finder-${r}-${a}`))}),u=({matrix:e,cellSize:r,color:t})=>(0,i.jsx)(i.Fragment,{children:e.map((e,o)=>e.map((e,n)=>e?(0,i.jsx)("rect",{height:r-.4,width:r-.4,x:o*r+.1*r,y:n*r+.1*r,rx:.5*r,ry:.5*r,fill:t},`cell-${o}-${n}`):(0,i.jsx)(a.Fragment,{},`circle-${o}-${n}`)))}),g=({cellSize:e,matrixSize:r,element:t,sizePercentage:o,bgColor:a})=>{if(!t)return(0,i.jsx)(i.Fragment,{});let n=r*(o||.14),l=Math.floor(r/2-n/2),s=Math.floor(r/2+n/2);(s-l)%2!=r%2&&(s+=1);let c=(s-l)*e,d=c-.2*c,h=l*e;return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("rect",{x:l*e,y:l*e,width:c,height:c,fill:a}),(0,i.jsx)(t,{x:h+.1*c,y:h+.1*c,height:d,width:d})]})},x=e=>{var r,t;let a,n,l=e.outputSize,c=(r=e.url,t=e.errorCorrectionLevel,a=o.create(r,{errorCorrectionLevel:t}).modules,n=d(n=(0,s.l)(Array.from(a.data),a.size),0,0,7,7),n=d(n,n.length-7,0,7,7),d(n,0,n.length-7,7,7)),h=l/c.length,x=(0,s.m)(2*h,{min:.025*l,max:.036*l});return(0,i.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${x}px`},children:[(0,i.jsx)(u,{matrix:c,cellSize:h,color:e.fgColor}),(0,i.jsx)(p,{cellSize:h,matrixSize:c.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,i.jsx)(g,{cellSize:h,element:e.logo?.element,bgColor:e.bgColor,matrixSize:c.length})]})},v=n.I4.div.attrs({className:"ph-no-capture"})`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${e=>`${e.$size}px`};
  width: ${e=>`${e.$size}px`};
  margin: auto;
  background-color: ${e=>e.$bgColor};

  && {
    border-width: 2px;
    border-color: ${e=>e.$borderColor};
    border-radius: var(--privy-border-radius-md);
  }
`,f=e=>{let{appearance:r}=(0,l.a)(),t=e.bgColor||"#FFFFFF",o=e.fgColor||"#000000",a=e.size||160,n="dark"===r.palette.colorScheme?t:o;return(0,i.jsx)(v,{$size:a,$bgColor:t,$fgColor:o,$borderColor:n,children:(0,i.jsx)(x,{url:e.url,logo:e.hideLogo?void 0:{element:e.squareLogoElement??c},outputSize:a,bgColor:t,fgColor:o,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},84310:(e,r,t)=>{t.d(r,{F:()=>o});var i=t(95155);let o=e=>(0,i.jsxs)("svg",{width:"33",height:"32",viewBox:"0 0 33 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,i.jsx)("rect",{x:"0.5",width:"32",height:"32",rx:"4",fill:"#855DCD"}),(0,i.jsxs)("g",{"clip-path":"url(#clip0_1715_1960)",children:[(0,i.jsx)("path",{d:"M4.5 4H28.5V28H4.5V4Z",fill:"#855DCD"}),(0,i.jsx)("path",{d:"M11.1072 8.42105H21.6983V23.5789H20.1437V16.6357H20.1284C19.9566 14.7167 18.3542 13.2129 16.4028 13.2129C14.4514 13.2129 12.849 14.7167 12.6771 16.6357H12.6619V23.5789H11.1072V8.42105Z",fill:"white"}),(0,i.jsx)("path",{d:"M8.28943 10.5725L8.92101 12.7239H9.45542V21.4275C9.1871 21.4275 8.96959 21.6464 8.96959 21.9165V22.5032H8.87242C8.60411 22.5032 8.38659 22.7221 8.38659 22.9922V23.5789H13.8279V22.9922C13.8279 22.7221 13.6104 22.5032 13.3421 22.5032H13.2449V21.9165C13.2449 21.6464 13.0274 21.4275 12.7591 21.4275H12.1761V10.5725H8.28943Z",fill:"white"}),(0,i.jsx)("path",{d:"M20.2408 21.4275C19.9725 21.4275 19.755 21.6464 19.755 21.9165V22.5032H19.6579C19.3895 22.5032 19.172 22.7221 19.172 22.9922V23.5789H24.6133V22.9922C24.6133 22.7221 24.3958 22.5032 24.1275 22.5032H24.0303V21.9165C24.0303 21.6464 23.8128 21.4275 23.5445 21.4275V12.7239H24.0789L24.7105 10.5725H20.8238V21.4275H20.2408Z",fill:"white"})]}),(0,i.jsx)("defs",{children:(0,i.jsx)("clipPath",{id:"clip0_1715_1960",children:(0,i.jsx)("rect",{width:"24",height:"24",fill:"white",transform:"translate(4.5 4)"})})})]})},87674:(e,r,t)=>{t.d(r,{O:()=>n});var i=t(95155),o=t(12115),a=t(51862);let n=e=>{let[r,t]=(0,o.useState)(!1);return(0,i.jsx)(l,{color:e.color,href:e.url,target:"_blank",rel:"noreferrer noopener",onClick:()=>{t(!0),setTimeout(()=>t(!1),1500)},justOpened:r,children:e.text})},l=a.I4.a`
  display: flex;
  align-items: center;
  gap: 6px;

  && {
    margin: 8px 2px;
    font-size: 14px;
    color: ${e=>e.justOpened?"var(--privy-color-foreground)":e.color||"var(--privy-color-foreground-3)"};
    font-weight: ${e=>e.justOpened?500:"normal"};
    transition: color 350ms ease;

    :focus,
    :active {
      background-color: transparent;
      border: none;
      outline: none;
      box-shadow: none;
    }

    :hover {
      color: ${e=>e.justOpened?"var(--privy-color-foreground)":"var(--privy-color-foreground-2)"};
    }

    :active {
      color: var(--privy-color-foreground);
      font-weight: 500;
    }

    @media (max-width: 440px) {
      margin: 12px 2px;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`},94514:(e,r,t)=>{t.d(r,{A:()=>i});let i=(0,t(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98590:(e,r,t)=>{t.d(r,{N:()=>a});var i=t(95155),o=t(51862);let a=({size:e,centerIcon:r})=>(0,i.jsx)(n,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),n=o.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=o.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=o.I4.div`
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
`,c=o.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=o.I4.div`
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