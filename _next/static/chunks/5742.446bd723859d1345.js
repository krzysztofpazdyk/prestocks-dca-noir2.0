"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5742],{48280:(e,t,s)=>{s.d(t,{A:()=>r});let r=(0,s(78340).A)("hourglass",[["path",{d:"M5 22h14",key:"ehvnwv"}],["path",{d:"M5 2h14",key:"pdyrp9"}],["path",{d:"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",key:"1d314k"}],["path",{d:"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",key:"1vvvr6"}]])},67635:(e,t,s)=>{s.d(t,{A:()=>r});let r=(0,s(78340).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},81728:(e,t,s)=>{s.r(t),s.d(t,{FundWithBankDepositScreen:()=>I,default:()=>I});var r=s(95155),o=s(12115),a=s(31794),n=s(49056),i=s(73532),c=s(51774),l=s(67884),u=s(51862),d=s(91322),p=s(43665),y=s(50023),m=s(62791),f=s(48280);let h=(0,s(78340).A)("user-check",[["path",{d:"m16 11 2 2 4-4",key:"9rsbq5"}],["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);var k=s(94514),g=s(20223),v=s(6224);let w=({data:e,onClose:t})=>(0,r.jsx)(y.S,{showClose:!0,onClose:t,title:"Initiate bank transfer",subtitle:"Use the details below to complete a bank transfer from your bank.",primaryCta:{label:"Done",onClick:t},watermark:!1,footerText:"Exchange rates and fees are set when you authorize and determine the amount you receive. You'll see the applicable rates and fees for your transaction separately",children:(0,r.jsx)(C,{children:(p.D[e.deposit_instructions.asset]||[]).map(([t,s],o)=>{let a=e.deposit_instructions[t];if(!a||Array.isArray(a))return null;let n="asset"===t?a.toUpperCase():a,i=n.length>100?`${n.slice(0,9)}...${n.slice(-9)}`:n;return(0,r.jsxs)(b,{children:[(0,r.jsx)(x,{children:s}),(0,r.jsx)(d.a,{value:n,includeChildren:l.Fr,children:(0,r.jsx)(A,{children:i})})]},o)})})}),C=u.I4.ol`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-mdlg);
  border-style: solid;
  display: flex;
  flex-direction: column;

  && {
    padding: 0 1rem;
  }
`,b=u.I4.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;

  &:not(:first-of-type) {
    border-top: 1px solid var(--privy-color-border-default);
  }

  & > {
    :nth-child(1) {
      flex-basis: 30%;
    }

    :nth-child(2) {
      flex-basis: 60%;
    }
  }
