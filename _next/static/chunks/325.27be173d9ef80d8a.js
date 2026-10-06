"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[325],{325:(e,t,a)=>{a.d(t,{C:()=>er,L:()=>X});var i=a(95155),l=a(12115);let r=l.forwardRef(function({title:e,titleId:t,...a},i){return l.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":t},a),e?l.createElement("title",{id:t},e):null,l.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"}))});var n=a(51862),o=a(10308),s=a(97677),d=a(51774),c=a(48777),p=a(69704),u=a(73532),h=a(54479),g=a(19750),m=a(65534),x=a(4104),f=a(57445),y=a(58837),v=a(92289),w=a(25237);let j=(0,a(78340).A)("circle-user",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}],["path",{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662",key:"154egf"}]]);var b=a(39464),k=a(69685),C=a(84310),S=a(31794),M=a(26798),T=a(93683),A=a(26904),L=a(673),E=a(63874),P=a(46797),I=a(7894),N=a(44239),V=a(50023);let W=()=>{let e=(0,d.a)(),t=e?.appearance?.logo,a=`${e?.name} logo`,r={maxHeight:"90px",maxWidth:"180px"};return t?"string"==typeof t?(0,i.jsx)("img",{src:t,alt:a,style:r}):"svg"===t.type||"img"===t.type?l.cloneElement(t,{alt:a,style:r}):(console.warn("`config.appearance.logo` must be a string, or an SVG / IMG element. Nothing will be rendered."),null):null},$=n.I4.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  flex-grow: 1;
  justify-content: center;
`,H=({name:e,logoUrl:t,size:a="38px"})=>"string"==typeof t?(0,i.jsx)("img",{src:t,alt:`${e??"Provider app"} logo`,style:{width:a,height:a,maxHeight:"90px",maxWidth:"180px",borderRadius:"8px"}}):(0,i.jsx)("span",{}),D=({appId:e})=>{let[t,a]=(0,l.useState)(void 0),{startCrossAppAuthFlow:r}=(0,y.d)(),{authenticated:n}=(0,d.u)(),{data:o}=(0,u.u)(),{client:s}=(0,p.u)();return(0,l.useEffect)(()=>{(async()=>{s&&a(await s.getCrossAppProviderDetails(e))})()},[s]),(0,i.jsx)(m.L,{onClick:()=>r({appId:e,action:n?"link":"login",disableSignup:o?.login?.disableSignup}),disabled:!t,children:t?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(m.m,{$fullSize:!0,children:(0,i.jsx)(H,{name:t.name,logoUrl:t.icon_url||void 0,size:"32px"})}),t.name]}):(0,i.jsx)(f.B,{})})},R=({isEditable:e,setIsEditable:t,defaultValue:a})=>{let r=(0,l.useRef)(null);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(m.H,{$if:!e,children:(0,i.jsx)(b.C,{ref:r,defaultValue:a})}),(0,i.jsx)(m.H,{$if:e,children:(0,i.jsxs)(m.L,{onClick:()=>{t(),setTimeout(()=>{r.current?.focus()},0)},children:[(0,i.jsx)(m.m,{children:(0,i.jsx)(v.A,{})}),"Continue with Email"]})})]})},F=()=>{let[e,t]=(0,l.useState)(!1),{currentScreen:a,navigate:r,setModalData:n,data:o}=(0,u.u)(),{enabled:s,token:d}=(0,h.a)(),{initLoginWithFarcaster:c}=(0,p.u)(),{accountType:g}=(0,m.h)();return(0,i.jsxs)(m.L,{onClick:async()=>{t(!0);try{s&&!d?(n({captchaModalData:{callback:e=>c(e,o?.login?.disableSignup),userIntentRequired:!0,onSuccessNavigateTo:"FarcasterConnectStatusScreen",onErrorNavigateTo:"ErrorScreen"}}),r("CaptchaScreen")):(await c(d,o?.login?.disableSignup),r("FarcasterConnectStatusScreen"))}catch(e){n({errorModalData:{error:e,previousScreen:a||"LandingScreen"}}),r("ErrorScreen")}finally{t(!1)}},disabled:!1,children:[(0,i.jsx)(C.F,{width:32,height:32})," Farcaster",e&&(0,i.jsx)(f.B,{}),"farcaster"===g&&(0,i.jsx)(O,{color:"gray",children:"Recent"})]})},O=(0,n.I4)(k.C)`
  margin-left: auto;
