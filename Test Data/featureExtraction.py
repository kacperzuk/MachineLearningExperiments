from data import samples
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction import DictVectorizer
import numpy as np
vec = DictVectorizer()
vectorizer = CountVectorizer(min_df=1)
outputIp = []
hostnames = []
ports = [22,25,80,443,8080]


newDict = []
for val in samples:
	d = {}
	for j,y in enumerate(val["whois"]):
		for i,z in enumerate(y):
			for key in y[z]:
				if isinstance(y[z][key],list):
					d[z + str(i) + key] = "".join(y[z][key])
				else:
					d[z + str(i) + key] = y[z][key]
	newDict.append(d)		

Y = vec.fit_transform(newDict)
Y = Y.toarray()

for x in samples:
	if len(x["hostnames"]) == 0:
		hostnames.append("")
	else:
		hostnames.append(x["hostnames"][0])

X = vectorizer.fit_transform(hostnames)
X = X.toarray()
for i,val in enumerate(samples):
	foo = ([int(y) for y in val["ip"].split(".")])	
	foo = foo + [n for n in X[i]] + [m for m in Y[i]] + [int(x  in val["ports"]) for x in ports] 
	outputIp.append(foo)
 
# print(outputIp)

