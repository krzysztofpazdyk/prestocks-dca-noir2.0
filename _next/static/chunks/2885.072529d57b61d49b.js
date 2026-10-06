"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2885],{673:(e,r,i)=>{i.d(r,{C:()=>h});var n=i(95155),o=i(12115),t=i(51862),a=i(31794),l=i(35450),d=i(51774),c=i(65534),s=i(97677),p=i(69685);let u=({value:e,onChange:r})=>(0,n.jsx)("select",{value:e,onChange:r,children:a.QN.map(e=>(0,n.jsxs)("option",{value:e.code,children:[e.code," +",e.callCode]},e.code))}),h=(0,o.forwardRef)((e,r)=>{let i=(0,d.a)(),[t,h]=(0,o.useState)(!1),{accountType:x}=(0,c.h)(),[b,f]=(0,o.useState)(""),[m,y]=(0,o.useState)(e.defaultCountry??i?.intl.defaultCountry??"US"),w=(0,a.Q7)(b,m),j=(0,a.qi)(m),k=(0,a.jZ)(m),S=(0,l.K)(m),C=!w,[$,I]=(0,o.useState)(!1),z=S.length,E=r=>{let i=r.target.value;y(i),f(""),e.onChange&&e.onChange({rawPhoneNumber:b,qualifiedPhoneNumber:(0,a.n4)(b,i),countryCode:i,isValid:(0,a.Q7)(b,m)})},N=(r,i)=>{try{let n=r.replace(/\D/g,"")===b.replace(/\D/g,"")?r:j.input(r);f(n),e.onChange&&e.onChange({rawPhoneNumber:n,qualifiedPhoneNumber:(0,a.n4)(r,i),countryCode:i,isValid:(0,a.Q7)(r,i)})}catch(e){console.error("Error processing phone number:",e)}},P=()=>{I(!0);let r=(0,a.n4)(b,m);e.onSubmit({rawPhoneNumber:b,qualifiedPhoneNumber:r,countryCode:m,isValid:(0,a.Q7)(b,m)}).finally(()=>I(!1))};return(0,o.useEffect)(()=>{if(e.defaultValue){let r=(0,a.oj)(e.defaultValue);j.reset(),E({target:{value:r.countryCode}}),N(r.phone,r.countryCode)}},[e.defaultValue]),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(g,{children:(0,n.jsxs)(v,{$callingCodeLength:z,$stacked:e.stacked,children:[(0,n.jsx)(u,{value:m,onChange:E}),(0,n.jsx)("input",{ref:r,id:"phone-number-input",className:"login-method-button",type:"tel",placeholder:k,onFocus:()=>h(!0),onChange:e=>{N(e.target.value,m)},onKeyUp:e=>{"Enter"===e.key&&P()},value:b,autoComplete:"tel"}),"phone"!==x||t||e.hideRecent?e.stacked||e.noIncludeSubmitButton?(0,n.jsx)("span",{}):(0,n.jsx)(s.E,{isSubmitting:$,onClick:P,disabled:C,children:"Submit"}):(0,n.jsx)(p.C,{color:"gray",children:"Recent"})]})}),e.stacked&&!e.noIncludeSubmitButton?(0,n.jsx)(s.P,{loading:$,loadingText:null,onClick:P,disabled:C,children:"Submit"}):null]})}),g=t.I4.div`
  width: 100%;
