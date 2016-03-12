# -*- coding: utf8 -*-
from data import samples
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction import DictVectorizer
from sklearn.cluster import FeatureAgglomeration
from sklearn.svm import SVC
from sklearn import svm
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
# from scipy.sparse import coo_matrix, hstack, vstack
import scipy.io



vec = DictVectorizer()
#vectorizer = CountVectorizer(analyzer='char',ngram_range=(1, 3),min_df=1)
vectorizer = HashingVectorizer(analyzer='char',ngram_range=(3,3))
outputIp = []
hostnames = []
bots = []
openPorts =[11,22,33] #https://api.shodan.io/shodan/ports#otwarte porty jakie bierzemy pod uwage
ports = []
keyWords = ["vpn"]
newDict = [] 
whois = []
#lista wszystkich whois
#te petle tworza niezagniezdzone slowniki z whoisa. Z racji ze w whois moze byc 2 odpowiedzi
#nowe unikalne klucze towrzne sa :element whoisa - z ( data lub server), inedx elementu whoisa j
#stary klucz - key
#przyklad : server0host : "whois.arin.net"
# jesli jakis element jest tablica np klucz comment, nowa wartość klucza np data0comment to
# polaczenie wszyzstkich elementow tej tablicy
X = np.array([])
for index,val in enumerate(samples):
	dataItem = [0] * len(keyWords)
	bots.append(int(val["bot"]))
	data = val["data"]
	whois = data["whois"]
	dnsbl = data["dnsbl"]
	blacklists = dnsbl["blacklists"]
	shodanFeature = data["shodan"]
	shodan = shodanFeature["shodan"]
	#whois
	if whois["whois"] is not None:
		for j,y in enumerate(whois["whois"]):
			for i,z in enumerate(y):
				for key in y[z]:
					for k,word in enumerate(keyWords):
						if word in str(y[z][key]):
							++dataItem[k]
	# #hostnames
	revdns = data["revdns"]
	for k,word in enumerate(keyWords):
		if len(revdns["hostnames"]) != 0:
			if word in str(revdns["hostnames"][0]):
				++dataItem[k]

	try:
		dataItem + [int(y) for y in val["ip"].split(".")]
	except Exception, e:
		dataItem + [0,0,0,0]
	#ports
	p = []
	for x in openPorts:
		if shodan is not None:
			if "ports" in shodan.keys():
  				dataItem.append(int(x  in shodan["ports"]))
 			else:
 				dataItem.append(0)
 		else:
 			dataItem.append(0)	
 	# dataItem.append(p)


	#dnsbl
	for key in blacklists:
		# d[key] = int(blacklists[key])
		dataItem.append(int(blacklists[key]))


	Y = np.array([dataItem])
	if index == 0:
		X = np.array([dataItem])
	else:
		X = np.vstack((X,Y))
	

###############################################################################
# zapis do pliku
###############################################################################
np.save("bots", bots)
np.save("training_features",X)
# scipy.io.mmwrite("training_features", X)

print X.shape