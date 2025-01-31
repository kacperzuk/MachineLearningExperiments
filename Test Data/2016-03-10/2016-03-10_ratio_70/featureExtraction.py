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
openPorts = [7, 11, 13, 15, 17, 19, 21, 22, 23, 25, 26, 37, 49, 53, 67, 69, 79, 80, 81, 82, 83, 84, 88, 102, 110, 111, 119, 123, 129, 137, 143, 161, 175, 179, 195, 311, 389, 443, 444, 445, 465, 500, 502, 503, 515, 520, 523, 554, 587, 623, 626, 631, 666, 771, 789, 873, 902, 992, 993, 995, 1010, 1023, 1025, 1099, 1177, 1200, 1234, 1311, 1434, 1471, 1604, 1723, 1777, 1883, 1900, 1911, 1962, 1991, 2000, 2067, 2082, 2083, 2086, 2087, 2123, 2152, 2181, 2222, 2323, 2332, 2375, 2376, 2404, 2455, 2480, 2628, 3000, 3128, 3306, 3386, 3388, 3389, 3460, 3541, 3542, 3689, 3749, 3780, 3784, 3790, 4000, 4022, 4040, 4063, 4064, 4369, 4443, 4444, 4500, 4567, 4848, 4911, 4949, 5000, 5001, 5006, 5007, 5008, 5009, 5060, 5094, 5222, 5269, 5353, 5357, 5432, 5555, 5560, 5577, 5632, 5672, 5900, 5901, 5984, 5985, 5986, 6000, 6379, 6664, 6666, 6667, 6881, 6969, 7071, 7218, 7474, 7547, 7548, 7657, 7777, 7779, 8000, 8010, 8060, 8069, 8080, 8081, 8086, 8087, 8089, 8090, 8098, 8099, 8112, 8139, 8140, 8181, 8333, 8334, 8443, 8554, 8649, 8834, 8880, 8888, 8889, 9000, 9001, 9002, 9051, 9080, 9100, 9151, 9160, 9191, 9200, 9443, 9595, 9600, 9943, 9944, 9981, 9999, 10000, 10001, 10243, 11211, 12345, 13579, 14147, 16010, 17000, 18245, 20000, 20547, 21025, 21379, 23023, 23424, 25105, 25565, 27015, 27017, 28017, 30718, 32400, 32764, 37777, 44818, 47808, 49152, 49153, 50070, 50100, 51106, 55553, 55554, 62078, 64738] # otwarte porty jakie bierzemy pod uwage
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