`,_=({...e})=>(0,i.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"25",height:"25",viewBox:"0 0 25 25",fill:"none",...e,children:[(0,i.jsxs)("g",{clipPath:"url(#clip0_2856_1743)",children:[(0,i.jsx)("path",{d:"M22.1673 8.24075V16.3642C22.1673 17.3256 21.3421 18.105 20.3241 18.105H17.0028M22.1673 8.24075C22.1673 7.27936 21.3421 6.5 20.3241 6.5H11.5302M22.1673 8.24075V8.42852C22.1673 9.03302 21.8352 9.59423 21.2901 9.91105L15.1463 13.4818C14.5539 13.8261 13.8067 13.8261 13.2143 13.4818L10.1621 11.5401",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,i.jsx)("path",{d:"M3.12913 6.64816C0.508085 12.9507 3.49251 20.1847 9.79504 22.8057L11.5068 23.5176C12.4522 23.9108 13.7783 23.2222 14.1714 22.2768L14.6054 21.2333C14.7687 20.8406 14.6438 20.3871 14.3024 20.1334L11.2872 17.8927C10.9878 17.6702 10.5843 17.6488 10.2632 17.8384L9.11575 18.5156C8.78274 18.7121 8.3597 18.6844 8.07552 18.4221C5.94293 16.4542 4.77629 13.6264 4.90096 10.7273C4.91757 10.3409 5.19796 10.023 5.57269 9.92753L6.86381 9.59869C7.22522 9.50664 7.49627 9.20696 7.55169 8.83815L8.10986 5.12321C8.17306 4.70259 7.94188 4.29293 7.54915 4.1296L6.50564 3.69564C5.56026 3.30248 4.23416 3.99103 3.84101 4.9364L3.12913 6.64816Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,i.jsx)("defs",{children:(0,i.jsx)("clipPath",{id:"clip0_2856_1743",children:(0,i.jsx)("rect",{x:"0.5",y:"0.5",width:"24",height:"24",rx:"6",fill:"white"})})})]}),U=({chainType:e,withPadding:t})=>{let a="";return a="ethereum-only"===e||"ethereum-and-solana"===e?"Rainbow, Phantom, or Coinbase Wallet":"Phantom or Solflare",(0,i.jsx)(m.E,{$withPadding:t,children:(0,i.jsxs)(m.n,{children:[(0,i.jsx)(M.A,{style:{color:"var(--privy-color-warn)",height:48,width:48}}),(0,i.jsx)("h3",{children:"No wallets available"}),(0,i.jsxs)("p",{children:["Please download an external wallet provider, like ",a,"."]})]})},"empty-wallet-state")},z=()=>{let{enabled:e,token:t}=(0,h.a)(),{navigate:a,setModalData:r,data:n}=(0,u.u)(),o=(0,d.a)(),{initLoginWithPasskey:s}=(0,p.u)(),c=()=>{o.loginConfig.passkeysForSignupEnabled?a("PasskeySelectSignupOrLogin"):(async()=>{e&&!t?(r({passkeyAuthModalData:{passkeySignupFlow:!1},captchaModalData:{callback:e=>s({captchaToken:e,withPrivyUi:!0}),userIntentRequired:!1,onSuccessNavigateTo:"PasskeyStatusScreen",onErrorNavigateTo:"ErrorScreen"}}),a("CaptchaScreen")):(await s({withPrivyUi:!0,captchaToken:t}),r({passkeyAuthModalData:{passkeySignupFlow:!1}}),a("PasskeyStatusScreen"))})()};return 0===(0,l.useMemo)(()=>{let e=n?.login?.loginMethods;return e?e.filter(e=>"passkey"!==e).length:Object.entries(o.loginMethods).filter(([e,t])=>t).filter(([e])=>"passkey"!==e).length},[o.loginMethods,n?.login])?(0,i.jsxs)(m.L,{onClick:c,children:[(0,i.jsx)(T.A,{})," Continue with passkey"]}):(0,i.jsx)(A.L,{as:"button",onClick:c,size:"sm",variant:"navigation",style:{width:"100%",justifyContent:"center"},children:"I have a passkey"})},q=({isEditable:e,setIsEditable:t,defaultValue:a})=>{let r=(0,l.useRef)(null),{authenticated:n}=(0,d.u)(),{navigate:o,setModalData:s,currentScreen:c,data:g}=(0,u.u)(),{initLoginWithSms:x}=(0,p.u)(),{enabled:f,token:y}=(0,h.a)(),{whatsAppEnabled:v}=(0,d.a)();return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(m.H,{$if:!e,children:(0,i.jsx)(L.C,{ref:r,onSubmit:async function({qualifiedPhoneNumber:e}){if(!f||y||n)try{await x({phoneNumber:e,captchaToken:y,withPrivyUi:!0,disableSignup:g?.login?.disableSignup}),o("AwaitingPasswordlessCodeScreen")}catch(e){s({errorModalData:{error:e,previousScreen:c||"LandingScreen"}}),o("ErrorScreen")}else s({captchaModalData:{callback:t=>x({phoneNumber:e,captchaToken:t,withPrivyUi:!0,disableSignup:g?.login?.disableSignup}),userIntentRequired:!1,onSuccessNavigateTo:"AwaitingPasswordlessCodeScreen",onErrorNavigateTo:"ErrorScreen"}}),o("CaptchaScreen")},defaultValue:a})}),(0,i.jsx)(m.H,{$if:e,children:(0,i.jsxs)(m.L,{onClick:()=>{t(),setTimeout(()=>{r.current?.focus()},0)},children:[(0,i.jsx)(m.m,{children:(0,i.jsx)(w.A,{})}),"Continue with ",v?"WhatsApp":"SMS"]})})]})},B={apple:{logo:E.A,displayName:"Apple"},discord:{logo:E.D,displayName:"Discord"},github:{logo:E.b,displayName:"GitHub"},google:{logo:E.G,displayName:"Google"},linkedin:{logo:E.L,displayName:"LinkedIn"},spotify:{logo:E.S,displayName:"Spotify"},instagram:{logo:E.I,displayName:"Instagram"},telegram:{logo:I.T,displayName:"Telegram"},twitter:{logo:E.a,displayName:"Twitter"},tiktok:{logo:E.T,displayName:"TikTok"},line:{logo:P.L,displayName:"LINE"},twitch:{logo:P.T,displayName:"Twitch"}},G=({provider:e})=>{let{enabled:t,token:a}=(0,h.a)(),{currentScreen:r,navigate:n,setModalData:o,data:s}=(0,u.u)(),[c,g]=(0,l.useState)(!1),x=(0,d.a)(),{initLoginWithOAuth:f}=(0,p.u)(),{accountType:y}=(0,m.h)(),v=(0,l.useMemo)(()=>y&&"guest"!==y&&"authorization_key"!==y&&"cross_app"!==y?(0,h.t)(y):null,[y]),{displayName:w,logo:j}=(0,l.useMemo)(()=>{if((0,d.i)(e)){let t=x.customOAuthProviders.find(t=>t.provider===e),a=t.provider_icon_url,l=t.provider_display_name;return{displayName:l,logo:({style:e})=>(0,i.jsx)("img",{alt:`${l} logo`,src:a,style:e})}}return B[e]},[e,x.customOAuthProviders]);return(0,i.jsxs)(m.L,{onClick:()=>{g(!0),setTimeout(()=>{g(!1)},2e3),t&&!a?(o({captchaModalData:{callback:t=>f(e,t,s?.login?.disableSignup),userIntentRequired:!0,onSuccessNavigateTo:null,onErrorNavigateTo:"ErrorScreen"}}),n("CaptchaScreen")):f(e,void 0,s?.login?.disableSignup).catch(e=>{g(!1),o({errorModalData:{error:e,previousScreen:r||"LandingScreen"}}),n("ErrorScreen")})},disabled:c,children:[(0,i.jsx)(m.m,{$fullSize:!0,children:(0,i.jsx)(j,{style:{width:"32px",height:"32px"}})}),w,v?.loginMethod===e&&(0,i.jsx)(Z,{color:"gray",children:"Recent"})]})},Z=(0,n.I4)(k.C)`
  margin-left: auto;
