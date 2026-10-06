"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[548],{29958:(e,r,i)=>{i.d(r,{T:()=>l,a:()=>c});var t=i(95155),n=i(94514),a=i(33210),o=i(12115),s=i(51862);let l=s.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px; /* 10px gap between items */
  padding-left: 8px; /* 8px indentation container */
`;s.I4.div`
  &&& {
    margin-left: 6px; /* Center the line under the checkbox (12px/2) */
    border-left: 2px solid var(--privy-color-foreground-4);
    height: 10px; /* 10px H padding between paragraphs */
    margin-top: 0;
    margin-bottom: 0;
  }
`;let c=({children:e,variant:r="default",icon:i})=>{let s=()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}};return(0,t.jsxs)(p,{children:[(0,t.jsx)(d,{$variant:r,"data-variant":r,children:(()=>{if(i)return o.isValidElement(i)?o.cloneElement(i,{stroke:s(),strokeWidth:2}):i;switch(r){case"success":default:return(0,t.jsx)(n.A,{size:12,stroke:s(),strokeWidth:3});case"error":return(0,t.jsx)(a.A,{size:12,stroke:s(),strokeWidth:3})}})()}),e]})},d=s.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"error":return"var(--privy-color-error-bg)";default:return"var(--privy-color-background-2)"}}};
  flex-shrink: 0;
`,p=s.I4.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; /* Align all elements to the top */
  text-align: left;
  gap: 8px;

  && {
    a {
      color: var(--privy-color-accent);
    }
  }
