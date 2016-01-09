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

vec = DictVectorizer()
#vectorizer = CountVectorizer(analyzer='char',ngram_range=(1, 3),min_df=1)
vectorizer = HashingVectorizer(analyzer='char',ngram_range=(3,3))
outputIp = []
hostnames = []
openPorts = [22,25,80,443,8080]#otwarte porty jakie bierzemy pod uwage


newDict = [] #lista wszystkich whois
#te petle tworza niezagniezdzone slowniki z whoisa. Z racji ze w whois moze byc 2 odpowiedzi
#nowe unikalne klucze towrzne sa :element whoisa - z ( data lub server), inedx elementu whoisa j
#stary klucz - key
#przyklad : server0host : "whois.arin.net"
# jesli jakis element jest tablica np klucz comment, nowa wartość klucza np data0comment to
# polaczenie wszyzstkich elementow tej tablicy
for val in samples:
	d = {}
	for j,y in enumerate(val["whois"]):
		for i,z in enumerate(y):
			for key in y[z]:
				if isinstance(y[z][key],list):
					d[z + str(j) + key] = "".join(y[z][key])
				else:
					d[z + str(j) + key] = y[z][key]
	newDict.append(d)

################################################################################
#stworzenie listy wszystkich hostname'ow
################################################################################
for x in samples:
	if len(x["hostnames"]) == 0:
		hostnames.append("")
	else:
		hostnames.append(x["hostnames"][0])

#transformacja na macierz liczb
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
 ip.append([int(y) for y in val["ip"].split(".")])
X = hstack([X,ip])

###############################################################################
# stworznie macierzy portów
###############################################################################

ports = []
for i,val in enumerate(samples):
 p = []
 for x in openPorts:
  p.append(int(x  in val["ports"]))
 ports.append(p)

X = hstack([X,ports])
