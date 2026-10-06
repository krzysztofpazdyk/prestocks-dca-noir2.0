"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4814],{673:(e,n,o)=>{o.d(n,{C:()=>m});var t=o(95155),r=o(12115),l=o(51862),a=o(31794),i=o(35450),s=o(51774),c=o(65534),d=o(97677),u=o(69685);let h=({value:e,onChange:n})=>(0,t.jsx)("select",{value:e,onChange:n,children:a.QN.map(e=>(0,t.jsxs)("option",{value:e.code,children:[e.code," +",e.callCode]},e.code))}),m=(0,r.forwardRef)((e,n)=>{let o=(0,s.a)(),[l,m]=(0,r.useState)(!1),{accountType:f}=(0,c.h)(),[y,j]=(0,r.useState)(""),[g,v]=(0,r.useState)(e.defaultCountry??o?.intl.defaultCountry??"US"),w=(0,a.Q7)(y,g),b=(0,a.qi)(g),C=(0,a.jZ)(g),k=(0,i.K)(g),S=!w,[M,E]=(0,r.useState)(!1),F=k.length,P=n=>{let o=n.target.value;v(o),j(""),e.onChange&&e.onChange({rawPhoneNumber:y,qualifiedPhoneNumber:(0,a.n4)(y,o),countryCode:o,isValid:(0,a.Q7)(y,g)})},R=(n,o)=>{try{let t=n.replace(/\D/g,"")===y.replace(/\D/g,"")?n:b.input(n);j(t),e.onChange&&e.onChange({rawPhoneNumber:t,qualifiedPhoneNumber:(0,a.n4)(n,o),countryCode:o,isValid:(0,a.Q7)(n,o)})}catch(e){console.error("Error processing phone number:",e)}},T=()=>{E(!0);let n=(0,a.n4)(y,g);e.onSubmit({rawPhoneNumber:y,qualifiedPhoneNumber:n,countryCode:g,isValid:(0,a.Q7)(y,g)}).finally(()=>E(!1))};return(0,r.useEffect)(()=>{if(e.defaultValue){let n=(0,a.oj)(e.defaultValue);b.reset(),P({target:{value:n.countryCode}}),R(n.phone,n.countryCode)}},[e.defaultValue]),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x,{children:(0,t.jsxs)(p,{$callingCodeLength:F,$stacked:e.stacked,children:[(0,t.jsx)(h,{value:g,onChange:P}),(0,t.jsx)("input",{ref:n,id:"phone-number-input",className:"login-method-button",type:"tel",placeholder:C,onFocus:()=>m(!0),onChange:e=>{R(e.target.value,g)},onKeyUp:e=>{"Enter"===e.key&&T()},value:y,autoComplete:"tel"}),"phone"!==f||l||e.hideRecent?e.stacked||e.noIncludeSubmitButton?(0,t.jsx)("span",{}):(0,t.jsx)(d.E,{isSubmitting:M,onClick:T,disabled:S,children:"Submit"}):(0,t.jsx)(u.C,{color:"gray",children:"Recent"})]})}),e.stacked&&!e.noIncludeSubmitButton?(0,t.jsx)(d.P,{loading:M,loadingText:null,onClick:T,disabled:S,children:"Submit"}):null]})}),x=l.I4.div`
  width: 100%;