`},33210:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},49579:(e,r,i)=>{i.d(r,{S:()=>j});var t=i(95155),n=i(12115),a=i(51862),o=i(57445),s=i(10308),l=i(97677),c=i(98590);let d=a.I4.div`
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
`,h=a.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,a.I4)(l.M)`
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
`,k=a.I4.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"warning":return"var(--privy-color-warn)";case"error":return"var(--privy-color-error-bg)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=a.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=a.I4.div`
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
`,j=({children:e,...r})=>(0,t.jsx)(d,{children:(0,t.jsx)(p,{...r,children:e})}),I=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,A=(0,a.I4)(s.B)`
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
`,z=({step:e})=>e?(0,t.jsx)(I,{children:(0,t.jsx)(C,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:n,iconLoadingStatus:a,showBack:o,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:p,step:v,headerTitle:g,eyebrow:k,...b})=>(0,t.jsxs)(h,{...b,children:[(0,t.jsx)(u,{backFn:o?s:void 0,infoFn:l?c:void 0,onClose:d?p:void 0,title:g,eyebrow:k,closeable:d}),(i||n||e||r)&&(0,t.jsxs)(x,{children:[i||n?(0,t.jsx)(j.Icon,{icon:i,variant:n,loadingStatus:a}):null,!(!e&&!r)&&(0,t.jsxs)(y,{children:[e&&(0,t.jsx)(f,{children:e}),r&&(0,t.jsx)(m,{children:r})]})]}),v&&(0,t.jsx)(z,{step:v})]}),(j.Body=n.forwardRef(({children:e,...r},i)=>(0,t.jsx)(v,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,t.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,t.jsx)(S,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,t.jsx)(E,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,t.jsx)(M,{...r,children:e}),j.Watermark=()=>(0,t.jsx)(A,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,t.jsx)(b,"string"==typeof e?{children:(0,t.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,t.jsx)(w,{children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)(o.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,t.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,t.jsx)(k,{$variant:r,children:(0,t.jsx)(c.N,{size:"64px"})}):(0,t.jsx)(k,{$variant:r,children:e&&("string"==typeof e?(0,t.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let S=a.I4.div`
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
`,M=a.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>o});var t=i(95155),n=i(97677),a=i(49579);let o=({primaryCta:e,secondaryCta:r,helpText:i,footerText:o,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,t.jsxs)(t.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,t.jsx)(n.B,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,t.jsx)(n.B,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,t.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,t.jsx)(a.S.Header,{...c}),l?(0,t.jsx)(a.S.Body,{children:l}):null,i||d||s?(0,t.jsxs)(a.S.Footer,{children:[i?(0,t.jsx)(a.S.HelpText,{children:i}):null,d?(0,t.jsx)(a.S.Actions,{children:d}):null,s?(0,t.jsx)(a.S.Watermark,{}):null]}):null,o?(0,t.jsx)(a.S.FooterText,{children:o}):null]})}},52484:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},78340:(e,r,i)=>{i.d(r,{A:()=>l});var t=i(12115);let n=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,i)=>i?i.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},a=(...e)=>e.filter((e,r,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===r).join(" ").trim();var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let s=(0,t.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:i=2,absoluteStrokeWidth:n,className:s="",children:l,iconNode:c,...d},p)=>(0,t.createElement)("svg",{ref:p,...o,width:r,height:r,stroke:e,strokeWidth:n?24*Number(i)/Number(r):i,className:a("lucide",s),...!l&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(d)&&{"aria-hidden":"true"},...d},[...c.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(l)?l:[l]])),l=(e,r)=>{let i=(0,t.forwardRef)(({className:i,...o},l)=>(0,t.createElement)(s,{ref:l,iconNode:r,className:a(`lucide-${n(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...o}));return i.displayName=n(e),i}},80548:(e,r,i)=>{i.r(r),i.d(r,{DoubleIconWrapper:()=>A,LinkButton:()=>z,LinkPasskeyScreen:()=>I,LinkPasskeyView:()=>y,default:()=>I});var t=i(95155),n=i(52484),a=i(88885);let o=(0,i(78340).A)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);var s=i(12115),l=i(51862),c=i(57445),d=i(29958),p=i(37857),h=i(69704),u=i(73532),v=i(51774),g=i(58837),x=i(50023);let y=({passkeys:e,name:r,isLoading:i,errorReason:o,success:s,expanded:l,onLinkPasskey:c,onUnlinkPasskey:d,onExpand:p,onBack:h,onClose:u})=>s?(0,t.jsx)(x.S,{title:"Passkeys updated",icon:n.A,iconVariant:"success",primaryCta:{label:"Done",onClick:u},onClose:u,watermark:!0}):l?(0,t.jsx)(x.S,{icon:a.A,title:"Your passkeys",onBack:h,onClose:u,watermark:!0,children:(0,t.jsx)(w,{passkeys:e,expanded:l,onUnlink:d,onExpand:p})}):(0,t.jsxs)(x.S,{icon:a.A,title:"Set up passkey verification",subtitle:"Verify with passkey",primaryCta:{label:"Add new passkey",onClick:c,loading:i},onClose:u,watermark:!0,helpText:o||void 0,children:[0===e.length?(0,t.jsx)(j,{}):(0,t.jsx)(f,{children:(0,t.jsx)(w,{passkeys:e,expanded:l,onUnlink:d,onExpand:p})}),r?(0,t.jsxs)(m,{children:[(0,t.jsx)(k,{children:"New Passkey Name"}),(0,t.jsx)(b,{children:r})]}):null]}),f=l.I4.div`
  margin-bottom: 0.75rem;
`,m=l.I4.div`
  margin-top: 0.25rem;
`,k=l.I4.div`
  color: var(--privy-color-foreground-2);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  margin-bottom: 0.25rem;
`,b=l.I4.div`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  line-height: 1.25rem;
`,w=({passkeys:e,expanded:r,onUnlink:i,onExpand:n})=>{let[a,l]=(0,s.useState)([]),d=r?e.length:2;return(0,t.jsxs)("div",{children:[(0,t.jsx)(E,{children:"Your passkeys"}),(0,t.jsxs)(S,{children:[e.slice(0,d).map(e=>(0,t.jsxs)(N,{children:[(0,t.jsxs)("div",{children:[(0,t.jsx)(M,{children:e.authenticatorName?e.createdWithBrowser?`${e.authenticatorName} on ${e.createdWithBrowser}`:e.authenticatorName:e.createdWithBrowser?e.createdWithOs?`${e.createdWithBrowser} on ${e.createdWithOs}`:`${e.createdWithBrowser}`:"Unknown device"}),(0,t.jsxs)($,{children:["Last used:"," ",(e.latestVerifiedAt??e.firstVerifiedAt)?.toLocaleString()??"N/A"]})]}),(0,t.jsx)(L,{disabled:a.includes(e.credentialId),onClick:()=>(async e=>{l(r=>r.concat([e])),await i(e),l(r=>r.filter(r=>r!==e))})(e.credentialId),children:a.includes(e.credentialId)?(0,t.jsx)(c.B,{}):(0,t.jsx)(o,{size:16})})]},e.credentialId)),e.length>2&&!r&&(0,t.jsx)(z,{onClick:n,children:"View all"})]})]})},j=()=>(0,t.jsxs)(d.T,{style:{color:"var(--privy-color-foreground)"},children:[(0,t.jsx)(d.a,{children:"Verify with Touch ID, Face ID, PIN, or hardware key"}),(0,t.jsx)(d.a,{children:"Takes seconds to set up and use"}),(0,t.jsx)(d.a,{children:"Use your passkey to verify transactions and login to your account"})]}),I={component:()=>{let{user:e}=(0,v.u)(),{unlink:r}=(0,g.l)(),{linkWithPasskey:i,closePrivyModal:n}=(0,h.u)(),{data:a}=(0,u.u)(),o=e?.linkedAccounts.filter(e=>"passkey"===e.type),[l,c]=(0,s.useState)(!1),[d,x]=(0,s.useState)(""),[f,m]=(0,s.useState)(!1),[k,b]=(0,s.useState)(!1);return(0,s.useEffect)(()=>{0===o.length&&b(!1)},[o.length]),(0,t.jsx)(y,{passkeys:o,name:a?.passkeyAuthModalData?.name,isLoading:l,errorReason:d,success:f,expanded:k,onLinkPasskey:()=>{c(!0),i({name:a?.passkeyAuthModalData?.name}).then(()=>m(!0)).catch(e=>{if(e instanceof p.b){if(e.privyErrorCode===p.a.CANNOT_LINK_MORE_OF_TYPE)return void x("Cannot link more passkeys to account.");if(e.privyErrorCode===p.a.PASSKEY_NOT_ALLOWED)return void x("Passkey request timed out or rejected by user.")}x("Unknown error occurred.")}).finally(()=>{c(!1)})},onUnlinkPasskey:async e=>(c(!0),await r({credentialId:e}).then(()=>m(!0)).catch(e=>{e instanceof p.b&&e.privyErrorCode===p.a.MISSING_MFA_CREDENTIALS?x("Cannot unlink a passkey enrolled in MFA"):x("Unknown error occurred.")}).finally(()=>{c(!1)})),onExpand:()=>b(!0),onBack:()=>b(!1),onClose:()=>n()})}},A=l.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 90px;
  border-radius: 50%;
  svg + svg {
    margin-left: 12px;
  }
  > svg {
    z-index: 2;
    color: var(--privy-color-accent) !important;
    stroke: var(--privy-color-accent) !important;
    fill: var(--privy-color-accent) !important;
  }
