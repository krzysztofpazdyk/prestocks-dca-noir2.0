"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9346],{14084:(e,n,t)=>{t.d(n,{t:()=>i});var a=t(95155),l=t(73532),o=t(97677);function i({title:e}){let{currentScreen:n,navigateBack:t,navigate:r,data:c,setModalData:s}=(0,l.u)();return(0,a.jsx)(o.M,{title:e,backFn:"ManualTransferScreen"===n?t:n===c?.funding?.methodScreen?c.funding.comingFromSendTransactionScreen?()=>r("SendTransactionScreen"):void 0:c?.funding?.methodScreen?()=>{let e=c.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),s({funding:e,solanaFundingData:c?.solanaFundingData}),r(e.methodScreen)}:void 0})}},29781:(e,n,t)=>{t.d(n,{C:()=>i,S:()=>o});var a=t(95155),l=t(51862);let o=({title:e,description:n,children:t,...l})=>(0,a.jsx)(r,{...l,children:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("h3",{children:e}),"string"==typeof n?(0,a.jsx)("p",{children:n}):n,t]})});(0,l.I4)(o)`
  margin-bottom: 24px;
`;let i=({title:e,description:n,icon:t,children:l,...o})=>(0,a.jsxs)(c,{...o,children:[t||null,(0,a.jsx)("h3",{children:e}),n&&"string"==typeof n?(0,a.jsx)("p",{children:n}):n,l]}),r=l.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  width: 100%;
  margin-bottom: 24px;

  && h3 {
    font-size: 17px;
    color: var(--privy-color-foreground);
  }

  /* Sugar assuming children are paragraphs. Otherwise, handling styling on your own */
  && p {
    color: var(--privy-color-foreground-2);
    font-size: 14px;
  }
`,c=(0,l.I4)(r)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},37403:(e,n,t)=>{t.d(n,{L:()=>o});var a=t(51862);let l=(0,a.i7)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,o=(0,a.AH)`
  ${e=>e.$isLoading?(0,a.AH)`
          width: 35%;
          animation: ${l} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},44239:(e,n,t)=>{t.d(n,{W:()=>i});var a=t(95155),l=t(71275),o=t(65534);let i=({onClick:e,text:n})=>(0,a.jsxs)(o.L,{onClick:e,children:[(0,a.jsx)(o.m,{children:(0,a.jsx)(l.A,{})}),(0,a.jsx)(o.G,{children:n})]})},61992:(e,n,t)=>{t.d(n,{S:()=>l});var a=t(51862);let l=a.I4.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},63679:(e,n,t)=>{t.d(n,{F:()=>c,I:()=>r,a:()=>s,b:()=>d,c:()=>u,d:()=>h,e:()=>i,f:()=>g,g:()=>p});var a=t(51862),l=t(97677),o=t(80548);let i=a.I4.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,r=a.I4.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    border-radius: var(--privy-border-radius-sm);
  }
`,c=a.I4.div`
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
`;let d=a.I4.input`
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
`,p=(0,a.I4)(d)`
  && {
    font-size: 42px;
  }
`;a.I4.button`
  cursor: pointer;
  padding-left: 4px;
`;let u=a.I4.div`
  font-size: 18px;
`,h=a.I4.div`
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
`,(0,a.I4)(o.LinkButton)`
  margin-top: 16px;
`;let y=(0,a.i7)`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;(0,a.I4)(l.c)`
  border-radius: var(--privy-border-radius-md) !important;
  animation: ${y} 0.3s ease-in-out;
`;let g=a.I4.a`
  && {
    color: var(--privy-color-accent);
  }

  cursor: pointer;
`},64493:(e,n,t)=>{t.d(n,{I:()=>o});var a=t(95155),l=t(84122);let o=({icon:e,name:n})=>"string"==typeof e?(0,a.jsx)("img",{alt:`${n||"wallet"} logo`,src:e,style:{height:24,width:24,borderRadius:4}}):void 0===e?(0,a.jsx)(l.A,{style:{height:24,width:24}}):e?(0,a.jsx)(e,{style:{height:24,width:24}}):null},69685:(e,n,t)=>{t.d(n,{C:()=>i});var a=t(95155),l=t(51862),o=t(37403);let i=({children:e,color:n,isLoading:t,isPulsing:l,...o})=>(0,a.jsx)(r,{$color:n,$isLoading:t,$isPulsing:l,...o,children:e}),r=l.I4.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let n,t;"green"===e.$color&&(n="var(--privy-color-success-dark)",t="var(--privy-color-success-light)"),"red"===e.$color&&(n="var(--privy-color-error)",t="var(--privy-color-error-light)"),"gray"===e.$color&&(n="var(--privy-color-foreground-2)",t="var(--privy-color-background-2)");let a=(0,l.i7)`
      from, to {
        background-color: ${t};
      }

      50% {
        background-color: rgba(${t}, 0.8);
      }
    `;return(0,l.AH)`
      color: ${n};
      background-color: ${t};
      ${e.$isPulsing&&(0,l.AH)`
        animation: ${a} 3s linear infinite;
      `};
    `}}

  ${o.L}
