import{Color as e,PointsMaterial as t,MeshLambertMaterial as r,SphereGeometry as a,LineDashedMaterial as n,VertexColors as s,LineBasicMaterial as o,Scene as l,Object3D as i,PerspectiveCamera as d,SpotLight as h,WebGLRenderer as p,Geometry as c,LineStrip as u,AxisHelper as m,Mesh as g,MeshBasicMaterial as f,Line as b,Vector3 as w,Points as y}from"../../vendor/three.min.js";let x=new WeakMap;class v{constructor(){x.set(this,new Map)}static on(...e){return v.prototype.on.apply(v,e)}static off(...e){return v.prototype.off.apply(v,e)}static trigger(...e){return v.prototype.trigger.apply(v,e)}on(e,t){let r=x.get(this);r.has(e)||r.set(e,[]),r.get(e).push(t)}off(e,t){let r=x.get(this);if(r.has(e))if(t){let a=r.get(e),n=a.indexOf(t);n>-1&&(a.splice(n,1),0===a.length&&r.delete(e))}else r.get(e).length=0,r.delete(e)}trigger(e,...t){let r=x.get(this);if(r.has(e))for(let a of r.get(e))a.apply(null,t)}}x.set(v,new Map);let C=new Map,A=Object.assign(new v,{addAction(e,t){C.set(e,t)},execAction(e,...t){if(!this.actionEnabled(e))throw new Error(`Action "${e}" is disabled and can't be executed`);return C.get(e).exec(...t)},actionEnabled(e){return!this.busy&&C.get(e).enabled},getActionStates(){let e=this.busy,t=new Map;for(let[r,a]of C)t.set(r,!e&&a.enabled);return t}}),S=0;Object.defineProperty(A,"busy",{configurable:!0,enumerable:!0,get:()=>S>0,set(e){let t=this.busy;if(t||e){S+=e?1:-1;let r=this.busy;t!==r&&this.trigger("app:stateChange",r)}}});let O=new Worker("js/rr-worker.js"),M=null,P=Object.assign(new v,{invoke(e,t){if(M)throw new Error(`Unable to run the method “${e}” as the blocking method “${M}” is still running`);M=e,A.busy=!0,O.postMessage({method:e,data:t})}});O.addEventListener("message",({data:{method:e,data:t}={}})=>{e&&(e===M&&(A.busy=!1,M=null),P.trigger(e,t))}),O.addEventListener("error",e=>{throw e});let k={name:"",atoms:[],bonds:[]},T=new Set,j=new Set,R=Object.assign(new v,{getPairList(e){switch(e){case"basic":return[...j].filter(e=>!e.startsWith("x-"));case"extra":return[...j].filter(e=>e.startsWith("x-"));default:return[...j]}},getPairSet(e){return new Set(this.getPairList(e))},getAtomList:()=>[...T],getAtomSet(){return new Set(this.getAtomList())},overwrite(e,t=!0){if(({name:k.name="",atoms:k.atoms=[],bonds:k.bonds=[]}=e),!1!==t){T=new Set(k.atoms.map(e=>e.el));let e=this.getAtomList(),t=[];for(let[r,a]of e.entries())t.push(...e.slice(r).map(e=>a+e));t.push(...t.map(e=>"x-"+e)),j=new Set(t)}this.trigger("updateStructure",!1!==t)},getCentroid(){let e={x:0,y:0,z:0};for(let{x:t,y:r,z:a}of k.atoms)e.x+=t,e.y+=r,e.z+=a;let t=k.atoms.length;return e.x/=t,e.y/=t,e.z/=t,e},getWrappingSphere(){let{x:e,y:t,z:r}=this.getCentroid(),a=0;for(let{x:n,y:s,z:o}of k.atoms){let l=(n-e)*(n-e)+(s-t)*(s-t)+(o-r)*(o-r);l>a&&(a=l)}return{cx:e,cy:t,cz:r,r:Math.sqrt(a)}},translate(e,t,r){let a=this.getCentroid(),n=e-a.x,s=t-a.y,o=r-a.z;for(let e of k.atoms)e.x+=n,e.y+=s,e.z+=o;this.overwrite(k,!1)},rotate(e,t){let r="x"===t?"y":"x",a="z"===t?"y":"z",n=Math.sin(e),s=Math.cos(e);for(let e of k.atoms){let t=e[r],o=e[a];e[r]=t*s+o*n,e[a]=o*s-t*n}this.overwrite(k,!1)}});function z(e){return e&&e.jquery?e:$(e)}Object.defineProperty(R,"structure",{enumerable:!0,get:()=>k}),P.on("updateStructure",e=>R.overwrite(e));class L{constructor(e){this.$el=z(e)}listen(e){for(let{type:t,owner:r,filter:a,handler:n}of e){let e="function"==typeof n?n:this[n];r instanceof v?r.on(t,e.bind(this)):z(r||this.$el).on(t,a||null,e.bind(this))}}}let N,B=[{type:"click",filter:".nt-apply",handler(...e){this.handleApply(...e)}},{type:"click",filter:".nt-discard",handler(...e){this.handleDiscard(...e)}},{type:"keyup",owner:document,handler(...e){this.handleGlobalKeyUp(...e)}}];class E extends L{constructor(e){super(e),this.listen(B)}handleApply(){this.apply(),this.hide()}handleDiscard(){this.discard(),this.hide()}handleGlobalKeyUp(e){27===e.which&&(this.discard(),this.hide())}apply(){}discard(){}show(){this.$el.removeClass("hidden")}hide(){this.$el.addClass("hidden")}fix(e){e||(e=this.$el[0].elements);for(let t of Array.from(e))"checkbox"===t.type||"radio"===t.type?t.defaultChecked=t.checked:"OPTION"===t.nodeName.toUpperCase()?t.defaultSelected=t.selected:"defaultValue"in t?t.defaultValue=t.value:t.options&&this.fix(t.options)}reset(){this.$el[0].reset()}}let D={readFile:e=>new Promise((t,r)=>{if("string"==typeof e){let a=new XMLHttpRequest;a.open("GET",e,!0),a.addEventListener("load",()=>{200===a.status&&t(a.responseText)}),a.addEventListener("error",()=>r(a.status)),a.send(null)}else{let a=new FileReader;a.addEventListener("load",()=>t(a.result)),a.addEventListener("error",()=>r(a.error)),a.readAsText(e)}}),getBlobURL(e,t="text/plain"){let r=e instanceof Blob?e:new Blob([e],{type:t});return N&&URL.revokeObjectURL(N),N=URL.createObjectURL(r),N}},H={};H.hin={parseMolecule(e,t,r){let{atoms:a,bonds:n}=r,s=a.length,o=/\s+/;for(let r=0,l=t.length;r<l;r++){let l=t[r].trim().split(o);a.push({el:l[3],x:+l[7],y:+l[8],z:+l[9],mol:e});for(let e=11,t=2*l[10]+11;e<t;e+=2)l[e]-1>r&&n.push({iAtm:r+s,jAtm:l[e]-1+s,type:l[e+1]})}},parse(e){let t=/\n\s*mol\s+(\d+)([\s\S]+)\n\s*endmol\s+\1\b/g,r=/^atom\s+\d+\s+.+$/gm,a={atoms:[],bonds:[]},n=t.exec(e);for(;n;)this.parseMolecule(n[1]-1,n[2].match(r),a),n=t.exec(e);return a},make(){let e=R.structure.atoms,t=[];for(let[r,{mol:a}]of e.entries()){let e=t[a]||(t[a]=[]);e[e.length]=r}let r=new Array(e.length);for(let{type:a,iAtm:n,jAtm:s}of R.structure.bonds){let o=t[e[n].mol].indexOf(n)+1,l=t[e[s].mol].indexOf(s)+1;(r[n]||(r[n]=[])).push(`${l} ${a}`),(r[s]||(r[s]=[])).push(`${o} ${a}`)}let a=";The structure was saved in Nanothrower\nforcefield mm+\n";for(let[n,s]of t.entries()){a+=`mol ${n+1}\n`;for(let[t,n]of s.entries()){let{el:s,x:o,y:l,z:i}=e[n],d=r[n];a+=`atom ${t+1} - ${s} ** - 0 ${o.toFixed(4)} ${l.toFixed(4)} ${i.toFixed(4)} `+(d?`${d.length} ${d.join(" ")}`:"0")+"\n"}a+=`endmol ${n+1}\n`}return a}},H.ml2=H.mol2={bondTypes:new Map([["s","1"],["d","2"],["t","3"],["a","ar"]]),parseMolecule(e,t,r,a){let{atoms:n,bonds:s}=a,o=n.length,l=/\s+/;for(let r of t){let t=r.trim().split(l),a=t[5].indexOf(".");n.push({el:a>-1?t[5].slice(0,a):t[5],x:+t[2],y:+t[3],z:+t[4],mol:e})}for(let e of r){let t=e.trim().split(l),r=[...this.bondTypes].find(e=>e[1]===t[3]);s.push({iAtm:t[1]-1+o,jAtm:t[2]-1+o,type:r&&r[0]||"s"})}},parse(e){let t={atoms:[],bonds:[]},r=e.split("@<TRIPOS>MOLECULE").slice(1),a=/@<TRIPOS>ATOM([\s\S]+?)(?:@<TRIPOS>|$)/,n=/@<TRIPOS>BOND([\s\S]+?)(?:@<TRIPOS>|$)/,s=/(?:\r?\n)+/,o=[];for(let[e,l]of r.entries()){let r=l.match(a),i=r&&r[1].trim().split(s)||o,d=l.match(n),h=d&&d[1].trim().split(s)||o;this.parseMolecule(e,i,h,t)}return t},make(){let e=R.structure.atoms,t=[];for(let[r,{mol:a}]of e.entries()){let e=t[a]||(t[a]=[]);e[e.length]=r}let r={};for(let{type:a,iAtm:n,jAtm:s}of R.structure.bonds){let o=t[e[n].mol].indexOf(n)+1,l=t[e[s].mol].indexOf(s)+1;(r[n]||(r[n]=[])).push(`${o} ${l} ${this.bondTypes.get(a)||1}`)}let a="# The structure was saved in Nanothrower\n";for(let n of t){a+=`@<TRIPOS>MOLECULE\n****\n${n.length} %BOND_COUNT%\nSMALL\nNO_CHARGES\n\n\n@<TRIPOS>ATOM\n`;let t=[];for(let[s,o]of n.entries()){let{el:n,x:l,y:i,z:d}=e[o];a+=`${s+1} ${n} ${l.toFixed(4)} ${i.toFixed(4)} ${d.toFixed(4)} ${n} 1 **** 0.0000\n`,r[o]&&t.push(...r[o])}a=a.replace("%BOND_COUNT%",t.length.toString()),a+="@<TRIPOS>BOND\n";for(let[e,r]of t.entries())a+=`${e+1} ${r}\n`;a+="@<TRIPOS>SUBSTRUCTURE\n1 **** 0\n"}return a}},H.xyz={parseAtomRecord(e){let t=e.trim().split(/\s+/);return{el:t[0],x:+t[1],y:+t[2],z:+t[3]}},parse(e){let t=e.split(/(?:\r?\n)+/).slice(2);return t&&{atoms:t.map(this.parseAtomRecord,this),bonds:[]}},make(){let e=R.structure.atoms.length+"\nThe structure was saved in Nanothrower";for(let{el:t,x:r,y:a,z:n}of R.structure.atoms)e+=`\n${t} ${r.toFixed(5)} ${a.toFixed(5)} ${n.toFixed(5)}`;return e}},H.json={parse:e=>JSON.parse(e),make:()=>JSON.stringify(R.structure,null,2)};var I={load:e=>D.readFile(e).then(t=>{let r=e.name||String(e),a=r.slice(r.lastIndexOf(".")+1).toLowerCase(),n=(H[a]||H.hin).parse(t);return n.name=r.replace(/.*[/\\]/,"")||"unknown",R.overwrite(n),t}),makeFile(e){let t=H[e.toLowerCase()];return!!t&&t.make()}};let F=Object.assign(new E(".nt-save-form"),{handleSave(e){let t=$("#nt-file-type").val(),r=I.makeFile(t);r&&(e.target.setAttribute("download","untitled."+t),e.target.href=D.getBlobURL(r))}});F.listen([{type:"click",filter:".nt-apply",handler:"handleSave"}]),A.addAction("save",{get enabled(){return R.structure.atoms.length>0},exec(){F.show()}});let U={create(e){return{name:"Graphene",atoms:this.makeAtoms(e),bonds:this.makeBonds(e)}},makeAtoms({width:e,height:t,rCC:r}){let a=2*Math.round(e/(Math.sqrt(3)*r)),n=Math.round(2*t/(3*r)),s=(a+1)*n,o=r/2,l=Math.sqrt(3)*o,i=3*o,d=new Array(s),h=0;for(let e=0;e<n;e++){let t=e%2;for(let r=0;r<=a;r++,h++)d[h]={el:"C",x:l*r,y:e*i+(r%2===t?o:0),z:0,mol:0}}return d},makeBonds({width:e,height:t,rCC:r}){let a=2*Math.round(e/(Math.sqrt(3)*r))+1,n=a*Math.round(2*t/(3*r)),s=[];for(let e=0;e<n-1;e++)if((e+1)%a&&s.push({iAtm:e,jAtm:e+1,type:"a"}),e%2==0){let t=e+a;t<n&&s.push({iAtm:e,jAtm:t,type:"a"})}return s}};var W=U.create.bind(U);let q=Object.assign(new E(".nt-graphene-form"),{handleApply(...e){if(this.$el[0].checkValidity())return Object.getPrototypeOf(this).handleApply.apply(this,e);window.alert("Please, fix invalid input first")},apply(){this.fix(),R.overwrite(W({width:Number($("#graphene-width").val()),height:Number($("#graphene-height").val()),rCC:Number($("#graphene-rcc").val())})),R.translate(0,0,0)}});A.addAction("graphene",{get enabled(){return!0},exec(){q.show()}});let V={create(e){return{name:"Nanotube",atoms:this.makeAtoms(e),bonds:this.makeBonds(e)}},makeAtoms({radius:e,length:t,rCC:r}){let a=r/e,n=Math.round(2*Math.PI/Math.acos(1-1.5*a*a));e=.5*Math.sqrt(3)*r/Math.sin(Math.PI/n);let s=2*Math.PI/n;a=e*(1-Math.cos(s/2));let o=Math.sqrt(r*r/4-a*a),l=Math.round(t/(r+o)),i=s/2,d=new Array(2*n*l),h=0;for(let t=0;t<l;t++){let a=t%2;for(let s=0;s<2*n;s++,h++)d[h]={el:"C",x:e*Math.cos(i*s),y:e*Math.sin(i*s),z:t*(r+o)+(s%2^a)*o,mol:0}}return d},makeBonds({radius:e,length:t,rCC:r}){let a=r/e,n=Math.round(2*Math.PI/Math.acos(1-1.5*a*a));e=.5*Math.sqrt(3)*r/Math.sin(Math.PI/n);let s=2*Math.PI/n;a=e*(1-Math.cos(s/2));let o=Math.sqrt(r*r/4-a*a),l=2*n,i=l*Math.round(t/(r+o)),d=[];for(let e=0;e<i;e++){if((e+1)%l?d.push({iAtm:e,jAtm:e+1,type:"a"}):d.push({iAtm:e,jAtm:e+1-l,type:"a"}),Math.trunc(e/l)%2^e%2){let t=e+l;t<i&&d.push({iAtm:e,jAtm:t,type:"a"})}}return d}};var G=V.create.bind(V);let _=Object.assign(new E(".nt-nanotube-form"),{handleApply(...e){if(this.$el[0].checkValidity())return Object.getPrototypeOf(this).handleApply.apply(this,e);window.alert("Please, fix invalid input first")},apply(){this.fix(),R.overwrite(G({radius:Number($("#nanotube-radius").val()),length:Number($("#nanotube-length").val()),rCC:Number($("#graphene-rcc").val())})),R.translate(0,0,0)}});A.addAction("nanotube",{get enabled(){return!0},exec(){_.show()}});let X=new WeakMap;class J{constructor(e){Object.defineProperty(this,"create",{configurable:!0,value:e}),X.set(this,new Map)}get(e){let t=X.get(this);return t.has(e)||t.set(e,this.create(e)),t.get(e)}renew(e){X.get(this).delete(e)}}let K=new J(t=>new e(t)),Z=Object.prototype.hasOwnProperty,Y=Object.create({get(e){return Z.call(this,e)?this[e]:this._def},set(e,t){Z.call(this,e)?Object.assign(this[e],t):this[e]=Object.assign({},this._def,t)}},{_def:{value:Object.freeze({color:16777215,radius:1})}});Y.set("C",{color:16711680}),Y.set("H",{radius:.7}),Y.set("B",{color:16776960}),Y.set("N",{color:255});let Q,ee,te=new J(e=>{let r=Y.get(e);return new t({color:r.color,sizeAttenuation:!1})}),re=new J(e=>{let t=Y.get(e);return new r({color:t.color})}),ae=new J(e=>{let t=Y.get(e);return new a(t.radius)}),ne=new J(e=>"extra"===e?new n({dashSize:.2,gapSize:.1,vertexColors:s}):new o({vertexColors:s})),se=0,oe={setup(e){Q={el:e,width:e.offsetWidth,height:e.offsetHeight},ee={scene:new l,group:new i,camera:new d(75,Q.width/Q.height,.1,1e3),spotLight:new h(16777215),renderer:new p({canvas:e})},ee.spotLight.position.set(-40,60,50),ee.scene.add(ee.group,ee.spotLight),ee.camera.position.x=0,ee.camera.position.y=0,ee.camera.position.z=20,ee.camera.lookAt(ee.scene.position),ee.renderer.setClearColor(0),ee.renderer.setSize(Q.width,Q.height),ee.renderer.render(ee.scene,ee.camera)},get canvas(){return Q.el},get rotation(){return se},set rotation(e){e!==se&&Number.isFinite(e)&&(se=e,ee.group.rotation.y+=.05*(se-ee.group.rotation.y))},appearance:"graph",zoom(e){ee.camera.position.z+=e,ee.camera.lookAt(ee.scene.position),this.update()},resize(e=Q.el.offsetWidth,t=Q.el.offsetHeight){e>0&&t>0&&(e!==Q.width||t!==Q.height)&&(ee.camera.aspect=e/t,ee.camera.updateProjectionMatrix(),ee.renderer.setSize(e,t,!1),Q.width=e,Q.height=t,this.update())},render(){this.resetScene(),this.update()},update(){ee.renderer.render(ee.scene,ee.camera),this.autoUpdate&&requestAnimationFrame(()=>this.update())},getAtomColor:e=>Y.get(e).color,setAtomColors(e){for(let[t,r]of e)this.getAtomColor(t)!==r&&(Y.set(t,{color:r}),re.renew(t),te.renew(t))},setBgColor(e){"string"==typeof e&&(e=Number(e.replace("#","0x"))),ee.renderer.setClearColor(e)},clearScene(){let e=ee.group,t=e.children[0];for(;t;)e.remove(t),t=e.children[0]},resetScene(){this.clearScene(),"spheres"===this.appearance?this.addSceneAtoms():R.structure.bonds.length?this.addSceneBonds():this.addScenePoints()},addSceneAtoms(){let e=g,t=ee.group;for(let{el:r,x:a,y:n,z:s}of R.structure.atoms){let o=new e(ae.get(r),re.get(r));o.position.x=a,o.position.y=n,o.position.z=s,t.add(o)}},addSceneBonds(){let e=b,t=w,r=ee.group,a=R.structure.atoms,n=new Int8Array(a.length);for(let{type:s,iAtm:o,jAtm:l}of R.structure.bonds){n[o]=n[l]=1;let i=new c,d=a[o];i.vertices.push(new t(d.x,d.y,d.z)),i.colors.push(K.get(Y.get(d.el).color)),d=a[l],i.vertices.push(new t(d.x,d.y,d.z)),i.colors.push(K.get(Y.get(d.el).color)),"x"===s?(i.computeLineDistances(),r.add(new e(i,ne.get("extra"),u))):r.add(new e(i,ne.get("basic")))}let s=y,o=n.indexOf(0);for(;-1!==o;){let e=new c,l=a[o];e.vertices.push(new t(l.x,l.y,l.z)),r.add(new s(e,te.get(l.el))),o=n.indexOf(0,o+1)}},addScenePoints(){let e=y,t=w,r=ee.group;for(let{el:a,x:n,y:s,z:o}of R.structure.atoms){let l=new c;l.vertices.push(new t(n,s,o)),r.add(new e(l,te.get(a)))}},addAxes(){this.axes||(this.axes=new m(20),ee.scene.add(this.axes),this.update())},removeAxes(){this.axes&&(ee.scene.remove(this.axes),this.axes=void 0,this.update())},addWireSphere({cx:e,cy:t,cz:r,r:n,color:s=16777215}){let o=this.wireSphere;o||(o=this.wireSphere=new g(new a(n,15,15),new f({color:s,wireframe:!0})),o.position.x=e,o.position.y=t,o.position.z=r,ee.scene.add(o),this.update())},removeWireSphere(){this.wireSphere&&(ee.scene.remove(this.wireSphere),this.wireSphere=void 0,this.update())}};R.on("updateStructure",oe.render.bind(oe));let le=Object.assign(new E(".nt-transform-form"),{handleAppStateChange(e){this.$el.find("fieldset").prop("disabled",e)},handleTranslate(){let e=this.$el.find(".nt-translate"),t=+e.find("[data-axis='x']").val(),r=+e.find("[data-axis='y']").val(),a=+e.find("[data-axis='z']").val();R.translate(t,r,a)},handleRotate(e){let t=$("#nt-rotate-angle").val()*Math.PI/180,r=e.target.getAttribute("data-axis");R.rotate(t,r)},show(...e){let t=R.getCentroid(),r=this.$el.find(".nt-translate input[data-axis]");return r.val(e=>t[r.eq(e).data("axis")].toFixed(5)),oe.addAxes(),Object.getPrototypeOf(this).show.apply(this,e)},hide(...e){return oe.removeAxes(),Object.getPrototypeOf(this).hide.apply(this,e)}});le.listen([{type:"app:stateChange",owner:A,handler:"handleAppStateChange"},{type:"click",owner:"#nt-translate-apply",handler:"handleTranslate"},{type:"click",filter:".nt-rotate [data-axis]",handler:"handleRotate"}]),A.addAction("transform",{get enabled(){return R.structure.atoms.length>0},exec(){le.show()}});let ie={convert(){let e=JSON.parse(JSON.stringify(R.structure.atoms));for(let{iAtm:t,jAtm:r}of R.structure.bonds){let a=e[t].el,n=e[r].el;"C"===a&&"C"===n?(e[t].el="B",e[r].el="N"):"C"===a?e[t].el="B"===n?"N":"B":"C"===n&&(e[r].el="B"===a?"N":"B")}R.overwrite(Object.assign({},R.structure,{atoms:e}))}};A.addAction("bnConvert",{get enabled(){return R.structure.atoms.length>0},exec(){ie.convert()}});let de={H:1.00794,H1:1.00794,He:4.002602,Li:6.941,Be:9.01218,B:10.811,C:12.011,N:14.0067,O:15.9994,F:18.998403,Ne:20.179,Na:22.98977,Mg:24.305,Al:26.98154,Si:28.0855,P:30.97376,S:32.066,Cl:35.453,Ar:39.948,K:39.0983,Ca:40.078,Sc:44.95591,Ti:47.88,V:50.9415,Cr:51.9961,Mn:54.938,Fe:55.847,Co:58.9332,Ni:58.69,Cu:63.546,Zn:65.39,Ga:69.723,Ge:72.59,As:74.9216,Se:78.96,Br:79.904,Kr:83.8,Rb:85.4678,Sr:87.62,Y:88.9059,Zr:91.224,Nb:92.9064,Mo:95.94,Tc:97.9072,Ru:101.07,Rh:102.9055,Pd:106.42,Ag:107.8682,Cd:112.41,In:114.82,Sn:118.71,Sb:121.75,Te:127.6,I:126.9045,Xe:131.29,Cs:132.9054,Ba:137.33,La:138.9055,Ce:140.12,Pr:140.9077,Nd:144.24,Pm:144.9128,Sm:150.36,Eu:151.96,Gd:157.25,Tb:158.9254,Dy:162.5,Ho:164.9304,Er:167.26,Tm:168.9342,Yb:173.04,Lu:174.967,Hf:178.49,Ta:180.9479,W:183.85,Re:186.207,Os:190.2,Ir:192.22,Pt:195.08,Au:196.9665,Hg:200.59,Tl:204.383,Pb:207.2,Bi:208.9804,Po:208.9824,At:209.9871,Rn:222.0176,Fr:223.0197,Ra:226.0254,Ac:227.0278,Th:232.0381,Pa:231.0359,U:238.0289,Np:237.0482,Pu:244.0642,Am:243.0614,Cm:247.0703,Bk:247.0703,Cf:251.0796,Es:252.0828,Fm:257.0951,Md:258.0986,No:259.1009,Lr:260.1054,Rf:261,Db:262,Sg:263,Bh:262,Hs:265,Mt:266};var he={getAtomicMass:e=>de[e],countAtoms(e,t="H"){let r=0,a=t+"1";for(let{el:n}of e)n!==t&&n!==a||r++;return r},getConcentration(e,t="H"){let r=0,a=0,n=t+"1";for(let{el:s}of e){let e=de[s];r+=e,s!==t&&s!==n||(a+=e)}return a/r},conToNum(e,t,r="H"){let a=0,n=r+"1";for(let{el:t}of e)t!==r&&t!==n&&(a+=de[t]);return Math.round(t*a/((1-t)*de[r]))}};let pe=Object.assign(new E(".nt-rnd-rain-form"),{show(...e){let t=this.sphere=R.getWrappingSphere();return t.r*=1.1,oe.addWireSphere(t),$("#nt-sphere-radius").val(t.r.toFixed(3)),Object.getPrototypeOf(this).show.apply(this,e)},hide(...e){return oe.removeWireSphere(),Object.getPrototypeOf(this).hide.apply(this,e)},handleApply(...e){if(this.$el[0].checkValidity())return Object.getPrototypeOf(this).handleApply.apply(this,e);window.alert("Please, fix invalid input first")},apply(){this.fix();let e=Number($("#nt-adsorb-concentration").val()),t=he.conToNum(R.structure.atoms,e),r=he.countAtoms(R.structure.atoms);if(t<=r)return void window.alert("The given mass concentration of hydrogen is already reached");let a=$("#nt-distance-fields").find("label[data-el]").get(),n=new Map(a.map(e=>[$(e).data("el"),Number($("input",e).val())]));n.set("H1",n.get("H")),P.invoke("run",{mode:this.$el.find("input[name='nt-src-mode']").filter(":checked").val(),molecular:$("#nt-adsorb-mol").prop("checked"),biradical:$("#nt-adsorb-birad").prop("checked"),rHH:Number($("#nt-adsorb-r-hh").val()),hCount:t-r,sphere:this.sphere,structure:R.structure,captureDistances:n})},discard(){this.reset()},resetHTML(){let e=R.getAtomSet();e.add("H");let t="";for(let r of e)t+=`<label data-el="${r}"><input type="text" pattern="\\d*\\.?\\d+([eE][+-]?\\d+)?" required></label>`;$("#nt-distance-fields").html(t)},handleMolecularChange(e){let t=e.target.checked;$("#nt-adsorb-birad").prop({checked:t,disabled:!t}),$("#nt-adsorb-r-hh").prop({required:t,disabled:!t})},handleRadiusChange(e){e.target.checkValidity()&&(this.sphere.r=Number(e.target.value),oe.removeWireSphere(),oe.addWireSphere(this.sphere))},updateProgress(e){A.trigger("app:progress",e)},updateStructure(e){R.overwrite(e)}});pe.listen([{type:"change",owner:"#nt-adsorb-mol",handler:"handleMolecularChange"},{type:"change",owner:"#nt-sphere-radius",handler:"handleRadiusChange"},{type:"app:structure:loaded",owner:A,handler:"resetHTML"},{type:"updateStructure",owner:R,handler:"resetHTML"},{type:"progress",owner:P,handler:"updateProgress"},{type:"run",owner:P,handler:"updateStructure"}]),A.addAction("rndRain",{get enabled(){return R.structure.atoms.length>0},exec(){pe.show()}});let ce,ue=Object.assign(new E(".nt-appearance-form"),{handleUpdateStructure(e){e&&($("#nt-appearance-element").html("<option selected>"+R.getAtomList().join("</option><option>")+"</option>"),this.setCurrElementColor())},handleColorChange(e){let t=parseInt(e.target.value.slice(1),16);isNaN(t)||(this.tmpClrPresets||(this.tmpClrPresets=new Map),this.tmpClrPresets.set($("#nt-appearance-element").val(),t))},apply(){oe.appearance=this.$el.find("input[name='appearance']:checked").data("appearance"),oe.setBgColor($("#nt-bg-color").val()),this.tmpClrPresets&&(oe.setAtomColors(this.tmpClrPresets),this.tmpClrPresets=void 0),oe.render(),this.fix()},discard(){this.reset(),this.tmpClrPresets=void 0,this.setCurrElementColor()},setCurrElementColor(){let e,t=$("#nt-appearance-element").val();e=this.tmpClrPresets&&this.tmpClrPresets.has(t)?this.tmpClrPresets.get(t):oe.getAtomColor(t),$("#nt-appearance-color").val("#"+e.toString(16).padStart(6,"0"))}});ue.listen([{type:"updateStructure",owner:R,handler:"handleUpdateStructure"},{type:"change",owner:"#nt-appearance-element",handler:"setCurrElementColor"},{type:"change",owner:"#nt-appearance-color",handler:"handleColorChange"}]),A.addAction("alterView",{get enabled(){return R.structure.atoms.length>0},exec(){ue.show()}});let me=Object.assign(new L(".nt-menu"),{handleAppStateChange(e){this.disabled=e},handleGlobalClick(e){if(this.disabled)return;let t=$(e.target),r=this.$el.find(".nt-popup.expanded");if(t.is(".nt-menu button")){let e=t.next(".nt-popup").toggleClass("expanded");e.hasClass("expanded")&&this.setItemStates(),r=r.not(e)}r.removeClass("expanded")},handleHover(e){if(this.disabled)return;let t=this.$el.find(".nt-popup.expanded");if(t.length){let r=$(e.target).next(".nt-popup");t.is(r)||(t.removeClass("expanded"),r.addClass("expanded"))}},handleAction(e){let t=$(e.target).data("action");"load"===t?$("#nt-file").trigger("click"):A.execAction(t)},handleFile(e){A.execAction("load",e.target.files[0])},setItemStates(e){let t=this.$el.find("[data-action]");e&&(t=t.filter(`[data-action="${e}"]`));let r=A.getActionStates();t.each((e,t)=>{let a=r.get(t.getAttribute("data-action")),n=t.hasAttribute("disabled");a&&n?t.removeAttribute("disabled"):a||n||t.setAttribute("disabled","disabled")})}});Object.defineProperty(me,"disabled",{enumerable:!0,get:()=>ce,set(e){ce=!!e,this.$el.toggleClass("nt-disabled",!!ce),ce&&this.$el.find("menu.expanded").removeClass("expanded")}}),me.listen([{type:"app:stateChange",owner:A,handler:"handleAppStateChange"},{type:"click",owner:document,handler:"handleGlobalClick"},{type:"mouseenter",owner:".nt-menu",filter:"button",handler:"handleHover"},{type:"click",owner:".nt-menu",filter:"[data-action]",handler:"handleAction"},{type:"change",owner:"#nt-file",handler:"handleFile"}]),me.disabled=A.busy,A.addAction("load",{get enabled(){return!0},exec(e){e&&I.load(e).then(()=>A.trigger("app:structure:loaded"))}});let ge=Object.assign(new L("#nt-view"),{rotData:{startX:0,startRot:0},handleDragEnterOver(e){e.preventDefault(),"dragenter"===e.type&&e.currentTarget.classList.add("nt-droppable")},handleDragLeave(e){e.preventDefault(),e.target===e.currentTarget&&e.target.classList.remove("nt-droppable")},handleDrop(e){let t=e.originalEvent.dataTransfer,r=t&&t.files;r&&r.length&&(e.preventDefault(),A.execAction("load",r[0])),e.currentTarget.classList.remove("nt-droppable")},handleWheelZoom(e){oe.zoom(e.originalEvent.deltaY<0?5:-5),e.preventDefault()},handleStartRotate(e){this.rotData.startX=e.pageX,this.rotData.startRot=oe.rotation,this.$el.on("mouseup.ntViewRotation mouseleave.ntViewRotation",this.handleStopRotate.bind(this)).on("mousemove.ntViewRotation",this.handleRotate.bind(this)),oe.autoUpdate=!0,oe.update()},handleStopRotate(){oe.autoUpdate=!1,this.$el.off(".ntViewRotation")},handleRotate(e){oe.rotation=this.rotData.startRot+.02*(e.pageX-this.rotData.startX)},handleWndResize(){this._resizeTimer||(this._resizeTimer=setTimeout(()=>{oe.resize(),this._resizeTimer=void 0},300))},handleDblClick(){let e=R.getWrappingSphere();oe.addWireSphere(e.cx,e.cy,e.cz,e.r)}});ge.listen([{type:"dragenter dragover",handler:"handleDragEnterOver"},{type:"dragleave",handler:"handleDragLeave"},{type:"drop",handler:"handleDrop"},{type:"wheel",handler:"handleWheelZoom"},{type:"mousedown",handler:"handleStartRotate"},{type:"resize",owner:window,handler:"handleWndResize"},{type:"dblclick",handler:"handleDblClick"}]),oe.setup(ge.$el.children("canvas")[0]),A.on("app:structure:loaded",()=>{document.title=R.structure.name+" - Nanothrower"}),A.on("app:stateChange",e=>{document.body.classList.toggle("app-busy",e),e||(document.getElementById("nt-progress").innerHTML="")}),A.on("app:progress",e=>{document.getElementById("nt-progress").innerHTML=Math.round(e)+"%"});
