"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1858],{8336:(e,t,n)=>{n.d(t,{B:()=>a,C:()=>s,F:()=>c,H:()=>o,R:()=>m,S:()=>u,a:()=>d,b:()=>g,c:()=>l,d:()=>p,e:()=>r});var i=n(51862);let a=i.I4.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,r=i.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,o=i.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,s=(0,i.I4)(r)`
  padding: 20px 0;
`,l=(0,i.I4)(r)`
  gap: 16px;
`,c=i.I4.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=i.I4.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;i.I4.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let u=i.I4.div`
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
`,g=i.I4.div`
  height: 16px;
`,m=i.I4.div`
  height: 12px;
`;i.I4.div`
  position: relative;
`;let p=i.I4.div`
  height: ${e=>e.height??"12"}px;
`;i.I4.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},14084:(e,t,n)=>{n.d(t,{t:()=>o});var i=n(95155),a=n(73532),r=n(97677);function o({title:e}){let{currentScreen:t,navigateBack:n,navigate:s,data:l,setModalData:c}=(0,a.u)();return(0,i.jsx)(r.M,{title:e,backFn:"ManualTransferScreen"===t?n:t===l?.funding?.methodScreen?l.funding.comingFromSendTransactionScreen?()=>s("SendTransactionScreen"):void 0:l?.funding?.methodScreen?()=>{let e=l.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),c({funding:e,solanaFundingData:l?.solanaFundingData}),s(e.methodScreen)}:void 0})}},16746:(e,t,n)=>{n.d(t,{A:()=>s,D:()=>d,J:()=>c,L:()=>i,R:()=>l,S:()=>a,T:()=>r,a:()=>o});let i=1e9,a="11111111111111111111111111111111",r="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",o="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",s="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",l=["CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C","CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"],c=["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],d={"solana:mainnet":{EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v:{symbol:"USDC",decimals:6,address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB:{symbol:"USDT",decimals:6,address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:devnet":{"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":{symbol:"USDC",decimals:6,address:"4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"},EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS:{symbol:"USDT",decimals:6,address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS"},So11111111111111111111111111111111111111112:{symbol:"SOL",decimals:9,address:"So11111111111111111111111111111111111111112"}},"solana:testnet":{}}},29781:(e,t,n)=>{n.d(t,{C:()=>o,S:()=>r});var i=n(95155),a=n(51862);let r=({title:e,description:t,children:n,...a})=>(0,i.jsx)(s,{...a,children:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("h3",{children:e}),"string"==typeof t?(0,i.jsx)("p",{children:t}):t,n]})});(0,a.I4)(r)`
  margin-bottom: 24px;
