from data import samples
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
vectorizer = CountVectorizer(min_df=1)
# outputIp = np.zeros(shape = [len(samples),4])
outputIp = []

hostnames = []



for x in samples:
	if len(x["hostnames"]) == 0:
		hostnames.append("")
	else:
		[hostnames.append(y) for y in x["hostnames"]]

X = vectorizer.fit_transform(hostnames)
X = X.toarray()
print(X[1][2])
for i,val in enumerate(samples):
	foo = ([int(y) for y in val["ip"].split(".")])
	m = []
	
	foo = foo + [n for n in X[i]] + [n for n in val["ports"]]
	outputIp.append(foo)
 
print(outputIp)
