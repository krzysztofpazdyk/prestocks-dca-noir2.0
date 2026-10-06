"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8863],{6224:(e,r,i)=>{i.d(r,{A:()=>c,C:()=>d,S:()=>y});var t=i(95155),o=i(66088),n=i(12115),l=i(51862),a=i(43665),s=i(50023);let c=({currency:e="usd",value:r,onChange:i,inputMode:o="decimal",autoFocus:l})=>{let[s,c]=(0,n.useState)("0"),[d,v]=(0,n.useState)(null),f=(0,n.useRef)(null),x=(0,n.useRef)(null),m=r??s,y=a.S[e]?.symbol??"$",b=m.length>9?"small":m.length>6?"compact":"default";(0,n.useLayoutEffect)(()=>{let e=x.current?.offsetWidth;v(e?Math.ceil(e)+2:null)},[b,m]);let w=(0,n.useCallback)(e=>{let r=e.target.value,t=(r=r.replace(/[^\d.]/g,"")).split(".");t.length>2&&(r=t[0]+"."+t.slice(1).join(""));let[o="",n]=r.split("."),l=o.replace(/^0+(?=\d)/,"");(""===(r=void 0!==n?`${l||"0"}.${n}`:l||"0")||"."===r)&&(r="0"),i?i(r):c(r)},[i]),j=(0,n.useCallback)(e=>{!(["Delete","Backspace","Tab","Escape","Enter",".","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)||(e.ctrlKey||e.metaKey)&&["a","c","v","x"].includes(e.key.toLowerCase()))&&(e.key>="0"&&e.key<="9"||e.preventDefault())},[]);return(0,t.jsxs)(p,{$size:b,onClick:()=>f.current?.focus(),children:[(0,t.jsx)(g,{$size:b,children:y}),(0,t.jsx)(h,{ref:f,type:"text",inputMode:o,value:m,onChange:w,onKeyDown:j,autoFocus:l,placeholder:"0","aria-label":"Amount",style:d?{width:`${d}px`}:void 0}),(0,t.jsx)(u,{ref:x,"aria-hidden":"true",children:m}),(0,t.jsx)(g,{$size:b,style:{opacity:0},children:y})]})},d=({selectedAsset:e,onEditSourceAsset:r})=>{let{icon:i}=a.S[e];return(0,t.jsxs)(v,{onClick:r,children:[(0,t.jsx)(f,{children:i}),(0,t.jsx)(x,{children:e.toLocaleUpperCase()}),(0,t.jsx)(m,{children:(0,t.jsx)(o.A,{})})]})},p=l.I4.span`
  position: relative;
  background-color: var(--privy-color-background);
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  font-kerning: none;
  font-feature-settings: 'calt' off;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  cursor: pointer;

  && {
    color: var(--privy-color-foreground);
    font-size: ${({$size:e})=>"small"===e?"2.25rem":"compact"===e?"3rem":"3.75rem"};
    font-style: normal;
    font-weight: 600;
    line-height: 5.375rem;
  }
`,h=l.I4.input`
  appearance: none;
  align-self: flex-start;
  min-width: 1ch;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-align: left;
  caret-color: currentcolor;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
`,u=l.I4.span`
  position: absolute;
  visibility: hidden;
  white-space: pre;
  pointer-events: none;
`,g=l.I4.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;
  font-size: ${({$size:e})=>"small"===e?"0.75rem":"compact"===e?"0.875rem":"1rem"};
  font-style: normal;
  font-weight: 600;
  line-height: 1.5rem;
  margin-top: 0.75rem;
`,v=l.I4.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  gap: 0.5rem;
  border: 1px solid var(--privy-color-border-default);
  border-radius: var(--privy-border-radius-full);

  && {
    margin: auto;
    padding: 0.5rem 1rem;
  }
`,f=l.I4.div`
  svg {
    width: 1rem;
    height: 1rem;
    border-radius: var(--privy-border-radius-full);
    overflow: hidden;
    border: solid 0.1px var(--privy-color-border-default);
  }
`,x=l.I4.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.375rem;
`,m=l.I4.div`
  color: var(--privy-color-foreground);

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`,y=({opts:e,isLoading:r,onSelectSource:i})=>(0,t.jsx)(s.S,{showClose:!1,showBack:!0,onBack:()=>i(e.source.selectedAsset),title:"Select currency",children:(0,t.jsx)(b,{children:e.source.assets.map(e=>{let{icon:o,name:n}=a.S[e];return(0,t.jsx)(w,{onClick:()=>i(e),disabled:r,children:(0,t.jsxs)(j,{children:[(0,t.jsx)(k,{children:o}),(0,t.jsxs)(I,{children:[(0,t.jsx)(z,{children:n}),(0,t.jsx)(C,{children:e.toLocaleUpperCase()})]})]})},e)})})}),b=l.I4.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-height: 20.875rem;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`,w=l.I4.button`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-mdlg);
  border-style: solid;
  display: flex;

  && {
    padding: 0.75rem 1rem;
  }
`,j=l.I4.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`,k=l.I4.div`
  svg {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--privy-border-radius-full);
    overflow: hidden;
    border: solid 0.1px var(--privy-color-border-default);
  }
