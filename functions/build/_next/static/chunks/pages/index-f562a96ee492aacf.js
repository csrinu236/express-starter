(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5557:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(9920)}])},5:function(e,t,n){"use strict";n.d(t,{Z:function(){return o}});var s=n(5893),a=n(7294),i=n(9294),r=n.n(i),l=n(2378);function o(){let[e,t]=(0,a.useState)(!1),[n,i]=(0,a.useState)(!1),[o,c]=(0,a.useState)(""),[d,h]=(0,a.useState)(!1),u=async e=>{e.preventDefault();let t=new FormData(e.target),s=t.get("name"),a=t.get("email"),i=t.get("password"),r=n?"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/register"):"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/login");try{h(!0);let e=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,password:i,...n&&{name:s}}),credentials:"include"});if(e.ok){let t=await e.json();console.log("--------------------->",{data:t}),h(!1),c(null==t?void 0:t.msg),window.location.reload()}else{let t=await e.json();throw Error(null==t?void 0:t.msg)}}catch(e){h(!1),c(e.message)}};return(0,s.jsx)("div",{className:r().loginContainer,children:(0,s.jsxs)("div",{className:r().loginForm,children:[(0,s.jsx)("h2",{className:r().loginHeading,children:n?"Register":"Login"}),d&&(0,s.jsx)("div",{className:"modaloutside",children:(0,s.jsx)("div",{className:"loader"})}),(0,s.jsxs)("form",{onSubmit:u,children:[n&&(0,s.jsx)("div",{className:r().inputGroup,children:(0,s.jsx)("input",{type:"text",name:"name",placeholder:"Enter your Name"})}),(0,s.jsx)("div",{className:r().inputGroup,children:(0,s.jsx)("input",{type:"email",name:"email",placeholder:"Enter your email"})}),(0,s.jsxs)("div",{className:r().inputGroup,children:[(0,s.jsx)("input",{type:e?"text":"password",id:"password",name:"password",placeholder:"Enter your password"}),(0,s.jsx)("button",{type:"button",className:r().passwordToggleBtn,onClick:()=>{t(!e)},children:e?"Hide":"Show"})]}),(0,s.jsx)("button",{type:"submit",className:r().loginBtn,children:n?"Register":"Login"}),o&&(0,s.jsx)("div",{className:"modaloutside",onClick:e=>c(""),children:(0,s.jsxs)("div",{class:"content",onClick:e=>e.stopPropagation(),children:[(0,s.jsx)("span",{className:"content-span",children:o}),(0,s.jsx)("span",{onClick:()=>c(""),children:(0,s.jsx)(l.u,{})})]})})]}),(0,s.jsx)("p",{className:r().divider,children:"or"}),(0,s.jsxs)("a",{href:"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/google/login"),className:r().googleBtn,children:[(0,s.jsx)("img",{src:"https://cdn-teams-slug.flaticon.com/google.jpg",alt:"Google G Logo"}),"Continue with Google"]}),(0,s.jsxs)("a",{href:"".concat("https://no-cost-emi-api.netlify.app","/api/v1/auth/github/login"),className:r().githubBtn,children:[(0,s.jsx)("img",{src:"https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",alt:"GitHub Logo"}),"Continue with GitHub"]}),n?(0,s.jsxs)("p",{className:r().signupText,children:["Already have account? ",(0,s.jsx)("span",{onClick:()=>i(!1),children:"Login here"})]}):(0,s.jsxs)("p",{className:r().signupText,children:["Don't have an account? ",(0,s.jsx)("span",{onClick:()=>i(!0),children:"Register here"})]})]})})}n(1163)},2378:function(e,t,n){"use strict";n.d(t,{u:function(){return a}});var s=n(5893);let a=()=>(0,s.jsx)("svg",{className:"cross-icon",height:"30",viewBox:"0 0 1792 1792",width:"30",xmlns:"http://www.w3.org/2000/svg",fill:"red",children:(0,s.jsx)("path",{d:"M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z"})})},9920:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return x}});var s=n(5893);n(5);var a=n(7294),i=n(541),r=n.n(i),l=n(4683),o=n(1163),c=(e,t)=>{let n=(0,o.useRouter)(),[s,i]=(0,a.useState)(()=>n.query[e]?n.query[e]:localStorage.getItem(e)?localStorage.getItem(e):t);return(0,a.useEffect)(()=>{localStorage.setItem(e,s)},[s]),[s,i]},d=n(2378),h=n(3263),u=n.n(h),m=e=>{let{src:t,alt:n}=e,[i,r]=(0,a.useState)(!1);return(0,s.jsxs)("div",{className:u().wrapper,children:[i&&(0,s.jsx)("div",{className:"loader"}),!i&&(0,s.jsx)("img",{src:t,alt:n,onLoadStart:()=>r(!0),onLoad:()=>r(!1)})]})},p=()=>{let[e,t]=c("interest",15.99),[n,i]=c("months",12),[o,h]=c("processingFee",199),[u,p]=c("loanTaken",68082),[x,g]=c("emiType","noCost"),[j,_]=c("loanType","creditcard"),[b,v]=(0,a.useState)(!1),[N,y]=(0,a.useState)(""),T="interest"===x?(0,l.U1)(e/100/12,n,-u):u/n,f=T*((1+e/100/12)**n-1)/(e/100/12*(1+e/100/12)**n),C=f,w=0,k=Array(Number(n)).fill(void 0).map((t,a)=>{let i=a+1,{monthlyInterest:o,monthlyPrincipal:c,monthlyTotal:d}=(0,l.QN)(e/100/12,i,n,-f),h=Math.abs(C-c);return C-=c,"creditcard"===j&&(w+=.18*o),(0,s.jsxs)(s.Fragment,{children:[0===a&&(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"-"}),(0,s.jsx)("td",{children:"-"}),(0,s.jsx)("td",{children:"-"}),(0,s.jsx)("td",{children:"-"}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(f)," ","creditcard"===j&&(0,s.jsx)("span",{onClick:()=>y((0,s.jsx)(m,{src:"/example.png",alt:"picture"})),className:r().disclaimer,children:"why?"})]}),(0,s.jsx)("td",{children:"-"})]},a),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:i}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(c)]}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(o)]}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(d)]}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(h)]}),(0,s.jsxs)("td",{className:r().red,children:["₹",(0,l.zW)("creditcard"===j?.18*o:0)]})]},a)]})}),S=e>0&&n>0&&u>0,B=async()=>{try{v(!0);let t=await fetch("".concat("https://no-cost-emi-api.netlify.app","/api/v1/cards/addcard"),{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({interest:e,months:n,processingFee:o,loanTaken:u,emiType:x,loanType:j})});if(t.ok)v(!1),y("Card Added");else{let e=await t.json();throw Error(null==e?void 0:e.msg)}}catch(e){v(!1),y(e.message)}};return(0,s.jsxs)("main",{className:r().tablePage,children:[b&&(0,s.jsx)("div",{className:"modaloutside",children:(0,s.jsx)("div",{className:"loader"})}),N&&(0,s.jsx)("div",{className:"modaloutside",onClick:e=>y(""),children:(0,s.jsxs)("div",{class:"content",onClick:e=>e.stopPropagation(),children:[(0,s.jsx)("span",{className:"content-span",children:N}),(0,s.jsx)("span",{onClick:()=>y(""),children:(0,s.jsx)(d.u,{})})]})}),(0,s.jsxs)("div",{className:r().btnsGroup,children:[(0,s.jsxs)("div",{className:r().emiTypeBtns,children:[(0,s.jsx)("button",{className:"creditcard"===j?r().activeButton:"",onClick:()=>_("creditcard"),children:"CreditCard"}),(0,s.jsx)("button",{className:"loan"===j?r().activeButton:"",onClick:()=>_("loan"),children:"Loan"})]}),(0,s.jsxs)("div",{className:r().emiTypeBtns,children:[(0,s.jsx)("button",{className:"noCost"===x?r().activeButton:"",onClick:()=>g("noCost"),children:"No Cost EMI"}),(0,s.jsx)("button",{className:"interest"===x?r().activeButton:"",onClick:()=>g("interest"),children:"Interest EMI"})]}),(0,s.jsx)("button",{onClick:B,className:r().saveBtn,children:"Save"})]}),(0,s.jsxs)("div",{className:r().tableContainer,children:[(0,s.jsx)("table",{className:r().table,children:(0,s.jsxs)("tbody",{children:[(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Loan Amount"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",min:"0",value:u,onChange:e=>{0>Number(e.target.value)?p(1):e.target.value.startsWith("0")?p(e.target.value.replace(/^0+/,"")):p(Number(e.target.value))},className:r().inputField})})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Annual Interest(%)"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",min:"0",max:"100",value:e,onChange:e=>{0>Number(e.target.value)?t(1):Number(e.target.value)>100?t(100):e.target.value.startsWith("0")?t(e.target.value.replace(/^0+/,"")):t(Number(e.target.value))},className:r().inputField})})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"No. of Months(1-600)"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",value:n,onChange:e=>{0>Number(e.target.value)?i(1):Number(e.target.value)>600?i(600):e.target.value.startsWith("0")?i(e.target.value.replace(/^0+/,"")):i(Number(e.target.value))},className:r().inputField})})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Processing Fee"}),(0,s.jsx)("td",{children:(0,s.jsx)("input",{type:"number",value:o,onChange:e=>{0>Number(e.target.value)?h(1):e.target.value.startsWith("0")?h(e.target.value.replace(/^0+/,"")):h(Number(e.target.value))},className:r().inputField})})]})]})}),(0,s.jsx)("table",{className:r().table,children:(0,s.jsxs)("tbody",{children:[S&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Loan Taken"}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(u)]})]}),(0,s.jsxs)("tr",{children:[(0,s.jsxs)("td",{children:["Total EMI(",(0,l.zW)(T)," x ",n,")"]}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(T*n)]})]})]}),S&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("tr",{children:(0,s.jsx)("th",{colSpan:2,children:"Hidden Costs"})}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"Processing Fee"}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(o)]})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"18% GST on Processing Fee"}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(.18*o)]})]}),(0,s.jsxs)("tr",{children:[(0,s.jsx)("td",{children:"18% GST on each month's interest"}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(w)," ",(0,s.jsx)("span",{onClick:()=>y("creditcard"===j?"There is 18% GST on interest component for any credit card purchase. Because interest is profit to the banks, since they have to pay GST on profits, they pass on tax to end users.":"There is NO 18% GST on interest component of any Loan, like Home loan, vehicle loan, personal loan, etc."),className:r().disclaimer,children:"why?"})]})]}),(0,s.jsxs)("tr",{className:r().red,children:[(0,s.jsx)("td",{children:"Total Hidden Costs"}),(0,s.jsxs)("td",{children:["₹",(0,l.zW)(w+1.18*o)]})]}),(0,s.jsxs)("tr",{className:r().blue,children:[(0,s.jsx)("th",{children:"Total EMI + Hidden Costs"}),(0,s.jsxs)("th",{children:["₹",(0,l.zW)(T*n+w+1.18*o)]})]})]})]})})]}),S&&(0,s.jsx)("div",{className:r().mainTableWrapper,children:(0,s.jsxs)("table",{className:r().mainTable,children:[(0,s.jsx)("thead",{children:(0,s.jsxs)("tr",{children:[(0,s.jsx)("th",{children:"Month"}),(0,s.jsx)("th",{children:"Monthly Principal"}),(0,s.jsx)("th",{children:"Monthly Interest"}),(0,s.jsx)("th",{children:"Monthly EMI"}),(0,s.jsx)("th",{children:"Remaining Principal"}),(0,s.jsx)("th",{children:"18% GST on Interest"})]})}),(0,s.jsx)("tbody",{children:k})]})})]})};function x(){return(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(p,{})})}n(9008)},4683:function(e,t,n){"use strict";n.d(t,{QN:function(){return i},U1:function(){return a},zW:function(){return r}});let s=(e,t,n,s)=>{var a=Math.pow(1+n,s);return 0-(e*a*n+t*(a-1))},a=(e,t,n,s,a)=>{if(s||(s=0),a||(a=0),0==e)return-(n+s)/t;var i=Math.pow(1+e,t),r=-(e/(i-1)*(n*i+s));return 1==a&&(r/=1+e),r},i=(e,t,n,i,r,l)=>{if(t<1||t>=n+1)return null;var o=a(e,n,i,r,l),c=s(i,o,e,t-1);return{monthlyTotal:o,monthlyInterest:c,monthlyPrincipal:o-c}},r=e=>new Intl.NumberFormat("en-IN",{maximumFractionDigits:2,minimumFractionDigits:2}).format(e)},3263:function(e){e.exports={wrapper:"Image_wrapper__pvWMu",loader:"Image_loader__XlZl5"}},9294:function(e){e.exports={loginContainer:"Login_loginContainer__NecC2",loginForm:"Login_loginForm__L36xy",loginHeading:"Login_loginHeading__pzDeW",inputGroup:"Login_inputGroup__JmCof",passwordToggleBtn:"Login_passwordToggleBtn__6Wsj6",loginBtn:"Login_loginBtn__7SbRy",divider:"Login_divider__0zZcu",googleBtn:"Login_googleBtn__Ixab0",githubBtn:"Login_githubBtn__eJlNi",signupText:"Login_signupText__nPY63",error:"Login_error__Is9wR"}},541:function(e){e.exports={tablePage:"Table_tablePage__YK9Ov",tableContainer:"Table_tableContainer__ZSJbZ",btnsGroup:"Table_btnsGroup__1CnmY",saveBtn:"Table_saveBtn__U8Otj",emiTypeBtns:"Table_emiTypeBtns__bkI0y",activeButton:"Table_activeButton__CF42E",table:"Table_table__b_0YI",disclaimer:"Table_disclaimer__qzCXy",red:"Table_red__jy6s6",blue:"Table_blue__egtnw",mainTableWrapper:"Table_mainTableWrapper__aieo7",mainTable:"Table_mainTable__tO7hO",inputField:"Table_inputField___TyPi"}},9008:function(e,t,n){n(7828)}},function(e){e.O(0,[888,774,179],function(){return e(e.s=5557)}),_N_E=e.O()}]);