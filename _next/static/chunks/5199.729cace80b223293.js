"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5199],{3942:(e,t,r)=>{r.d(t,{a:()=>u,u:()=>c});var n=r(21307),a=r(12115),o=r(51774),i=r(69704),l=r(73532),d=r(89367);let s="moonpay";function u(e){return parseFloat(e)}function c(e,t=!1){let[r,u]=(0,a.useState)(null),{createAnalyticsEvent:g}=(0,i.u)(),{data:p,navigate:f,setModalData:m}=(0,l.u)(),h=p?.funding,y=(0,a.useRef)(0);return(0,a.useEffect)(()=>{let r=setInterval(async()=>{if(e)try{let[a]=await async function(e,t){return(0,n.OT)(`${t?o.Y:o.Z}/transactions/ext/${e}`,{query:{apiKey:t?o._:o.$}})}(e,t),i="waitingAuthorization"===a.status&&"credit_debit_card"===a.paymentMethod?"pending":a.status;if(["failed","completed","awaitingAuthorization"].includes(i)&&(g({eventName:d.O,payload:{status:i,provider:s,paymentMethod:a.paymentMethod,cardPaymentType:a.cardPaymentType,currency:a.currency?.code,baseCurrencyAmount:a.baseCurrencyAmount,quoteCurrencyAmount:a.quoteCurrencyAmount,feeAmount:a.feeAmount,extraFeeAmount:a.extraFeeAmount,networkFeeAmount:a.networkFeeAmount,isSandbox:t}}),clearInterval(r)),"failed"===i||"serviceFailure"===i)return m({funding:{...h,errorMessage:"Something went wrong adding funds from Moonpay. Please try again or use another method to fund your wallet."},solanaFundingData:p?.solanaFundingData}),void f("FundingMethodSelectionScreen");u(i)}catch(e){404!==e.response?.status&&(y.current+=1),y.current>=3&&(g({eventName:d.O,payload:{status:"serviceFailure",provider:s}}),clearInterval(r),m({funding:{...h,errorMessage:"Something went wrong adding funds from Moonpay. Please try again or use another method to fund your wallet."},solanaFundingData:p?.solanaFundingData}),f("FundingMethodSelectionScreen"))}},3e3);return()=>clearInterval(r)},[e,y]),r}},8336:(e,t,r)=>{r.d(t,{B:()=>a,C:()=>l,F:()=>s,H:()=>i,R:()=>p,S:()=>c,a:()=>u,b:()=>g,c:()=>d,d:()=>f,e:()=>o});var n=r(51862);let a=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,o=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,i=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,n.I4)(o)`
  padding: 20px 0;
`,d=(0,n.I4)(o)`
  gap: 16px;
`,s=n.I4.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,u=n.I4.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;n.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let c=n.I4.div`
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
`,g=n.I4.div`
  height: 16px;
`,p=n.I4.div`
  height: 12px;
`;n.I4.div`
  position: relative;
`;let f=n.I4.div`
  height: ${e=>e.height??"12"}px;