`},71275:(e,n,t)=>{t.d(n,{A:()=>a});let a=(0,t(78340).A)("wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]])},84122:(e,n,t)=>{t.d(n,{A:()=>l});var a=t(12115);let l=a.forwardRef(function({title:e,titleId:n,...t},l){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":n},t),e?a.createElement("title",{id:n},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"}))})},99346:(e,n,t)=>{t.r(n),t.d(n,{TransferFromWalletScreen:()=>O,default:()=>O});var a=t(95155),l=t(12115),o=t(10308),i=t(97677),r=t(29781),c=t(14084),s=t(64493),d=t(69685),p=t(61992),u=t(51774),h=t(48777),y=t(69704),g=t(73532),f=t(80061),w=t(44239),m=t(67884),x=t(51862),v=t(4104),T=t(54479),C=t(65534),j=t(63679);let b=({provider:e,displayName:n,logo:t,connectOnly:o,connector:i})=>{let r,{navigate:c,setModalData:d}=(0,g.u)(),{connectWallet:p,walletConnectionStatus:u}=(0,y.u)(),f=(0,C.h)(),[w,x]=(0,l.useState)(!1),j="wallet_connect_v2"===i.connectorType?e:i.walletClientType,[b,k]=(0,l.useState)(!1);(0,l.useEffect)(()=>{b&&("connected"===u?.status||u?.connectError)&&(c(o?"ConnectOnlyStatusScreen":"ConnectionStatusScreen"),k(!1))},[b,u]);let I=(0,h.e)(e),W=window.matchMedia("(display-mode: standalone)").matches,F=(0,h.g)({connectorType:i.connectorType,walletClientType:j});r=F&&F.chainTypes.includes(i.chainType)?()=>{F.isInstalled||"solana"===i.chainType&&"isInstalled"in i&&i.isInstalled?(p(i,j),c(o?"ConnectOnlyStatusScreen":"ConnectionStatusScreen")):(0,h.f)({isMobile:m.Fr,walletConfig:F})?(d(n=>({...n,externalConnectWallet:{...n?.externalConnectWallet,preSelectedWalletId:e,walletChainType:"solana"===i.chainType?"solana-only":"ethereum-only"}})),c(o?"ConnectOnlyLandingScreen":"AuthenticateWithWalletScreen")):m.Fr?(d({installWalletModalData:{walletConfig:F,chainType:i.chainType,connectOnly:o}}),c("WalletInterstitialScreen")):(d({installWalletModalData:{walletConfig:F,chainType:i.chainType,connectOnly:o}}),c("InstallWalletScreen"))}:"coinbase_wallet"!==i.connectorType||"eoaOnly"!==i.coinbaseWalletConfig.preference?.options||!m.Fr||W||(0,v.q)()?()=>{if(!(0,T.r)(window.navigator.userAgent)||event?.isTrusted){if("mobile_wallet_adapter"===i.walletClientType)return p(i,j),void k(!0);p(i,j),o?"wallet_connect_v2"===i.connectorType?(d(e=>({...e,externalConnectWallet:{...e?.externalConnectWallet,preSelectedWalletId:"wallet_connect_qr"}})),c("ConnectOnlyLandingScreen")):c("ConnectOnlyStatusScreen"):c("ConnectionStatusScreen")}}:()=>{window.location.href=`https://go.cb-w.com/dapp?cb_url=${encodeURI(window.location.href)}`};let O=n||I?.metadata?.shortName||I?.name||i.walletClientType;return(0,a.jsxs)(S,{onClick:()=>{w||(x(!0),setTimeout(()=>x(!1),2e3),r())},disabled:w,children:[(0,a.jsx)(s.I,{icon:t||I?.image_url?.md,name:O}),(0,a.jsx)("span",{children:O}),(0,a.jsxs)($,{id:"chip-container",children:[f?.walletClientType===j&&f?.chainType===i.chainType?(0,a.jsx)(_,{color:"gray",children:"Recent"}):(0,a.jsx)("span",{id:"connect-text",children:"Connect"}),"solana"===i.chainType&&(0,a.jsx)(_,{color:"gray",children:"Solana"})]})]})},S=(0,x.I4)(C.L)`
  /* Wallet name text color */
  > span {
    color: var(--privy-color-foreground);
  }

  /* Show "Connect" on hover */
  > #chip-container > #connect-text {
    font-weight: 500;
    color: var(--privy-color-accent);
    opacity: 0;
    transition: opacity 0.1s ease-out;
  }

  :hover > #chip-container > #connect-text {
    opacity: 1;
  }

  @media (max-width: 440px) {
    > #chip-container > #connect-text {
      display: none;
    }
  }