`,K=()=>{let{enabled:e,token:t}=(0,h.a)(),{navigate:a,setModalData:r,data:n}=(0,u.u)(),[o,s]=(0,l.useState)(!1),{initLoginWithTelegram:d}=(0,p.u)(),{accountType:c}=(0,m.h)();async function g(e){try{await d(e,n?.login?.disableSignup),r({telegramAuthModalData:{seamlessAuth:!1}}),a("TelegramAuthScreen")}catch(e){console.error(e),s(!1)}}return(0,i.jsxs)(m.L,{onClick:async function(){(s(!0),e&&!t)?(r({captchaModalData:{callback:g,userIntentRequired:!0,onSuccessNavigateTo:null,onErrorNavigateTo:"ErrorScreen"}}),a("CaptchaScreen")):await g(t)},disabled:o,children:[(0,i.jsx)(I.T,{width:32,height:32}),"Telegram","telegram"===c&&(0,i.jsx)(Q,{color:"gray",children:"Recent"})]})},Q=(0,n.I4)(k.C)`
  margin-left: auto;
`,J=({onClick:e,text:t,icon:a})=>(0,i.jsxs)(m.L,{onClick:e,children:[(0,i.jsx)(m.m,{children:a}),(0,i.jsx)(m.G,{children:t})]}),X=({connectOnly:e})=>{let{closePrivyModal:t}=(0,p.u)(),{data:a,setModalData:r,onUserCloseViaDialogOrKeybindRef:n,navigate:s}=(0,u.u)(),x=(0,d.a)(),f=a?.login,y=x.appearance.walletList,v=f?.walletChainType??x.appearance.walletChainType,{accountType:w,walletClientType:j,chainType:b}=(0,m.h)(),k=(0,l.useMemo)(()=>w&&"guest"!==w&&"authorization_key"!==w&&"cross_app"!==w?(0,h.t)(w):null,[w]),{email:C,sms:M,google:T,twitter:A,discord:L,github:E,spotify:P,instagram:I,tiktok:$,line:H,twitch:O,linkedin:_,apple:B,wallet:Z,farcaster:Q,telegram:X}=(0,l.useMemo)(()=>f?.loginMethods?(0,S.vA)(f.loginMethods,!0):null,[f])??x.loginMethods,{wallets:er}=(0,g.u)({enabled:(0,c.s)(Z?y:[]),walletList:y,walletChainType:v}),en=x.customOAuthProviders,eo=x.crossAppProviders,{passkey:es}=x.loginMethods,ed=[C&&"email",M&&"sms",T&&"google",A&&"twitter",L&&"discord",E&&"github",P&&"spotify",I&&"instagram",$&&"tiktok",H&&"line",O&&"twitch",_&&"linkedin",B&&"apple",Q&&"farcaster",X&&"telegram",...en.map(e=>e.provider),...eo].filter(e=>!!e),ec=ed.length>0,ep=(0,l.useMemo)(()=>Z&&!ec?"web3-first":Z&&x?.appearance.loginGroupPriority||"web2-first",[Z,ec,x?.appearance.loginGroupPriority]),eu=x?.appearance.hideDirectWeb2Inputs,[eh,eg]=(0,l.useState)("default"),[em,ex]=(0,l.useState)(el({mostRecentlyUsedAccountType:w,smsAvailable:M,emailAvailable:C,prefilledType:f?.prefill?.type}));(0,l.useEffect)(()=>{ex(el({mostRecentlyUsedAccountType:w,smsAvailable:M,emailAvailable:C,prefilledType:f?.prefill?.type}))},[C,M,w]);let ef=()=>{t({shouldCallAuthOnSuccess:!0}),setTimeout(()=>{eg("default")},150)};n.current=ef;let ey=[];j&&Z?ey.push(j):k?.loginMethod&&ed.includes(k.loginMethod)&&ey.push(k.loginMethod);let ev=t=>{if("email"===t)return(0,i.jsx)(R,{isEditable:"email"===em,setIsEditable:()=>{ex("email")},defaultValue:"email"===f?.prefill?.type?f.prefill.value:void 0},t);if("sms"===t)return(0,i.jsx)(q,{isEditable:"sms"===em,setIsEditable:()=>{ex("sms")},defaultValue:"phone"===f?.prefill?.type?f.prefill.value:void 0},t);if("apple"===t)return(0,i.jsx)(G,{provider:"apple"},t);if("discord"===t)return(0,i.jsx)(G,{provider:"discord"},t);if("farcaster"===t)return(0,i.jsx)(F,{},t);if("github"===t)return(0,i.jsx)(G,{provider:"github"},t);if("google"===t)return(0,i.jsx)(G,{provider:"google"},t);if("linkedin"===t)return(0,i.jsx)(G,{provider:"linkedin"},t);if("tiktok"===t)return(0,i.jsx)(G,{provider:"tiktok"},t);if("line"===t)return(0,i.jsx)(G,{provider:"line"},t);if("twitch"===t)return(0,i.jsx)(G,{provider:"twitch"},t);if("spotify"===t)return(0,i.jsx)(G,{provider:"spotify"},t);if("instagram"===t)return(0,i.jsx)(G,{provider:"instagram"},t);if("twitter"===t)return(0,i.jsx)(G,{provider:"twitter"},t);if("telegram"===t)return x.loginConfig.telegramHasHmacCredentials?(0,i.jsx)(K,{},t):(0,i.jsx)(G,{provider:"telegram"},t);if((0,d.i)(t))return(0,i.jsx)(G,{provider:t},t);if(t.startsWith("privy:")){let e=t.split(":")[1];if(!e)throw Error("Invalid cross-app provider format. App ID missing.");return(0,i.jsx)(D,{appId:e},t)}let a=er.findIndex(({id:e})=>e===g.W.normalize(t)),l="solana"===b?"solana-only":"ethereum-only";return(0,i.jsx)(g.a,{recent:!0,index:a,data:{wallets:er,walletChainType:l,handleWalletClick(t){r(e=>({...e,externalConnectWallet:{walletList:y,walletChainType:l,preSelectedWalletId:t.id}})),s(e?"ConnectOnlyLandingScreen":"AuthenticateWithWalletScreen")}}})},ew=er.filter(e=>e.id!==g.W.normalize(j||"")),ej=ew.map((t,a)=>(0,i.jsx)(g.a,{index:a,data:{walletChainType:v,wallets:ew,handleWalletClick(t){r(e=>({...e,externalConnectWallet:{walletList:y,walletChainType:v,preSelectedWalletId:t.id}})),s(e?"ConnectOnlyLandingScreen":"AuthenticateWithWalletScreen")}}},t.id)),eb=ed.filter(e=>e!==k?.loginMethod).flatMap(ev),ek=ey.flatMap(ev);"web3-first"===ep&&"default"===eh?ej.unshift(...ek):"web2-first"===ep&&eb.unshift(...ek);let eC="web2-overflow"===eh?()=>eg("default"):void 0,eS=ed.filter(e=>"email"!==e&&"sms"!==e),eM=et({priority:ep,email:C,sms:M,social:eS}),eT=ea({priority:ep,email:C,sms:M,social:eS}),eA=(0,i.jsx)(N.W,{text:ei({priority:ep}),onClick:()=>{r({...a,externalConnectWallet:{walletChainType:f?.walletChainType??x.appearance.walletChainType}}),s(e?"ConnectOnlyLandingScreen":"AuthenticateWithWalletScreen")}}),eL=(0,i.jsx)(J,{text:eM,icon:eT,onClick:()=>eg("web2-overflow")}),eE=+!eu,eP=Z&&ej.length>0,eI=0===eb.length&&Z&&0===ej.length,eN=5-!!eP,eV="default"===eh&&x?.appearance.logo,eW="default"===eh&&x.appearance.loginMessage;return(0,i.jsxs)(V.S,{title:x.appearance.landingHeader,icon:eV?(0,i.jsx)(W,{}):void 0,iconVariant:eV?"logo":void 0,onClose:ef,showClose:!0,onBack:eC,showBack:!!eC,helpText:x||es&&"default"===eh?(0,i.jsxs)(i.Fragment,{children:[es&&"default"===eh&&!x.globalDisablePasskeys&&(0,i.jsx)(z,{}),x&&(0,i.jsx)(o.T,{app:x})]}):void 0,watermark:!0,children:[eW&&("string"==typeof x.appearance.loginMessage?(0,i.jsx)(Y,{children:x.appearance.loginMessage}):(0,i.jsx)(ee,{children:x.appearance.loginMessage})),(0,i.jsx)(m.o,{$colorScheme:x.appearance.palette.colorScheme,children:"default"===eh&&"web2-first"===ep?(0,i.jsxs)(i.Fragment,{children:[eb.length>eN?eb.slice(0,eN-1):eb,eb.length>eN&&eL,eP&&eA,eI&&(0,i.jsx)(U,{chainType:x.appearance.walletChainType})]}):"default"===eh&&"web3-first"===ep?(0,i.jsxs)(i.Fragment,{children:[Z&&(0,i.jsxs)(i.Fragment,{children:[ej.length>eN?ej.slice(0,eN-1):ej,ej.length>eN&&eA]}),eb.length>eE&&eL,eb.length===eE&&eb[0],eI&&(0,i.jsx)(U,{chainType:x.appearance.walletChainType})]}):"web2-overflow"===eh?(0,i.jsx)(i.Fragment,{children:"web3-first"===ep?eb:eb.slice(3)}):null})]})},Y=n.I4.div`
  text-align: center;
  font-size: 14px;
  margin-bottom: 24px;