`,C=(0,l.AH)`
  && {
    width: 100%;
    font-size: 0.875rem;
    line-height: 1rem;

    /* Tablet and Up */
    @media (min-width: 440px) {
      font-size: 14px;
    }

    display: flex;
    gap: 12px;
    justify-content: center;

    padding: 6px 8px;
    background-color: var(--privy-color-background);
    transition: background-color 200ms ease;
    color: var(--privy-color-accent) !important;

    :focus {
      outline: none;
      box-shadow: none;
    }
  }
`,z=l.I4.button`
  ${C}
`,S=l.I4.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.8rem;
  padding: 0.5rem 0 0;
  flex-grow: 1;
  width: 100%;
`,E=l.I4.div`
  line-height: 20px;
  height: 20px;
  font-size: 1em;
  font-weight: 450;
  display: flex;
  justify-content: flex-start;
  width: 100%;
`,M=l.I4.div`
  font-size: 1em;
  line-height: 1.3em;
  font-weight: 500;
  color: var(--privy-color-foreground-2);
  padding: 0.2em 0;
`,$=l.I4.div`
  font-size: 0.875rem;
  line-height: 1rem;
  color: var(--privy-color-foreground-2);
  padding: 0.2em 0;
`,N=l.I4.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1rem;
  text-align: left;
  border-radius: 8px;
  border: 1px solid var(--privy-color-border-default) !important;
  width: 100%;
  height: 5em;
`,B=(0,l.AH)`
  :focus,
  :hover,
  :active {
    outline: none;
  }
  display: flex;
  width: 2em;
  height: 2em;
  justify-content: center;
  align-items: center;
  svg {
    color: var(--privy-color-error);
  }
  svg:hover {
    color: var(--privy-color-foreground-3);
  }
`,L=l.I4.button`
  ${B}
`},88885:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("fingerprint-pattern",[["path",{d:"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",key:"1nerag"}],["path",{d:"M14 13.12c0 2.38 0 6.38-1 8.88",key:"o46ks0"}],["path",{d:"M17.29 21.02c.12-.6.43-2.3.5-3.02",key:"ptglia"}],["path",{d:"M2 12a10 10 0 0 1 18-6",key:"ydlgp0"}],["path",{d:"M2 16h.01",key:"1gqxmh"}],["path",{d:"M21.8 16c.2-2 .131-5.354 0-6",key:"drycrb"}],["path",{d:"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",key:"1tidbn"}],["path",{d:"M8.65 22c.21-.66.45-1.32.57-2",key:"13wd9y"}],["path",{d:"M9 6.8a6 6 0 0 1 9 5.2v2",key:"1fr1j5"}]])},94514:(e,r,i)=>{i.d(r,{A:()=>t});let t=(0,i(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98590:(e,r,i)=>{i.d(r,{N:()=>a});var t=i(95155),n=i(51862);let a=({size:e,centerIcon:r})=>(0,t.jsx)(o,{$size:e,children:(0,t.jsxs)(s,{children:[(0,t.jsx)(c,{}),(0,t.jsx)(d,{}),r?(0,t.jsx)(l,{children:r}):null]})}),o=n.I4.div`
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
`}}]);