`;let o=({title:e,description:t,icon:n,children:a,...r})=>(0,i.jsxs)(l,{...r,children:[n||null,(0,i.jsx)("h3",{children:e}),t&&"string"==typeof t?(0,i.jsx)("p",{children:t}):t,a]}),s=a.I4.div`
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
`,l=(0,a.I4)(s)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},33187:(e,t,n)=>{n.d(t,{A:()=>a});var i=n(12115);let a=i.forwardRef(function({title:e,titleId:t,...n},a){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?i.createElement("title",{id:t},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))})},33507:(e,t,n)=>{n.d(t,{g:()=>a});var i=n(16746);function a(e){let[t]=Object.entries(i.D[e]).find(([e,t])=>"USDC"===t.symbol)??[];return t}},36745:(e,t,n)=>{n.d(t,{u:()=>l});var i=n(12115),a=n(65078),r=n(51774),o=n(69704),s=n(46531);function l(e){let{tokenPrice:t,isTokenPriceLoading:n,tokenPriceError:l}=(e=>{let{showFiatPrices:t,getUsdTokenPrice:n,chains:s}=(0,o.u)(),[l,c]=(0,i.useState)(!0),[d,u]=(0,i.useState)(void 0),[g,m]=(0,i.useState)(void 0);return(0,i.useEffect)(()=>{e||=r.U;let i=(0,a.uc)(s).find(t=>t.id===Number(e));(async()=>{if(t){if(!i)return c(!1),u(Error(`Unable to fetch token price on chain id ${e}`));try{c(!0);let e=await n(i);e?m(e):u(Error(`Unable to fetch token price on chain id ${i.id}`))}catch(e){u(e)}finally{c(!1)}}else c(!1)})()},[e]),{tokenPrice:g,isTokenPriceLoading:l,tokenPriceError:d}})("solana"===e?-1:e),{solPrice:c,isSolPriceLoading:d,solPriceError:u}=(0,s.u)({enabled:"solana"===e});return"solana"===e?{tokenPrice:c,isTokenPriceLoading:d,tokenPriceError:u}:{tokenPrice:t,isTokenPriceLoading:n,tokenPriceError:l}}},37403:(e,t,n)=>{n.d(t,{L:()=>r});var i=n(51862);let a=(0,i.i7)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,r=(0,i.AH)`
  ${e=>e.$isLoading?(0,i.AH)`
          width: 35%;
          animation: ${a} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},46531:(e,t,n)=>{n.d(t,{u:()=>r});var i=n(12115),a=n(69704);let r=({enabled:e=!0}={})=>{let{showFiatPrices:t,getUsdPriceForSol:n}=(0,a.u)(),[r,o]=(0,i.useState)(!0),[s,l]=(0,i.useState)(void 0),[c,d]=(0,i.useState)(void 0);return(0,i.useEffect)(()=>{(async()=>{if(t&&e)try{o(!0);let e=await n();e?d(e):l(Error("Unable to fetch SOL price"))}catch(e){l(e)}finally{o(!1)}else o(!1)})()},[]),{solPrice:c,isSolPriceLoading:r,solPriceError:s}}},51858:(e,t,n)=>{n.r(t),n.d(t,{FundSolWalletWithExternalSolanaWallet:()=>ec,default:()=>ec});var i,a,r,o,s,l,c,d,u,g=n(95155),m=n(33187),p=n(12115),f=n(31794),h=n(97677),v=n(8336),x=n(10308),y=n(29781),S=n(14084),w=n(64493),A=n(98590),b=n(63530),k=n(84161);function I({rows:e}){return(0,g.jsx)(k.a,{children:e.filter(e=>!!e).map((e,t)=>null!=e.value||e.isLoading?(0,g.jsxs)(k.R,{children:[(0,g.jsx)(b.L,{children:e.label}),(0,g.jsx)(b.V,{$isLoading:e.isLoading,children:e.value})]},t):null)})}var C=n(51774),T=n(37857),P=n(69704),z=n(73532),j=n(58837),L=n(36745),F=n(89367),W=n(23846),E=n(37272),N=n(43451),U=n(38855),M=((i=M||{})[i.Uninitialized=0]="Uninitialized",i[i.Initialized=1]="Initialized",i),D=((a=D||{})[a.Legacy=0]="Legacy",a[a.Current=1]="Current",a),B=((r=B||{})[r.Nonce=0]="Nonce",r),H=((o=H||{})[o.CreateAccount=0]="CreateAccount",o[o.Assign=1]="Assign",o[o.TransferSol=2]="TransferSol",o[o.CreateAccountWithSeed=3]="CreateAccountWithSeed",o[o.AdvanceNonceAccount=4]="AdvanceNonceAccount",o[o.WithdrawNonceAccount=5]="WithdrawNonceAccount",o[o.InitializeNonceAccount=6]="InitializeNonceAccount",o[o.AuthorizeNonceAccount=7]="AuthorizeNonceAccount",o[o.Allocate=8]="Allocate",o[o.AllocateWithSeed=9]="AllocateWithSeed",o[o.AssignWithSeed=10]="AssignWithSeed",o[o.TransferSolWithSeed=11]="TransferSolWithSeed",o[o.UpgradeNonceAccount=12]="UpgradeNonceAccount",o[o.CreateAccountAllowPrefund=13]="CreateAccountAllowPrefund",o),O=n(50382),$=n(3744),R=n(28172),V=n(17378),G=n(4013),Z=((s=Z||{})[s.Uninitialized=0]="Uninitialized",s[s.Initialized=1]="Initialized",s[s.Frozen=2]="Frozen",s),J=((l=J||{})[l.MintTokens=0]="MintTokens",l[l.FreezeAccount=1]="FreezeAccount",l[l.AccountOwner=2]="AccountOwner",l[l.CloseAccount=3]="CloseAccount",l);async function Q(e,t={}){let{programAddress:n="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"}=t;return await (0,G.o0)({programAddress:n,seeds:[(0,G.jw)().encode(e.owner),(0,G.jw)().encode(e.tokenProgram),(0,G.jw)().encode(e.mint)]})}var q=((c=q||{})[c.CreateAssociatedToken=0]="CreateAssociatedToken",c[c.CreateAssociatedTokenIdempotent=1]="CreateAssociatedTokenIdempotent",c[c.RecoverNestedAssociatedToken=2]="RecoverNestedAssociatedToken",c),Y=((d=Y||{})[d.Mint=0]="Mint",d[d.Token=1]="Token",d[d.Multisig=2]="Multisig",d),_=((u=_||{})[u.InitializeMint=0]="InitializeMint",u[u.InitializeAccount=1]="InitializeAccount",u[u.InitializeMultisig=2]="InitializeMultisig",u[u.Transfer=3]="Transfer",u[u.Approve=4]="Approve",u[u.Revoke=5]="Revoke",u[u.SetAuthority=6]="SetAuthority",u[u.MintTo=7]="MintTo",u[u.Burn=8]="Burn",u[u.CloseAccount=9]="CloseAccount",u[u.FreezeAccount=10]="FreezeAccount",u[u.ThawAccount=11]="ThawAccount",u[u.TransferChecked=12]="TransferChecked",u[u.ApproveChecked=13]="ApproveChecked",u[u.MintToChecked=14]="MintToChecked",u[u.BurnChecked=15]="BurnChecked",u[u.InitializeAccount2=16]="InitializeAccount2",u[u.SyncNative=17]="SyncNative",u[u.InitializeAccount3=18]="InitializeAccount3",u[u.InitializeMultisig2=19]="InitializeMultisig2",u[u.InitializeMint2=20]="InitializeMint2",u[u.GetAccountDataSize=21]="GetAccountDataSize",u[u.InitializeImmutableOwner=22]="InitializeImmutableOwner",u[u.AmountToUiAmount=23]="AmountToUiAmount",u[u.UiAmountToAmount=24]="UiAmountToAmount",u[u.WithdrawExcessLamports=25]="WithdrawExcessLamports",u[u.UnwrapLamports=26]="UnwrapLamports",u[u.Batch=27]="Batch",u),X=n(16746),K=n(33507),ee=n(73162),et=n(17691),en=n(69066),ei=n(90491),ea=n(16487);function er(e){return BigInt(Math.floor(1e9*parseFloat(e)))}function eo(e){return+es.format(parseFloat(e.toString())/1e9)}let es=Intl.NumberFormat(void 0,{maximumFractionDigits:8});async function el({tx:e,solanaClient:t,amount:n,asset:i,tokenPrice:a}){if(!e)return null;if("SOL"===i&&a){let i=er(n),r=(0,ei.g)(i,a),o=await (0,ee.f)({solanaClient:t,tx:e});return{amountInUsd:r,feeInUsd:a?(0,ei.g)(o,a):void 0,totalInUsd:(0,ei.g)(i+o,a)}}if("USDC"===i&&a){let i,r="$"+n,o=await (0,ee.f)({solanaClient:t,tx:e}),s=(i=parseFloat(o.toString())/X.L*a)<.01?0:i;return{amountInUsd:r,feeInUsd:(0,ei.g)(o,a),totalInUsd:"$"+(parseFloat(n)+s).toFixed(2)}}if("SOL"===i){let i=er(n),a=await (0,ee.f)({solanaClient:t,tx:e});return{amountInSol:n+" SOL",feeInSol:eo(a)+" SOL",totalInSol:eo(i+a)+" SOL"}}return{amountInUsdc:n+" USDC",feeInSol:eo(await (0,ee.f)({solanaClient:t,tx:e}))+" SOL"}}let ec={component:function(){let e=(0,C.a)(),{closePrivyModal:t,createAnalyticsEvent:n}=(0,P.u)(),{data:i,setModalData:a,navigate:r}=(0,z.u)(),{wallets:o}=(0,j.o)(),[s,l]=(0,p.useState)("preparing"),[c,d]=(0,p.useState)(),[u,b]=(0,p.useState)(),[k,M]=(0,p.useState)();if(!i?.solanaFundingData)throw Error("Funding config is missing");if(!i.solanaFundingData.sourceWalletData)throw Error("Funding config is missing source wallet data");let{amount:D,asset:B,chain:H,sourceWalletData:G,destinationAddress:Z,afterSuccessScreen:J}=i.solanaFundingData,q=o.find(e=>e.address===G.address&&(0,ea.t)(G.walletClientType)===(0,ea.t)(e.standardWallet.name)),Y=(0,j.q)()(H),{tokenPrice:_,isTokenPriceLoading:eo}=(0,L.u)("solana");return(0,p.useEffect)(()=>{if("preparing"!==s||eo||!q)return;let e="SOL"===B?er(D):BigInt(Math.floor(1e6*parseFloat(D)));b({amount:("SOL"===B&&_?(0,ei.g)(e,_):D)??D}),("SOL"===B?async function({solanaClient:e,source:t,destination:n,amountInLamports:i}){let{value:a}=await e.rpc.getLatestBlockhash().send(),r={address:t},o=(0,O.F)((0,$.mN)({version:0}),e=>(0,R.pt)(r,e),e=>(0,$.S$)(a,e),e=>{var t;let a,o,s,l;return(0,$.az)((t={amount:i,source:r,destination:n},a=(void 0)??"11111111111111111111111111111111",o=(0,U.RH)(a,"omitted"),s={source:{value:t.source??null,isSigner:!0,isWritable:!0},destination:{value:t.destination??null,isSigner:!1,isWritable:!0}},l={...t},Object.freeze({accounts:[o("source",s.source),o("destination",s.destination)],data:(0,W.FU)((0,E.a5)([["discriminator",(0,N.PL)()],["amount",(0,N.eC)()]]),e=>({...e,discriminator:2})).encode(l),programAddress:a})),e)},e=>(0,V.i5)(e));return new Uint8Array((0,V.l9)().encode(o))}({solanaClient:Y,source:q.address,destination:Z,amountInLamports:e}):async function({solanaClient:e,source:t,destination:n,amountInBaseUnits:i}){var a;let r,o,s,l=(0,K.g)(e.chain),{value:c}=await e.rpc.getLatestBlockhash().send(),d={address:t},[u]=await Q({mint:l,owner:t,tokenProgram:X.T}),[g]=await Q({mint:l,owner:n,tokenProgram:X.T}),[m,p]=await Promise.all([e.rpc.getAccountInfo(u,{commitment:"confirmed",encoding:"jsonParsed"}).send().catch(()=>null),e.rpc.getAccountInfo(g,{commitment:"confirmed",encoding:"jsonParsed"}).send().catch(()=>null)]);if(!m?.value)throw Error(`Source token account does not exist for address: ${t}`);let f=(a={payer:d,ata:g,owner:n,mint:l},r=(void 0)??"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",o=(0,U.RH)(r,"programId"),(s={payer:{value:a.payer??null,isSigner:!0,isWritable:!0},ata:{value:a.ata??null,isSigner:!1,isWritable:!0},owner:{value:a.owner??null,isSigner:!1,isWritable:!1},mint:{value:a.mint??null,isSigner:!1,isWritable:!1},systemProgram:{value:a.systemProgram??null,isSigner:!1,isWritable:!1},tokenProgram:{value:a.tokenProgram??null,isSigner:!1,isWritable:!1}}).tokenProgram.value||(s.tokenProgram.value="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),s.systemProgram.value||(s.systemProgram.value="11111111111111111111111111111111"),Object.freeze({accounts:[o("payer",s.payer),o("ata",s.ata),o("owner",s.owner),o("mint",s.mint),o("systemProgram",s.systemProgram),o("tokenProgram",s.tokenProgram)],data:(0,W.FU)((0,E.a5)([["discriminator",(0,N.Qe)()]]),e=>({...e,discriminator:1})).encode({}),programAddress:r})),h=(0,O.F)((0,$.mN)({version:0}),e=>(0,R.pt)(d,e),e=>(0,$.S$)(c,e),e=>p?.value?e:(0,$.az)(f,e),e=>{var t;let n,a,r,o,s;return(0,$.az)((t={source:u,destination:g,authority:d,amount:i},n=(void 0)??"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",a=(0,U.RH)(n,"programId"),r={source:{value:t.source??null,isSigner:!1,isWritable:!0},destination:{value:t.destination??null,isSigner:!1,isWritable:!0},authority:{value:t.authority??null,isSigner:"either",isWritable:!1}},s=((o={...t}).multiSigners??[]).map(e=>(0,U.H0)("multiSigners",a("multiSigners",{value:e,isSigner:!0,isWritable:!1}))),Object.freeze({accounts:[a("source",r.source),a("destination",r.destination),a("authority",r.authority),...s],data:(0,W.FU)((0,E.a5)([["discriminator",(0,N.Qe)()],["amount",(0,N.eC)()]]),e=>({...e,discriminator:3})).encode(o),programAddress:n})),e)},e=>(0,V.i5)(e));return new Uint8Array((0,V.l9)().encode(h))}({solanaClient:Y,source:q.address,destination:Z,amountInBaseUnits:e})).then(d).catch(e=>{l("error"),M(e)})},[s,D,B,H,q,Z,eo,_]),(0,p.useEffect)(()=>{"preparing"===s&&c&&el({tx:c,solanaClient:Y,amount:D,asset:B,tokenPrice:_}).then(e=>{l("loaded"),b({amount:e?.amountInUsd??e?.amountInUsdc??e?.amountInSol??D,fee:e?.feeInUsd??e?.feeInSol,total:e?.totalInUsd??e?.totalInSol})}).catch(e=>{l("error"),M(e)})},[c,D,B,s,_]),(0,p.useEffect)(()=>{"error"===s&&k&&(a({errorModalData:{error:k,previousScreen:"FundSolWalletWithExternalSolanaWallet"},solanaFundingData:i.solanaFundingData}),r("ErrorScreen",!1))},[s,r]),(0,p.useEffect)(()=>{if("success"!==s)return;let e=setTimeout(J?()=>r(J):t,C.X);return()=>clearTimeout(e)},[s]),(0,g.jsxs)(g.Fragment,"success"===s?{children:[(0,g.jsx)(S.t,{}),(0,g.jsx)(v.b,{}),(0,g.jsxs)(v.c,{children:[(0,g.jsx)(m.A,{color:"var(--privy-color-success)",width:"64px",height:"64px"}),(0,g.jsx)(y.C,{title:"Success!",description:`You’ve successfully added ${D} ${B} to your ${e.name} wallet. It may take a minute before the funds are available to use.`})]}),(0,g.jsx)(v.R,{}),(0,g.jsx)(x.B,{})]}:"preparing"===s||"loaded"===s||"sending"===s?{children:[(0,g.jsx)(S.t,{}),(0,g.jsx)(v.e,{style:{marginTop:"16px"},children:(0,g.jsx)(w.I,{icon:q?.standardWallet.icon,name:q?.standardWallet.name})}),(0,g.jsx)(y.C,{style:{marginTop:"8px",marginBottom:"12px"},title:"sending"===s&&q?`Confirming with ${q.standardWallet.name}`:"Confirm transaction"}),(0,g.jsx)(I,{rows:[{label:"Source",value:(0,f.vz)(G.address)},{label:"Destination",value:(0,f.vz)(Z)},{label:"Network",value:(0,en.g)(H)},{label:"Amount",value:u?.amount,isLoading:"preparing"===s},{label:"Estimated fee",value:u?.fee,isLoading:"preparing"===s},{label:"Total",value:u?.total,isLoading:"preparing"===s}]}),(0,g.jsx)(h.P,{style:{marginTop:"1rem"},loading:"preparing"===s||"sending"===s,onClick:function(){"loaded"===s&&c&&q&&(l("sending"),(async function({transaction:e,chain:t,sourceWallet:n,solanaClient:i}){let{hasFunds:a}=await (0,ee.s)({solanaClient:i,tx:e});if(!a)throw new T.P(`Wallet ${(0,f.vz)(n.address)} does not have enough funds.`,void 0,T.a.INSUFFICIENT_BALANCE);let r=(0,et.g)((await n.signAndSendTransaction({transaction:e,chain:t}).catch(e=>{throw new T.P("Transaction was rejected by the user",e,T.a.TRANSACTION_FAILURE)})).signature);return await (0,j.x)({rpcSubscriptions:i.rpcSubscriptions,signature:r,timeout:2e4}),r})({solanaClient:Y,transaction:c,chain:H,sourceWallet:q}).then(e=>{l("success"),n({eventName:F.O,payload:{provider:"external",status:"success",txHash:e,address:q.address,value:D,chainType:"solana",clusterName:H,token:B,destinationAddress:Z,destinationValue:D,destinationChainType:"solana",destinationClusterName:H,destinationToken:B}})}).catch(e=>{l("error"),M(e)}))},children:"Confirm"}),(0,g.jsx)(x.B,{})]}:{children:[(0,g.jsx)(S.t,{}),(0,g.jsx)(A.N,{}),(0,g.jsx)("div",{style:{marginTop:"1rem"}}),(0,g.jsx)(x.B,{})]})}}},63530:(e,t,n)=>{n.d(t,{L:()=>r,V:()=>s,a:()=>o});var i=n(51862),a=n(37403);let r=i.I4.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`,o=(0,i.I4)(r)`
  color: var(--privy-color-accent);
`,s=i.I4.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */
  word-break: break-all;
  text-align: right;

  ${a.L}
`},64493:(e,t,n)=>{n.d(t,{I:()=>r});var i=n(95155),a=n(84122);let r=({icon:e,name:t})=>"string"==typeof e?(0,i.jsx)("img",{alt:`${t||"wallet"} logo`,src:e,style:{height:24,width:24,borderRadius:4}}):void 0===e?(0,i.jsx)(a.A,{style:{height:24,width:24}}):e?(0,i.jsx)(e,{style:{height:24,width:24}}):null},69066:(e,t,n)=>{n.d(t,{g:()=>i});function i(e){switch(e){case"solana:mainnet":return"Solana";case"solana:devnet":return"Devnet";case"solana:testnet":return"Testnet"}}},84122:(e,t,n)=>{n.d(t,{A:()=>a});var i=n(12115);let a=i.forwardRef(function({title:e,titleId:t,...n},a){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?i.createElement("title",{id:t},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"}))})},84161:(e,t,n)=>{n.d(t,{R:()=>r,a:()=>a});var i=n(51862);let a=i.I4.span`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
`,r=i.I4.span`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 0.5rem;
`},89367:(e,t,n)=>{n.d(t,{O:()=>i});let i="sdk_fiat_on_ramp_completed_with_status"},90491:(e,t,n)=>{n.d(t,{g:()=>a});var i=n(16746);function a(e,t){let n=parseFloat(e.toString())/i.L,a=r.format(t*n);return"$0.00"===a?"<$0.01":a}let r=new Intl.NumberFormat(void 0,{style:"currency",currency:"USD",maximumFractionDigits:2})},98590:(e,t,n)=>{n.d(t,{N:()=>r});var i=n(95155),a=n(51862);let r=({size:e,centerIcon:t})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),t?(0,i.jsx)(l,{children:t}):null]})}),o=a.I4.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=a.I4.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=a.I4.div`
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
`,c=a.I4.div`
  position: absolute;
  inset: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=a.I4.div`
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