`,I=l.I4.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
`,z=l.I4.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
`,C=l.I4.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
`},20223:(e,r,i)=>{i.d(r,{I:()=>a});var t=i(95155),o=i(12115);let n=o.forwardRef(function({title:e,titleId:r,...i},t){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var l=i(51862);let a=({children:e,theme:r,className:i})=>(0,t.jsxs)(s,{$theme:r,className:i,children:[(0,t.jsx)(n,{width:"16px",height:"16px",color:"var(--privy-color-foreground-2)",strokeWidth:2,style:{flexShrink:0}}),(0,t.jsx)(c,{$theme:r,children:e})]}),s=l.I4.div`
  display: flex;
  gap: 0.5rem;
  background-color: var(--privy-color-info-bg);
  border: 1px solid var(--privy-color-border-info);
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow: clip;
  width: 100%;
`,c=l.I4.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
  font-feature-settings:
    'calt' 0,
    'kern' 0;
`},49579:(e,r,i)=>{i.d(r,{S:()=>k});var t=i(95155),o=i(12115),n=i(51862),l=i(57445),a=i(10308),s=i(97677),c=i(98590);let d=n.I4.div`
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
`,u=(0,n.I4)(s.M)`
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
`,f=n.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,x=n.I4.div`
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
`,k=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(p,{...r,children:e})}),I=n.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,n.I4)(a.B)`
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
`,S=({step:e})=>e?(0,t.jsx)(I,{children:(0,t.jsx)(C,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:i,iconVariant:o,iconLoadingStatus:n,showBack:l,onBack:a,showInfo:s,onInfo:c,showClose:d,onClose:p,step:g,headerTitle:v,eyebrow:b,...w})=>(0,t.jsxs)(h,{...w,children:[(0,t.jsx)(u,{backFn:l?a:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:v,eyebrow:b,closeable:d}),(i||o||e||r)&&(0,t.jsxs)(f,{children:[i||o?(0,t.jsx)(k.Icon,{icon:i,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,t.jsxs)(x,{children:[e&&(0,t.jsx)(m,{children:e}),r&&(0,t.jsx)(y,{children:r})]})]}),g&&(0,t.jsx)(S,{step:g})]}),(k.Body=o.forwardRef(({children:e,...r},i)=>(0,t.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,t.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,t.jsx)($,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,t.jsx)(A,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),k.Watermark=()=>(0,t.jsx)(z,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(w,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,t.jsx)(j,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(l.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(b,{$variant:r,children:(0,t.jsx)(c.N,{size:"64px"})}):(0,t.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let $=n.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,A=n.I4.div`
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
`,E=n.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>l});var t=i(95155),o=i(97677),n=i(49579);let l=({primaryCta:e,secondaryCta:r,helpText:i,footerText:l,watermark:a=!0,children:s,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,t.jsx)(o.B,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,t.jsx)(o.B,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,t.jsx)(n.S.Header,{...c}),s?(0,t.jsx)(n.S.Body,{children:s}):null,i||d||a?(0,t.jsxs)(n.S.Footer,{children:[i?(0,t.jsx)(n.S.HelpText,{children:i}):null,d?(0,t.jsx)(n.S.Actions,{children:d}):null,a?(0,t.jsx)(n.S.Watermark,{}):null]}):null,l?(0,t.jsx)(n.S.FooterText,{children:l}):null]})}},62791:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},66088:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]])},78340:(e,r,i)=>{i.d(r,{A:()=>s});var t=i(12115);let o=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,i)=>i?i.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},n=(...e)=>e.filter((e,r,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===r).join(" ").trim();var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let a=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:i=2,absoluteStrokeWidth:o,className:a="",children:s,iconNode:c,...d},p)=>(0,t.createElement)("svg",{ref:p,...l,width:r,height:r,stroke:e,strokeWidth:o?24*Number(i)/Number(r):i,className:n("lucide",a),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let i=(0,t.forwardRef)(({className:i,...l},s)=>(0,t.createElement)(a,{ref:s,iconNode:r,className:n(`lucide-${o(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...l}));return i.displayName=o(e),i}},91322:(e,r,i)=>{i.d(r,{C:()=>h,a:()=>u});var t=i(95155),o=i(94514),n=i(67635),l=i(12115),a=i(51862);let s=a.I4.button`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;

  && {
    color: var(--privy-color-foreground);
    font-weight: 500;
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`,c=a.I4.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--privy-color-foreground-2);
`,d=(0,a.I4)(o.A)`
  color: var(--privy-color-icon-success);
  flex-shrink: 0;
`,p=(0,a.I4)(n.A)`
  color: var(--privy-color-icon-muted);
  flex-shrink: 0;
`;function h({children:e,iconOnly:r,value:i,hideCopyIcon:o,onCopy:n,iconSize:a=14,...u}){let[g,v]=(0,l.useState)(!1);return(0,t.jsxs)(s,{...u,onClick:()=>{navigator.clipboard.writeText(i||("string"==typeof e?e:"")).then(()=>n?.()).catch(console.error),v(!0),setTimeout(()=>v(!1),1500)},children:[e," ",g?(0,t.jsxs)(c,{children:[(0,t.jsx)(d,{size:a})," ",!r&&"Copied"]}):!o&&(0,t.jsx)(p,{size:a})]})}let u=({value:e,includeChildren:r,children:i,...o})=>{let[n,a]=(0,l.useState)(!1),h=()=>{navigator.clipboard.writeText(e).catch(console.error),a(!0),setTimeout(()=>a(!1),1500)};return(0,t.jsxs)(t.Fragment,{children:[r?(0,t.jsx)(s,{...o,onClick:h,children:i}):(0,t.jsx)(t.Fragment,{children:i}),(0,t.jsx)(s,{...o,onClick:h,children:n?(0,t.jsx)(c,{children:(0,t.jsx)(d,{})}):(0,t.jsx)(p,{})})]})}},94514:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98590:(e,r,i)=>{i.d(r,{N:()=>n});var t=i(95155),o=i(51862);let n=({size:e,centerIcon:r})=>(0,t.jsx)(l,{$size:e,children:(0,t.jsxs)(a,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(s,{children:r}):null]})}),l=o.I4.div`
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