`,p=l.I4.label`
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
`},33187:(e,n,o)=>{o.d(n,{A:()=>r});var t=o(12115);let r=t.forwardRef(function({title:e,titleId:n,...o},r){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":n},o),e?t.createElement("title",{id:n},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))})},34814:(e,n,o)=>{o.r(n),o.d(n,{MfaEnrollmentFlowScreen:()=>k,default:()=>k});var t=o(95155),r=o(26798),l=o(67112),a=o(12115);let i=a.forwardRef(function({title:e,titleId:n,...o},t){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":n},o),e?a.createElement("title",{id:n},e):null,a.createElement("path",{fillRule:"evenodd",d:"M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",clipRule:"evenodd"}))}),s=a.forwardRef(function({title:e,titleId:n,...o},t){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":n},o),e?a.createElement("title",{id:n},e):null,a.createElement("path",{fillRule:"evenodd",d:"M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z",clipRule:"evenodd"}))});var c=o(97677),d=o(57445),u=o(10308),h=o(51774),m=o(69704),x=o(73532),p=o(54479),f=o(67473),y=o(33187),j=o(10099),g=o(31794),v=o(673),w=o(3445),b=o(52680);let C=({appName:e,onComplete:n,onReset:o,onClose:r})=>{let[l,i]=(0,a.useState)(""),[s,d]=(0,a.useState)(!1),[m,f]=(0,a.useState)(null),[C,k]=(0,a.useState)("enroll"),{initEnrollmentWithSms:S,submitEnrollmentWithSms:M}=(0,p.h)(),{data:E}=(0,x.u)(),F=(0,h.a)();function P(){E?.mfaEnrollmentFlow?.onSuccess(),n()}return m?(0,t.jsx)(b.ErrorScreenView,{allowlistConfig:F.allowlistConfig,error:m,onBack:()=>f(null),onRetry:()=>f(null)}):(0,t.jsxs)(t.Fragment,"enroll"===C?{children:[(0,t.jsx)(c.M,{backFn:o,onClose:r},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(j.A,{})}),(0,t.jsx)(w.T,{children:"Set up SMS verification"}),(0,t.jsxs)(w.S,{children:["We'll text a verification code to this mobile device whenever you use your ",e," ","wallet."]}),(0,t.jsxs)(w.C,{children:[(0,t.jsx)(v.C,{onSubmit:async function({qualifiedPhoneNumber:e}){try{await S({phoneNumber:e}),i(e),k("verify")}catch(e){f(e)}},hideRecent:!0}),(0,t.jsxs)(w.c,{children:["By providing your mobile number, you agree to receive text messages from ",F?.name,". Some carrier charges may apply"]})]}),(0,t.jsx)(u.M,{})]}:s?{children:[(0,t.jsx)(c.M,{onClose:P},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(y.A,{})}),(0,t.jsx)(w.T,{children:"SMS verification added"}),(0,t.jsxs)(w.S,{children:["From now on, you'll enter the verification code sent to your mobile device whenever you use your ",e," wallet."]}),(0,t.jsx)(w.B,{children:(0,t.jsx)(c.P,{onClick:P,children:"Done"})}),(0,t.jsx)(u.M,{})]}:{children:[(0,t.jsx)(c.M,{backFn:function(){"verify"===C?k("enroll"):o()},onClose:r},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(j.A,{})}),(0,t.jsx)(w.T,{children:"Enter enrollment code"}),(0,t.jsxs)(w.C,{children:[(0,t.jsx)(w.N,{onChange:async function(e){try{if(!e)return;await M({phoneNumber:l,mfaCode:e}),d(!0)}catch(e){if((0,p.i)(e))throw Error("You have exceeded the maximum number of attempts. Please close this window and try again in 10 seconds.");if((0,p.d)(e))throw Error("The code you entered is not valid");if((0,p.f)(e))throw Error("You have exceeded the time limit for code entry. Please try again in 30 seconds.");throw(0,p.j)(e)?Error("Verification canceled"):Error("Unknown error")}}}),(0,t.jsxs)(w.S,{children:["To continue, enter the 6-digit code sent to ",(0,t.jsx)("strong",{children:(0,g.Ds)(l)})]})]}),(0,t.jsx)(u.M,{})]})},k={component:()=>{let{user:e,enrollInMfa:n,ready:o}=(0,h.u)(),[y,j]=(0,a.useState)(null),{unenrollWithSms:g,unenrollWithTotp:v,unenrollWithPasskey:b,submitEnrollmentWithTotp:k,initEnrollmentWithPasskey:S,submitEnrollmentWithPasskey:M,initEnrollmentWithTotp:E}=(0,p.h)(),{data:F,onUserCloseViaDialogOrKeybindRef:P}=(0,x.u)(),R=(0,h.a)(),{closePrivyModal:T}=(0,m.u)(),{promptMfa:A}=(0,p.u)(),[B,N]=(0,a.useState)(!1),[I,L]=(0,a.useState)(null),[U,W]=(0,a.useState)(null),$=()=>{T({shouldCallAuthOnSuccess:!0}),n(!1),setTimeout(()=>{j(null),L(null)},500)},[V,Z]=(0,a.useState)(!1),[O,q]=(0,a.useState)();P.current=$;let z=e?.mfaMethods.includes("sms"),D=!!e?.phone,Q=e?.mfaMethods.includes("totp"),H=e?.mfaMethods.includes("passkey"),_=z||Q||H,K=e?.linkedAccounts.filter(e=>"passkey"===e.type).map(e=>e.credentialId)??[];function Y(){j(null),L(null)}async function G(e=K){Z(!0);try{return await S(),await M({credentialIds:e},{removeForLogin:F?.mfaEnrollmentFlow?.shouldUnlinkOnUnenrollMfa}),F?.mfaEnrollmentFlow?.onSuccess(),$()}catch(e){q(e)}finally{Z(!1)}}if((0,a.useEffect)(()=>{_&&N(!0)},[_]),!o||!e||!R)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.M,{onClose:$},"header"),(0,t.jsx)(w.A,{children:(0,t.jsx)(f.M,{})}),(0,t.jsx)(w.C,{children:(0,t.jsx)(d.L,{})}),(0,t.jsx)(u.M,{})]});if("sms"===y)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.M,{backFn:Y,onClose:$},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(r.A,{})}),(0,t.jsx)(w.T,{children:"Remove SMS verification?"}),(0,t.jsxs)(w.S,{children:["MFA adds an extra layer of security to your ",R?.name," account. Make sure you have other methods to secure your account."]}),(0,t.jsx)(w.B,{children:(0,t.jsx)(c.P,{$warn:!0,onClick:async function(){j(null);try{await g()}catch(e){j(null)}},children:"Remove"})}),(0,t.jsx)(u.M,{})]});if("totp"===y)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.M,{backFn:Y,onClose:$},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(r.A,{})}),(0,t.jsx)(w.T,{children:"Remove authenticator app verification?"}),(0,t.jsxs)(w.S,{children:["MFA adds an extra layer of security to your ",R?.name," account. Make sure you have other methods to secure your account."]}),(0,t.jsx)(w.B,{children:(0,t.jsx)(c.P,{$warn:!0,onClick:async function(){j(null);try{await v()}catch(e){j(null)}},children:"Remove"})}),(0,t.jsx)(u.M,{})]});if("passkey"===y){let e=F?.mfaEnrollmentFlow?.shouldUnlinkOnUnenrollMfa??!0;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.M,{backFn:Y,onClose:$},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(r.A,{})}),(0,t.jsx)(w.T,{children:"Are you sure you want to remove this passkey?"}),(0,t.jsx)(w.S,{children:e?"Removing your passkey will remove as both a verification method and a login method.":"Removing your passkey will remove as a verification method."}),(0,t.jsx)(w.B,{children:(0,t.jsx)(c.P,{$warn:!0,onClick:async function(){j(null);try{await b({removeForLogin:F?.mfaEnrollmentFlow?.shouldUnlinkOnUnenrollMfa})}catch(e){j(null)}},children:"Remove"})}),(0,t.jsx)(u.M,{})]})}if(0===F.mfaEnrollmentFlow.mfaMethods.length&&!_)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.M,{onClose:$},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(l.A,{})}),(0,t.jsx)(w.T,{children:"Add more security"}),(0,t.jsxs)(w.S,{children:[R?.name," does not have any verification methods enabled."]}),(0,t.jsx)(w.B,{children:(0,t.jsx)(c.P,{onClick:$,children:"Close"})}),(0,t.jsx)(u.M,{})]});let J=!_&&!B;return J?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(c.M,{onClose:$},"header"),(0,t.jsx)(w.I,{style:{marginBottom:"1.5rem"},children:(0,t.jsx)(l.A,{})}),(0,t.jsx)(w.T,{children:"Transaction Protection"}),(0,t.jsx)(w.S,{children:"Set up transaction protection to add an extra layer of security to your account"}),(0,t.jsxs)(w.L,{children:[(0,t.jsxs)(w.a,{children:[(0,t.jsx)(w.b,{children:(0,t.jsx)(i,{})}),"Enable 2-Step verification for your ",R?.name," wallet."]}),(0,t.jsxs)(w.a,{children:[(0,t.jsx)(w.b,{children:(0,t.jsx)(s,{})}),"You'll be prompted to authenticate to complete transactions."]})]}),(0,t.jsxs)(w.B,{children:[(0,t.jsx)(c.P,{onClick:()=>N(!0),children:"Continue"}),(0,t.jsx)(c.S,{onClick:$,children:"Not now"})]}),(0,t.jsx)(u.M,{})]}):"sms"===I?(0,t.jsx)(C,{appName:R?.name||"Privy",onComplete:$,onReset:Y,onClose:$}):"totp"===I&&U?(0,t.jsx)(f.E,{onClose:$,onReset:Y,submitEnrollmentWithTotp:({mfaCode:e})=>(async function(e){try{return q(void 0),await k({mfaCode:e}),F?.mfaEnrollmentFlow?.onSuccess(),$()}catch(e){q(e)}finally{j(null)}})(e),totpInfo:{...U,appName:R?.name||"Privy"}}):"passkey"===I?(0,t.jsx)(f.a,{onReset:Y,onClose:$,submitEnrollmentWithPasskey:G}):(0,t.jsx)(f.b,{showIntro:J,userMfaMethods:e.mfaMethods,appMfaMethods:R.mfa.methods,userHasAuthSms:D,backFn:function(){N(!1)},handleSelectMethod:async function(e){try{await A()}catch(e){return void q(e)}return"totp"===e?(L(e),W(null),void E().then(e=>{W(e)}).catch(()=>{W(null),Y()})):"passkey"===e&&1===K.length?await G():void L(e)},isTotpLoading:"totp"===I&&!U,isPasskeyLoading:V,error:O,onClose:$,setRemovingMfaMethod:async e=>{try{await A()}catch(e){return void q(e)}j(e)}})}}}}]);