"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3670],{8336:(e,r,i)=>{i.d(r,{B:()=>t,C:()=>l,F:()=>s,H:()=>n,R:()=>g,S:()=>p,a:()=>c,b:()=>u,c:()=>d,d:()=>h,e:()=>a});var o=i(51862);let t=o.I4.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,a=o.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,n=o.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,o.I4)(a)`
  padding: 20px 0;
`,d=(0,o.I4)(a)`
  gap: 16px;
`,s=o.I4.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,c=o.I4.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;o.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let p=o.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  width: 100%;
  background: var(--privy-color-background-2);
  border-radius: var(--privy-border-radius-md);
  && h4 {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
    text-decoration: underline;
    font-weight: 500;
  }
  && p {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
  }
`,u=o.I4.div`
  height: 16px;
`,g=o.I4.div`
  height: 12px;
`;o.I4.div`
  position: relative;
`;let h=o.I4.div`
  height: ${e=>e.height??"12"}px;
`;o.I4.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},37403:(e,r,i)=>{i.d(r,{L:()=>a});var o=i(51862);let t=(0,o.i7)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,a=(0,o.AH)`
  ${e=>e.$isLoading?(0,o.AH)`
          width: 35%;
          animation: ${t} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},39464:(e,r,i)=>{i.d(r,{C:()=>f});var o=i(95155),t=i(92289),a=i(12115),n=i(51862),l=i(51774),d=i(54479),s=i(69704),c=i(73532),p=i(65534),u=i(4104),g=i(97677),h=i(69685),v=i(45943),x=i(98910);let f=(0,a.forwardRef)((e,r)=>{let[i,n]=(0,a.useState)(e.defaultValue||""),[v,f]=(0,a.useState)(""),[w,k]=(0,a.useState)(!1),{authenticated:j}=(0,l.u)(),{initLoginWithEmail:I}=(0,s.u)(),{navigate:$,setModalData:S,currentScreen:C,data:E}=(0,c.u)(),{enabled:z,token:A}=(0,d.a)(),[L,N]=(0,a.useState)(!1),{accountType:T}=(0,p.h)(),B=(0,l.a)(),F=(0,u.v)(i)&&(B.disablePlusEmails&&i.includes("+")?(v||f("Please enter a valid email address without a '+'."),!1):(v&&f(""),!0)),H=w||!F,P=()=>{H||(S({login:E?.login,inlineError:void 0}),!z||A||j?(k(!0),I({email:i,captchaToken:A,disableSignup:E?.login?.disableSignup,withPrivyUi:!0}).then(()=>{$("AwaitingPasswordlessCodeScreen")}).catch(e=>{S({errorModalData:{error:e,previousScreen:C||"LandingScreen"}}),$("ErrorScreen")}).finally(()=>{k(!1)})):(S({captchaModalData:{callback:e=>I({email:i,captchaToken:e,withPrivyUi:!0}),userIntentRequired:!1,onSuccessNavigateTo:"AwaitingPasswordlessCodeScreen",onErrorNavigateTo:"ErrorScreen"}}),$("CaptchaScreen")))};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(m,{children:[v&&(0,o.jsx)(x.E,{style:{display:"block",marginTop:"0.25rem",textAlign:"left"},children:v}),(0,o.jsxs)(y,{stacked:e.stacked,$error:!!v,children:[(0,o.jsx)(b,{children:(0,o.jsx)(t.A,{})}),(0,o.jsx)("input",{ref:r,id:"email-input",className:"login-method-button",type:"email",placeholder:"your@email.com",onFocus:()=>N(!0),onChange:e=>n(e.target.value),onKeyUp:e=>{"Enter"===e.key&&P()},value:i,autoComplete:"email"}),"email"!==T||L?e.stacked?(0,o.jsx)("span",{}):(0,o.jsx)(g.E,{isSubmitting:w,onClick:P,disabled:H,children:"Submit"}):(0,o.jsx)(h.C,{color:"gray",children:"Recent"})]})]}),e.stacked?(0,o.jsx)(g.P,{loadingText:null,loading:w,disabled:H,onClick:P,style:{width:"100%"},children:"Submit"}):null]})}),m=v.I,y=v.a,b=(0,n.I4)(p.m)`
  display: inline-flex;
`},45943:(e,r,i)=>{i.d(r,{E:()=>n,I:()=>d,a:()=>l});var o=i(51862),t=i(98910);let a=o.I4.label`
  display: block;
  position: relative;
  width: 100%;
  height: 56px;

  && > :first-child {
    position: absolute;
    left: 0.75em;
    top: 50%;
    transform: translate(0, -50%);
  }

  && > input {
    font-size: 16px;
    line-height: 24px;
    color: var(--privy-color-foreground);

    padding: 12px 88px 12px 52px;
    flex-grow: 1;
    background: var(--privy-color-background);
    border: 1px solid
      ${({$error:e})=>e?"var(--privy-color-error) !important":"var(--privy-color-foreground-4)"};
    border-radius: var(--privy-border-radius-md);
    width: 100%;
    height: 100%;

    /* Tablet and Up */
    @media (min-width: 441px) {
      font-size: 14px;
      padding-right: 78px;
    }

    :focus {
      outline: none;
      border-color: ${({$error:e})=>e?"var(--privy-color-error) !important":"var(--privy-color-accent-light)"};
      box-shadow: ${({$error:e})=>e?"none":"0 0 0 1px var(--privy-color-accent-light)"};
    }

    :autofill,
    :-webkit-autofill {
      background: var(--privy-color-background);
    }

    && > input::placeholder {
      color: var(--privy-color-foreground-3);
    }
    &:disabled {
      opacity: 0.4; /* Make it visually appear disabled */
      cursor: not-allowed; /* Change cursor to not-allowed */
    }
    &:disabled,
    &:disabled:hover,
    &:disabled > span {
      color: var(--privy-color-foreground-3); /* Change text color to grey */
    }
  }

  && > button:last-child {
    right: 0;
    line-height: 24px;
    padding: 16px 17px;
    /* matches the border radius of the input only on the right side where we touch the radius */
    border-radius: 0 var(--privy-border-radius-md) var(--privy-border-radius-md) 0;

    :focus {
      outline: none;
    }
    &:disabled {
      opacity: 0.4; /* Make it visually appear disabled */
      cursor: not-allowed; /* Change cursor to not-allowed */
    }
    &:disabled,
    &:disabled:hover,
    &:disabled > span {
      color: var(--privy-color-foreground-3); /* Change text color to grey */
    }
  }
`,n=(0,o.I4)(a)`
  background-color: var(--privy-color-background);
  transition: background-color 200ms ease;
`,l=(0,o.I4)(a)`
  && > input {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    padding-right: ${e=>e.$stacked?"16px":"88px"};

    border: 1px solid
      ${({$error:e})=>e?"var(--privy-color-error) !important":"var(--privy-color-foreground-4)"};

    && > input::placeholder {
      color: var(--privy-color-foreground-3);
    }
  }

  && > :last-child {
    right: 16px;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
  }

  && > button:last-child {
    right: 0;
    line-height: 24px;
    padding: 16px 17px;

    :focus {
      outline: none;
    }
  }
`,d=o.I4.div`
  width: 100%;

  /* Add styling for the ErrorMessage within EmailInput */
  && > ${t.E} {
    display: block;
    text-align: left;
    padding-left: var(--privy-border-radius-md);
    padding-bottom: 5px;
  }
`},49579:(e,r,i)=>{i.d(r,{S:()=>j});var o=i(95155),t=i(12115),a=i(51862),n=i(57445),l=i(10308),d=i(97677),s=i(98590);let c=a.I4.div`
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
`,g=(0,a.I4)(d.M)`
  margin: 0 -8px;
`,h=a.I4.div`
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
`,v=a.I4.div`
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
`,k=a.I4.div`
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
`,j=({children:e,...r})=>(0,o.jsx)(c,{children:(0,o.jsx)(p,{...r,children:e})}),I=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,$=(0,a.I4)(l.B)`
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
`,C=({step:e})=>e?(0,o.jsx)(I,{children:(0,o.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:a,showBack:n,onBack:l,showInfo:d,onInfo:s,showClose:c,onClose:p,step:h,headerTitle:v,eyebrow:b,...w})=>(0,o.jsxs)(u,{...w,children:[(0,o.jsx)(g,{backFn:n?l:void 0,infoFn:d?s:void 0,onClose:c?p:void 0,title:v,eyebrow:b,closeable:c}),(i||t||e||r)&&(0,o.jsxs)(x,{children:[i||t?(0,o.jsx)(j.Icon,{icon:i,variant:t,loadingStatus:a}):null,!(!e&&!r)&&(0,o.jsxs)(f,{children:[e&&(0,o.jsx)(m,{children:e}),r&&(0,o.jsx)(y,{children:r})]})]}),h&&(0,o.jsx)(C,{step:h})]}),(j.Body=t.forwardRef(({children:e,...r},i)=>(0,o.jsx)(h,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,o.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,o.jsx)(E,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,o.jsx)(z,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,o.jsx)(A,{...r,children:e}),j.Watermark=()=>(0,o.jsx)($,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,o.jsx)(w,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,o.jsx)(k,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(n.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(b,{$variant:r,children:(0,o.jsx)(s.N,{size:"64px"})}):(0,o.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=a.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,z=a.I4.div`
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
`,A=a.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>n});var o=i(95155),t=i(97677),a=i(49579);let n=({primaryCta:e,secondaryCta:r,helpText:i,footerText:n,watermark:l=!0,children:d,...s})=>{let c=e||r?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,o.jsx)(t.B,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,o.jsx)(t.B,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,o.jsxs)(a.S,{id:s.id,className:s.className,children:[(0,o.jsx)(a.S.Header,{...s}),d?(0,o.jsx)(a.S.Body,{children:d}):null,i||c||l?(0,o.jsxs)(a.S.Footer,{children:[i?(0,o.jsx)(a.S.HelpText,{children:i}):null,c?(0,o.jsx)(a.S.Actions,{children:c}):null,l?(0,o.jsx)(a.S.Watermark,{}):null]}):null,n?(0,o.jsx)(a.S.FooterText,{children:n}):null]})}},53670:(e,r,i)=>{i.r(r),i.d(r,{LinkEmailScreen:()=>c,LinkEmailScreenView:()=>s,default:()=>c});var o=i(95155),t=i(53931),a=i(39464),n=i(8336),l=i(51774),d=i(50023);let s=({title:e="Connect your email",subtitle:r="Add your email to your account"})=>(0,o.jsx)(d.S,{title:e,subtitle:r,icon:t.A,watermark:!0,children:(0,o.jsx)(n.B,{children:(0,o.jsx)(a.C,{stacked:!0})})}),c={component:()=>{let e=(0,l.a)();return(0,o.jsx)(s,{subtitle:`Add your email to your ${e?.name} account`})}}},53931:(e,r,i)=>{i.d(r,{A:()=>t});var o=i(12115);let t=o.forwardRef(function({title:e,titleId:r,...i},t){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"}))})},69685:(e,r,i)=>{i.d(r,{C:()=>n});var o=i(95155),t=i(51862),a=i(37403);let n=({children:e,color:r,isLoading:i,isPulsing:t,...a})=>(0,o.jsx)(l,{$color:r,$isLoading:i,$isPulsing:t,...a,children:e}),l=t.I4.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let r,i;"green"===e.$color&&(r="var(--privy-color-success-dark)",i="var(--privy-color-success-light)"),"red"===e.$color&&(r="var(--privy-color-error)",i="var(--privy-color-error-light)"),"gray"===e.$color&&(r="var(--privy-color-foreground-2)",i="var(--privy-color-background-2)");let o=(0,t.i7)`
      from, to {
        background-color: ${i};
      }

      50% {
        background-color: rgba(${i}, 0.8);
      }
    `;return(0,t.AH)`
      color: ${r};
      background-color: ${i};
      ${e.$isPulsing&&(0,t.AH)`
        animation: ${o} 3s linear infinite;
      `};
    `}}

  ${a.L}
`},78340:(e,r,i)=>{i.d(r,{A:()=>d});var o=i(12115);let t=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,i)=>i?i.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},a=(...e)=>e.filter((e,r,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===r).join(" ").trim();var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,o.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:i=2,absoluteStrokeWidth:t,className:l="",children:d,iconNode:s,...c},p)=>(0,o.createElement)("svg",{ref:p,...n,width:r,height:r,stroke:e,strokeWidth:t?24*Number(i)/Number(r):i,className:a("lucide",l),...!d&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(c)&&{"aria-hidden":"true"},...c},[...s.map(([e,r])=>(0,o.createElement)(e,r)),...Array.isArray(d)?d:[d]])),d=(e,r)=>{let i=(0,o.forwardRef)(({className:i,...n},d)=>(0,o.createElement)(l,{ref:d,iconNode:r,className:a(`lucide-${t(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...n}));return i.displayName=t(e),i}},92289:(e,r,i)=>{i.d(r,{A:()=>o});let o=(0,i(78340).A)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]])},98590:(e,r,i)=>{i.d(r,{N:()=>a});var o=i(95155),t=i(51862);let a=({size:e,centerIcon:r})=>(0,o.jsx)(n,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(s,{}),(0,o.jsx)(c,{}),r?(0,o.jsx)(d,{children:r}):null]})}),n=t.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=t.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,d=t.I4.div`
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
`,s=t.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,c=t.I4.div`
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
`},98910:(e,r,i)=>{i.d(r,{E:()=>t});var o=i(51862);let t=o.I4.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`}}]);