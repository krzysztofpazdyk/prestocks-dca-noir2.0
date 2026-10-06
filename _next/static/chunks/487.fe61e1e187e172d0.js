"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[487],{487:(e,r,i)=>{i.r(r),i.d(r,{FarcasterSignerStatusScreen:()=>k,FarcasterSignerStatusView:()=>m,default:()=>k});var t=i(95155),o=i(12115),n=i(67884),l=i(51862),a=i(42302),s=i(57445),c=i(87674),d=i(80833),p=i(51774),h=i(69704),g=i(73532),x=i(50023),u=i(84310);let v="#8a63d2",m=({appName:e,loading:r,success:i,errorMessage:o,connectUri:l,onBack:p,onClose:h,onOpenFarcaster:g})=>(0,t.jsx)(x.S,n.Fr||r?n.un?{title:o?o.message:"Add a signer to Farcaster",subtitle:o?o.detail:`This will allow ${e} to add casts, likes, follows, and more on your behalf.`,icon:u.F,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!o},primaryCta:l&&g?{label:"Open Farcaster app",onClick:g}:void 0,onBack:p,onClose:h,watermark:!0}:{title:o?o.message:"Requesting signer from Farcaster",subtitle:o?o.detail:"This should only take a moment",icon:u.F,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!o},onBack:p,onClose:h,watermark:!0,children:l&&n.Fr&&(0,t.jsx)(f,{children:(0,t.jsx)(c.O,{text:"Take me to Farcaster",url:l,color:v})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${e} to add casts, likes, follows, and more on your behalf.`,onBack:p,onClose:h,watermark:!0,children:(0,t.jsxs)(y,{children:[(0,t.jsx)(w,{children:l?(0,t.jsx)(d.Q,{url:l,size:275,squareLogoElement:u.F}):(0,t.jsx)(C,{children:(0,t.jsx)(s.L,{})})}),(0,t.jsxs)(b,{children:[(0,t.jsx)(j,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),l&&(0,t.jsx)(a.C,{text:l,itemName:"link",color:v})]})]})}),f=l.I4.div`
  margin-top: 24px;
`,y=l.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,w=l.I4.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,b=l.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,j=l.I4.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,C=l.I4.div`
  position: relative;
  width: 82px;
  height: 82px;
