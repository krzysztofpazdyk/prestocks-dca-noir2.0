"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1464],{8336:(e,t,r)=>{r.d(t,{B:()=>a,C:()=>l,F:()=>d,H:()=>o,R:()=>g,S:()=>u,a:()=>c,b:()=>f,c:()=>s,d:()=>p,e:()=>i});var n=r(51862);let a=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,i=n.I4.div`
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
`,l=(0,n.I4)(i)`
  padding: 20px 0;
`,s=(0,n.I4)(i)`
  gap: 16px;
`,d=n.I4.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,c=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;n.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=n.I4.div`
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
`,f=n.I4.div`
  height: 16px;
`,g=n.I4.div`
  height: 12px;
`;n.I4.div`
  position: relative;
`;let p=n.I4.div`
  height: ${e=>e.height??"12"}px;
`;n.I4.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},14827:(e,t,r)=>{r.d(t,{A:()=>a});var n=r(12115);let a=n.forwardRef(function({title:e,titleId:t,...r},a){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},r),e?n.createElement("title",{id:t},e):null,n.createElement("path",{fillRule:"evenodd",d:"M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z",clipRule:"evenodd"}))})},41464:(e,t,r)=>{r.r(t),r.d(t,{CoinbaseOnrampStatusScreen:()=>v,PENDING_TIMED_OUT_BODY:()=>h,default:()=>v,getStatusCopy:()=>x});var n=r(95155),a=r(14827),i=r(52998),o=r(12115),l=r(51862),s=r(97677),d=r(8336),c=r(57445),u=r(10308),f=r(69704),g=r(73532),p=r(89367),m=r(33031);let h="If you've completed your purchase in Coinbase, your funds are on the way and may take a few minutes to appear.",v={component:()=>{let{data:e,setModalData:t,navigate:r,navigateBack:a}=(0,g.u)(),{closePrivyModal:i,createAnalyticsEvent:l,client:d}=(0,f.u)(),[c,m]=(0,o.useState)("pending-in-flow"),[h,v]=(0,o.useState)(!1),x=(0,o.useRef)(0),w={...e?.funding,showAlternateFundingMethod:!0};w.usingDefaultFundingMethod&&(w.usingDefaultFundingMethod=!1);let{partnerUserId:b,popup:j}=e?.coinbaseOnrampStatus??{};return(0,o.useEffect)(()=>{if("pending-in-flow"===c||"pending-after-flow"===c){let n=setInterval(async()=>{if(b)try{let{status:n}=await d.getCoinbaseOnRampStatus({partnerUserId:b});if("success"===n)return void m("success");if("failure"===n)throw Error("There was an error completing Coinbase Onramp flow.");if(x.current>=3)return t({funding:w,solanaFundingData:e?.solanaFundingData}),void r("FundingMethodSelectionScreen");j?.closed&&(x.current=x.current+1,m("pending-after-flow"))}catch(n){console.error(n),m("error"),l({eventName:p.O,payload:{status:"failure",provider:"coinbase-onramp",error:n.message}}),t({funding:{...w,errorMessage:"Something went wrong adding funds. Please try again or use another method."},solanaFundingData:e?.solanaFundingData}),r("FundingMethodSelectionScreen")}},1500);return()=>clearInterval(n)}},[b,j,c]),(0,o.useEffect)(()=>{let e=setTimeout(()=>v(!0),3e4);return()=>clearTimeout(e)},[]),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.M,{title:"Fund account",backFn:()=>{t({funding:w,solanaFundingData:e?.solanaFundingData}),a()}},"header"),(0,n.jsx)(y,{status:c,hasPendingTimedOut:h,onClickCta:i}),(0,n.jsx)(u.B,{})]})}},x=(e,t)=>{switch(e){case"success":return{title:"You've funded your account!",body:"It may take a few minutes for the assets to appear.",cta:"Continue"};case"pending-after-flow":return{title:"In progress",body:t?h:"Almost done. Retrieving transaction status from Coinbase",cta:"Done"};case"error":case"pending-in-flow":return{title:"In progress",body:t?h:"Go back to Coinbase Onramp to finish funding your account.",cta:"Done"}}},y=({status:e,hasPendingTimedOut:t,onClickCta:r})=>{let{title:a,body:i,cta:l}=(0,o.useMemo)(()=>x(e,t),[e,t]);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(j,{children:[(0,n.jsx)(w,{isSucccess:"success"===e}),(0,n.jsxs)(d.a,{children:[(0,n.jsx)("h3",{children:a}),(0,n.jsx)(b,{children:i})]})]}),l&&(0,n.jsx)(s.P,{onClick:r,children:l})]})},w=({isSucccess:e})=>{if(!e){let e="var(--privy-color-foreground-4)";return(0,n.jsxs)("div",{style:{position:"relative"},children:[(0,n.jsx)(c.L,{color:e,style:{position:"absolute"}}),(0,n.jsx)(c.a,{color:e}),(0,n.jsx)(m.D,{style:{position:"absolute",width:"2.8rem",height:"2.8rem",top:"1.2rem",left:"1.2rem"}})]})}let t=e?i.A:()=>(0,n.jsx)(a.A,{width:"3rem",height:"3rem",style:{backgroundColor:"var(--privy-color-foreground-4)",color:"var(--privy-color-background)",borderRadius:"100%",padding:"0.5rem",margin:"0.5rem"}}),r=e?"var(--privy-color-success)":"var(--privy-color-foreground-4)";return(0,n.jsx)("div",{style:{borderColor:r,display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"100%",borderWidth:2,padding:"0.5rem",marginBottom:"0.5rem"},children:t&&(0,n.jsx)(t,{width:"4rem",height:"4rem",color:r})})},b=l.I4.p`
  font-size: 1rem;
  color: var(--privy-color-foreground-3);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,j=l.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1.75rem;
  margin-right: 1.75rem;
  padding: 2rem 0;
`},52998:(e,t,r)=>{r.d(t,{A:()=>a});var n=r(12115);let a=n.forwardRef(function({title:e,titleId:t,...r},a){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},r),e?n.createElement("title",{id:t},e):null,n.createElement("path",{fillRule:"evenodd",d:"M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",clipRule:"evenodd"}))})},89367:(e,t,r)=>{r.d(t,{O:()=>n});let n="sdk_fiat_on_ramp_completed_with_status"}}]);