`,_=(0,x.I4)(d.C)`
  margin-left: auto;
`,$=x.I4.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
`,k=["coinbase_wallet","base_account"],I=["metamask","okx_wallet","rainbow","uniswap","bybit_wallet","ronin_wallet","haha_wallet","uniswap_extension","zerion","rabby_wallet","cryptocom","binance","kraken_wallet","robinhood_wallet"],W=["safe"],F=["phantom","backpack","solflare","jupiter","universal_profile"],O={component:()=>{let e,{connectors:n}=(0,y.u)(),{setModalData:t,data:s,navigate:d}=(0,g.u)(),m=(0,u.a)(),{wallets:x}=(0,f.u)(),v=n.filter(h.b).flatMap(e=>e.wallets),[T,j]=(0,l.useState)("default"),S="solana"===s?.funding?.chainType,_=!!s?.funding?.crossChainBridgingEnabled;e="ethereum"===s?.funding?.chainType?s.funding.erc20Address&&!s.funding.isUSDC?"ethereum-only":_&&!s.funding.chain.testnet?"ethereum-and-solana":"ethereum-only":_&&!s.funding?.isUSDC?"ethereum-and-solana":"solana-only";let $=x.filter(e=>"privy"!==e.walletClientType),O=$.map(e=>e.walletClientType),D=v.filter(e=>"privy"!==e.walletClientType),M=D.map(e=>e.walletClientType),E=[],L={...s.funding};L.usingDefaultFundingMethod&&(L.usingDefaultFundingMethod=!1);let B=({wallet:e,walletChainType:n})=>{t({...s,funding:{...L,connectedWallet:e,onContinueWithExternalWallet:()=>d(N({destChainType:S?"solana":"ethereum",sourceChainType:n}))},solanaFundingData:s?.solanaFundingData?{...s.solanaFundingData,sourceWalletData:{address:e.address,walletClientType:e.walletClientType}}:void 0}),d("FundingAmountEditScreen")};"solana-only"!==e&&E.push(...$.map((e,n)=>(0,a.jsx)(A,{onClick:()=>B({wallet:e,walletChainType:"ethereum"}),icon:e.meta.icon,name:e.meta.name,chainType:e.type},n))),"ethereum-only"!==e&&E.push(...D.map((e,n)=>(0,a.jsx)(A,{onClick:()=>B({wallet:e,walletChainType:"solana"}),icon:e.meta.icon,name:e.meta.name,chainType:e.type},n))),E.push(...(({walletList:e,walletChainType:n,connectors:t,connectOnly:l,ignore:o,walletConnectEnabled:i,forceWallet:r})=>{let c=[],s=[],d=[],p=t.filter(e=>"ethereum-only"===n?"ethereum"===e.chainType:"solana-only"!==n||"solana"===e.chainType),u=p.find(e=>"wallet_connect_v2"===e.connectorType);for(let[t,h]of(r?[r.wallet]:e).entries()){if("detected_ethereum_wallets"===h)for(let[e,n]of p.filter(({chainType:e,connectorType:n,walletClientType:t})=>"solana"!==e&&("uniswap_wallet_extension"===t||"uniswap_extension"===t?!o.includes("uniswap"):"crypto.com_wallet_extension"===t||"crypto.com_onchain"===t?!o.includes("cryptocom"):"injected"===n&&!o.includes(t))).entries()){let{walletClientType:o,walletBranding:i,chainType:r}=n;("unknown"===o?s:c).push((0,a.jsx)(b,{connectOnly:l,provider:o,logo:i.icon,displayName:i.name,connector:n},`${t}-${h}-${o}-${r}-${e}`))}if("detected_solana_wallets"===h)for(let[e,i]of p.filter(({chainType:e,walletClientType:t})=>{if("solana"===e)return"ethereum-only"!==n&&!o.includes(t)}).entries()){let{walletClientType:n,walletBranding:o,chainType:r}=i;("unknown"===n?s:c).push((0,a.jsx)(b,{connectOnly:l,provider:n,logo:o.icon,displayName:o.name,connector:i},`${t}-${h}-${n}-${r}-${e}`))}if(F.includes(h)){let e=p.find(e=>"injected"===e.connectorType&&e.walletClientType===h||e.connectorType===h);if(e&&c.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:e},`${t}-${h}`)),"solana-only"===n||"ethereum-and-solana"===n){let e=p.find(({chainType:e,walletClientType:n})=>"solana"===e&&n===h);e&&c.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:e},`${h}-solana`))}}else if(I.includes(h)){let e=p.find(e=>"uniswap"===h?"uniswap_wallet_extension"===e.walletClientType||"uniswap_extension"===e.walletClientType:"cryptocom"===h?"crypto.com_wallet_extension"===e.walletClientType||"crypto.com_onchain"===e.walletClientType:"injected"===e.connectorType&&e.walletClientType===h);if(i&&!e&&(e=u),e&&c.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:e,logo:"injected"===e.connectorType?e.walletBranding.icon:void 0,displayName:"injected"===e.connectorType?e.walletBranding.name:void 0},`${t}-${h}`)),"solana-only"===n||"ethereum-and-solana"===n){let e=p.find(({chainType:e,walletClientType:n})=>"solana"===e&&n===h);e&&c.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:e},`${h}-solana`))}}else if(k.includes(h)){let e=p.find(({connectorType:e})=>e===h);e&&c.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:e,displayName:e.walletBranding.name,logo:e.walletBranding.icon},`${t}-${h}`))}else if(W.includes(h))u&&d.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:u},`${t}-${h}`));else if("wallet_connect"===h)u&&d.push((0,a.jsx)(b,{connectOnly:l,provider:h,connector:u,logo:u.walletBranding.icon,displayName:"WalletConnect"},`${t}-${h}`));else if(h===r?.wallet){let n="ethereum"===r.chainType&&e.includes("detected_ethereum_wallets"),o="solana"===r.chainType&&e.includes("detected_solana_wallets");if(n||o){let e=p.find(({walletClientType:e})=>e===h);e&&c.push((0,a.jsx)(b,{connectOnly:l,provider:h,displayName:e.walletBranding?.name,logo:e.walletBranding?.icon,connector:e},`${t}-${h}`))}}}return[...s,...c,...d]})({walletList:m.appearance.walletList.filter(e=>!$.some(n=>n.walletClientType===e)&&!D.some(n=>n.walletClientType===e)),walletChainType:e,connectors:n,connectOnly:!0,ignore:[...m.appearance.walletList,...O,...M],walletConnectEnabled:m.externalWallets.walletConnect.enabled}));let z=(0,a.jsx)(w.W,{text:"More wallets",onClick:()=>j("overflow")}),N=({sourceChainType:e,destChainType:n})=>"ethereum"===e&&"solana"===n?"AwaitingEvmToSolBridgingScreen":"ethereum"===e&&"ethereum"===n?"AwaitingExternalEthereumTransferScreen":"solana"===e&&"ethereum"===n?"AwaitingSolToEvmBridgingScreen":L.externalSolanaFundingScreen;return(0,l.useEffect)(()=>{t({...s,externalConnectWallet:{onCompleteNavigateTo:({address:e,walletClientType:n,walletChainType:a})=>{let l=a??"ethereum",o="ethereum"===l?$.find(t=>t.address===e&&t.walletClientType===n):D.find(t=>t.address===e&&t.walletClientType===n);return t({...s,funding:{...L,connectedWallet:o,onContinueWithExternalWallet:()=>{d(N({destChainType:S?"solana":"ethereum",sourceChainType:l}))}},solanaFundingData:s?.solanaFundingData?{...s.solanaFundingData,sourceWalletData:{address:e||"",walletClientType:n||""}}:void 0}),"FundingAmountEditScreen"}}})},[]),(0,a.jsxs)(a.Fragment,"overflow"===T?{children:[(0,a.jsx)(i.M,{backFn:()=>j("default")},"header"),(0,a.jsxs)(C.p,{children:[(0,a.jsx)(p.S,{style:{color:"var(--privy-color-foreground-3)",textAlign:"left"},children:"More wallets"}),E]}),(0,a.jsx)(o.B,{})]}:{children:[(0,a.jsx)(c.t,{}),(0,a.jsx)(r.C,{title:"Transfer from wallet",description:"Connect a wallet to deposit funds or send funds manually to your wallet address."}),(0,a.jsxs)(C.p,{children:[E.length>4?E.slice(0,3):E,E.length>4&&z]}),(0,a.jsx)(o.B,{})]})}},A=({onClick:e,icon:n,name:t,chainType:l})=>(0,a.jsxs)(C.L,{onClick:e,children:[(0,a.jsx)(j.I,{style:{width:20},children:(0,a.jsx)(s.I,{icon:n,name:t})}),t,(0,a.jsx)(d.C,{color:"gray",style:{marginLeft:"auto"},children:"Connected"}),"solana"===l&&(0,a.jsx)(d.C,{color:"gray",children:"Solana"})]})}}]);