`,k={component:()=>{let{lastScreen:e,navigateBack:r,data:i}=(0,g.u)(),n=(0,p.a)(),{requestFarcasterSignerStatus:l,closePrivyModal:a}=(0,h.u)(),[s,c]=(0,o.useState)(void 0),[d,x]=(0,o.useState)(!1),[u,v]=(0,o.useState)(!1),f=(0,o.useRef)([]),y=i?.farcasterSigner;(0,o.useEffect)(()=>{let e=Date.now(),r=setInterval(async()=>{if(!y?.public_key)return clearInterval(r),void c({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});"approved"===y.status&&(clearInterval(r),x(!1),v(!0),f.current.push(setTimeout(()=>a({shouldCallAuthOnSuccess:!1,isSuccess:!0}),p.Q)));let i=await l(y?.public_key),t=Date.now()-e;"approved"===i.status?(clearInterval(r),x(!1),v(!0),f.current.push(setTimeout(()=>a({shouldCallAuthOnSuccess:!1,isSuccess:!0}),p.Q))):t>3e5?(clearInterval(r),c({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):"revoked"===i.status&&(clearInterval(r),c({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))},2e3);return()=>{clearInterval(r),f.current.forEach(e=>clearTimeout(e))}},[]);let w="pending_approval"===y?.status?y.signer_approval_url:void 0;return(0,t.jsx)(m,{appName:n.name,loading:d,success:u,errorMessage:s,connectUri:w,onBack:e?r:void 0,onClose:a,onOpenFarcaster:()=>{w&&(window.location.href=w)}})}}},42302:(e,r,i)=>{i.d(r,{C:()=>s});var t=i(95155),o=i(12115),n=i(51862);let l=({style:e,color:r,...i})=>(0,t.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:r||"currentColor",style:{height:"1.5rem",width:"1.5rem",...e},...i,children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4.5 12.75l6 6 9-13.5"})}),a=({color:e,...r})=>(0,t.jsx)("svg",{version:"1.1",id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 115.77 122.88",xmlSpace:"preserve",...r,children:(0,t.jsx)("g",{children:(0,t.jsx)("path",{fill:e||"currentColor",className:"st0",d:"M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"})})}),s=e=>{let[r,i]=(0,o.useState)(!1);return(0,t.jsxs)(c,{color:e.color,onClick:()=>{i(!0),navigator.clipboard.writeText(e.text),setTimeout(()=>i(!1),1500)},$justCopied:r,children:[r?(0,t.jsx)(l,{style:{height:"14px",width:"14px"},strokeWidth:"2"}):(0,t.jsx)(a,{style:{height:"14px",width:"14px"}}),r?"Copied":"Copy"," ",e.itemName?e.itemName:"to Clipboard"]})},c=n.I4.button`
  display: flex;
  align-items: center;
  gap: 6px;

  && {
    margin: 8px 2px;
    font-size: 14px;
    color: ${e=>e.$justCopied?"var(--privy-color-foreground)":e.color||"var(--privy-color-foreground-3)"};
    font-weight: ${e=>e.$justCopied?500:"normal"};
    transition: color 350ms ease;

    :focus,
    :active {
      background-color: transparent;
      border: none;
      outline: none;
      box-shadow: none;
    }

    :hover {
      color: ${e=>e.$justCopied?"var(--privy-color-foreground)":"var(--privy-color-foreground-2)"};
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
`},49579:(e,r,i)=>{i.d(r,{S:()=>C});var t=i(95155),o=i(12115),n=i(51862),l=i(57445),a=i(10308),s=i(97677),c=i(98590);let d=n.I4.div`
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
`,h=n.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,g=(0,n.I4)(s.M)`
  margin: 0 -8px;
`,x=n.I4.div`
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
`,u=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=n.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,m=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=n.I4.h3`
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
`,w=n.I4.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"warning":return"var(--privy-color-warn)";case"error":return"var(--privy-color-error-bg)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=n.I4.div`
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
`,C=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(p,{...r,children:e})}),k=n.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,S=(0,n.I4)(a.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,z=n.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,$=({step:e})=>e?(0,t.jsx)(k,{children:(0,t.jsx)(z,{pct:Math.min(100,e.current/e.total*100)})}):null;C.Header=({title:e,subtitle:r,icon:i,iconVariant:o,iconLoadingStatus:n,showBack:l,onBack:a,showInfo:s,onInfo:c,showClose:d,onClose:p,step:x,headerTitle:u,eyebrow:w,...b})=>(0,t.jsxs)(h,{...b,children:[(0,t.jsx)(g,{backFn:l?a:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:u,eyebrow:w,closeable:d}),(i||o||e||r)&&(0,t.jsxs)(v,{children:[i||o?(0,t.jsx)(C.Icon,{icon:i,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(m,{children:[e&&(0,t.jsx)(f,{children:e}),r&&(0,t.jsx)(y,{children:r})]})]}),x&&(0,t.jsx)($,{step:x})]}),(C.Body=o.forwardRef(({children:e,...r},i)=>(0,t.jsx)(x,{ref:i,...r,children:e}))).displayName="Screen.Body",C.Footer=({children:e,...r})=>(0,t.jsx)(u,{id:"privy-content-footer-container",...r,children:e}),C.Actions=({children:e,...r})=>(0,t.jsx)(I,{...r,children:e}),C.HelpText=({children:e,...r})=>(0,t.jsx)(F,{...r,children:e}),C.FooterText=({children:e,...r})=>(0,t.jsx)(V,{...r,children:e}),C.Watermark=()=>(0,t.jsx)(S,{}),C.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(l.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(w,{$variant:r,children:(0,t.jsx)(c.N,{size:"64px"})}):(0,t.jsx)(w,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let I=n.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,F=n.I4.div`
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
`,V=n.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>l});var t=i(95155),o=i(97677),n=i(49579);let l=({primaryCta:e,secondaryCta:r,helpText:i,footerText:l,watermark:a=!0,children:s,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(o.B,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(o.B,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,t.jsx)(n.S.Header,{...c}),s?(0,t.jsx)(n.S.Body,{children:s}):null,i||d||a?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,d?(0,t.jsx)(n.S.Actions,{children:d}):null,a?(0,t.jsx)(n.S.Watermark,{}):null]}):null,l?(0,t.jsx)(n.S.FooterText,{children:l}):null]})}},80833:(e,r,i)=>{i.d(r,{Q:()=>m});var t=i(95155),o=i(768),n=i(12115),l=i(51862),a=i(51774),s=i(4104);let c=e=>(0,t.jsx)("svg",{viewBox:"0 0 50 50",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:(0,t.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),d=(e,r,i,t,o)=>{for(let n=r;n<r+t;n++)for(let r=i;r<i+o;r++){let i=e?.[r];i&&i[n]&&(i[n]=0)}return e},p=({x:e,y:r,cellSize:i,bgColor:o,fgColor:n})=>(0,t.jsx)(t.Fragment,{children:[0,1,2].map(l=>(0,t.jsx)("circle",{r:i*(7-2*l)/2,cx:e+7*i/2,cy:r+7*i/2,fill:l%2!=0?o:n},`finder-${e}-${r}-${l}`))}),h=({cellSize:e,matrixSize:r,bgColor:i,fgColor:o})=>(0,t.jsx)(t.Fragment,{children:[[0,0],[(r-7)*e,0],[0,(r-7)*e]].map(([r,n])=>(0,t.jsx)(p,{x:r,y:n,cellSize:e,bgColor:i,fgColor:o},`finder-${r}-${n}`))}),g=({matrix:e,cellSize:r,color:i})=>(0,t.jsx)(t.Fragment,{children:e.map((e,o)=>e.map((e,l)=>e?(0,t.jsx)("rect",{height:r-.4,width:r-.4,x:o*r+.1*r,y:l*r+.1*r,rx:.5*r,ry:.5*r,fill:i},`cell-${o}-${l}`):(0,t.jsx)(n.Fragment,{},`circle-${o}-${l}`)))}),x=({cellSize:e,matrixSize:r,element:i,sizePercentage:o,bgColor:n})=>{if(!i)return(0,t.jsx)(t.Fragment,{});let l=r*(o||.14),a=Math.floor(r/2-l/2),s=Math.floor(r/2+l/2);(s-a)%2!=r%2&&(s+=1);let c=(s-a)*e,d=c-.2*c,p=a*e;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:a*e,y:a*e,width:c,height:c,fill:n}),(0,t.jsx)(i,{x:p+.1*c,y:p+.1*c,height:d,width:d})]})},u=e=>{var r,i;let n,l,a=e.outputSize,c=(r=e.url,i=e.errorCorrectionLevel,n=o.create(r,{errorCorrectionLevel:i}).modules,l=d(l=(0,s.l)(Array.from(n.data),n.size),0,0,7,7),l=d(l,l.length-7,0,7,7),d(l,0,l.length-7,7,7)),p=a/c.length,u=(0,s.m)(2*p,{min:.025*a,max:.036*a});return(0,t.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${u}px`},children:[(0,t.jsx)(g,{matrix:c,cellSize:p,color:e.fgColor}),(0,t.jsx)(h,{cellSize:p,matrixSize:c.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,t.jsx)(x,{cellSize:p,element:e.logo?.element,bgColor:e.bgColor,matrixSize:c.length})]})},v=l.I4.div.attrs({className:"ph-no-capture"})`
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
`,m=e=>{let{appearance:r}=(0,a.a)(),i=e.bgColor||"#FFFFFF",o=e.fgColor||"#000000",n=e.size||160,l="dark"===r.palette.colorScheme?i:o;return(0,t.jsx)(v,{$size:n,$bgColor:i,$fgColor:o,$borderColor:l,children:(0,t.jsx)(u,{url:e.url,logo:e.hideLogo?void 0:{element:e.squareLogoElement??c},outputSize:n,bgColor:i,fgColor:o,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},84310:(e,r,i)=>{i.d(r,{F:()=>o});var t=i(95155);let o=e=>(0,t.jsxs)("svg",{width:"33",height:"32",viewBox:"0 0 33 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,t.jsx)("rect",{x:"0.5",width:"32",height:"32",rx:"4",fill:"#855DCD"}),(0,t.jsxs)("g",{"clip-path":"url(#clip0_1715_1960)",children:[(0,t.jsx)("path",{d:"M4.5 4H28.5V28H4.5V4Z",fill:"#855DCD"}),(0,t.jsx)("path",{d:"M11.1072 8.42105H21.6983V23.5789H20.1437V16.6357H20.1284C19.9566 14.7167 18.3542 13.2129 16.4028 13.2129C14.4514 13.2129 12.849 14.7167 12.6771 16.6357H12.6619V23.5789H11.1072V8.42105Z",fill:"white"}),(0,t.jsx)("path",{d:"M8.28943 10.5725L8.92101 12.7239H9.45542V21.4275C9.1871 21.4275 8.96959 21.6464 8.96959 21.9165V22.5032H8.87242C8.60411 22.5032 8.38659 22.7221 8.38659 22.9922V23.5789H13.8279V22.9922C13.8279 22.7221 13.6104 22.5032 13.3421 22.5032H13.2449V21.9165C13.2449 21.6464 13.0274 21.4275 12.7591 21.4275H12.1761V10.5725H8.28943Z",fill:"white"}),(0,t.jsx)("path",{d:"M20.2408 21.4275C19.9725 21.4275 19.755 21.6464 19.755 21.9165V22.5032H19.6579C19.3895 22.5032 19.172 22.7221 19.172 22.9922V23.5789H24.6133V22.9922C24.6133 22.7221 24.3958 22.5032 24.1275 22.5032H24.0303V21.9165C24.0303 21.6464 23.8128 21.4275 23.5445 21.4275V12.7239H24.0789L24.7105 10.5725H20.8238V21.4275H20.2408Z",fill:"white"})]}),(0,t.jsx)("defs",{children:(0,t.jsx)("clipPath",{id:"clip0_1715_1960",children:(0,t.jsx)("rect",{width:"24",height:"24",fill:"white",transform:"translate(4.5 4)"})})})]})},87674:(e,r,i)=>{i.d(r,{O:()=>l});var t=i(95155),o=i(12115),n=i(51862);let l=e=>{let[r,i]=(0,o.useState)(!1);return(0,t.jsx)(a,{color:e.color,href:e.url,target:"_blank",rel:"noreferrer noopener",onClick:()=>{i(!0),setTimeout(()=>i(!1),1500)},justOpened:r,children:e.text})},a=n.I4.a`
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
`},98590:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(95155),o=i(51862);let n=({size:e,centerIcon:r})=>(0,t.jsx)(l,{$size:e,children:(0,t.jsxs)(a,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(s,{children:r}):null]})}),l=o.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,a=o.I4.div`
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