const s=(n,t="₹")=>!n&&n!==0?"":`${t}${parseFloat(n).toLocaleString("en-IN",{minimumFractionDigits:0,maximumFractionDigits:2})}`,u=(n,t)=>!t||t>=n?0:Math.round((n-t)/n*100),l=(n,t)=>{const r=n.replace(/[^0-9]/g,""),e=encodeURIComponent(t);return`https://wa.me/${r}?text=${e}`},i=(n,t,r)=>{let e=`🛒 *New Order Received*

`;return e+=`*Order #:* ${n.order_number||"N/A"}
`,e+=`*Customer:* ${n.customer_name}
`,e+=`*Mobile:* ${n.customer_phone}
`,e+=`*Address:* ${n.customer_address||"N/A"}
`,n.customer_landmark&&(e+=`*Landmark:* ${n.customer_landmark}
`),n.notes&&(e+=`*Notes:* ${n.notes}
`),e+=`
*Products:*
`,e+=`─────────────
`,t.forEach(o=>{const a=(o.discount_price||o.price)*o.quantity;e+=`${o.quantity} x ${o.name} = ${s(a)}
`}),e+=`─────────────
`,e+=`*Total Amount: ${s(n.grand_total)}*

`,e+="Thank you for your order! 🙏",e},g=(n,t=5)=>n<=0?{label:"Out of Stock",color:"danger"}:n<=t?{label:"Low Stock",color:"warning"}:{label:"In Stock",color:"success"},m=n=>({pending:"warning",confirmed:"info",processing:"info",delivered:"success",cancelled:"danger"})[n]||"info";export{g as a,l as b,i as c,m as d,s as f,u as g};
