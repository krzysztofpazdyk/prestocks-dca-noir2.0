"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1873],{29781:(e,t,r)=>{r.d(t,{C:()=>l,S:()=>i});var o=r(95155),s=r(51862);let i=({title:e,description:t,children:r,...s})=>(0,o.jsx)(n,{...s,children:(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:e}),"string"==typeof t?(0,o.jsx)("p",{children:t}):t,r]})});(0,s.I4)(i)`
  margin-bottom: 24px;
`;let l=({title:e,description:t,icon:r,children:s,...i})=>(0,o.jsxs)(c,{...i,children:[r||null,(0,o.jsx)("h3",{children:e}),t&&"string"==typeof t?(0,o.jsx)("p",{children:t}):t,s]}),n=s.I4.div`
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
`,c=(0,s.I4)(n)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},41873:(e,t,r)=>{r.r(t),r.d(t,{RecoverySelectionScreen:()=>C,default:()=>C});var o=r(95155),s=r(44656),i=r(12115);let l=i.forwardRef(function({title:e,titleId:t,...r},o){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":t},r),e?i.createElement("title",{id:t},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"}))});var n=r(26798),c=r(51862),a=r(51774),d=r(97677),h=r(10308),u=r(29781),p=r(69704),x=r(73532),g=r(54479),v=r(73449),j=r(65534);let y=c.I4.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`,f={"google-drive":"Google Drive",icloud:"iCloud","user-passcode":"password",privy:"Privy","privy-v2":"Privy"},w=({onClose:e})=>(0,o.jsxs)(v.a,{children:[(0,o.jsx)(u.C,{title:"Why do I need to secure my account?",icon:(0,o.jsx)(n.A,{width:48}),description:(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{children:"Your app uses cryptography to secure your account. App secrets are split and encrypted so only you can access them."}),(0,o.jsx)("p",{children:"To use this app on new devices, secure account secrets using a password, your Google or your Apple account. It’s important you don’t lose access to the method you choose."})]})}),(0,o.jsx)(d.P,{onClick:e,children:"Select backup method"})]}),C={component:()=>{let[e,t]=(0,i.useState)(!1),{navigate:r,lastScreen:n,navigateBack:c,setModalData:C,data:m,onUserCloseViaDialogOrKeybindRef:L}=(0,x.u)(),{user:k}=(0,a.u)(),{embeddedWallets:A}=(0,a.a)(),{closePrivyModal:S}=(0,p.u)(),b=(0,a.g)(k),M=null===b,{isInAccountCreateFlow:F,isResettingPassword:E,shouldCreateEth:O,shouldCreateSol:H}=m.recoverySelection,I=b&&"privy"!==b.recoveryMethod,R=I?(0,o.jsxs)("span",{children:["Your account is currently secured using"," ",(0,o.jsx)("strong",{children:f[b?.recoveryMethod||"user-passcode"]}),"."]}):"Select a method for logging in on new devices and recovering your account.";function B(e){C({recoveryOAuthStatus:{provider:e,action:M?"create-wallet":"set-recovery",isInAccountCreateFlow:F,shouldCreateEth:O,shouldCreateSol:H}}),r("RecoveryOAuthScreen")}function P(){m?.setWalletPassword?.onFailure(Error("User exited set recovery flow")),S({shouldCallAuthOnSuccess:m?.setWalletPassword?.callAuthOnSuccessOnClose??!1})}return L.current=P,(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(d.M,{onClose:P,backFn:e?()=>t(!1):n?c:void 0,infoFn:n||e?void 0:()=>t(!0)},"header"),e?(0,o.jsx)(w,{onClose:()=>t(!1)}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(u.C,{title:I?"Update backup method":"Secure your account",icon:(0,o.jsx)(s.A,{width:48}),description:R}),(0,o.jsx)(v.R,{children:A.userOwnedRecoveryOptions.filter(e=>!["icloud","google-drive"].includes(b?.recoveryMethod||"")||e!==b?.recoveryMethod).sort().map(e=>{switch(e){case"google-drive":return(0,o.jsxs)(j.L,{onClick:()=>B("google-drive"),children:[(0,o.jsx)(y,{children:(0,o.jsx)(v.G,{style:{width:18}})}),"Back up to Google Drive"]},e);case"icloud":return(0,o.jsxs)(j.L,{onClick:()=>B("icloud"),children:[(0,o.jsx)(y,{children:(0,o.jsx)(v.A,{style:{width:24}})}),"Back up to Apple iCloud"]},e);case"user-passcode":return(0,o.jsxs)(j.L,{onClick:()=>{r((0,g.o)({isCreatingWallet:M,skipSplashScreen:!0}))},children:[(0,o.jsx)(y,{children:(0,o.jsx)(l,{style:{width:18}})}),E?"Reset your":"Set a"," password"]},e);default:return null}})})]}),(0,o.jsx)(h.B,{})]})}}},44656:(e,t,r)=>{r.d(t,{A:()=>s});var o=r(12115);let s=o.forwardRef(function({title:e,titleId:t,...r},s){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:s,"aria-labelledby":t},r),e?o.createElement("title",{id:t},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"}))})},73449:(e,t,r)=>{r.d(t,{A:()=>i,G:()=>l,R:()=>n,a:()=>c});var o=r(95155),s=r(51862);let i=e=>(0,o.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 21 20",...e,children:[(0,o.jsx)("path",{fill:"url(#icloud-gradient)",d:"M12.34 7.315a4.26 4.26 0 0 0-3.707 2.18 2.336 2.336 0 0 0-1.02-.236 2.336 2.336 0 0 0-2.3 1.963 3.217 3.217 0 0 0 1.244 6.181c.135-.001.27-.01.404-.029h8.943c.047.004.094.006.141.007.045-.001.09-.004.135-.007h.214v-.016a2.99 2.99 0 0 0 1.887-.988c.487-.55.757-1.261.757-1.998v-.006a3.017 3.017 0 0 0-.69-1.915 2.992 2.992 0 0 0-1.748-1.034 4.26 4.26 0 0 0-4.26-4.102Z"}),(0,o.jsx)("defs",{children:(0,o.jsxs)("linearGradient",{id:"icloud-gradient",x1:19.086,x2:3.333,y1:14.38,y2:14.163,gradientUnits:"userSpaceOnUse",children:[(0,o.jsx)("stop",{stopColor:"#3E82F4"}),(0,o.jsx)("stop",{offset:1,stopColor:"#93DCF7"})]})})]}),l=({style:e,...t})=>(0,o.jsxs)("svg",{width:"16",height:"14",style:e,viewBox:"0 0 16 14",fill:"none",xmlns:"http://www.w3.org/2000/svg",...t,children:[(0,o.jsxs)("g",{clipPath:"url(#clip0_2115_829)",children:[(0,o.jsx)("path",{d:"M2.34709 12.9404L2.3471 12.9404L2.34565 12.938L1.64031 11.7448L1.64004 11.7444L0.651257 10.0677C0.640723 10.0496 0.630746 10.0314 0.621325 10.0129H4.16461L2.39424 13.0139C2.3775 12.9901 2.36178 12.9656 2.34709 12.9404Z",fill:"#0066DA",stroke:"#6366F1"}),(0,o.jsx)("path",{d:"M8 4.48713L5.47995 0.215332C5.23253 0.358922 5.02176 0.556358 4.87514 0.80764L0.219931 8.70508C0.076007 8.95094 0.000191627 9.22937 0 9.51277H5.04009L8 4.48713Z",fill:"#00AC47"}),(0,o.jsx)("path",{d:"M13.48 13.7847C13.7274 13.6411 13.9382 13.4437 14.0848 13.1924L14.3781 12.6988L15.7801 10.3206C15.9267 10.0693 16.0001 9.79114 16.0001 9.51294H10.9596L12.0321 11.577L13.48 13.7847Z",fill:"#EA4335"}),(0,o.jsx)("path",{d:"M8.00003 4.48718L10.5201 0.215385C10.2726 0.0717949 9.98857 0 9.69533 0H6.30472C6.01148 0 5.7274 0.0807692 5.47998 0.215385L8.00003 4.48718Z",fill:"#00832D"}),(0,o.jsx)("path",{d:"M10.9599 9.51294H5.04007L2.52002 13.7847C2.76744 13.9283 3.05152 14.0001 3.34476 14.0001H12.6552C12.9484 14.0001 13.2325 13.9194 13.4799 13.7847L10.9599 9.51294Z",fill:"#2684FC"}),(0,o.jsx)("path",{d:"M13.4525 4.75636L11.1249 0.80764C10.9782 0.556358 10.7675 0.358922 10.52 0.215332L8 4.48713L10.9599 9.51277H15.9908C15.9908 9.23456 15.9175 8.95636 15.7709 8.70508L13.4525 4.75636Z",fill:"#FFBA00"})]}),(0,o.jsx)("defs",{children:(0,o.jsx)("clipPath",{id:"clip0_2115_829",children:(0,o.jsx)("rect",{width:"16",height:"14",fill:"white"})})})]}),n=s.I4.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,c=s.I4.div`
  padding-bottom: 24px;
`}}]);