`,v=t.I4.label`
  --country-code-dropdown-width: calc(54px + calc(12 * ${e=>e.$callingCodeLength}px));
  --phone-input-extra-padding-left: calc(12px + calc(3 * ${e=>e.$callingCodeLength}px));
  display: block;
  position: relative;
  width: 100%;

  /* Tablet and Up */
  @media (min-width: 441px) {
    --country-code-dropdown-width: calc(52px + calc(10 * ${e=>e.$callingCodeLength}px));
  }

  && > select {
    font-size: 16px;
    height: 24px;
    position: absolute;
    margin: 13px calc(var(--country-code-dropdown-width) / 4);
    line-height: 24px;
    width: var(--country-code-dropdown-width);
    background-color: var(--privy-color-background);
    background-size: auto;
    background-position-x: right;
    cursor: pointer;

    /* Tablet and Up */
    @media (min-width: 441px) {
      font-size: 14px;
      width: var(--country-code-dropdown-width);
    }

    :focus {
      outline: none;
      box-shadow: none;
    }
  }

  && > input {
    font-size: 16px;
    line-height: 24px;
    color: var(--privy-color-foreground);

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    padding: 12px 88px 12px
      calc(var(--country-code-dropdown-width) + var(--phone-input-extra-padding-left));
    padding-right: ${e=>e.$stacked?"16px":"88px"};
    flex-grow: 1;
    background: var(--privy-color-background);
    border: 1px solid var(--privy-color-foreground-4);
    border-radius: var(--privy-border-radius-md);
    width: 100%;

    :focus {
      outline: none;
      border-color: var(--privy-color-accent);
    }

    :autofill,
    :-webkit-autofill {
      background: var(--privy-color-background);
    }

    /* Tablet and Up */
    @media (min-width: 441px) {
      font-size: 14px;
      padding-right: 78px;
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
    padding: 13px 17px;

    :focus {
      outline: none;
      border-color: var(--privy-color-accent);
    }
  }

  && > input::placeholder {
    color: var(--privy-color-foreground-3);
  }
`},10099:(e,r,i)=>{i.d(r,{A:()=>o});var n=i(12115);let o=n.forwardRef(function({title:e,titleId:r,...i},o){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":r},i),e?n.createElement("title",{id:r},e):null,n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"}))})},37403:(e,r,i)=>{i.d(r,{L:()=>t});var n=i(51862);let o=(0,n.i7)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,t=(0,n.AH)`
  ${e=>e.$isLoading?(0,n.AH)`
          width: 35%;
          animation: ${o} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},42885:(e,r,i)=>{i.r(r),i.d(r,{UpdatePhoneScreen:()=>u,UpdatePhoneScreenView:()=>p,default:()=>u});var n=i(95155),o=i(10099),t=i(12115),a=i(673),l=i(69704),d=i(73532),c=i(51774),s=i(50023);let p=({title:e="Update your phone number",subtitle:r="Add the phone number you'd like to use going forward. We'll send you a confirmation code",onSubmit:i,isSubmitting:l=!1})=>{let[d,c]=(0,t.useState)(null);return(0,n.jsx)(s.S,{title:e,subtitle:r,icon:o.A,primaryCta:{label:l?"Submitting":"Update",onClick:async()=>{d?.qualifiedPhoneNumber&&await i(d)},disabled:!d?.isValid||l},watermark:!0,children:(0,n.jsx)(a.C,{onChange:e=>{c(e)},onSubmit:async()=>{},noIncludeSubmitButton:!0,hideRecent:!0})})},u={component:()=>{let{currentScreen:e,data:r,navigate:i,setModalData:o}=(0,d.u)(),{user:a}=(0,c.u)(),{initUpdatePhone:s}=(0,l.u)(),[u,h]=(0,t.useState)(!1);return(0,n.jsx)(p,{onSubmit:async n=>{h(!0);try{if(!a?.phone?.number)throw Error("User is required to have an phone number to update it.");await s(a?.phone?.number,n.qualifiedPhoneNumber),i("AwaitingPasswordlessCodeScreen")}catch(n){o({errorModalData:{error:n,previousScreen:r?.errorModalData?.previousScreen||e||"LinkPhoneScreen"}}),i("ErrorScreen")}finally{h(!1)}},isSubmitting:u})}}},49579:(e,r,i)=>{i.d(r,{S:()=>k});var n=i(95155),o=i(12115),t=i(51862),a=i(57445),l=i(10308),d=i(97677),c=i(98590);let s=t.I4.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=t.I4.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=t.I4.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,h=(0,t.I4)(d.M)`
  margin: 0 -8px;
`,g=t.I4.div`
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
`,v=t.I4.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,x=t.I4.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,b=t.I4.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=t.I4.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,m=t.I4.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=t.I4.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg)";case"warning":return"var(--privy-color-warn)";case"error":return"var(--privy-color-error-bg)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,w=t.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,j=t.I4.div`
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
`,k=({children:e,...r})=>(0,n.jsx)(s,{children:(0,n.jsx)(p,{...r,children:e})}),S=t.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,C=(0,t.I4)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,$=t.I4.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,I=({step:e})=>e?(0,n.jsx)(S,{children:(0,n.jsx)($,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:i,iconVariant:o,iconLoadingStatus:t,showBack:a,onBack:l,showInfo:d,onInfo:c,showClose:s,onClose:p,step:g,headerTitle:v,eyebrow:y,...w})=>(0,n.jsxs)(u,{...w,children:[(0,n.jsx)(h,{backFn:a?l:void 0,infoFn:d?c:void 0,onClose:s?p:void 0,title:v,eyebrow:y,closeable:s}),(i||o||e||r)&&(0,n.jsxs)(x,{children:[i||o?(0,n.jsx)(k.Icon,{icon:i,variant:o,loadingStatus:t}):null,!(!e&&!r)&&(0,n.jsxs)(b,{children:[e&&(0,n.jsx)(f,{children:e}),r&&(0,n.jsx)(m,{children:r})]})]}),g&&(0,n.jsx)(I,{step:g})]}),(k.Body=o.forwardRef(({children:e,...r},i)=>(0,n.jsx)(g,{ref:i,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,n.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,n.jsx)(z,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,n.jsx)(E,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,n.jsx)(N,{...r,children:e}),k.Watermark=()=>(0,n.jsx)(C,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(w,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,n.jsx)(j,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(a.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(y,{$variant:r,children:(0,n.jsx)(c.N,{size:"64px"})}):(0,n.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let z=t.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,E=t.I4.div`
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
`,N=t.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>a});var n=i(95155),o=i(97677),t=i(49579);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:d,...c})=>{let s=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,t=i.variant||"primary";return(0,n.jsx)(o.B,{...i,variant:t,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,t=i.variant||"secondary";return(0,n.jsx)(o.B,{...i,variant:t,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(t.S,{id:c.id,className:c.className,children:[(0,n.jsx)(t.S.Header,{...c}),d?(0,n.jsx)(t.S.Body,{children:d}):null,i||s||l?(0,n.jsxs)(t.S.Footer,{children:[i?(0,n.jsx)(t.S.HelpText,{children:i}):null,s?(0,n.jsx)(t.S.Actions,{children:s}):null,l?(0,n.jsx)(t.S.Watermark,{}):null]}):null,a?(0,n.jsx)(t.S.FooterText,{children:a}):null]})}},69685:(e,r,i)=>{i.d(r,{C:()=>a});var n=i(95155),o=i(51862),t=i(37403);let a=({children:e,color:r,isLoading:i,isPulsing:o,...t})=>(0,n.jsx)(l,{$color:r,$isLoading:i,$isPulsing:o,...t,children:e}),l=o.I4.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let r,i;"green"===e.$color&&(r="var(--privy-color-success-dark)",i="var(--privy-color-success-light)"),"red"===e.$color&&(r="var(--privy-color-error)",i="var(--privy-color-error-light)"),"gray"===e.$color&&(r="var(--privy-color-foreground-2)",i="var(--privy-color-background-2)");let n=(0,o.i7)`
      from, to {
        background-color: ${i};
      }

      50% {
        background-color: rgba(${i}, 0.8);
      }
    `;return(0,o.AH)`
      color: ${r};
      background-color: ${i};
      ${e.$isPulsing&&(0,o.AH)`
        animation: ${n} 3s linear infinite;
      `};
    `}}

  ${t.L}
`},98590:(e,r,i)=>{i.d(r,{N:()=>t});var n=i(95155),o=i(51862);let t=({size:e,centerIcon:r})=>(0,n.jsx)(a,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(s,{}),r?(0,n.jsx)(d,{children:r}):null]})}),a=o.I4.div`
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
`,d=o.I4.div`
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
`,s=o.I4.div`
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