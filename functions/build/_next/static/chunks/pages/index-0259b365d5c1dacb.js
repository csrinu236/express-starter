(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5557:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(9753)}])},5:function(e,t,n){"use strict";n.d(t,{Z:function(){return c}});var s=n(5893),a=n(7294),i=n(9294),l=n.n(i),r=n(2378),o=n(1163);function c(){let[e,t]=(0,a.useState)(!1),[n,i]=(0,a.useState)(!1),[c,d]=(0,a.useState)(""),[u,h]=(0,a.useState)(!1),m=(0,o.useRouter)(),g=async e=>{e.preventDefault();let t=new FormData(e.target);console.log({formData:t});let s=t.get("name"),a=t.get("email"),i=t.get("password"),l=n?"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/register"):"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/login");try{h(!0);let e=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:i,...n&&{name:s}}),credentials:"include"});if(e.ok){let t=await e.json();console.log({data:t}),h(!1),d(null==t?void 0:t.msg),m.replace({pathname:"/",query:{user:null==t?void 0:t.user,isLoding:!1}})}else{let t=await e.json();throw console.log({data:t}),Error(null==t?void 0:t.msg)}}catch(e){h(!1),d(e.message)}};return(0,s.jsx)("div",{className:l().loginContainer,children:(0,s.jsxs)("div",{className:l().loginForm,children:[(0,s.jsx)("h2",{className:l().loginHeading,children:n?"Register":"Login"}),u&&(0,s.jsx)("div",{className:"modaloutside",children:(0,s.jsx)("div",{className:"loader"})}),(0,s.jsxs)("form",{onSubmit:g,children:[n&&(0,s.jsx)("div",{className:l().inputGroup,children:(0,s.jsx)("input",{type:"text",name:"name",placeholder:"Enter your Name"})}),(0,s.jsx)("div",{className:l().inputGroup,children:(0,s.jsx)("input",{type:"email",name:"email",placeholder:"Enter your email"})}),(0,s.jsxs)("div",{className:l().inputGroup,children:[(0,s.jsx)("input",{type:e?"text":"password",id:"password",name:"password",placeholder:"Enter your password"}),(0,s.jsx)("button",{type:"button",className:l().passwordToggleBtn,onClick:()=>{t(!e)},children:e?"Hide":"Show"})]}),(0,s.jsx)("button",{type:"submit",className:l().loginBtn,children:n?"Register":"Login"}),c&&(0,s.jsx)("div",{className:"modaloutside",onClick:e=>d(""),children:(0,s.jsxs)("div",{class:"content",onClick:e=>e.stopPropagation(),children:[(0,s.jsx)("span",{className:"content-span",children:c}),(0,s.jsx)("span",{onClick:()=>d(""),children:(0,s.jsx)(r.u,{})})]})})]}),(0,s.jsx)("p",{className:l().divider,children:"or"}),(0,s.jsxs)("a",{href:"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/google/login"),className:l().googleBtn,children:[(0,s.jsx)("img",{src:"https://cdn-teams-slug.flaticon.com/google.jpg",alt:"Google G Logo"}),"Continue with Google"]}),(0,s.jsxs)("a",{href:"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/github/login"),className:l().githubBtn,children:[(0,s.jsx)("img",{src:"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",alt:"GitHub Logo"}),"Continue with GitHub"]}),n?(0,s.jsxs)("p",{className:l().signupText,children:["Already have account? ",(0,s.jsx)("span",{onClick:()=>i(!1),children:"Login here"})]}):(0,s.jsxs)("p",{className:l().signupText,children:["Don't have an account? ",(0,s.jsx)("span",{onClick:()=>i(!0),children:"Register here"})]})]})})}},2378:function(e,t,n){"use strict";n.d(t,{u:function(){return a}});var s=n(5893);let a=()=>(0,s.jsx)("svg",{className:"cross-icon",height:"30",viewBox:"0 0 1792 1792",width:"30",xmlns:"http://www.w3.org/2000/svg",fill:"red",children:(0,s.jsx)("path",{d:"M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"})})},9753:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return h}});var s=n(5893);n(5);var a=n(7294),i=n(541),l=n.n(i),r=n(4683),o=n(1163),c=(e,t)=>{let n=(0,o.useRouter)(),[s,i]=(0,a.useState)(()=>n.query[e]?n.query[e]:localStorage.getItem(e)?localStorage.getItem(e):t);return(0,a.useEffect)(()=>{localStorage.setItem(e,s)},[s]),[s,i]},d=n(2378),u=()=>{let[e,t]=c("interest",15),[n,i]=c("months",12),[o,u]=c("processingFee",200),[h,m]=c("loanTaken",45e3),[g,p]=c("emiType","noCost"),[x,j]=(0,a.useState)(!1),[_,b]=(0,a.useState)(),v="interest"===g?(0,r.U1)(e/100/12,n,-h):h/n,N=v*((1+e/100/12)**n-1)/(e/100/12*(1+e/100/12)**n),y=N,f=0,T=Array(Number(n)).fill(void 0).map((t,a)=>{let i=a+1,{monthlyInterest:o,monthlyPrincipal:c,monthlyTotal:d}=(0,r.QN)(e/100/12,i,n,-N),u=Math.abs(y-c);return y-=c,f+=.18*o,(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:i}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(c)]}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(o)]}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(d)]}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(u)]}),(0,s.jsxs)("td",{className:l().red,children:["₹",(0,r.zW)(.18*o)]})]},a)}),C=e>0&&n>0&&h>0,w=async()=>{try{j(!0);let t=await fetch("".concat("https://no-cost-emi-api.netlify.app","/api/v1/cards/addcard"),{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({interest:e,months:n,processingFee:o,loanTaken:h,emiType:g})});if(t.ok)j(!1),b("Card Added");else{let e=await t.json();throw Error(null==e?void 0:e.msg)}}catch(e){j(!1),b(e.message)}};return(0,s.jsxs)("main",{className:l().tablePage,children:[x&&(0,s.jsx)("div",{className:"modaloutside",children:(0,s.jsx)("div",{className:"loader"})}),_&&(0,s.jsx)("div",{className:"modaloutside",onClick:e=>b(""),children:(0,s.jsxs)("div",{class:"content",onClick:e=>e.stopPropagation(),children:[(0,s.jsx)("span",{className:"content-span",children:_}),(0,s.jsx)("span",{onClick:()=>b(""),children:(0,s.jsx)(d.u,{})})]})}),(0,s.jsxs)("div",{className:l().btnsGroup,children:[(0,s.jsxs)("div",{className:l().emiTypeBtns,children:[(0,s.jsx)("button",{className:"noCost"===g?l().activeButton:"",onClick:()=>p("noCost"),children:"No Cost EMI"}),(0,s.jsx)("button",{className:"interest"===g?l().activeButton:"",onClick:()=>p("interest"),children:"Interest EMI"})]}),(0,s.jsx)("button",{onClick:w,className:l().saveBtn,children:"Save"})]}),(0,s.jsxs)("div",{className:l().tableContainer,children:[(0,s.jsx)("table",{className:l().table,children:(0,s.jsxs)("tbody",{children:[(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Loan Amount"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",min:"0",value:h,onChange:e=>{0>Number(e.target.value)?m(1):e.target.value.startsWith("0")?m(e.target.value.replace(/^0+/,"")):m(Number(e.target.value))},className:l().inputField})})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Annual Interest(%)"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",min:"0",max:"100",value:e,onChange:e=>{0>Number(e.target.value)?t(1):Number(e.target.value)>100?t(100):e.target.value.startsWith("0")?t(e.target.value.replace(/^0+/,"")):t(Number(e.target.value))},className:l().inputField})})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"No. of Months(1-600)"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",value:n,onChange:e=>{0>Number(e.target.value)?i(1):Number(e.target.value)>600?i(600):e.target.value.startsWith("0")?i(e.target.value.replace(/^0+/,"")):i(Number(e.target.value))},className:l().inputField})})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Processing Fee"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",value:o,onChange:e=>{0>Number(e.target.value)?u(1):e.target.value.startsWith("0")?u(e.target.value.replace(/^0+/,"")):u(Number(e.target.value))},className:l().inputField})})]})]})}),(0,s.jsx)("table",{className:l().table,children:(0,s.jsxs)("tbody",{children:[C&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Loan Taken"}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(h)]})]}),(0,s.jsxs)("tr",{children:[(0,s.jsxs)("td",{children:["Total EMI(",(0,r.zW)(v)," x ",n,")"]}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(v*n)]})]})]}),C&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("tr",{children:(0,s.jsx)("th",{colSpan:2,children:"Hidden Costs"})}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Processing Fee"}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(o)]})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"18% GST on Processing Fee"}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(.18*o)]})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"18% GST on each month's interest"}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(f)]})]}),(0,s.jsxs)("tr",{className:l().red,children:[(0,s.jsx)("td",{children:"Total Hidden Costs"}),(0,s.jsxs)("td",{children:["₹",(0,r.zW)(f+1.18*o)]})]}),(0,s.jsxs)("tr",{className:l().blue,children:[(0,s.jsx)("th",{children:"Total EMI + Hidden Costs"}),(0,s.jsxs)("th",{children:["₹",(0,r.zW)(v*n+f+1.18*o)]})]})]})]})})]}),C&&(0,s.jsx)("div",{className:l().mainTableWrapper,children:(0,s.jsxs)("table",{className:l().mainTable,children:[(0,s.jsx)("thead",{children:(0,s.jsxs)("tr",{children:[(0,s.jsx)("th",{children:"Month"}),(0,s.jsx)("th",{children:"Monthly Principal"}),(0,s.jsx)("th",{children:"Monthly Interest"}),(0,s.jsx)("th",{children:"Monthly EMI"}),(0,s.jsx)("th",{children:"Remaining Principal"}),(0,s.jsx)("th",{children:"18% GST on Interest"})]})}),(0,s.jsx)("tbody",{children:T})]})})]})};function h(){return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(u,{})})}n(9008)},4683:function(e,t,n){"use strict";n.d(t,{QN:function(){return i},U1:function(){return a},zW:function(){return l}});let s=(e,t,n,s)=>{var a=Math.pow(1+n,s);return 0-(e*a*n+t*(a-1))},a=(e,t,n,s,a)=>{if(s||(s=0),a||(a=0),0==e)return-(n+s)/t;var i=Math.pow(1+e,t),l=-(e/(i-1)*(n*i+s));return 1==a&&(l/=1+e),l},i=(e,t,n,i,l,r)=>{if(t<1||t>=n+1)return null;var o=a(e,n,i,l,r),c=s(i,o,e,t-1);return{monthlyTotal:o,monthlyInterest:c,monthlyPrincipal:o-c}},l=e=>new Intl.NumberFormat("en-IN",{maximumFractionDigits:2,minimumFractionDigits:2}).format(e)},9294:function(e){e.exports={loginContainer:"Login_loginContainer__NecC2",loginForm:"Login_loginForm__L36xy",loginHeading:"Login_loginHeading__pzDeW",inputGroup:"Login_inputGroup__JmCof",passwordToggleBtn:"Login_passwordToggleBtn__6Wsj6",loginBtn:"Login_loginBtn__7SbRy",divider:"Login_divider__0zZcu",googleBtn:"Login_googleBtn__Ixab0",githubBtn:"Login_githubBtn__eJlNi",signupText:"Login_signupText__nPY63",error:"Login_error__Is9wR"}},541:function(e){e.exports={tablePage:"Table_tablePage__YK9Ov",tableContainer:"Table_tableContainer__ZSJbZ",btnsGroup:"Table_btnsGroup__1CnmY",saveBtn:"Table_saveBtn__U8Otj",emiTypeBtns:"Table_emiTypeBtns__bkI0y",activeButton:"Table_activeButton__CF42E",table:"Table_table__b_0YI",red:"Table_red__jy6s6",blue:"Table_blue__egtnw",mainTableWrapper:"Table_mainTableWrapper__aieo7",mainTable:"Table_mainTable__tO7hO",inputField:"Table_inputField___TyPi"}},9008:function(e,t,n){n(7828)}},function(e){e.O(0,[888,774,179],function(){return e(e.s=5557)}),_N_E=e.O()}]);