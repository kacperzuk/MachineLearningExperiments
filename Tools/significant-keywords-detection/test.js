"use strict";

// todo: multiprocessing

const significant_keywords = ["abo","acces","adsl","ahmed","amazon","amazonaws","amzn","ao","aq","area","arm","armateo","asn","avangard","avangarddsl","bd","beeline","bh","broad","broadband","bsnl","bt","business","cab","cable","cantv","case","cert","changes","chu","cloud","cm","comcast","company","compute","correct","csirt","customers","describes","details","dial","dialup","dnic","dnw","dnwplg","dos","dt","dtac","dtd","dynamic","dynamicip","elt","esp","eur","flood","fp","fpt","fregat","fttb","gate","gener","generic","genericrev","gg","globet","globetel","gp","gprs","gsm","gvt","haitt","handle","hinet","hs","hsd","hst","identify","idnic","infium","infiumhost","infra","internet","iof","iofl","ioflood","issue","issues","italy","izh","jc","jor","jt","jtotech","kb","kht","kin","kk","knet","kornet","kp","krn","krnic","kuban","kyiv","kyivstar","kz","lake","lane","leadertelecom","level","like","lir","live","mailbox","mateo","matters","md","mega","mgts","mig","mk","mna","mob","mobil","mobile","modified","mts","mtu","munir","mz","nev","nodes","nodesdirect","oit","opl","oran","orange","orsk","ote","outlook","ovh","ovs","packe","people","peoplenet","pinspb","pk","point","pool","postmaster","ptc","ptcl","ptn","quan","quant","quantil","quick","quickpacket","radio","registrobr","retail","revip","rue","sal","sam","same","servers","set","seti","sib","sibir","sid","sil","sky","sn","snet","snl","spbnit","speed","subpoena","subpoenas","subs","subsidiary","svyaz","svyazinform","swip","tedata","telecomitalia","telecommunication","telekom","telemar","telesp","telkomsel","that","these","tien","tiennd","tis","totisp","true","truong","truongpd","twnic","uic","ukrtel","umc","unable","ural","uu","veloxzone","vh","viettel","vip","virtua","vivo","vodafone","vp","vs","vt","was","wp","xtglobal","zone","zp"];
const reduced_keywords = [];
significant_keywords.forEach((candidate) => {
  if(Array.from(significant_keywords).every((keyword) => {
    let ret = candidate.indexOf(keyword) === -1 || candidate === keyword;
    if(candidate == "ovh" && !ret) console.log(keyword);
    return ret;
  }))
  reduced_keywords.push(candidate);
});
