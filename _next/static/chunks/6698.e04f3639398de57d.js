"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6698],{8336:(e,r,t)=>{t.d(r,{B:()=>a,C:()=>l,F:()=>d,H:()=>o,R:()=>p,S:()=>u,a:()=>c,b:()=>g,c:()=>s,d:()=>h,e:()=>i});var n=t(51862);let a=n.I4.div`
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
`,g=n.I4.div`
  height: 16px;
`,p=n.I4.div`
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
`},14084:(e,r,t)=>{t.d(r,{t:()=>o});var n=t(95155),a=t(73532),i=t(97677);function o({title:e}){let{currentScreen:r,navigateBack:t,navigate:l,data:s,setModalData:d}=(0,a.u)();return(0,n.jsx)(i.M,{title:e,backFn:"ManualTransferScreen"===r?t:r===s?.funding?.methodScreen?s.funding.comingFromSendTransactionScreen?()=>l("SendTransactionScreen"):void 0:s?.funding?.methodScreen?()=>{let e=s.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),d({funding:e,solanaFundingData:s?.solanaFundingData}),l(e.methodScreen)}:void 0})}},16137:(e,r,t)=>{t.d(r,{L:()=>a});var n=t(51862);let a=n.I4.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},16746:(e,r,t)=>{t.d(r,{A:()=>l,D:()=>c,J:()=>d,L:()=>n,R:()=>s,S:()=>a,T:()=>i,a:()=>o});let n=1e9,a="11111111111111111111111111111111",i="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",o="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",l="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",s=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],d=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],c={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}}},18892:(e,r,t)=>{t.d(r,{u:()=>s});var n=t(12115),a=t(76713),i=t(65760),o=t(25738),l=t(69704);function s({rpcConfig:e,appId:r,address:t,chain:d}){let{chains:c}=(0,l.u)(),[u,g]=(0,n.useState)(0n),[p,h]=(0,n.useState)(!1),f=(0,n.useMemo)(()=>{let t=d||c[0];if(t)return(0,a.l)({chain:d,transport:(0,i.L)((0,o.a)(t,e,r))})},[d,e,r]),m=(0,n.useCallback)(async()=>{if(!t||!f)return;h(!0);let e=await f.getBalance({address:t}).catch(console.error);return e?(g(e),h(!1),e):void 0},[f,t,g]);return(0,n.useEffect)(()=>{m().catch(console.error)},[]),{balance:u,isLoading:p,reloadBalance:m}}},20223:(e,r,t)=>{t.d(r,{I:()=>l});var n=t(95155),a=t(12115);let i=a.forwardRef(function({title:e,titleId:r,...t},n){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?a.createElement("title",{id:r},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var o=t(51862);let l=({children:e,theme:r,className:t})=>(0,n.jsxs)(s,{$theme:r,className:t,children:[(0,n.jsx)(i,{width:"16px",height:"16px",color:"var(--privy-color-foreground-2)",strokeWidth:2,style:{flexShrink:0}}),(0,n.jsx)(d,{$theme:r,children:e})]}),s=o.I4.div`
  display: flex;
  gap: 0.5rem;
  background-color: var(--privy-color-info-bg);
  border: 1px solid var(--privy-color-border-info);
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow: clip;
  width: 100%;