`,ee=n.I4.div`
  margin-bottom: 24px;
`,et=({priority:e,email:t,sms:a,social:i})=>"web2-first"===e?"Other socials":t&&a&&i.length>0||t&&i.length>0?"Log in with email or socials":a&&i.length>0?"Log in with sms or socials":t&&a?"Continue with email or sms":t?"Continue with email":a?"Continue with sms":"Log in with a social account",ea=({priority:e,email:t,sms:a,social:l})=>"web2-first"===e||l.length>0?(0,i.jsx)(j,{}):t&&a?(0,i.jsx)(_,{}):t?(0,i.jsx)(v.A,{}):a?(0,i.jsx)(w.A,{}):null,ei=({priority:e})=>"web2-first"===e?"Continue with a wallet":"Other wallets",el=({mostRecentlyUsedAccountType:e,smsAvailable:t,emailAvailable:a,prefilledType:i})=>a&&("email"===e&&"phone"!==i||"email"===i)||!t||"phone"!==e&&"phone"!==i?"email":"sms",er=({connectOnly:e})=>{let{closePrivyModal:t,connectors:a}=(0,p.u)(),{data:n,setModalData:f,onUserCloseViaDialogOrKeybindRef:y,navigate:v}=(0,u.u)(),w=(0,d.a)(),j=w.appearance.palette.colorScheme,{accountType:b,walletClientType:k}=(0,m.h)(),C=(0,l.useMemo)(()=>b&&"guest"!==b&&"authorization_key"!==b&&"cross_app"!==b?(0,h.t)(b):null,[b]),S=w.loginMethodsAndOrder?.primary??[],M=w.loginMethodsAndOrder?.overflow??[],T=(0,l.useMemo)(()=>[...S,...M],[S,M]),A=w.loginMethods.passkey,L=n?.login,E=[];k&&T.includes(k)?E.push(k):b&&T.includes(C?.loginMethod)&&E.push(C?.loginMethod);let[P,I]=(0,l.useState)("default"),[N,V]=(0,l.useState)(el({mostRecentlyUsedAccountType:b,smsAvailable:T.includes("sms"),emailAvailable:T.includes("email"),prefilledType:L?.prefill?.type}));(0,l.useEffect)(()=>{V(el({mostRecentlyUsedAccountType:b,smsAvailable:T.includes("sms"),emailAvailable:T.includes("email"),prefilledType:L?.prefill?.type}))},[T,b]),(0,l.useEffect)(()=>{"phone"===b&&V("sms");let e=T.indexOf("sms"),t=T.indexOf("email");e>-1&&e<t&&V("sms")},[b,S,M]);let W=()=>{t({shouldCallAuthOnSuccess:!0}),setTimeout(()=>{I("default")},150)};y.current=W;let{listings:$}=(0,c.u)(),H=t=>{if("email"===t)return(0,i.jsx)(R,{isEditable:"email"===N,setIsEditable:()=>{V("email")},defaultValue:"email"===L?.prefill?.type?L.prefill.value:void 0},t);if("sms"===t)return(0,i.jsx)(q,{isEditable:"sms"===N,setIsEditable:()=>{V("sms")},defaultValue:"phone"===L?.prefill?.type?L.prefill.value:void 0},t);if("apple"===t)return(0,i.jsx)(G,{provider:"apple"},t);if("discord"===t)return(0,i.jsx)(G,{provider:"discord"},t);if("farcaster"===t)return(0,i.jsx)(F,{},t);if("github"===t)return(0,i.jsx)(G,{provider:"github"},t);if("google"===t)return(0,i.jsx)(G,{provider:"google"},t);if("linkedin"===t)return(0,i.jsx)(G,{provider:"linkedin"},t);if("spotify"===t)return(0,i.jsx)(G,{provider:"spotify"},t);if("instagram"===t)return(0,i.jsx)(G,{provider:"instagram"},t);if("tiktok"===t)return(0,i.jsx)(G,{provider:"tiktok"},t);if("line"===t)return(0,i.jsx)(G,{provider:"line"},t);if("twitch"===t)return(0,i.jsx)(G,{provider:"twitch"},t);if("twitter"===t)return(0,i.jsx)(G,{provider:"twitter"},t);if("telegram"===t)return w.loginConfig.telegramHasHmacCredentials?(0,i.jsx)(K,{},t):(0,i.jsx)(G,{provider:"telegram"},t);if(t.startsWith("privy:"))return(0,i.jsx)(D,{appId:t.replace("privy:","")},t);let l=w.appearance.walletChainType,r=new g.W(l,[t]).getWallets(a,$);return r.wallets.map((t,a)=>(0,i.jsx)(g.a,{index:a,data:{wallets:r.wallets,walletChainType:l,handleWalletClick(t){f(e=>({...e,externalConnectWallet:{walletList:T,walletChainType:l,preSelectedWalletId:t.id}})),v(e?"ConnectOnlyLandingScreen":"AuthenticateWithWalletScreen")}}},t.id+a))},O=E.flatMap(H),_=S.filter(e=>e!==k&&e!==C?.loginMethod).flatMap(H),U=M.filter(e=>e!==k&&e!==C?.loginMethod).flatMap(H),[B,Z]=(0,x.k)([...O,..._,...U],en({primary:_.length+O.length,overflow:U.length}));return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.M,{title:w.appearance.landingHeader,onClose:W,backFn:"default"===P?void 0:()=>{I("default")}}),"default"===P&&(0,i.jsx)(eo,{}),"default"===P&&("string"==typeof w.appearance.loginMessage?(0,i.jsx)(m.S,{children:w.appearance.loginMessage}):w.appearance.loginMessage),(0,i.jsx)(m.A,{style:{overflow:"hidden"},children:(0,i.jsxs)(m.o,{$colorScheme:j,children:["default"===P&&(0,i.jsxs)(i.Fragment,{children:[B,Z.length>0&&(0,i.jsx)(J,{text:"More options",icon:(0,i.jsx)(r,{}),onClick:()=>I("overflow")})]}),"overflow"===P&&(0,i.jsx)(i.Fragment,{children:Z}),A&&"default"===P&&(0,i.jsx)(z,{})]})}),w&&(0,i.jsx)(o.T,{app:w}),(0,i.jsx)(o.B,{})]})},en=({primary:e,overflow:t})=>e<5?e:5===e&&0===t?5:4,eo=(0,n.I4)(e=>{let t=(0,d.a)();return t?.appearance.logo?(0,i.jsx)($,{...e,children:(0,i.jsx)(W,{})}):null})`
  margin-bottom: 16px;
