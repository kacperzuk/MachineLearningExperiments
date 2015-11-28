from data import samples
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
vectorizer = CountVectorizer(min_df=1)
outputIp = []
hostnames = []
ports = [22,25,80,443,8080]
for x in samples:
	if len(x["hostnames"]) == 0:
		hostnames.append("")
	else:
		hostnames.append(x["hostnames"][0])

X = vectorizer.fit_transform(hostnames)
X = X.toarray()
for i,val in enumerate(samples):
	foo = ([int(y) for y in val["ip"].split(".")])	
	foo = foo + [n for n in X[i]] + [int(x  in val["ports"]) for x in ports] 
	outputIp.append(foo)
 
print(outputIp)
