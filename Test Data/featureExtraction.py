from data import samples
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction import DictVectorizer
import numpy as np
vec = DictVectorizer()
vectorizer = CountVectorizer(min_df=1)
outputIp = []
hostnames = []
ports = [22,25,80,443,8080]#otwarte porty jakie bierzemy pod uwage


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
		print(j)
		for i,z in enumerate(y):
			for key in y[z]:
				if isinstance(y[z][key],list):
					d[z + str(j) + key] = "".join(y[z][key])
				else:
					d[z + str(j) + key] = y[z][key]
	newDict.append(d)		
#transformacja slownika na macierz liczb
Y = vec.fit_transform(newDict)
Y = Y.toarray()

#stworzenie listy wszystkich hostname'ow
for x in samples:
	if len(x["hostnames"]) == 0:
		hostnames.append("")
	else:
		hostnames.append(x["hostnames"][0])

#transformacja na macierz liczb
X = vectorizer.fit_transform(hostnames)
X = X.toarray()
#stowrzenie macierzy nxm gdzie n -liczba probek m - ilosc feature'ow
for i,val in enumerate(samples):
	foo = ([int(y) for y in val["ip"].split(".")])	
	foo = foo + [n for n in X[i]] + [m for m in Y[i]] + [int(x  in val["ports"]) for x in ports] 
	outputIp.append(foo)
 
# print(outputIp)