`},673:(e,t,a)=>{a.d(t,{C:()=>h});var i=a(95155),l=a(12115),r=a(51862),n=a(31794),o=a(35450),s=a(51774),d=a(65534),c=a(97677),p=a(69685);let u=({value:e,onChange:t})=>(0,i.jsx)("select",{value:e,onChange:t,children:n.QN.map(e=>(0,i.jsxs)("option",{value:e.code,children:[e.code," +",e.callCode]},e.code))}),h=(0,l.forwardRef)((e,t)=>{let a=(0,s.a)(),[r,h]=(0,l.useState)(!1),{accountType:x}=(0,d.h)(),[f,y]=(0,l.useState)(""),[v,w]=(0,l.useState)(e.defaultCountry??a?.intl.defaultCountry??"US"),j=(0,n.Q7)(f,v),b=(0,n.qi)(v),k=(0,n.jZ)(v),C=(0,o.K)(v),S=!j,[M,T]=(0,l.useState)(!1),A=C.length,L=t=>{let a=t.target.value;w(a),y(""),e.onChange&&e.onChange({rawPhoneNumber:f,qualifiedPhoneNumber:(0,n.n4)(f,a),countryCode:a,isValid:(0,n.Q7)(f,v)})},E=(t,a)=>{try{let i=t.replace(/\D/g,"")===f.replace(/\D/g,"")?t:b.input(t);y(i),e.onChange&&e.onChange({rawPhoneNumber:i,qualifiedPhoneNumber:(0,n.n4)(t,a),countryCode:a,isValid:(0,n.Q7)(t,a)})}catch(e){console.error("Error processing phone number:",e)}},P=()=>{T(!0);let t=(0,n.n4)(f,v);e.onSubmit({rawPhoneNumber:f,qualifiedPhoneNumber:t,countryCode:v,isValid:(0,n.Q7)(f,v)}).finally(()=>T(!1))};return(0,l.useEffect)(()=>{if(e.defaultValue){let t=(0,n.oj)(e.defaultValue);b.reset(),L({target:{value:t.countryCode}}),E(t.phone,t.countryCode)}},[e.defaultValue]),(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(g,{children:(0,i.jsxs)(m,{$callingCodeLength:A,$stacked:e.stacked,children:[(0,i.jsx)(u,{value:v,onChange:L}),(0,i.jsx)("input",{ref:t,id:"phone-number-input",className:"login-method-button",type:"tel",placeholder:k,onFocus:()=>h(!0),onChange:e=>{E(e.target.value,v)},onKeyUp:e=>{"Enter"===e.key&&P()},value:f,autoComplete:"tel"}),"phone"!==x||r||e.hideRecent?e.stacked||e.noIncludeSubmitButton?(0,i.jsx)("span",{}):(0,i.jsx)(c.E,{isSubmitting:M,onClick:P,disabled:S,children:"Submit"}):(0,i.jsx)(p.C,{color:"gray",children:"Recent"})]})}),e.stacked&&!e.noIncludeSubmitButton?(0,i.jsx)(c.P,{loading:M,loadingText:null,onClick:P,disabled:S,children:"Submit"}):null]})}),g=r.I4.div`
  width: 100%;