`,x=u.I4.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'calt' off;

  /* text-xs/font-regular */
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.125rem; /* 150% */

  text-align: left;
  flex-shrink: 0;
`,A=u.I4.span`
  color: var(--privy-color-foreground);
  font-kerning: none;
  font-feature-settings: 'calt' off;

  /* text-sm/font-medium */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */

  text-align: right;
  word-break: break-all;
`,j=({onClose:e})=>(0,r.jsx)(y.S,{showClose:!0,onClose:e,icon:m.A,iconVariant:"error",title:"Something went wrong",subtitle:"We couldn't complete account setup. This isn't caused by anything you did.",primaryCta:{label:"Close",onClick:e},watermark:!0}),S=({onClose:e,reason:t})=>{let s=t?t.charAt(0).toLowerCase()+t.slice(1):void 0;return(0,r.jsx)(y.S,{showClose:!0,onClose:e,icon:m.A,iconVariant:"error",title:"Identity verification failed",subtitle:s?`We can't complete identity verification because ${s}. Please try again or contact support for assistance.`:"We couldn't verify your identity. Please try again or contact support for assistance.",primaryCta:{label:"Close",onClick:e},watermark:!0})},B=({onClose:e,email:t})=>(0,r.jsx)(y.S,{showClose:!0,onClose:e,icon:f.A,title:"Identity verification in progress",subtitle:"We're waiting for Persona to approve your identity verification. This usually takes a few minutes, but may take up to 24 hours.",primaryCta:{label:"Done",onClick:e},watermark:!0,children:(0,r.jsxs)(g.I,{theme:"light",children:["You'll receive an email at ",t," once approved with instructions for completing your deposit."]})}),E=({onClose:e,onAcceptTerms:t,isLoading:s})=>(0,r.jsx)(y.S,{showClose:!0,onClose:e,icon:h,title:"Verify your identity to continue",subtitle:"Finish verification with Persona — it takes just a few minutes and requires a government ID.",helpText:(0,r.jsxs)(r.Fragment,{children:['This app uses Bridge to securely connect accounts and move funds. By clicking "Accept," you agree to Bridge\'s'," ",(0,r.jsx)("a",{href:"https://www.bridge.xyz/legal",target:"_blank",rel:"noopener noreferrer",children:"Terms of Service"})," ","and"," ",(0,r.jsx)("a",{href:"https://www.bridge.xyz/legal/row-privacy-policy/bridge-building-limited",target:"_blank",rel:"noopener noreferrer",children:"Privacy Policy"}),"."]}),primaryCta:{label:"Accept and continue",onClick:t,loading:s},watermark:!0}),U=({onClose:e})=>(0,r.jsx)(y.S,{showClose:!0,onClose:e,icon:k.A,iconVariant:"success",title:"Identity verified successfully",subtitle:"We've successfully verified your identity. Now initiate a bank transfer to view instructions.",primaryCta:{label:"Initiate bank transfer",onClick:()=>{},loading:!0},watermark:!0}),_=({opts:e,onClose:t,onBack:s,onEditSourceAsset:o,onSelectAmount:a,isLoading:n})=>(0,r.jsxs)(y.S,{showClose:!0,onClose:t,showBack:!!s,onBack:s,headerTitle:`Buy ${e.destination.asset.toLocaleUpperCase()}`,primaryCta:{label:"Continue",onClick:a,loading:n},watermark:!0,children:[(0,r.jsx)(v.A,{currency:e.source.selectedAsset,inputMode:"decimal",autoFocus:!0}),(0,r.jsx)(v.C,{selectedAsset:e.source.selectedAsset,onEditSourceAsset:o})]}),T=({onClose:e,onBack:t,onAcceptTerms:s,onSelectAmount:o,onSelectSource:a,onEditSourceAsset:n,opts:i,state:c,email:l,isLoading:u})=>"select-amount"===c.status?(0,r.jsx)(_,{onClose:e,onBack:t,onSelectAmount:o,onEditSourceAsset:n,opts:i,isLoading:u}):"select-source-asset"===c.status?(0,r.jsx)(v.S,{onSelectSource:a,opts:i,isLoading:u}):"kyc-prompt"===c.status?(0,r.jsx)(E,{onClose:e,onAcceptTerms:s,opts:i,isLoading:u}):"kyc-incomplete"===c.status?(0,r.jsx)(B,{onClose:e,email:l}):"kyc-success"===c.status?(0,r.jsx)(U,{onClose:e}):"kyc-error"===c.status?(0,r.jsx)(S,{onClose:e,reason:c.reason}):"account-details"===c.status?(0,r.jsx)(w,{onClose:e,data:c.data}):"create-customer-error"===c.status||"get-customer-error"===c.status?(0,r.jsx)(j,{onClose:e}):null,I={component:()=>{let{user:e}=(0,c.u)(),t=(0,i.u)().data;if(!t?.FundWithBankDepositScreen)throw Error("Missing data");let{onSuccess:s,onFailure:l,onBack:u,opts:d,createOrUpdateCustomer:p,getCustomer:y,getOrCreateVirtualAccount:m}=t.FundWithBankDepositScreen,[f,h]=(0,o.useState)(d),[k,g]=(0,o.useState)({status:"select-amount"}),[v,w]=(0,o.useState)(null),[C,b]=(0,o.useState)(!1),x=(0,o.useRef)(null),A=(0,o.useCallback)(async()=>{let e;b(!0),w(null);try{e=await y({kycRedirectUrl:window.location.origin})}catch(e){if(!e||"object"!=typeof e||!("status"in e)||404!==e.status)return g({status:"get-customer-error"}),w(e),void b(!1)}if(!e)try{e=await p({hasAcceptedTerms:!1,kycRedirectUrl:window.location.origin})}catch(e){return g({status:"create-customer-error"}),w(e),void b(!1)}if(!e)return g({status:"create-customer-error"}),w(Error("Unable to create customer")),void b(!1);if("not_started"===e.status&&e.kyc_url)return g({status:"kyc-prompt",kycUrl:e.kyc_url}),void b(!1);if("not_started"===e.status)return g({status:"get-customer-error"}),w(Error("Unexpected user state")),void b(!1);if("rejected"===e.status)return g({status:"kyc-error",reason:e.rejection_reasons?.[0]?.reason}),w(Error("User KYC rejected.")),void b(!1);if("incomplete"===e.status)return g({status:"kyc-incomplete"}),void b(!1);if("active"!==e.status)return g({status:"get-customer-error"}),w(Error("Unexpected user state")),void b(!1);e.status;try{let e=await m({destination:f.destination,provider:f.provider,source:{asset:f.source.selectedAsset}});g({status:"account-details",data:e})}catch(e){return g({status:"create-customer-error"}),w(e),void b(!1)}},[f]),j=(0,o.useCallback)(async()=>{if(w(null),b(!0),"kyc-prompt"!==k.status)return w(Error("Unexpected state")),void b(!1);let e=(0,n.hZ)({location:k.kycUrl});if(await p({hasAcceptedTerms:!0}),!e)return w(Error("Unable to begin kyc flow.")),b(!1),void g({status:"create-customer-error"});x.current=new AbortController;let t=await (async(e,t)=>{let s=await (0,a.wt)({operation:async()=>({done:(e=>{try{return e.location.origin}catch{return}})(e)===window.location.origin,closed:e.closed}),until:({done:e,closed:t})=>e||t,delay:0,interval:500,attempts:360,signal:t});return"aborted"===s.status?(e.close(),{status:"aborted"}):"max_attempts"===s.status?{status:"timeout"}:s.result.done?(e.close(),{status:"redirected"}):{status:"closed"}})(e,x.current.signal);if("aborted"===t.status)return;if("closed"===t.status)return void b(!1);t.status;let s=await (0,a.wt)({operation:()=>y({}),until:e=>"active"===e.status||"rejected"===e.status,delay:0,interval:2e3,attempts:60,signal:x.current.signal});if("aborted"!==s.status){if("max_attempts"===s.status)return g({status:"kyc-incomplete"}),void b(!1);if(s.status,"rejected"===s.result.status)return g({status:"kyc-error",reason:s.result.rejection_reasons?.[0]?.reason}),w(Error("User KYC rejected.")),void b(!1);if("active"!==s.result.status)return g({status:"kyc-incomplete"}),void b(!1);e.closed||e.close(),s.result.status;try{g({status:"kyc-success"});let e=await m({destination:f.destination,provider:f.provider,source:{asset:f.source.selectedAsset}});g({status:"account-details",data:e})}catch(e){g({status:"create-customer-error"}),w(e)}finally{b(!1)}}},[g,w,b,p,m,k,f,x]),S=(0,o.useCallback)(e=>{g({status:"select-amount"}),h({...f,source:{...f.source,selectedAsset:e}})},[g,h]),B=(0,o.useCallback)(()=>{g({status:"select-source-asset"})},[g]);return(0,r.jsx)(T,{onClose:(0,o.useCallback)(async()=>{x.current?.abort(),f.showBackButton&&("select-amount"===k.status||"select-source-asset"===k.status)?l(Error("User cancelled funding")):v?l(v):await s()},[v,x,l,s,f.showBackButton,k.status]),onBack:u,opts:f,state:k,isLoading:C,email:e.email.address,onAcceptTerms:j,onSelectAmount:A,onSelectSource:S,onEditSourceAsset:B})}}}}]);