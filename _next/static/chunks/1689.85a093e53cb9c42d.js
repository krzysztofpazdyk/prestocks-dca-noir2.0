"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1689],{21689:(e,r,t)=>{t.r(r),t.d(r,{SetAutomaticRecoveryScreen:()=>w,default:()=>w});var o=t(95155),n=t(41550),l=t(44656),a=t(12115),i=t(51774),s=t(97677),c=t(10308),d=t(51862),u=t(61992),h=t(40135),y=t(69704),v=t(73532),f=t(65534);let g=d.I4.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${e=>e.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,w={component:()=>{let{user:e}=(0,i.u)(),{client:r,walletProxy:t,refreshSessionAndUser:d,closePrivyModal:w}=(0,y.u)(),m=(0,v.u)(),{entropyId:p,entropyIdVerifier:x}=m.data?.recoverWallet??{},[j,b]=(0,a.useState)(!1),[k,S]=(0,a.useState)(null),[E,C]=(0,a.useState)(null);function T(){if(!j){if(E)return m.data?.setWalletPassword?.onFailure(E),void w();if(!k)return m.data?.setWalletPassword?.onFailure(Error("User exited set recovery flow")),void w()}}return m.onUserCloseViaDialogOrKeybindRef.current=T,(0,o.jsxs)(o.Fragment,E?{children:[(0,o.jsx)(s.M,{onClose:T},"header"),(0,o.jsx)(g,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:(0,o.jsx)(n.A,{height:38,width:38,stroke:"var(--privy-color-error)"})}),(0,o.jsx)(h.T,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),(0,o.jsx)(f.G,{style:{minHeight:"2rem"}}),(0,o.jsx)(s.b,{onClick:()=>C(null),children:"Try again"}),(0,o.jsx)(c.B,{})]}:{children:[(0,o.jsx)(s.M,{onClose:T},"header"),(0,o.jsx)(l.A,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),(0,o.jsx)(h.T,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),(0,o.jsx)(u.S,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),(0,o.jsx)(f.G,{style:{minHeight:"2rem"}}),(0,o.jsx)(s.b,{loading:j,disabled:!(!j&&!k),onClick:()=>(async function(){b(!0);try{let o=await r.getAccessToken(),n=(0,i.k)(e,p);if(!o||!t||!n)return;if(!(await t.setRecovery({accessToken:o,entropyId:p,entropyIdVerifier:x,existingRecoveryMethod:n.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let l=await d();if(!l)throw Error("Unable to set recovery on wallet");let a=(0,i.k)(l,n.address);if(!a)throw Error("Unabled to set recovery on wallet");S(!!l),setTimeout(()=>{m.data?.setWalletPassword?.onSuccess(a),w()},i.Q)}catch(e){C(e)}finally{b(!1)}})(),children:k?"Success":"Confirm"}),(0,o.jsx)(c.B,{})]})}}},40135:(e,r,t)=>{t.d(r,{T:()=>n});var o=t(51862);let n=o.I4.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`},41550:(e,r,t)=>{t.d(r,{A:()=>n});var o=t(12115);let n=o.forwardRef(function({title:e,titleId:r,...t},n){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))})},44656:(e,r,t)=>{t.d(r,{A:()=>n});var o=t(12115);let n=o.forwardRef(function({title:e,titleId:r,...t},n){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"}))})},61992:(e,r,t)=>{t.d(r,{S:()=>n});var o=t(51862);let n=o.I4.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`}}]);