`,m=r.I4.label`
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
`},25237:(e,t,a)=>{a.d(t,{A:()=>i});let i=(0,a(78340).A)("smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]])},37403:(e,t,a)=>{a.d(t,{L:()=>r});var i=a(51862);let l=(0,i.i7)`
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
          animation: ${l} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},39464:(e,t,a)=>{a.d(t,{C:()=>f});var i=a(95155),l=a(92289),r=a(12115),n=a(51862),o=a(51774),s=a(54479),d=a(69704),c=a(73532),p=a(65534),u=a(4104),h=a(97677),g=a(69685),m=a(45943),x=a(98910);let f=(0,r.forwardRef)((e,t)=>{let[a,n]=(0,r.useState)(e.defaultValue||""),[m,f]=(0,r.useState)(""),[j,b]=(0,r.useState)(!1),{authenticated:k}=(0,o.u)(),{initLoginWithEmail:C}=(0,d.u)(),{navigate:S,setModalData:M,currentScreen:T,data:A}=(0,c.u)(),{enabled:L,token:E}=(0,s.a)(),[P,I]=(0,r.useState)(!1),{accountType:N}=(0,p.h)(),V=(0,o.a)(),W=(0,u.v)(a)&&(V.disablePlusEmails&&a.includes("+")?(m||f("Please enter a valid email address without a '+'."),!1):(m&&f(""),!0)),$=j||!W,H=()=>{$||(M({login:A?.login,inlineError:void 0}),!L||E||k?(b(!0),C({email:a,captchaToken:E,disableSignup:A?.login?.disableSignup,withPrivyUi:!0}).then(()=>{S("AwaitingPasswordlessCodeScreen")}).catch(e=>{M({errorModalData:{error:e,previousScreen:T||"LandingScreen"}}),S("ErrorScreen")}).finally(()=>{b(!1)})):(M({captchaModalData:{callback:e=>C({email:a,captchaToken:e,withPrivyUi:!0}),userIntentRequired:!1,onSuccessNavigateTo:"AwaitingPasswordlessCodeScreen",onErrorNavigateTo:"ErrorScreen"}}),S("CaptchaScreen")))};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(y,{children:[m&&(0,i.jsx)(x.E,{style:{display:"block",marginTop:"0.25rem",textAlign:"left"},children:m}),(0,i.jsxs)(v,{stacked:e.stacked,$error:!!m,children:[(0,i.jsx)(w,{children:(0,i.jsx)(l.A,{})}),(0,i.jsx)("input",{ref:t,id:"email-input",className:"login-method-button",type:"email",placeholder:"your@email.com",onFocus:()=>I(!0),onChange:e=>n(e.target.value),onKeyUp:e=>{"Enter"===e.key&&H()},value:a,autoComplete:"email"}),"email"!==N||P?e.stacked?(0,i.jsx)("span",{}):(0,i.jsx)(h.E,{isSubmitting:j,onClick:H,disabled:$,children:"Submit"}):(0,i.jsx)(g.C,{color:"gray",children:"Recent"})]})]}),e.stacked?(0,i.jsx)(h.P,{loadingText:null,loading:j,disabled:$,onClick:H,style:{width:"100%"},children:"Submit"}):null]})}),y=m.I,v=m.a,w=(0,n.I4)(p.m)`
  display: inline-flex;
`},44239:(e,t,a)=>{a.d(t,{W:()=>n});var i=a(95155),l=a(71275),r=a(65534);let n=({onClick:e,text:t})=>(0,i.jsxs)(r.L,{onClick:e,children:[(0,i.jsx)(r.m,{children:(0,i.jsx)(l.A,{})}),(0,i.jsx)(r.G,{children:t})]})},69685:(e,t,a)=>{a.d(t,{C:()=>n});var i=a(95155),l=a(51862),r=a(37403);let n=({children:e,color:t,isLoading:a,isPulsing:l,...r})=>(0,i.jsx)(o,{$color:t,$isLoading:a,$isPulsing:l,...r,children:e}),o=l.I4.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let t,a;"green"===e.$color&&(t="var(--privy-color-success-dark)",a="var(--privy-color-success-light)"),"red"===e.$color&&(t="var(--privy-color-error)",a="var(--privy-color-error-light)"),"gray"===e.$color&&(t="var(--privy-color-foreground-2)",a="var(--privy-color-background-2)");let i=(0,l.i7)`
      from, to {
        background-color: ${a};
      }

      50% {
        background-color: rgba(${a}, 0.8);
      }
    `;return(0,l.AH)`
      color: ${t};
      background-color: ${a};
      ${e.$isPulsing&&(0,l.AH)`
        animation: ${i} 3s linear infinite;
      `};
    `}}

  ${r.L}
