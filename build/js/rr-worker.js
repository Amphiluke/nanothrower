"use strict";let e,t={mode:"sphere",molecular:!0,biradical:!0},r={run(e){try{let t=s.applySettings(e);if(!0!==t)return t}catch(e){return e.message}return s.run()}};self.onmessage=function({data:{method:e,data:t}={}}){"function"==typeof r[e]&&self.postMessage({method:e,data:r[e](t)})};let s={applySettings(r){if(r=Object.assign({},t,r),!Number.isInteger(r.hCount)||r.hCount<1)return`A number of H atoms to be injected is incorrect: ${r.hCount}`;if(!r.sphere||!r.sphere.r)return"Wrapping sphere parameters are missed";let s=r.captureDistances,n=r.structure.atoms.find((e=>!s.has(e.el)));return n?`Capture distance is not specified for ${n.el}`:(e=r,e.sqrDistances=new Map([...s].map((([e,t])=>[e,t*t]))),e.lastMol=e.structure.atoms.reduce(((e,t)=>Math.max(e,t.mol)),0),!0)},run(){let{molecular:t,hCount:r,sphere:s,captureDistances:n,structure:a}=e,i="hemisphere"===e.mode,o=0,l={method:"progress",data:0};for(;o<r;){let e=this.getRndPointOnSphere(s),a=this.getRndPointOnSphere(s);i&&(e.z=Math.abs(e.z));let u=this.getCapturingAtom(e,a);if(!u)continue;let h={cx:u.x,cy:u.y,cz:u.z,r:n.get(u.el)},c=this.lineSphereCrossPoints(h,e,a);if(!c)continue;let p=this.sqrDistance(c[0],e)<this.sqrDistance(c[1],e)?c[0]:c[1];t?(this.adhereHH(p),o+=2):(this.adhereH(p),o++),l.data=100*o/r,self.postMessage(l)}return a},adhereH({x:t,y:r,z:s}){e.structure.atoms.push({el:"H",x:t,y:r,z:s,mol:++e.lastMol})},adhereHH({x:t,y:r,z:s}){let n=++e.lastMol,a=this.getRndPointOnSphere({cx:t,cy:r,cz:s,r:e.rHH/2}),i={x:2*t-a.x,y:2*r-a.y,z:2*s-a.z},o=e.structure.atoms.push({el:"H",x:a.x,y:a.y,z:a.z,mol:n},{el:e.biradical?"H1":"H",x:i.x,y:i.y,z:i.z,mol:n});e.structure.bonds.push({iAtm:o-2,jAtm:o-1,type:"s"})},getCapturingAtom(t,r){let s=e.sqrDistances,n=null,a=1/0;for(let i of e.structure.atoms)if(this.pointToLineSqrDistance(i,t,r)<=s.get(i.el)){let e=this.sqrDistance(i,t);(!n||a>e)&&(n=i,a=e)}return n},sphericalToCartesian(e,t,r){let s=e*Math.sin(t);return{x:s*Math.cos(r),y:s*Math.sin(r),z:e*Math.cos(t)}},sqrDistance(e,t){let r=e.x-t.x,s=e.y-t.y,n=e.z-t.z;return r*r+s*s+n*n},pointToLineSqrDistance(e,t,r){let s=[r.x-t.x,r.y-t.y,r.z-t.z],n=[e.x-r.x,e.y-r.y,e.z-r.z],a=[n[1]*s[2]-s[1]*n[2],n[0]*s[2]-s[0]*n[2],n[0]*s[1]-s[0]*n[1]];return(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])/(s[0]*s[0]+s[1]*s[1]+s[2]*s[2])},lineSphereCrossPoints({cx:e,cy:t,cz:r,r:s},n,a){let{x:i,y:o,z:l}=n,u=a.x-i,h=a.y-o,c=a.z-l,p=i-e,m=o-t,y=l-r,d=u*u+h*h+c*c,z=2*(u*p+h*m+c*y),x=z*z-4*d*(p*p+m*m+y*y-s*s);if(x<0)return null;let f=Math.sqrt(x),g=(-z+f)/(2*d),M=(-z-f)/(2*d);return[{x:u*g+i,y:h*g+o,z:c*g+l},{x:u*M+i,y:h*M+o,z:c*M+l}]},getRndPointOnSphere({cx:e,cy:t,cz:r,r:s}){let n=this.sphericalToCartesian(s,Math.random()*Math.PI,2*Math.random()*Math.PI);return n.x+=e,n.y+=t,n.z+=r,n}};