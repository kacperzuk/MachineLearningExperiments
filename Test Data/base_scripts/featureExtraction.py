# -*- coding: utf8 -*-
from data import samples
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction import DictVectorizer
from sklearn.cluster import FeatureAgglomeration
from sklearn.svm import SVC
from sklearn import svm
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from scipy.sparse import coo_matrix, hstack
import scipy.io



vec = DictVectorizer()
#vectorizer = CountVectorizer(analyzer='char',ngram_range=(1, 3),min_df=1)
vectorizer = HashingVectorizer(analyzer='char',ngram_range=(3,3))
outputIp = []
hostnames = []
bots = []
openPorts = https://api.shodan.io/shodan/ports#otwarte porty jakie bierzemy pod uwage
ports = []
newDict = [] #lista wszystkich whois
#te petle tworza niezagniezdzone slowniki z whoisa. Z racji ze w whois moze byc 2 odpowiedzi
#nowe unikalne klucze towrzne sa :element whoisa - z ( data lub server), inedx elementu whoisa j
#stary klucz - key
#przyklad : server0host : "whois.arin.net"
# jesli jakis element jest tablica np klucz comment, nowa wartość klucza np data0comment to
# polaczenie wszyzstkich elementow tej tablicy
for val in samples:
	bots.append(int(val["bot"]))
	d = {}
	data = val["data"]
	whois = data["whois"]
	dnsbl = data["dnsbl"]
	blacklists = dnsbl["blacklists"]
	shodanFeature = data["shodan"]
	shodan = shodanFeature["shodan"]

	#hostnames
	revdns = data["revdns"]
	if len(revdns["hostnames"]) == 0:
		hostnames.append("")
	else:
		hostnames.append(revdns["hostnames"][0])

	#dnsbl
	for key in blacklists:
		d[key] = int(blacklists[key])

	#ports
	p = []
	for x in openPorts:
		if shodan is not None:
			if "ports" in shodan.keys():
  				p.append(int(x  in shodan["ports"]))
 			else:
 				p.append(0)
 		else:
 			p.append(0)	
 	ports.append(p)

	#whois
	if whois["whois"] is not None:
		for j,y in enumerate(whois["whois"]):
			for i,z in enumerate(y):
				for key in y[z]:
					if isinstance(y[z][key],list):
						d[z + str(j) + key] = "".join(y[z][key])
					else:
						d[z + str(j) + key] = y[z][key]
	newDict.append(d)

################################################################################
#transformacja listy hostname'ow w macierz liczb
################################################################################
X = vectorizer.transform(hostnames)

################################################################################
#stworzenie macierzy rzadkich (sparse amtrix) dla kazdego elementu whois'a
#i dodanie go do istniejącej macierzy wyników (hstack)
################################################################################

for i,key in enumerate(newDict[0]):
 result = []
 for item in newDict:
  if key in item.keys():
   result.append(str(item[key]))
  else:
   result.append("")

 T = vectorizer.transform(result)
 X = hstack([X,T])

###############################################################################
#stworzenie macierzy ip
###############################################################################

ip = []
for i,val in enumerate(samples):
	try:
		ip.append([int(y) for y in val["ip"].split(".")])
	except Exception, e:
		ip.append([0,0,0,0])
X = hstack([X,ip])

###############################################################################
# dodanie portów 
###############################################################################
X = hstack([X,ports])



###############################################################################
# zapis do pliku
###############################################################################
np.save("bots", bots)
scipy.io.mmwrite("training_features", X)