`},71275:(e,t,a)=>{a.d(t,{A:()=>i});let i=(0,a(78340).A)("wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]])},84310:(e,t,a)=>{a.d(t,{F:()=>l});var i=a(95155);let l=e=>(0,i.jsxs)("svg",{width:"33",height:"32",viewBox:"0 0 33 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...e,children:[(0,i.jsx)("rect",{x:"0.5",width:"32",height:"32",rx:"4",fill:"#855DCD"}),(0,i.jsxs)("g",{"clip-path":"url(#clip0_1715_1960)",children:[(0,i.jsx)("path",{d:"M4.5 4H28.5V28H4.5V4Z",fill:"#855DCD"}),(0,i.jsx)("path",{d:"M11.1072 8.42105H21.6983V23.5789H20.1437V16.6357H20.1284C19.9566 14.7167 18.3542 13.2129 16.4028 13.2129C14.4514 13.2129 12.849 14.7167 12.6771 16.6357H12.6619V23.5789H11.1072V8.42105Z",fill:"white"}),(0,i.jsx)("path",{d:"M8.28943 10.5725L8.92101 12.7239H9.45542V21.4275C9.1871 21.4275 8.96959 21.6464 8.96959 21.9165V22.5032H8.87242C8.60411 22.5032 8.38659 22.7221 8.38659 22.9922V23.5789H13.8279V22.9922C13.8279 22.7221 13.6104 22.5032 13.3421 22.5032H13.2449V21.9165C13.2449 21.6464 13.0274 21.4275 12.7591 21.4275H12.1761V10.5725H8.28943Z",fill:"white"}),(0,i.jsx)("path",{d:"M20.2408 21.4275C19.9725 21.4275 19.755 21.6464 19.755 21.9165V22.5032H19.6579C19.3895 22.5032 19.172 22.7221 19.172 22.9922V23.5789H24.6133V22.9922C24.6133 22.7221 24.3958 22.5032 24.1275 22.5032H24.0303V21.9165C24.0303 21.6464 23.8128 21.4275 23.5445 21.4275V12.7239H24.0789L24.7105 10.5725H20.8238V21.4275H20.2408Z",fill:"white"})]}),(0,i.jsx)("defs",{children:(0,i.jsx)("clipPath",{id:"clip0_1715_1960",children:(0,i.jsx)("rect",{width:"24",height:"24",fill:"white",transform:"translate(4.5 4)"})})})]})},92289:(e,t,a)=>{a.d(t,{A:()=>i});let i=(0,a(78340).A)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]])},93683:(e,t,a)=>{a.d(t,{A:()=>l});var i=a(12115);let l=i.forwardRef(function({title:e,titleId:t,...a},l){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":t},a),e?i.createElement("title",{id:t},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33"}))})}}]);