`;n.I4.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},14827:(e,t,r)=>{r.d(t,{A:()=>a});var n=r(12115);let a=n.forwardRef(function({title:e,titleId:t,...r},a){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},r),e?n.createElement("title",{id:t},e):null,n.createElement("path",{fillRule:"evenodd",d:"M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z",clipRule:"evenodd"}))})},45199:(e,t,r)=>{r.r(t),r.d(t,{MoonpayStatusScreen:()=>y,default:()=>y});var n=r(95155),a=r(14827),o=r(52998),i=r(12115),l=r(51862),d=r(97677),s=r(8336),u=r(57445),c=r(10308),g=r(51774),p=r(69704),f=r(73532),m=r(3942);let h=({size:e=61,...t})=>(0,n.jsx)("svg",{width:e,height:e,viewBox:"0 0 61 61",fill:"none",xmlns:"http://www.w3.org/2000/svg",...t,children:(0,n.jsxs)("g",{id:"moonpay_symbol_wht 2",children:[(0,n.jsx)("rect",{x:"1.3374",y:"1",width:"59",height:"59",rx:"11.5",fill:"#7715F5"}),(0,n.jsx)("path",{id:"Vector",d:"M43.8884 23.3258C45.0203 23.3258 46.1268 22.9901 47.068 22.3613C48.0091 21.7324 48.7427 20.8386 49.1759 19.7928C49.6091 18.747 49.7224 17.5962 49.5016 16.4861C49.2807 15.3759 48.7357 14.3561 47.9353 13.5557C47.1349 12.7553 46.1151 12.2102 45.0049 11.9893C43.8947 11.7685 42.7439 11.8819 41.6982 12.3151C40.6524 12.7482 39.7585 13.4818 39.1297 14.423C38.5008 15.3641 38.1651 16.4707 38.1651 17.6026C38.165 18.3542 38.3131 19.0985 38.6007 19.7929C38.8883 20.4873 39.3098 21.1182 39.8413 21.6496C40.3728 22.1811 41.0037 22.6027 41.6981 22.8903C42.3925 23.1778 43.1367 23.3259 43.8884 23.3258ZM26.3395 49.1017C23.5804 49.1017 20.8832 48.2836 18.5891 46.7507C16.295 45.2178 14.5069 43.039 13.4511 40.49C12.3952 37.9409 12.1189 35.1359 12.6572 32.4298C13.1955 29.7237 14.5241 27.238 16.4751 25.287C18.4262 23.336 20.9118 22.0074 23.6179 21.4691C26.324 20.9308 29.129 21.2071 31.6781 22.2629C34.2272 23.3189 36.406 25.1069 37.9389 27.401C39.4717 29.6952 40.2899 32.3923 40.2899 35.1514C40.2899 36.9835 39.9291 38.7975 39.2281 40.49C38.527 42.1826 37.4994 43.7205 36.204 45.0159C34.9086 46.3113 33.3707 47.3389 31.6781 48.04C29.9856 48.741 28.1715 49.1018 26.3395 49.1017Z",fill:"white"})]})}),y={component:()=>{let{data:e,setModalData:t,navigateBack:r}=(0,f.u)(),a=(0,g.a)(),{closePrivyModal:o}=(0,p.u)(),i=(0,m.u)(e?.moonpayStatus?.externalTransactionId||null,a.fundingMethodConfig.moonpay.useSandbox??!1);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(d.M,{title:"Fund account",backFn:()=>{let n={...e?.funding,showAlternateFundingMethod:!0};n.usingDefaultFundingMethod&&(n.usingDefaultFundingMethod=!1),t({funding:n,solanaFundingData:e?.solanaFundingData}),r()}}),(0,n.jsx)(v,{status:i,onClickCta:o}),(0,n.jsx)(c.B,{})]})}},v=({status:e,onClickCta:t})=>{let{title:r,body:a,cta:o}=(0,i.useMemo)(()=>(e=>{switch(e){case"completed":return{title:"You've funded your account!",body:"It may take a few minutes for the assets to appear.",cta:"Continue"};case"waitingAuthorization":return{title:"Processing payment",body:"This may take up to a few hours. You will receive an email when the purchase is complete.",cta:"Continue"};default:return{title:"In Progress",body:"Go back to MoonPay to finish funding your account.",cta:""}}})(e),[e]);return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(C,{children:[(0,n.jsx)(x,{status:e}),(0,n.jsxs)(s.a,{children:[(0,n.jsx)("h3",{children:r}),(0,n.jsx)(w,{children:a})]})]}),o&&(0,n.jsx)(d.P,{onClick:t,children:o})]})},x=({status:e})=>{if(!e||"pending"===e){let e="var(--privy-color-foreground-4)";return(0,n.jsxs)("div",{style:{position:"relative"},children:[(0,n.jsx)(u.L,{color:e,style:{position:"absolute"}}),(0,n.jsx)(u.a,{color:e}),(0,n.jsx)(h,{size:"3rem",style:{position:"absolute",top:"1rem",left:"1rem"}})]})}let t=(e=>{switch(e){case"completed":return o.A;case"waitingAuthorization":return()=>(0,n.jsx)(a.A,{width:"3rem",height:"3rem",style:{backgroundColor:"var(--privy-color-foreground-4)",color:"var(--privy-color-background)",borderRadius:"100%",padding:"0.5rem",margin:"0.5rem"}});default:return}})(e),r=e?({completed:"var(--privy-color-success)",failed:"var(--privy-color-error)",serviceFailure:"var(--privy-color-error)",waitingAuthorization:"var(--privy-color-accent)",pending:"var(--privy-color-foreground-4)"})[e]:"var(--privy-color-foreground-4)";return(0,n.jsx)("div",{style:{borderColor:r,display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"100%",borderWidth:2,padding:"0.5rem",marginBottom:"0.5rem"},children:t&&(0,n.jsx)(t,{width:"4rem",height:"4rem",color:r})})},w=l.I4.p`
  font-size: 1rem;
  color: var(--privy-color-foreground-3);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,C=l.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1.75rem;
  margin-right: 1.75rem;
  padding: 2rem 0;
`},52998:(e,t,r)=>{r.d(t,{A:()=>a});var n=r(12115);let a=n.forwardRef(function({title:e,titleId:t,...r},a){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},r),e?n.createElement("title",{id:t},e):null,n.createElement("path",{fillRule:"evenodd",d:"M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",clipRule:"evenodd"}))})},89367:(e,t,r)=>{r.d(t,{O:()=>n});let n="sdk_fiat_on_ramp_completed_with_status"}}]);