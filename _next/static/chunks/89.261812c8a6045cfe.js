"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[89],{330:(e,n,t)=>{t.d(n,{g:()=>a});var r=t(7564);function a(e,n="wei"){return r.Xq(e,n)}},45642:(e,n,t)=>{t.r(n),t.d(n,{AwaitingSolToEvmBridgingScreen:()=>I,default:()=>I});var r=t(95155),a=t(33187),i=t(12115),s=t(330),o=t(31794),d=t(8336),l=t(10308),c=t(29781),u=t(14084),p=t(98590),h=t(51774),g=t(37857),f=t(48777),m=t(69704),v=t(73532),w=t(89367),y=t(50218),x=t(29441),b=t(21391),C=t(4104),S=t(17961),A=t(16487);let I={component:function(){let e=(0,h.a)(),{closePrivyModal:n,createAnalyticsEvent:t,connectors:I}=(0,m.u)(),{navigate:T,setModalData:N,data:j}=(0,v.u)(),E=(0,h.a)(),k=(0,i.useRef)(!1),[F,U]=(0,i.useState)(!1),[P,$]=(0,i.useState)(!1),[z,R]=(0,i.useState)(null),[W,L]=(0,i.useState)(),[_,B]=(0,i.useState)();if(!j?.funding||"ethereum"!==j.funding.chainType)throw Error("Invalid funding data");let{amount:D,connectedWallet:M,chain:O,solanaChain:q,isUSDC:H}=j.funding,V=j.funding.address,X=j.funding.erc20Address,Z=j.funding.isUSDC?"USDC":O.nativeCurrency.symbol,Q=(0,i.useMemo)(()=>"solana"===M?.type?M.provider:function({connectors:e,connectedWalletAddress:n}){let t=e.find(e=>"solana"===e.chainType&&e.wallets.some(e=>e.address===n)),r=t?.wallet.accounts.find(e=>e.address===n);if(!t||!r)throw new g.P("Unable to find source wallet connector");return new o.WW({wallet:t.wallet,account:r})}({connectors:I,connectedWalletAddress:M?.address||""}),[M,I]),Y=(0,i.useMemo)(()=>{let n=(0,x.g)(b.S);if(!n)throw new g.P("Unable to load solana plugin");let t=e.solanaRpcs["solana:mainnet"];if(!t)throw new g.P("Unable to load mainnet RPC");return n.getSolanaRpcClient({rpc:t.rpc,rpcSubscriptions:t.rpcSubscriptions,chain:"solana:mainnet",blockExplorerUrl:t.blockExplorerUrl??"https://explorer.solana.com"})},[]),G=(0,f.e)((0,A.t)(Q?.standardWallet.name||"unknown")),J=G?.name||"wallet";return(0,i.useEffect)(()=>{(async function(){if(!Q||!O||k.current)return;let e=(0,x.g)(b.S);if(!e)return void R(new g.P("Unable to solana plugin"));k.current=!0,O?.testnet&&console.warn("Solana testnets are not supported for bridging");let n=H?1e6*parseFloat(D):(0,s.g)(D),t=await (0,y.g)({isTestnet:!!O.testnet,input:(0,y.t)({appId:E.id,amount:n.toString(),user:Q.address,recipient:V,destinationChainId:O.id,originChainId:y.c,originCurrency:H?y.e:y.b,destinationCurrency:H?X:void 0})}).catch(console.error);if(!t)return void R(new g.P(`Unable to fetch quotes for bridging. Wallet ${(0,C.o)(Q.address)} does not have enough funds.`,void 0,g.a.INSUFFICIENT_BALANCE));let r=await e.createTransactionFromRelayQuote({quote:t,source:Q.address,solanaClient:Y});if(r)try{U(!0);let n=await e.simulateTransaction({solanaClient:Y,tx:r});if(n.hasError)return n.hasFunds?(console.error("Transaction failed:",n.error),void R(new g.P("Something went wrong",void 0,g.a.TRANSACTION_FAILURE))):void R(new g.P(`Wallet ${(0,C.o)(Q?.address)} does not have enough funds. ${t.details.currencyIn.amountFormatted} ${Z} are needed to complete the transaction.`,void 0,g.a.INSUFFICIENT_BALANCE));let{signature:a}=await Q.signAndSendTransaction({chain:"solana:mainnet",transaction:r}),i=e.getAddressFromBuffer(a);L(i),B("pending")}catch(e){if(console.error(e),/user rejected the request/gi.test(e.message||""))return void R(new g.P("Transaction was rejected by the user",void 0,g.a.TRANSACTION_FAILURE));R(new g.P("Something went wrong",void 0,g.a.TRANSACTION_FAILURE))}else R(new g.P(`Unable to select bridge option from quotes. Wallet ${(0,C.o)(Q.address)} does not have enough funds.`,void 0,g.a.INSUFFICIENT_BALANCE))})().catch(console.error)},[]),(0,y.u)({transactionHash:W,isTestnet:!1,bridgingStatus:_,setBridgingStatus:B,onSuccess({transactionHash:e}){U(!1),$(!0),t({eventName:w.O,payload:{provider:"external",status:"success",txHash:e,address:Q.address,chainType:"solana",clusterName:q,token:"SOL",destinationAddress:V,destinationChainId:O.id,destinationChainType:"ethereum",destinationValue:D,destinationToken:H?"USDC":"ETH"}})},onFailure({error:e}){U(!1),R(e)}}),(0,i.useEffect)(()=>{if(!P)return;let e=setTimeout(n,h.X);return()=>clearTimeout(e)},[P]),(0,i.useEffect)(()=>{z&&(N({funding:j?.funding,solanaFundingData:j?.solanaFundingData,sendTransaction:j?.sendTransaction,errorModalData:{error:z,previousScreen:"TransferFromWalletScreen"}}),T("ErrorScreen",!1))},[z]),P?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(u.t,{}),(0,r.jsx)(d.b,{}),(0,r.jsxs)(d.c,{children:[(0,r.jsx)(a.A,{color:"var(--privy-color-success)",width:"64px",height:"64px"}),(0,r.jsx)(c.C,{title:"Success!",description:`You’ve successfully added ${D} ${Z} to your ${E.name} wallet. It may take a minute before the funds are available to use.`})]}),(0,r.jsx)(d.R,{}),(0,r.jsx)(l.B,{})]}):F&&Q?(0,r.jsx)(S.T,{walletClientType:(0,A.t)(Q?.standardWallet.name||"unknown"),displayName:J,addressToFund:V,isBridging:F,isErc20Flow:!1,chainId:O.id,chainName:O.name,totalPriceInUsd:void 0,totalPriceInNativeCurrency:void 0,gasPriceInUsd:void 0,gasPriceInNativeCurrency:void 0}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(u.t,{}),(0,r.jsx)(p.N,{}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(l.B,{})]})}}},67635:(e,n,t)=>{t.d(n,{A:()=>r});let r=(0,t(78340).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},78340:(e,n,t)=>{t.d(n,{A:()=>d});var r=t(12115);let a=e=>{let n=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,t)=>t?t.toUpperCase():n.toLowerCase());return n.charAt(0).toUpperCase()+n.slice(1)},i=(...e)=>e.filter((e,n,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===n).join(" ").trim();var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,r.forwardRef)(({color:e="currentColor",size:n=24,strokeWidth:t=2,absoluteStrokeWidth:a,className:o="",children:d,iconNode:l,...c},u)=>(0,r.createElement)("svg",{ref:u,...s,width:n,height:n,stroke:e,strokeWidth:a?24*Number(t)/Number(n):t,className:i("lucide",o),...!d&&!(e=>{for(let n in e)if(n.startsWith("aria-")||"role"===n||"title"===n)return!0})(c)&&{"aria-hidden":"true"},...c},[...l.map(([e,n])=>(0,r.createElement)(e,n)),...Array.isArray(d)?d:[d]])),d=(e,n)=>{let t=(0,r.forwardRef)(({className:t,...s},d)=>(0,r.createElement)(o,{ref:d,iconNode:n,className:i(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...s}));return t.displayName=a(e),t}},94514:(e,n,t)=>{t.d(n,{A:()=>r});let r=(0,t(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98590:(e,n,t)=>{t.d(n,{N:()=>i});var r=t(95155),a=t(51862);let i=({size:e,centerIcon:n})=>(0,r.jsx)(s,{$size:e,children:(0,r.jsxs)(o,{children:[(0,r.jsx)(l,{}),(0,r.jsx)(c,{}),n?(0,r.jsx)(d,{children:n}):null]})}),s=a.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,o=a.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,d=a.I4.div`
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
`,l=a.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,c=a.I4.div`
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