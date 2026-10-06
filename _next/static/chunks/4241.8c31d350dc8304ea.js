"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4241],{3942:(e,t,n)=>{n.d(t,{a:()=>c,u:()=>u});var a=n(21307),r=n(12115),i=n(51774),o=n(69704),d=n(73532),l=n(89367);let s="moonpay";function c(e){return parseFloat(e)}function u(e,t=!1){let[n,c]=(0,r.useState)(null),{createAnalyticsEvent:h}=(0,o.u)(),{data:p,navigate:f,setModalData:m}=(0,d.u)(),g=p?.funding,v=(0,r.useRef)(0);return(0,r.useEffect)(()=>{let n=setInterval(async()=>{if(e)try{let[r]=await async function(e,t){return(0,a.OT)(`${t?i.Y:i.Z}/transactions/ext/${e}`,{query:{apiKey:t?i._:i.$}})}(e,t),o="waitingAuthorization"===r.status&&"credit_debit_card"===r.paymentMethod?"pending":r.status;if(["failed","completed","awaitingAuthorization"].includes(o)&&(h({eventName:l.O,payload:{status:o,provider:s,paymentMethod:r.paymentMethod,cardPaymentType:r.cardPaymentType,currency:r.currency?.code,baseCurrencyAmount:r.baseCurrencyAmount,quoteCurrencyAmount:r.quoteCurrencyAmount,feeAmount:r.feeAmount,extraFeeAmount:r.extraFeeAmount,networkFeeAmount:r.networkFeeAmount,isSandbox:t}}),clearInterval(n)),"failed"===o||"serviceFailure"===o)return m({funding:{...g,errorMessage:"Something went wrong adding funds from Moonpay. Please try again or use another method to fund your wallet."},solanaFundingData:p?.solanaFundingData}),void f("FundingMethodSelectionScreen");c(o)}catch(e){404!==e.response?.status&&(v.current+=1),v.current>=3&&(h({eventName:l.O,payload:{status:"serviceFailure",provider:s}}),clearInterval(n),m({funding:{...g,errorMessage:"Something went wrong adding funds from Moonpay. Please try again or use another method to fund your wallet."},solanaFundingData:p?.solanaFundingData}),f("FundingMethodSelectionScreen"))}},3e3);return()=>clearInterval(n)},[e,v]),n}},4241:(e,t,n)=>{n.r(t),n.d(t,{FundingMethodSelectionScreen:()=>T,default:()=>T});var a=n(95155),r=n(12115);let i=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"}))}),o=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"}),r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"}))});var d=n(14827),l=n(7737),s=n(10308),c=n(14084),u=n(69419),h=n(20223),p=n(15679),f=n(25418),m=n(51774),g=n(48777),v=n(18005),y=n(69704),x=n(73532),w=n(80061),b=n(13113),M=n(70575),C=n(65078),F=n(31794),k=n(49056),j=n(37857),S=n(3942),I=n(65534),A=n(63679);let E={[C.rC.id]:"ethereum",[C.E3.id]:"base",[C.Rr.id]:"optimism",[C.n1.id]:"polygon",[C.D8.id]:"arbitrum",[C.mZ.id]:"avacchain",[C.cl.id]:"monad"},D=(e,t,n,a,r,i)=>new Promise(async(o,d)=>{let l=(0,k.hZ)();if(!l)return void d(Error("Unable to initialize flow"));let s="ethereum"===t.chainType?function(e){let t=E[e];if(!t)throw new j.P(`Unsupported chainId: ${e} for Coinbase Onramp`);return t}(t.chain.id):"solana",c=t.isUSDC?"USDC":"ethereum"===t.chainType?(0,F.bN)(t.chain.id,"native-currency"):"SOL",u=await e.initCoinbaseOnRamp({addresses:[{address:t.address,blockchains:[s]}],assets:[c]}),{url:h}=(0,F.v8)({appId:e.getAppId(),input:u,amount:t.amount,blockchain:s,asset:c,experience:i});l.location=h.toString();let p={...r?.funding,showAlternateFundingMethod:!0};t.usingDefaultFundingMethod&&(p.usingDefaultFundingMethod=!1),n({funding:p,solanaFundingData:r?.solanaFundingData,coinbaseOnrampStatus:{popup:l}}),a("CoinbaseOnrampStatusScreen"),e.createAnalyticsEvent({eventName:"sdk_fiat_on_ramp_started",payload:{provider:"coinbase-onramp",value:t.amount,chainType:t.chainType,chainId:"ethereum"===t.chainType?t.chain.id:t.chain}}),setTimeout(()=>{n({funding:p,solanaFundingData:r?.solanaFundingData,coinbaseOnrampStatus:{partnerUserId:u.partner_user_id,popup:l}})},5e3),o()}),W=async(e,t,n,a,r,i,o,d)=>{let l=(0,k.hZ)();if(!l)throw Error("Unable to initialize flow");let s="ethereum"===t.chainType?(0,F.v)(t.chain.id,a):t.isUSDC?"USDC_SOL":"SOL",{signedUrl:c,externalTransactionId:u}=await e.signMoonpayOnRampUrl({address:t.address,useSandbox:n.fundingMethodConfig.moonpay.useSandbox??!1,config:{uiConfig:{accentColor:n.appearance.palette.accent,theme:n.appearance.palette.colorScheme},paymentMethod:d,currencyCode:s,quoteCurrencyAmount:(0,S.a)(t.amount)}});e.createAnalyticsEvent({eventName:"sdk_fiat_on_ramp_started",payload:{provider:"moonpay",value:t.amount,chainType:t.chainType,chainId:"ethereum"===t.chainType?t.chain.id:t.chain}}),l.location=c;let h={...o?.funding,showAlternateFundingMethod:!0};t.usingDefaultFundingMethod&&(h.usingDefaultFundingMethod=!1),r({moonpayStatus:{},funding:h,solanaFundingData:o?.solanaFundingData}),i("MoonpayStatusScreen"),setTimeout(()=>{r({moonpayStatus:{externalTransactionId:u},funding:h,solanaFundingData:o?.solanaFundingData})},8e3)},T={component:()=>{let{wallets:e}=(0,w.u)(),{connectors:t}=(0,y.u)(),n=t.filter(g.b).flatMap(e=>e.wallets),{navigate:C,data:k,setModalData:j}=(0,x.u)(),{client:S}=(0,y.u)(),E=(0,m.a)(),T=k?.funding,L=(0,v.u)(v.i),z=(0,v.u)(v.a),_="solana"===T.chainType,O=_?void 0:T,Z=(0,r.useMemo)(()=>((e,t,n,a,r,i)=>{let o,d,l="solana"===n.chainType,s=l?void 0:n,c=n.isUSDC?"USDC":s?.erc20Address?void 0:"native-currency",u=!!l||c&&(0,F.Rx)(Number(n.chain.id),c),h=!!l||c&&(0,F.Vr)(Number(n.chain.id),c),p=[];for(let o of(n.preferredCardProvider&&n.supportedOptions.sort(e=>e.provider===n.preferredCardProvider?-1:1),n.supportedOptions))"card"===o.method&&"coinbase"===o.provider&&h&&p.push(()=>D(t,n,a,r,i,"buy")),"card"===o.method&&"moonpay"===o.provider&&u&&c&&p.push(()=>W(t,n,e,c,a,r,i,"credit_debit_card"));for(let e of n.supportedOptions)"exchange"===e.method&&"coinbase"===e.provider&&h&&(o=()=>D(t,n,a,r,i,"buy"));for(let e of i?.funding?.supportedOptions??[])"wallets"===e.method&&(d=()=>r("TransferFromWalletScreen"));return{onFundWithCard:p,onFundWithExchange:o,onFundWithWallet:d}})(E,S,T,j,C,k),[E,S,T,k,j,C]),N=_?n.find(({address:e})=>e===T.address):e.find(({address:e})=>(0,l.b)(e)===(0,l.b)(T.address)),R=(0,g.e)(N?.walletClientType||"unknown"),H=R?.name||"wallet",$=N&&"privy"!==N.walletClientType?H:E.name,B=(0,r.useMemo)(()=>T.uiConfig?.landing?.title?T.uiConfig?.landing?.title:`Add funds to your ${$?.toLowerCase().endsWith("wallet")?$:$+" wallet"}`,[T.uiConfig?.landing?.title,$]);(0,r.useEffect)(()=>{if(T?.defaultFundingMethod&&T.usingDefaultFundingMethod)switch(j({funding:{...T,usingDefaultFundingMethod:!1},solanaFundingData:k?.solanaFundingData}),T?.defaultFundingMethod){case"card":Z.onFundWithCard[0]&&Z.onFundWithCard[0]();break;case"exchange":Z.onFundWithExchange&&Z.onFundWithExchange();break;case"wallet":Z.onFundWithWallet&&Z.onFundWithWallet();break;case"manual":C("ManualTransferScreen")}},[]),(0,r.useEffect)(()=>{O?.erc20Address&&!O.erc20ContractInfo&&(0,M.g)({address:O.erc20Address,chain:O.chain,rpcConfig:E.rpcConfig,privyAppId:E.id}).then(e=>{j({...k,funding:{...O,erc20ContractInfo:e?{symbol:e.symbol,decimals:e.decimals}:void 0}})}).catch(console.error)},[O?.erc20Address,O?.chain]);let P=!(!O?.erc20Address||O?.erc20ContractInfo);return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(c.t,{}),(0,a.jsx)("h3",{children:B}),(0,a.jsxs)(A.e,{children:[T.errorMessage&&(0,a.jsx)(u.E,{theme:E.appearance.palette.colorScheme,children:T.errorMessage}),Z.onFundWithCard?.[0]&&(0,a.jsxs)(I.L,{disabled:P,onClick:Z.onFundWithCard[0],children:[(0,a.jsx)(A.I,{children:(0,a.jsx)(i,{style:{width:24}})}),"Pay with card",L?(0,a.jsx)(p.A,{style:{marginLeft:"auto",maxWidth:"100%",width:"auto",height:"0.875rem"}}):z?(0,a.jsx)(f.G,{style:{marginLeft:"auto",maxWidth:"100%",width:"auto",height:"0.875rem"}}):null]}),Z.onFundWithExchange&&(0,a.jsxs)(I.L,{disabled:P,onClick:Z.onFundWithExchange,children:[(0,a.jsx)(A.I,{children:(0,a.jsx)(d.A,{style:{width:24}})}),"Transfer from an exchange"]}),Z.onFundWithWallet&&(0,a.jsxs)(I.L,{disabled:P,onClick:Z.onFundWithWallet,children:[(0,a.jsx)(A.I,{children:(0,a.jsx)(b.W,{style:{width:24}})}),"Transfer from wallet"]}),(0,a.jsxs)(I.L,{disabled:P,onClick:()=>C("ManualTransferScreen"),children:[(0,a.jsx)(A.I,{children:(0,a.jsx)(o,{style:{width:24}})}),"Receive funds"]}),T?.showAlternateFundingMethod&&Z.onFundWithCard?.[1]&&(0,a.jsxs)(h.I,{theme:E.appearance.palette.colorScheme,children:["Having trouble or facing location restrictions?"," ",(0,a.jsx)(A.f,{onClick:Z.onFundWithCard[1],children:"Try a different provider."})]})]}),(0,a.jsx)(s.B,{})]})}}},13113:(e,t,n)=>{n.d(t,{W:()=>r});var a=n(95155);let r=({...e})=>(0,a.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",...e,children:[(0,a.jsx)("rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}),(0,a.jsx)("path",{d:"M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"}),(0,a.jsx)("path",{d:"M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21"})]})},14084:(e,t,n)=>{n.d(t,{t:()=>o});var a=n(95155),r=n(73532),i=n(97677);function o({title:e}){let{currentScreen:t,navigateBack:n,navigate:d,data:l,setModalData:s}=(0,r.u)();return(0,a.jsx)(i.M,{title:e,backFn:"ManualTransferScreen"===t?n:t===l?.funding?.methodScreen?l.funding.comingFromSendTransactionScreen?()=>d("SendTransactionScreen"):void 0:l?.funding?.methodScreen?()=>{let e=l.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),s({funding:e,solanaFundingData:l?.solanaFundingData}),d(e.methodScreen)}:void 0})}},14827:(e,t,n)=>{n.d(t,{A:()=>r});var a=n(12115);let r=a.forwardRef(function({title:e,titleId:t,...n},r){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},n),e?a.createElement("title",{id:t},e):null,a.createElement("path",{fillRule:"evenodd",d:"M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z",clipRule:"evenodd"}))})},15679:(e,t,n)=>{n.d(t,{A:()=>r});var a=n(95155);let r=e=>(0,a.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 210.2",xmlSpace:"preserve",...e,children:(0,a.jsx)("path",{d:"M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9  C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2  c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7  c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2  C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z   M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2  c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8  c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4  l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5  l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z"})})},18005:(e,t,n)=>{n.d(t,{a:()=>d,i:()=>o,u:()=>r});var a=n(12115);let r=e=>{let[t,n]=(0,a.useState)();return(0,a.useEffect)(()=>{e().then(e=>{n(e)}).catch(()=>{})},[]),t},i=async e=>"u">typeof window&&"PaymentRequest"in window&&await new window.PaymentRequest([{supportedMethods:e}],{id:"0",total:{label:"Item",amount:{currency:"USD",value:"1.00"}}}).canMakePayment(),o=()=>i("https://apple.com/apple-pay"),d=()=>i("https://google.com/pay")},20223:(e,t,n)=>{n.d(t,{I:()=>d});var a=n(95155),r=n(12115);let i=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var o=n(51862);let d=({children:e,theme:t,className:n})=>(0,a.jsxs)(l,{$theme:t,className:n,children:[(0,a.jsx)(i,{width:"16px",height:"16px",color:"var(--privy-color-foreground-2)",strokeWidth:2,style:{flexShrink:0}}),(0,a.jsx)(s,{$theme:t,children:e})]}),l=o.I4.div`
  display: flex;
  gap: 0.5rem;
  background-color: var(--privy-color-info-bg);
  border: 1px solid var(--privy-color-border-info);
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow: clip;
  width: 100%;
`,s=o.I4.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
  font-feature-settings:
    'calt' 0,
    'kern' 0;
`},25418:(e,t,n)=>{n.d(t,{G:()=>r});var a=n(95155);let r=e=>(0,a.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 80 38.1",xmlSpace:"preserve",...e,children:[(0,a.jsx)("path",{style:{fill:"#5F6368"},d:"M37.8,19.7V29h-3V6h7.8c1.9,0,3.7,0.7,5.1,2c1.4,1.2,2.1,3,2.1,4.9c0,1.9-0.7,3.6-2.1,4.9c-1.4,1.3-3.1,2-5.1,2  L37.8,19.7L37.8,19.7z M37.8,8.8v8h5c1.1,0,2.2-0.4,2.9-1.2c1.6-1.5,1.6-4,0.1-5.5c0,0-0.1-0.1-0.1-0.1c-0.8-0.8-1.8-1.3-2.9-1.2  L37.8,8.8L37.8,8.8z"}),(0,a.jsx)("path",{style:{fill:"#5F6368"},d:"M56.7,12.8c2.2,0,3.9,0.6,5.2,1.8s1.9,2.8,1.9,4.8V29H61v-2.2h-0.1c-1.2,1.8-2.9,2.7-4.9,2.7  c-1.7,0-3.2-0.5-4.4-1.5c-1.1-1-1.8-2.4-1.8-3.9c0-1.6,0.6-2.9,1.8-3.9c1.2-1,2.9-1.4,4.9-1.4c1.8,0,3.2,0.3,4.3,1v-0.7  c0-1-0.4-2-1.2-2.6c-0.8-0.7-1.8-1.1-2.9-1.1c-1.7,0-3,0.7-3.9,2.1l-2.6-1.6C51.8,13.8,53.9,12.8,56.7,12.8z M52.9,24.2  c0,0.8,0.4,1.5,1,1.9c0.7,0.5,1.5,0.8,2.3,0.8c1.2,0,2.4-0.5,3.3-1.4c1-0.9,1.5-2,1.5-3.2c-0.9-0.7-2.2-1.1-3.9-1.1  c-1.2,0-2.2,0.3-3,0.9C53.3,22.6,52.9,23.3,52.9,24.2z"}),(0,a.jsx)("path",{style:{fill:"#5F6368"},d:"M80,13.3l-9.9,22.7h-3l3.7-7.9l-6.5-14.7h3.2l4.7,11.3h0.1l4.6-11.3H80z"}),(0,a.jsx)("path",{style:{fill:"#4285F4"},d:"M25.9,17.7c0-0.9-0.1-1.8-0.2-2.7H13.2v5.1h7.1c-0.3,1.6-1.2,3.1-2.6,4v3.3H22C24.5,25.1,25.9,21.7,25.9,17.7z"}),(0,a.jsx)("path",{style:{fill:"#34A853"},d:"M13.2,30.6c3.6,0,6.6-1.2,8.8-3.2l-4.3-3.3c-1.2,0.8-2.7,1.3-4.5,1.3c-3.4,0-6.4-2.3-7.4-5.5H1.4v3.4  C3.7,27.8,8.2,30.6,13.2,30.6z"}),(0,a.jsx)("path",{style:{fill:"#FBBC04"},d:"M5.8,19.9c-0.6-1.6-0.6-3.4,0-5.1v-3.4H1.4c-1.9,3.7-1.9,8.1,0,11.9L5.8,19.9z"}),(0,a.jsx)("path",{style:{fill:"#EA4335"},d:"M13.2,9.4c1.9,0,3.7,0.7,5.1,2l0,0l3.8-3.8c-2.4-2.2-5.6-3.5-8.8-3.4c-5,0-9.6,2.8-11.8,7.3l4.4,3.4  C6.8,11.7,9.8,9.4,13.2,9.4z"})]})},46685:(e,t,n)=>{n.d(t,{A:()=>r});var a=n(12115);let r=a.forwardRef(function({title:e,titleId:t,...n},r){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},n),e?a.createElement("title",{id:t},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"}))})},63679:(e,t,n)=>{n.d(t,{F:()=>l,I:()=>d,a:()=>s,b:()=>c,c:()=>h,d:()=>p,e:()=>o,f:()=>m,g:()=>u});var a=n(51862),r=n(97677),i=n(80548);let o=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,d=a.I4.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    border-radius: var(--privy-border-radius-sm);
  }
`,l=a.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`,s=a.I4.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 16px;
  border-width: 1px !important;
  border-radius: 12px;
  cursor: text;

  &:focus-within {
    border-color: var(--privy-color-accent);
  }
`;a.I4.div`
  font-size: 42px !important;
`;let c=a.I4.input`
  background-color: var(--privy-color-background);
  width: 100%;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  && {
    font-size: 26px;
  }
`,u=(0,a.I4)(c)`
  && {
    font-size: 42px;
  }
`;a.I4.button`
  cursor: pointer;
  padding-left: 4px;
`;let h=a.I4.div`
  font-size: 18px;
`,p=a.I4.div`
  font-size: 12px;
  color: var(--privy-color-foreground-3);
  /* we need this container to maintain a static height if there's no content */
  height: 20px;
`;a.I4.div`
  display: flex;
  flex-direction: row;
  line-height: 22px;
  font-size: 16px;
  text-align: center;
  svg {
    margin: auto;
  }
`,(0,a.I4)(i.LinkButton)`
  margin-top: 16px;
`;let f=(0,a.i7)`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;(0,a.I4)(r.c)`
  border-radius: var(--privy-border-radius-md) !important;
  animation: ${f} 0.3s ease-in-out;
`;let m=a.I4.a`
  && {
    color: var(--privy-color-accent);
  }

  cursor: pointer;
`},69419:(e,t,n)=>{n.d(t,{E:()=>o});var a=n(95155),r=n(46685),i=n(51862);let o=({children:e,theme:t,className:n})=>(0,a.jsxs)(d,{$theme:t,className:n,children:[(0,a.jsx)(r.A,{width:"16px",height:"16px",color:"var(--privy-color-icon-error)",strokeWidth:2,style:{flexShrink:0}}),(0,a.jsx)(l,{$theme:t,children:e})]}),d=i.I4.div`
  display: flex;
  gap: 0.5rem;
  background-color: var(--privy-color-error-bg);
  border: 1px solid var(--privy-color-border-error);
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow: clip;
  width: 100%;
`,l=i.I4.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
  flex: 1;
  text-align: left;
  font-feature-settings:
    'calt' 0,
    'kern' 0;
`},70575:(e,t,n)=>{n.d(t,{g:()=>o});var a=n(76713),r=n(65760),i=n(25738);let o=async({address:e,chain:t,rpcConfig:n,privyAppId:o})=>{try{let l=(0,a.l)({chain:t,transport:(0,r.L)((0,i.a)(t,n,o))}),[s,c]=await Promise.all([l.readContract({abi:d,address:e,functionName:"symbol"}),l.readContract({abi:d,address:e,functionName:"decimals"})]);return{decimals:c,symbol:s}}catch(e){return console.log(e),null}},d=[{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"}]},89367:(e,t,n)=>{n.d(t,{O:()=>a});let a="sdk_fiat_on_ramp_completed_with_status"}}]);