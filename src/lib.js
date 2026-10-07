import qrcode from "qrcode-generator";

function lum(hex){var n=parseInt(hex.slice(1),16),c=[n>>16&255,n>>8&255,n&255].map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function normUrl(u){u=u.trim();if(!u)return"";return /^[a-z][a-z0-9+.-]*:/i.test(u)?u:"https://"+u;}
function buildQR(text,ec){if(!text)return null;try{var q=qrcode(0,ec);q.addData(text,"Byte");q.make();return q;}catch(e){return{error:true};}}

function toSvg(q,fg,bg,logo){
  var quiet=4,n=q.getModuleCount(),size=n+quiet*2,d="";
  for(var r=0;r<n;r++){var c=0;while(c<n){if(q.isDark(r,c)){var s=c;while(c<n&&q.isDark(r,c))c++;d+="M"+(s+quiet)+" "+(r+quiet)+"h"+(c-s)+"v1h-"+(c-s)+"z";}else c++;}}
  var out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+size+' '+size+'"><rect width="'+size+'" height="'+size+'" fill="'+bg+'"/><path shape-rendering="crispEdges" d="'+d+'" fill="'+fg+'"/>';
  if(logo){
    var ls=n*0.22,p=ls*0.14,x=size/2-ls/2;
    out+='<rect x="'+(x-p)+'" y="'+(x-p)+'" width="'+(ls+2*p)+'" height="'+(ls+2*p)+'" rx="'+(ls*0.18)+'" fill="'+bg+'"/>';
    if(logo.inner) out+='<svg x="'+x+'" y="'+x+'" width="'+ls+'" height="'+ls+'" viewBox="0 0 100 100">'+logo.inner+'</svg>';
    else out+='<image href="'+logo.data+'" x="'+x+'" y="'+x+'" width="'+ls+'" height="'+ls+'" preserveAspectRatio="xMidYMid meet"/>';
  }
  return out+'</svg>';
}
function loadImg(src){return new Promise(function(res,rej){var i=new Image();i.onload=function(){res(i)};i.onerror=function(){rej(new Error("img"))};i.src=src;});}
function svgUrl(s){return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);}
function textColor(mode,bg){return mode==="print"||lum(bg)>.4?"#16202b":"#ffffff";}

function wrap(ctx,text,maxW){
  var out=[];text.split("\n").forEach(function(par){
    var words=par.split(" "),line="";
    words.forEach(function(w){var t=line?line+" "+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w;}else line=t;});
    out.push(line);
  });
  return out;
}
async function compose(svg,o){
  try{await document.fonts.load('700 20px "Familjen Grotesk"');await document.fonts.load('400 20px "Familjen Grotesk"');}catch(e){}
  var img=await loadImg(svgUrl(svg));
  var letter=o.mode==="print",W=letter?Math.round(o.size[2]/25.4*300):1400,u=W/100,qr=(letter?70:84)*u,fa=7*u,fb=4.6*u,gap=4*u,maxW=84*u;
  var cv=document.createElement("canvas"),ctx=cv.getContext("2d"),F='"Familjen Grotesk",system-ui,sans-serif';
  ctx.font="700 "+fa+"px "+F;var la=o.above?wrap(ctx,o.above,maxW):[];
  ctx.font="400 "+fb+"px "+F;var lb=o.below?wrap(ctx,o.below,maxW):[];
  var ha=la.length*fa*1.2,hb=lb.length*fb*1.25,total=(ha?ha+gap:0)+qr+(hb?hb+gap:0);
  var H=letter?Math.round(o.size[3]/25.4*300):total+16*u,y=letter?(H-total)/2:8*u;
  cv.width=W;cv.height=Math.round(H);
  ctx.fillStyle=letter?"#fff":o.bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=textColor(o.mode,o.bg);ctx.textAlign="center";ctx.textBaseline="middle";
  if(la.length){ctx.font="700 "+fa+"px "+F;la.forEach(function(l,i){ctx.fillText(l,W/2,y+fa*1.2*(i+.5));});y+=ha+gap;}
  ctx.drawImage(img,(W-qr)/2,y,qr,qr);y+=qr+gap;
  if(lb.length){ctx.font="400 "+fb+"px "+F;lb.forEach(function(l,i){ctx.fillText(l,W/2,y+fb*1.25*(i+.5));});}
  return new Promise(function(res,rej){cv.toBlob(function(b){b?res(b):rej(new Error("png"))},"image/png");});
}

// Saves a string (SVG) or Blob (PNG) to the user's device.
function downloadFile(name,data){
  var blob=data instanceof Blob?data:new Blob([data],{type:"image/svg+xml"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
}

export { lum, contrast, normUrl, buildQR, toSvg, compose, textColor, downloadFile };
