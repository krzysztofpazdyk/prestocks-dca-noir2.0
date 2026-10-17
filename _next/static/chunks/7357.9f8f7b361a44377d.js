"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7357],{8336:(e,r,i)=>{i.d(r,{B:()=>t,C:()=>l,F:()=>c,H:()=>o,R:()=>v,S:()=>p,a:()=>d,b:()=>u,c:()=>s,d:()=>h,e:()=>a});var n=i(51862);let t=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,a=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,o=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,n.I4)(a)`
  padding: 20px 0;
`,s=(0,n.I4)(a)`
  gap: 16px;
`,c=n.I4.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;n.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let p=n.I4.div`
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
`,u=n.I4.div`
  height: 16px;
`,v=n.I4.div`
  height: 12px;
`;n.I4.div`
  position: relative;
`;let h=n.I4.div`
  height: ${e=>e.height??"12"}px;
`;n.I4.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},10099:(e,r,i)=>{i.d(r,{A:()=>t});var n=i(12115);let t=n.forwardRef(function({title:e,titleId:r,...i},t){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?n.createElement("title",{id:r},e):null,n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"}))})},17357:(e,r,i)=>{i.r(r),i.d(r,{AwaitingPasswordlessCodeScreen:()=>E,AwaitingPasswordlessCodeScreenView:()=>m,default:()=>E});var n=i(95155),t=i(12115);let a=t.forwardRef(function({title:e,titleId:r,...i},n){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},i),e?t.createElement("title",{id:r},e):null,t.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))});var o=i(53931),l=i(10099),s=i(67884),c=i(51862),d=i(8336),p=i(26904),u=i(51774),v=i(37857),h=i(69704),g=i(73532),x=i(45054),f=i(50023);let m=({contactMethod:e,authFlow:r,emailDomain:i,appName:c="Privy",whatsAppEnabled:u=!1,onBack:v,onCodeSubmit:h,onResend:g,errorMessage:x,success:m=!1,resendCountdown:w=0,onInvalidInput:j,onClearError:k})=>{let[I,E]=(0,t.useState)(b);(0,t.useEffect)(()=>{x||E(b)},[x]);let _=async e=>{e.preventDefault();let r=e.currentTarget.value.replace(" ","");if(""===r)return;if(isNaN(Number(r)))return void j?.("Code should be numeric");k?.();let i=Number(e.currentTarget.name?.charAt(5)),n=[...r||[""]].slice(0,y-i),t=[...I.slice(0,i),...n,...I.slice(i+n.length)];E(t);let a=Math.min(Math.max(i+n.length,0),y-1);if(!isNaN(Number(e.currentTarget.value))){let e=document.querySelector(`input[name=code-${a}]`);e?.focus()}if(t.every(e=>e&&!isNaN(+e))){let e=document.querySelector(`input[name=code-${a}]`);e?.blur(),await h?.(t.join(""))}};return(0,n.jsx)(f.S,{title:"Enter confirmation code",subtitle:(0,n.jsxs)("span","email"===r?{children:["Please check ",(0,n.jsx)(N,{children:e})," for an email from"," ",i??"privy.io"," and enter your code below."]}:{children:["Please check ",(0,n.jsx)(N,{children:e})," for a",u?" WhatsApp":""," message from ",c," and enter your code below."]}),icon:"email"===r?o.A:l.A,onBack:v,showBack:!0,helpText:(0,n.jsxs)($,{children:[(0,n.jsxs)("span",{children:["Didn't get ","email"===r?"an email":"a message","?"]}),w?(0,n.jsxs)(T,{children:[(0,n.jsx)(a,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),(0,n.jsx)("span",{children:"Code sent"})]}):(0,n.jsx)(p.L,{as:"button",size:"sm",onClick:g,children:"Resend code"})]}),children:(0,n.jsx)(S,{children:(0,n.jsx)(d.H,{children:(0,n.jsxs)(C,{children:[(0,n.jsx)("div",{children:I.map((e,r)=>(0,n.jsx)("input",{name:`code-${r}`,type:"text",value:I[r],onChange:_,onKeyUp:e=>{"Backspace"===e.key&&(e=>{if(k?.(),E([...I.slice(0,e),"",...I.slice(e+1)]),e>0){let r=document.querySelector(`input[name=code-${e-1}]`);r?.focus()}})(r)},inputMode:"numeric",autoFocus:0===r,pattern:"[0-9]",className:`${m?"success":""} ${x?"fail":""}`,autoComplete:s.Fr?"one-time-code":"off"},r))}),(0,n.jsx)(A,{$fail:!!x,$success:m,children:(0,n.jsx)("span",{children:"Invalid or expired verification code"===x?"Incorrect code":x||(m?"Success!":"")})})]})})})})},y=6,b=Array(6).fill("");var w,j,k=((w=k||{})[w.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",w[w.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",w),I=((j=I||{})[j.EMAIL=0]="EMAIL",j[j.SMS=1]="SMS",j);let E={component:()=>{let{navigate:e,lastScreen:r,navigateBack:i,setModalData:a,onUserCloseViaDialogOrKeybindRef:o}=(0,g.u)(),l=(0,u.a)(),{closePrivyModal:s,resendEmailCode:c,resendSmsCode:d,getAuthMeta:p,loginWithCode:f,updateWallets:y,createAnalyticsEvent:b}=(0,h.u)(),{authenticated:w,logout:j,user:k}=(0,u.u)(),{whatsAppEnabled:I}=(0,u.a)(),[E,S]=(0,t.useState)(!1),[C,A]=(0,t.useState)(null),[$,T]=(0,t.useState)(null),[N,_]=(0,t.useState)(0);o.current=()=>null;let R=+!p()?.email,z=0===R?p()?.email||"":p()?.phoneNumber||"",L=u.Q-500;return(0,t.useEffect)(()=>{if(N){let e=setTimeout(()=>{_(N-1)},1e3);return()=>clearTimeout(e)}},[N]),(0,t.useEffect)(()=>{if(w&&E&&k){if(l?.legal.requireUsersAcceptTerms&&!k.hasAcceptedTerms){let r=setTimeout(()=>{e("AffirmativeConsentScreen")},L);return()=>clearTimeout(r)}if((0,x.s)(k,l.embeddedWallets)){let r=setTimeout(()=>{a({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),b({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"AwaitingPasswordlessCodeScreen"}}),j()},callAuthOnSuccessOnClose:!0}}),e("EmbeddedWalletOnAccountCreateScreen")},L);return()=>clearTimeout(r)}{y();let e=setTimeout(()=>s({shouldCallAuthOnSuccess:!0,isSuccess:!0}),u.Q);return()=>clearTimeout(e)}}},[w,E,k]),(0,t.useEffect)(()=>{if(C&&0===$){let e=setTimeout(()=>{A(null),T(null);let e=document.querySelector("input[name=code-0]");e?.focus()},1400);return()=>clearTimeout(e)}},[C,$]),(0,n.jsx)(m,{contactMethod:z,authFlow:0===R?"email":"sms",emailDomain:l?.appearance.emailDomain,appName:l?.name,whatsAppEnabled:I,onBack:()=>i(),onCodeSubmit:async i=>{try{await f(i),S(!0)}catch(i){if(i instanceof v.c&&i.privyErrorCode===v.a.INVALID_CREDENTIALS)A("Invalid or expired verification code"),T(0);else if(i instanceof v.c&&i.privyErrorCode===v.a.CANNOT_LINK_MORE_OF_TYPE)A(i.message);else{if(i instanceof v.c&&i.privyErrorCode===v.a.USER_LIMIT_REACHED)return console.error(new v.j(i).toString()),void e("UserLimitReachedScreen");if(i instanceof v.c&&i.privyErrorCode===v.a.USER_DOES_NOT_EXIST)return void e("AccountNotFoundScreen");if(i instanceof v.c&&i.privyErrorCode===v.a.LINKED_TO_ANOTHER_USER)return a({errorModalData:{error:i,previousScreen:r??"AwaitingPasswordlessCodeScreen"}}),void e("ErrorScreen",!1);if(i instanceof v.c&&i.privyErrorCode===v.a.DISALLOWED_PLUS_EMAIL)return a({inlineError:{error:i}}),void e("ConnectOrCreateScreen",!1);if(i instanceof v.c&&i.privyErrorCode===v.a.ACCOUNT_TRANSFER_REQUIRED&&i.data?.data?.nonce)return a({accountTransfer:{nonce:i.data?.data?.nonce,account:z,displayName:i.data?.data?.account?.displayName,linkMethod:0===R?"email":"sms",embeddedWalletAddress:i.data?.data?.otherUser?.embeddedWalletAddress}}),void e("LinkConflictScreen");A("Issue verifying code"),T(0)}}},onResend:async()=>{_(30),0===R?await c():await d()},errorMessage:C||void 0,success:E,resendCountdown:N,onInvalidInput:e=>{A(e),T(1)},onClearError:()=>{1===$&&(A(null),T(null))}})}},S=c.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,C=c.I4.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0);
    }
    33% {
      transform: translate(-1px, 0);
    }
    67% {
      transform: translate(-1px, 0);
    }
    100% {
      transform: translate(1px, 0);
    }
  }
`,A=c.I4.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${e=>e.$success?"var(--privy-color-success-dark)":e.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,$=c.I4.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,T=c.I4.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,N=c.I4.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`},26904:(e,r,i)=>{i.d(r,{L:()=>o});var n=i(95155),t=i(51862);let a=t.I4.a`
  && {
    color: ${({$variant:e})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
    font-weight: 400;
    text-decoration: ${({$variant:e})=>"underlined"===e?"underline":"var(--privy-link-navigation-decoration, none)"};
    text-underline-offset: 4px;
    text-decoration-thickness: 1px;
    cursor: ${({$disabled:e})=>e?"not-allowed":"pointer"};
    opacity: ${({$disabled:e})=>e?.5:1};

    font-size: ${({$size:e})=>{switch(e){case"xs":return"12px";case"sm":return"14px";default:return"16px"}}};

    line-height: ${({$size:e})=>{switch(e){case"xs":return"18px";case"sm":return"22px";default:return"24px"}}};

    transition:
      color 200ms ease,
      text-decoration-color 200ms ease,
      opacity 200ms ease;

    &:hover {
      color: ${({$variant:e,$disabled:r})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
      text-decoration: ${({$disabled:e})=>e?"none":"underline"};
      text-underline-offset: 4px;
    }

    &:active {
      color: ${({$variant:e,$disabled:r})=>r?"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))":"var(--privy-color-foreground)"};
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--privy-shadow-focus-ring);
      border-radius: 2px;
    }
  }
`,o=({size:e="md",variant:r="navigation",disabled:i=!1,as:t,children:o,onClick:l,...s})=>(0,n.jsx)(a,{as:t,$size:e,$variant:r,$disabled:i,onClick:e=>{i?e.preventDefault():l?.(e)},...s,children:o})},45054:(e,r,i)=>{i.d(r,{s:()=>t});var n=i(54479);let t=(e,r)=>(0,n.s)(e,r.ethereum.createOnLogin)||(0,n.g)(e,r.solana.createOnLogin)},49579:(e,r,i)=>{i.d(r,{S:()=>k});var n=i(95155),t=i(12115),a=i(51862),o=i(57445),l=i(10308),s=i(97677),c=i(98590);let d=a.I4.div`
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
`,v=(0,a.I4)(s.M)`
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
`,k=({children:e,...r})=>(0,n.jsx)(d,{children:(0,n.jsx)(p,{...r,children:e})}),I=a.I4.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,E=(0,a.I4)(l.B)`
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
`,C=({step:e})=>e?(0,n.jsx)(I,{children:(0,n.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:a,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:p,step:h,headerTitle:g,eyebrow:b,...w})=>(0,n.jsxs)(u,{...w,children:[(0,n.jsx)(v,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?p:void 0,title:g,eyebrow:b,closeable:d}),(i||t||e||r)&&(0,n.jsxs)(x,{children:[i||t?(0,n.jsx)(k.Icon,{icon:i,variant:t,loadingStatus:a}):null,!(!e&&!r)&&(0,n.jsxs)(f,{children:[e&&(0,n.jsx)(m,{children:e}),r&&(0,n.jsx)(y,{children:r})]})]}),h&&(0,n.jsx)(C,{step:h})]}),(k.Body=t.forwardRef(({children:e,...r},i)=>(0,n.jsx)(h,{ref:i,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,n.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,n.jsx)(A,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,n.jsx)($,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,n.jsx)(T,{...r,children:e}),k.Watermark=()=>(0,n.jsx)(E,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,n.jsx)(w,"string"==typeof e?{children:(0,n.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,n.jsx)(j,{children:(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,n.jsx)(o.C,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,n.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,n.jsx)(b,{$variant:r,children:(0,n.jsx)(c.N,{size:"64px"})}):(0,n.jsx)(b,{$variant:r,children:e&&("string"==typeof e?(0,n.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let A=a.I4.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,$=a.I4.div`
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
`,T=a.I4.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; /* 11px */
    line-height: 1rem; /* 16px */
  }
`},50023:(e,r,i)=>{i.d(r,{S:()=>o});var n=i(95155),t=i(97677),a=i(49579);let o=({primaryCta:e,secondaryCta:r,helpText:i,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,n.jsxs)(n.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,a=i.variant||"primary";return(0,n.jsx)(t.B,{...i,variant:a,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,a=i.variant||"secondary";return(0,n.jsx)(t.B,{...i,variant:a,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,n.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,n.jsx)(a.S.Header,{...c}),s?(0,n.jsx)(a.S.Body,{children:s}):null,i||d||l?(0,n.jsxs)(a.S.Footer,{children:[i?(0,n.jsx)(a.S.HelpText,{children:i}):null,d?(0,n.jsx)(a.S.Actions,{children:d}):null,l?(0,n.jsx)(a.S.Watermark,{}):null]}):null,o?(0,n.jsx)(a.S.FooterText,{children:o}):null]})}},53931:(e,r,i)=>{i.d(r,{A:()=>t});var n=i(12115);let t=n.forwardRef(function({title:e,titleId:r,...i},t){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?n.createElement("title",{id:r},e):null,n.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"}))})},98590:(e,r,i)=>{i.d(r,{N:()=>a});var n=i(95155),t=i(51862);let a=({size:e,centerIcon:r})=>(0,n.jsx)(o,{$size:e,children:(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{}),(0,n.jsx)(d,{}),r?(0,n.jsx)(s,{children:r}):null]})}),o=t.I4.div`
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
`,s=t.I4.div`
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
`,c=t.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=t.I4.div`
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