import React, { useState, useMemo, useRef } from "react";
import { DEST, SIZES, QRC, BGC, IMGS } from "./data.js";
import { lum, contrast, normUrl, buildQR, toSvg, compose, textColor, downloadFile } from "./lib.js";

const h = React.createElement;

function App(){
  var _d=useState("gcal"),dest=_d[0],setDest=_d[1];
  var _u=useState(""),url=_u[0],setUrl=_u[1];
  var _i=useState("none"),imgId=_i[0],setImgId=_i[1];
  var _up=useState(""),upload=_up[0],setUpload=_up[1];
  var _f=useState(0),fgI=_f[0],setFgI=_f[1];
  var _b=useState(0),bgI=_b[0],setBgI=_b[1];
  var _m=useState("download"),mode=_m[0],setMode=_m[1];
  var _z=useState(0),szI=_z[0],setSzI=_z[1];
  var _a=useState(""),above=_a[0],setAbove=_a[1];
  var _w=useState(""),below=_w[0],setBelow=_w[1];
  var _s=useState(""),msg=_s[0],setMsg=_s[1];
  var fileRef=useRef(null);

  var D=DEST.filter(function(x){return x.id===dest})[0];
  var fg=QRC[fgI][1],bg=BGC[bgI][1],size=SIZES[szI];
  var link=normUrl(url);
  var logo=null,preset=null;
  if(imgId==="upload"&&upload)logo={data:upload};
  else if(imgId!=="none"&&imgId!=="upload"){preset=IMGS.filter(function(x){return x[0]===imgId})[0];logo={inner:preset[2]};}
  var ec=logo?"H":"Q";
  var qr=useMemo(function(){return buildQR(link,ec)},[link,ec]);
  var sample=useMemo(function(){return buildQR("https://example.com/book",ec)},[ec]);
  var ok=qr&&!qr.error;
  var svgP=toSvg(ok?qr:sample,fg,bg,logo);
  var svg=ok?svgP:"";
  var weak=contrast(fg,bg)<4||lum(fg)>lum(bg);
  var hostWarn=D.host&&link&&!D.host.test(link);
  var print=mode==="print";
  var tc=textColor(mode,bg);

  function pickFile(e){
    var f=e.target.files&&e.target.files[0];if(!f)return;
    var r=new FileReader();r.onload=function(){setUpload(r.result);setImgId("upload");};r.readAsDataURL(f);e.target.value="";
  }
  function onImg(e){var v=e.target.value;if(v==="upload"){if(upload)setImgId("upload");else fileRef.current.click();}else setImgId(v);}
  function pasteLink(){
    try{navigator.clipboard.readText().then(function(t){setUrl(t.trim());setMsg("");},function(){setMsg("Couldn't read the clipboard. Click in the Link box and paste with Ctrl+V (or press and hold on a phone).");});}
    catch(e){setMsg("Couldn't read the clipboard. Click in the Link box and paste with Ctrl+V (or press and hold on a phone).");}
  }
  function save(name,data){downloadFile(name,data);setMsg("Downloaded "+name);}
  var opts={mode:mode,above:above.trim(),below:below.trim(),bg:bg,size:size};
  function dlPng(){compose(svg,opts).then(function(b){save(print?"qr-"+size[0]+".png":"qr-code.png",b)},function(){setMsg("Couldn't create the image.")});}
  function dlSvg(){save("qr-code.svg",svg);}
  function copyPng(){compose(svg,opts).then(function(b){return navigator.clipboard.write([new ClipboardItem({"image/png":b})])}).then(function(){setMsg("Image copied.")},function(){setMsg("Copying isn't allowed here. Use Download instead.")});}
  function doPrint(){try{window.print();setMsg("If no print dialog opened, download the sheet and print the image.");}catch(e){setMsg("Printing is blocked here. Download the sheet and print the image.");}}

  function colorSel(id,label,list,val,set){
    return h("div",null,h("label",{htmlFor:id},label),h("div",{className:"sel"},
      h("select",{id:id,value:val,onChange:function(e){set(+e.target.value)}},list.map(function(c,i){return h("option",{key:c[0],value:i},c[0])})),
      h("span",{className:"sw",style:{background:list[val][1]},"aria-hidden":"true"})));
  }

  var thumb=h("span",{className:"thumb","aria-hidden":"true"},
    imgId==="upload"&&upload?h("img",{src:upload,alt:""}):preset?h("svg",{viewBox:"0 0 100 100",dangerouslySetInnerHTML:{__html:preset[2]}}):"None");

  var help=dest==="gcal"?h("details",{className:"help"},h("summary",null,"Help me find my Google Calendar booking link"),
      h("ol",null,
        h("li",null,h("a",{href:"https://calendar.google.com",target:"_blank",rel:"noopener noreferrer"},"Open Google Calendar"),", signed in to the account you use for school."),
        h("li",null,"On the left, look under \"Booking pages\" and hover over your page. No booking page yet? Click Create, choose Appointment schedule, fill it in, and save."),
        h("li",null,"Click the Copy link icon next to your booking page."),
        h("li",null,"Come back here and press \"Paste copied link\" below.")),
      h("div",{className:"hint"},"If you don't see Appointment schedule, your school may have turned it off. Try Calendly or a custom link instead."))
    :dest==="cal"?h("details",{className:"help"},h("summary",null,"Help me find my Calendly link"),
      h("ol",null,
        h("li",null,h("a",{href:"https://calendly.com",target:"_blank",rel:"noopener noreferrer"},"Open Calendly"),", then log in."),
        h("li",null,"Open Scheduling, then Event types."),
        h("li",null,"Click Copy link on the event you want parents to book."),
        h("li",null,"Come back here and press \"Paste copied link\" below."))):null;

  var left=h("div",{className:"panel"},
    h("h2",null,"Where should the code go?"),
    h("label",{htmlFor:"dest"},"Booking page"),
    h("select",{id:"dest",value:dest,onChange:function(e){setDest(e.target.value)}},DEST.map(function(x){return h("option",{key:x.id,value:x.id},x.name)})),
    h("label",{htmlFor:"url"},"Link"),
    h("input",{id:"url",type:"text",inputMode:"url",value:url,placeholder:D.ph,onChange:function(e){setUrl(e.target.value)}}),
    h("div",{className:"mini"},h("button",{className:"lnk",onClick:pasteLink},"Paste copied link"),url&&h("button",{className:"lnk",onClick:function(){setUrl("")}},"Clear")),
    h("div",{className:"hint"},D.hint),
    hostWarn&&h("div",{className:"warn",role:"status"},"That doesn't look like a "+D.name+" link. Check it, or choose Custom link."),
    help,
    h("h2",null,"Picture in the middle"),
    h("div",{className:"sel"},
      h("select",{id:"img","aria-label":"Picture in the middle",value:imgId,onChange:onImg},
        h("option",{value:"none"},"None"),
        IMGS.map(function(m){return h("option",{key:m[0],value:m[0]},m[1])}),
        h("option",{value:"upload"},upload?"My uploaded image":"Upload my own…")),
      thumb),
    imgId==="upload"&&h("div",{className:"mini"},h("button",{className:"lnk",onClick:function(){fileRef.current.click()}},"Choose a different image")),
    h("input",{ref:fileRef,type:"file",accept:"image/*",hidden:true,onChange:pickFile}),
    h("div",{className:"hint"},"Test-scan your code with a phone after adding a picture."),
    h("h2",null,"Colors"),
    h("div",{className:"row"},colorSel("fg","QR Code Color",QRC,fgI,setFgI),colorSel("bg","Background",BGC,bgI,setBgI)),
    weak&&h("div",{className:"warn",role:"status"},"Low contrast. Pick a darker code color or a lighter background so phones can scan it."),
    h("h2",null,"Text and layout"),
    h("label",{htmlFor:"above"},"Text above"),
    h("input",{id:"above",type:"text",value:above,placeholder:"Book a conference with Ms. Rivera",onChange:function(e){setAbove(e.target.value)}}),
    h("label",{htmlFor:"below"},"Text below"),
    h("input",{id:"below",type:"text",value:below,placeholder:"Scan with your phone camera",onChange:function(e){setBelow(e.target.value)}}),
    h("label",null,"Use it for"),
    h("div",{className:"seg",role:"group","aria-label":"Output"},
      h("button",{"aria-pressed":!print,onClick:function(){setMode("download")}},"Download"),
      h("button",{"aria-pressed":print,onClick:function(){setMode("print")}},"Print on a full page")),
    print&&h("div",null,h("label",{htmlFor:"size"},"Paper size"),
      h("select",{id:"size",value:szI,onChange:function(e){setSzI(+e.target.value)}},SIZES.map(function(z,i){return h("option",{key:z[0],value:i},z[1])})))
  );

  var ratio=size[2]/size[3];
  var sheetStyle=print?{background:"#fff",color:tc,aspectRatio:size[2]+"/"+size[3],width:"min(100%,400px,calc(62vh*"+ratio.toFixed(4)+"))","--pw":size[2]+"mm","--ph":size[3]+"mm"}
                      :{background:bg,color:tc,width:"min(100%,400px)"};
  var ovText=qr&&qr.error?"That link is too long for one QR code. Use a shorter link.":"Paste your booking link and the code appears here";
  var preview=h("div",{id:"sheet",className:"paper "+(print?"letter":"card")+(ok?"":" sample"),style:sheetStyle},
      above.trim()&&h("div",{className:"ta"},above.trim()),
      h("div",{className:"qrwrap",style:{width:(print?70:84)+"cqw"},role:"img","aria-label":ok?"QR code preview":"Sample page preview"},
        h("div",{dangerouslySetInnerHTML:{__html:svgP}}),
        !ok&&h("div",{className:"ov"},ovText)),
      below.trim()&&h("div",{className:"tb"},below.trim()));

  var right=h("div",{className:"panel sticky"},
    print&&h("style",null,"@page{size:"+size[2]+"mm "+size[3]+"mm;margin:0}"),
    preview,
    h("div",{className:"actions"},
      print?[h("button",{key:"p",className:"btn",disabled:!ok,onClick:doPrint},"Print"),h("button",{key:"d",className:"btn alt",disabled:!ok,onClick:dlPng},"Download sheet")]
           :[h("button",{key:"d",className:"btn",disabled:!ok,onClick:dlPng},"Download PNG"),h("button",{key:"s",className:"btn alt",disabled:!ok,onClick:dlSvg},"Download SVG"),h("button",{key:"c",className:"btn alt",disabled:!ok,onClick:copyPng},"Copy image")]),
    h("div",{className:"status",role:"status","aria-live":"polite"},msg));

  return h("div",null,h("h1",null,"Booking QR code maker"),h("p",{className:"sub"},"Turn your Google Calendar or Calendly page into a code parents can scan. Print it or share it."),h("div",{className:"grid"},left,right));
}

export default App;