`,d=o.I4.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.125rem;
  font-feature-settings:
    'calt' 0,
    'kern' 0;
`},33507:(e,r,t)=>{t.d(r,{g:()=>a});var n=t(16746);function a(e){let[r]=Object.entries(n.D[e]).find(([e,r])=>"USDC"===r.symbol)??[];return r}},40135:(e,r,t)=>{t.d(r,{T:()=>a});var n=t(51862);let a=n.I4.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`},45595:(e,r,t)=>{t.d(r,{g:()=>o});var n=t(76713),a=t(65760),i=t(25738);let o=async({chain:e,address:r,appId:t,rpcConfig:o,erc20Address:s})=>{let d=(0,n.l)({chain:e,transport:(0,a.L)((0,i.a)(e,o,t))});return{balance:await d.readContract({address:s,abi:l,functionName:"balanceOf",args:[r]}).catch(()=>0n),chain:e}},l=[{constant:!0,inputs:[{name:"_owner",type:"address"}],name:"balanceOf",outputs:[{name:"balance",type:"uint256"}],payable:!1,stateMutability:"view",type:"function"}]},55134:(e,r,t)=>{t.d(r,{W:()=>C});var n=t(95155),a=t(94514),i=t(67635),o=t(12115),l=t(51862),s=t(97677),d=t(98910),c=t(16137),u=t(67385),g=t(68753);let p=(0,l.I4)(g.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,h=l.I4.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,f=l.I4.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,m=l.I4.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,x=(0,l.I4)(c.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,v=(0,l.I4)(d.E)`
  margin-top: 0.25rem;
`,y=(0,l.I4)(s.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,C=({errMsg:e,balance:r,address:t,className:l,title:s,showCopyButton:d=!1})=>{let[c,g]=(0,o.useState)(!1);return(0,o.useEffect)(()=>{if(c){let e=setTimeout(()=>g(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,n.jsxs)("div",{children:[s&&(0,n.jsx)(x,{children:s}),(0,n.jsx)(p,{className:l,$state:e?"error":void 0,children:(0,n.jsxs)(h,{children:[(0,n.jsxs)(f,{children:[(0,n.jsx)(u.A,{address:t,showCopyIcon:!1}),void 0!==r&&(0,n.jsx)(m,{children:r})]}),d&&(0,n.jsx)(y,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(t).then(()=>g(!0)).catch(console.error)},size:"sm",children:(0,n.jsxs)(n.Fragment,c?{children:["Copied",(0,n.jsx)(a.A,{size:14})]}:{children:["Copy",(0,n.jsx)(i.A,{size:14})]})})]})}),e&&(0,n.jsx)(v,{children:e})]})}},61992:(e,r,t)=>{t.d(r,{S:()=>a});var n=t(51862);let a=n.I4.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},66698:(e,r,t)=>{t.r(r),t.d(r,{ManualTransferScreen:()=>F,default:()=>F});var n=t(95155),a=t(12115),i=t(19559),o=t(31794),l=t(97677),s=t(8336),d=t(10308),c=t(80833),u=t(14084),g=t(20223),p=t(61992),h=t(40135),f=t(55134),m=t(51774),x=t(48777),v=t(69704),y=t(73532),C=t(18892),b=t(80061),w=t(89367),S=t(54479),j=t(69066),k=t(33507),I=t(69161),z=t(45595),$=t(4104);let F={component:()=>{let{wallets:e}=(0,b.u)(),{connectors:r}=(0,v.u)(),t=r.filter(x.b).flatMap(e=>e.wallets),{data:F,setModalData:T,navigate:D,lastScreen:M}=(0,y.u)(),{rpcConfig:E,appId:N,createAnalyticsEvent:B,closePrivyModal:L}=(0,v.u)(),P=(0,m.a)(),[U,J]=(0,a.useState)(void 0),[Z,H]=(0,a.useState)(!1),O=F?.funding,{reloadBalance:W}=(0,C.u)({rpcConfig:E,appId:N,address:"ethereum"===O.chainType?O.address:void 0,chain:"ethereum"===O.chainType?O.chain:void 0}),R="solana"===O.chainType,V=R?O.isUSDC?"USDC":"SOL":O.erc20Address?O.erc20ContractInfo?.symbol:O.chain.nativeCurrency.symbol,q=R?t.find(({address:e})=>e===O.address):e.find(({address:e})=>(0,$.c)(e)===(0,$.c)(O.address));if(!O)return T({errorModalData:{error:Error("Couldn't find funding config"),previousScreen:M||"FundingMethodSelectionScreen"},funding:F?.funding,solanaFundingData:F?.solanaFundingData,sendTransaction:F?.sendTransaction}),D("ErrorScreen"),(0,n.jsx)(n.Fragment,{});(0,a.useEffect)(()=>{let e=R?async function(){if("solana"!==O.chainType)return;let e=P.solanaRpcs[O.chain];e?(O.isUSDC?async function({rpc:e,address:r,mintAddress:t}){let n=await e.getTokenAccountsByOwner(r,{mint:t},{encoding:"jsonParsed",commitment:"confirmed"}).send(),a=n.value[0]?.account;return a?BigInt(a.data.parsed.info.tokenAmount.amount):0n}({rpc:e.rpc,address:O.address,mintAddress:(0,k.g)(O.chain)}):(0,S.p)({rpc:e.rpc,address:O.address})).then(e=>{let r=BigInt(e);U&&r>U&&(H(!0),B({eventName:w.O,payload:{provider:"manual",status:"success",chainType:"solana",address:q?.address,value:O.isUSDC?(0,i.J)(r-U,6):(0,i.J)(r-U,9),token:O.isUSDC?"USDC":"SOL"}})),J(r)}):console.warn("Unable to load solana rpc, skipping balance")}:async function(){"ethereum"===O.chainType&&(async()=>{if(!O.erc20Address)return await W()??BigInt(0);{let{balance:e}=await (0,z.g)({chain:O.chain,address:O.address,erc20Address:O.erc20Address,rpcConfig:E,appId:N});return e}})().then(e=>{U&&e>U&&(H(!0),B({eventName:w.O,payload:{provider:"manual",status:"success",chainType:"ethereum",address:q?.address,chainId:O.chain.id,value:(0,i.J)(e-U,O.erc20ContractInfo?.decimals??18),token:O.erc20ContractInfo?.symbol??O.erc20Address??"ETH"}})),J(e)}).catch(()=>J(void 0))},r=setInterval(e,2e3);return e(),()=>clearInterval(r)},[U]);let G=(0,a.useMemo)(()=>null==U?"":O.isUSDC?(0,o.NJ)({amount:U,decimals:6}):R?(0,I.g)(U,3,!0,!0):null!=O.erc20ContractInfo?.decimals?(0,o.NJ)({amount:U,decimals:O.erc20ContractInfo.decimals}):(0,o.vj)({wei:U}),[U,R,O]),_="ethereum"===O.chainType?O.chain.name:(0,j.g)(O.chain),Q=(0,a.useMemo)(()=>""===O.uiConfig?.receiveFundsTitle?null:(0,n.jsx)(h.T,{children:O.uiConfig?.receiveFundsTitle??`Receive ${O.amount} ${V??""}`.trim()}),[O.uiConfig?.receiveFundsTitle,O.amount,V]),Y=(0,a.useMemo)(()=>""===O.uiConfig?.receiveFundsSubtitle?null:(0,n.jsx)(p.S,{children:O.uiConfig?.receiveFundsSubtitle??`Scan this code or copy your wallet address to receive funds on ${_}.`}),[O.uiConfig?.receiveFundsSubtitle,_]),K="solana"===O.chainType&&O.isUSDC&&(0,k.g)(O.chain)?`?spl-token=${(0,k.g)(O.chain)}`:"";return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(u.t,{}),Q,Y,(0,n.jsxs)(s.F,{style:{gap:"1rem",margin:Q||Y?"1rem 0":"0"},children:[(0,n.jsx)(c.Q,{url:`${O.chainType}:${O.address}${K}`,size:200,squareLogoElement:A}),(0,n.jsxs)(g.I,{theme:P.appearance.palette.colorScheme,children:["Make sure to send funds on ",_,"."]}),(0,n.jsx)(f.W,{title:"Your wallet",errMsg:void 0,showCopyButton:!0,balance:`${G} ${V}`,address:O.address}),Z&&(0,n.jsx)(l.P,{onClick:()=>L({shouldCallAuthOnSuccess:!1,isSuccess:!0}),children:"Continue"})]}),(0,n.jsx)(d.B,{})]})}},A=({...e})=>(0,n.jsx)(S.B,{color:"black",...e})},67385:(e,r,t)=>{t.d(r,{A:()=>c});var n=t(95155),a=t(94514),i=t(67635),o=t(12115),l=t(51862),s=t(4104),d=t(97677);let c=({address:e,showCopyIcon:r,url:t,className:l})=>{let[c,h]=(0,o.useState)(!1);function f(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>h(!0)).catch(console.error)}return(0,o.useEffect)(()=>{if(c){let e=setTimeout(()=>h(!1),3e3);return()=>clearTimeout(e)}},[c]),(0,n.jsxs)(u,t?{children:[(0,n.jsx)(p,{title:e,className:l,href:`${t}/address/${e}`,target:"_blank",children:(0,s.c)(e)}),r&&(0,n.jsx)(d.S,{onClick:f,size:"sm",style:{gap:"0.375rem"},children:(0,n.jsxs)(n.Fragment,c?{children:["Copied",(0,n.jsx)(a.A,{size:16})]}:{children:["Copy",(0,n.jsx)(i.A,{size:16})]})})]}:{children:[(0,n.jsx)(g,{title:e,className:l,children:(0,s.c)(e)}),r&&(0,n.jsx)(d.S,{onClick:f,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,n.jsxs)(n.Fragment,c?{children:["Copied",(0,n.jsx)(a.A,{size:14})]}:{children:["Copy",(0,n.jsx)(i.A,{size:14})]})})]})},u=l.I4.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,g=l.I4.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,p=l.I4.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},67635:(e,r,t)=>{t.d(r,{A:()=>n});let n=(0,t(78340).A)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},68753:(e,r,t)=>{t.d(r,{B:()=>i,a:()=>a});var n=t(51862);let a=(0,n.AH)`
  && {
    border-width: 1px;
    padding: 0.5rem 1rem;
  }

  width: 100%;
  text-align: left;
  border: solid 1px var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${e=>"error"===e.$state?"\n        border-color: var(--privy-color-error);\n        background: var(--privy-color-error-bg);\n      ":""}
`,i=n.I4.div`
  ${a}
`},69066:(e,r,t)=>{t.d(r,{g:()=>n});function n(e){switch(e){case"solana:mainnet":return"Solana";case"solana:devnet":return"Devnet";case"solana:testnet":return"Testnet"}}},69161:(e,r,t)=>{t.d(r,{a:()=>i,g:()=>a});var n=t(90491);function a(e,r=6,t=!1,n=!1){let i=(parseFloat(e.toString())/1e9).toFixed(r).replace(/0+$/,"").replace(/\.$/,""),o=n?"":" SOL";return t?`${i}${o}`:`${"0"===i?"<0.001":i}${o}`}function i({amount:e,fee:r,tokenPrice:t,isUsdc:o}){let l=BigInt(Math.floor(parseFloat(e)*10**(o?6:9))),s=o?l:l+r;return{fundingAmountInBaseUnit:l,fundingAmountInUsd:t?(0,n.g)(l,t):void 0,totalPriceInUsd:t?(0,n.g)(s,t):void 0,totalPriceInNativeCurrency:a(s),feePriceInNativeCurrency:a(r),feePriceInUsd:t?(0,n.g)(r,t):void 0}}},78340:(e,r,t)=>{t.d(r,{A:()=>s});var n=t(12115);let a=e=>{let r=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,r,t)=>t?t.toUpperCase():r.toLowerCase());return r.charAt(0).toUpperCase()+r.slice(1)},i=(...e)=>e.filter((e,r,t)=>!!e&&""!==e.trim()&&t.indexOf(e)===r).join(" ").trim();var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let l=(0,n.forwardRef)(({color:e="currentColor",size:r=24,strokeWidth:t=2,absoluteStrokeWidth:a,className:l="",children:s,iconNode:d,...c},u)=>(0,n.createElement)("svg",{ref:u,...o,width:r,height:r,stroke:e,strokeWidth:a?24*Number(t)/Number(r):t,className:i("lucide",l),...!s&&!(e=>{for(let r in e)if(r.startsWith("aria-")||"role"===r||"title"===r)return!0})(c)&&{"aria-hidden":"true"},...c},[...d.map(([e,r])=>(0,n.createElement)(e,r)),...Array.isArray(s)?s:[s]])),s=(e,r)=>{let t=(0,n.forwardRef)(({className:t,...o},s)=>(0,n.createElement)(l,{ref:s,iconNode:r,className:i(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,t),...o}));return t.displayName=a(e),t}},80833:(e,r,t)=>{t.d(r,{Q:()=>x});var n=t(95155),a=t(768),i=t(12115),o=t(51862),l=t(51774),s=t(4104);let d=e=>(0,n.jsx)("svg",{viewBox:"0 0 50 50",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:(0,n.jsx)("rect",{width:"50",height:"50",fill:"black",rx:10,ry:10})}),c=(e,r,t,n,a)=>{for(let i=r;i<r+n;i++)for(let r=t;r<t+a;r++){let t=e?.[r];t&&t[i]&&(t[i]=0)}return e},u=({x:e,y:r,cellSize:t,bgColor:a,fgColor:i})=>(0,n.jsx)(n.Fragment,{children:[0,1,2].map(o=>(0,n.jsx)("circle",{r:t*(7-2*o)/2,cx:e+7*t/2,cy:r+7*t/2,fill:o%2!=0?a:i},`finder-${e}-${r}-${o}`))}),g=({cellSize:e,matrixSize:r,bgColor:t,fgColor:a})=>(0,n.jsx)(n.Fragment,{children:[[0,0],[(r-7)*e,0],[0,(r-7)*e]].map(([r,i])=>(0,n.jsx)(u,{x:r,y:i,cellSize:e,bgColor:t,fgColor:a},`finder-${r}-${i}`))}),p=({matrix:e,cellSize:r,color:t})=>(0,n.jsx)(n.Fragment,{children:e.map((e,a)=>e.map((e,o)=>e?(0,n.jsx)("rect",{height:r-.4,width:r-.4,x:a*r+.1*r,y:o*r+.1*r,rx:.5*r,ry:.5*r,fill:t},`cell-${a}-${o}`):(0,n.jsx)(i.Fragment,{},`circle-${a}-${o}`)))}),h=({cellSize:e,matrixSize:r,element:t,sizePercentage:a,bgColor:i})=>{if(!t)return(0,n.jsx)(n.Fragment,{});let o=r*(a||.14),l=Math.floor(r/2-o/2),s=Math.floor(r/2+o/2);(s-l)%2!=r%2&&(s+=1);let d=(s-l)*e,c=d-.2*d,u=l*e;return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("rect",{x:l*e,y:l*e,width:d,height:d,fill:i}),(0,n.jsx)(t,{x:u+.1*d,y:u+.1*d,height:c,width:c})]})},f=e=>{var r,t;let i,o,l=e.outputSize,d=(r=e.url,t=e.errorCorrectionLevel,i=a.create(r,{errorCorrectionLevel:t}).modules,o=c(o=(0,s.l)(Array.from(i.data),i.size),0,0,7,7),o=c(o,o.length-7,0,7,7),c(o,0,o.length-7,7,7)),u=l/d.length,f=(0,s.m)(2*u,{min:.025*l,max:.036*l});return(0,n.jsxs)("svg",{height:e.outputSize,width:e.outputSize,viewBox:`0 0 ${e.outputSize} ${e.outputSize}`,style:{height:"100%",width:"100%",padding:`${f}px`},children:[(0,n.jsx)(p,{matrix:d,cellSize:u,color:e.fgColor}),(0,n.jsx)(g,{cellSize:u,matrixSize:d.length,fgColor:e.fgColor,bgColor:e.bgColor}),(0,n.jsx)(h,{cellSize:u,element:e.logo?.element,bgColor:e.bgColor,matrixSize:d.length})]})},m=o.I4.div.attrs({className:"ph-no-capture"})`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${e=>`${e.$size}px`};
  width: ${e=>`${e.$size}px`};
  margin: auto;
  background-color: ${e=>e.$bgColor};

  && {
    border-width: 2px;
    border-color: ${e=>e.$borderColor};
    border-radius: var(--privy-border-radius-md);
  }
`,x=e=>{let{appearance:r}=(0,l.a)(),t=e.bgColor||"#FFFFFF",a=e.fgColor||"#000000",i=e.size||160,o="dark"===r.palette.colorScheme?t:a;return(0,n.jsx)(m,{$size:i,$bgColor:t,$fgColor:a,$borderColor:o,children:(0,n.jsx)(f,{url:e.url,logo:e.hideLogo?void 0:{element:e.squareLogoElement??d},outputSize:i,bgColor:t,fgColor:a,errorCorrectionLevel:e.errorCorrectionLevel||"Q"})})}},89367:(e,r,t)=>{t.d(r,{O:()=>n});let n="sdk_fiat_on_ramp_completed_with_status"},90491:(e,r,t)=>{t.d(r,{g:()=>a});var n=t(16746);function a(e,r){let t=parseFloat(e.toString())/n.L,a=i.format(r*t);return"$0.00"===a?"<$0.01":a}let i=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},94514:(e,r,t)=>{t.d(r,{A:()=>n});let n=(0,t(78340).A)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},98910:(e,r,t)=>{t.d(r,{E:()=>a});var n=t(51862);let a=n.I4.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`}}]);