# -*- coding: utf8 -*-
import numpy as np

def processSample(sample):
  features = []
  data = sample["data"]
  keyword_features = [0] * len(keyWords)

  # keywords from whois
  raw_whois = data["whois"]["whois"]
  if raw_whois is not None:
    for server in raw_whois:
      for whois_field in server["data"].values():
        for keyword_index, keyword in enumerate(keyWords):
          if keyword in whois_field:
            ++keyword_features[keyword_index]

  # keywords from hostnames
  revdns = data["revdns"]["hostnames"]
  for hostname in revdns:
    for keyword_index, keyword in enumerate(keyWords):
      if keyword in hostname:
        ++keyword_features[keyword_index]

  features += keyword_features

  # parse IP
  features += [int(y) for y in sample["ip"].split(".")]

  # open ports
  shodan = data["shodan"]["shodan"]
  for port in openPorts:
    if shodan is not None and "ports" in shodan:
      features.append(int(port in shodan["ports"]))
    else:
      features.append(0)

  # dnsbls
  blacklists = data["dnsbl"]["blacklists"]
  for key in blacklists:
    features.append(int(blacklists[key]))

  return features

def process():
  from data import samples
  print("Processing {} samples...".format(len(samples)))
  X = []
  Y = []

  for sample in samples:
    Y.append(int(sample["bot"]))
    X.append(processSample(sample))

  X = np.array(X)
  Y = np.array(Y)

  ###############################################################################
  # zapis do pliku
  ###############################################################################
  np.save("bots", Y)
  np.save("training_features", X)

  print("Number of features: {}".format(X.shape[1]));


openPorts = [7, 11, 13, 15, 17, 19, 21, 22, 23, 25, 26, 37, 49, 53, 67, 69, 79, 80, 81, 82, 83, 84, 88, 102, 110, 111, 119, 123, 129, 137, 143, 161, 175, 179, 195, 311, 389, 443, 444, 445, 465, 500, 502, 503, 515, 520, 523, 554, 587, 623, 626, 631, 666, 771, 789, 873, 902, 992, 993, 995, 1010, 1023, 1025, 1099, 1177, 1200, 1234, 1311, 1434, 1471, 1604, 1723, 1777, 1883, 1900, 1911, 1962, 1991, 2000, 2067, 2082, 2083, 2086, 2087, 2123, 2152, 2181, 2222, 2323, 2332, 2375, 2376, 2404, 2455, 2480, 2628, 3000, 3128, 3306, 3386, 3388, 3389, 3460, 3541, 3542, 3689, 3749, 3780, 3784, 3790, 4000, 4022, 4040, 4063, 4064, 4369, 4443, 4444, 4500, 4567, 4848, 4911, 4949, 5000, 5001, 5006, 5007, 5008, 5009, 5060, 5094, 5222, 5269, 5353, 5357, 5432, 5555, 5560, 5577, 5632, 5672, 5900, 5901, 5984, 5985, 5986, 6000, 6379, 6664, 6666, 6667, 6881, 6969, 7071, 7218, 7474, 7547, 7548, 7657, 7777, 7779, 8000, 8010, 8060, 8069, 8080, 8081, 8086, 8087, 8089, 8090, 8098, 8099, 8112, 8139, 8140, 8181, 8333, 8334, 8443, 8554, 8649, 8834, 8880, 8888, 8889, 9000, 9001, 9002, 9051, 9080, 9100, 9151, 9160, 9191, 9200, 9443, 9595, 9600, 9943, 9944, 9981, 9999, 10000, 10001, 10243, 11211, 12345, 13579, 14147, 16010, 17000, 18245, 20000, 20547, 21025, 21379, 23023, 23424, 25105, 25565, 27015, 27017, 28017, 30718, 32400, 32764, 37777, 44818, 47808, 49152, 49153, 50070, 50100, 51106, 55553, 55554, 62078, 64738]

keyWords = ["abo","acces","adsl","ahmed","amazon","ao","aq","area","arm","avangard","bd","beeline","bh","broad","bt","business","cab","cantv","case","cert","changes","chu","c loud","cm","comcast","company","compute","correct","csirt","customers","depo","describes","details","dial","dnic","dnw","dos","dt","dyn","elt","email","esp","eur","flood","fp","fregat","fttb","g ate","gener","gg","globet","gp","gsm","hai","handle","hinet","hs","identify","infium","infra","internet","iof","issue","italy","izh","jc","jor","jt","kb","kht","kin","kk","knet","kornet","kp","k rn","kuban","kyiv","kz","lake","lane","leadertelecom","level","like","lir","live","luga","mailbox","mateo","md","mega","mgts","mig","mk","mna","mob","modified","mts","mtu","munir","mz","nev","no des","oit","opl","oran","orsk","ote","outlook","packe","pinspb","pk","point","pool","postmaster","ptc","ptn","quan","radio","registrobr","retail","rue","sal","sam","servers","set","sib","sid","s il","sky","sn","spbnit","speed","street","subpoena","subs","svyaz","swip","tedata","telecomitalia","telecommunication","telekom","telemar","telkomsel","that","these","tien","tis","truong","tte", "twnic","uic","ukrtel","umc","unable","ural","uu","vh","vip","virtua","vivo","vodafone","vp","vs","vt","was","wp","xtglobal","zone","zp"]


if __name__ == '__main__':
  process()
