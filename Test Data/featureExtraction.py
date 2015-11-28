from data import samples
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
vectorizer = CountVectorizer(min_df=1)
# outputIp = np.zeros(shape = [len(samples),4])
outputIp = []

for val in samples:
	foo = []
	foo.append([int(y) for y in val["ip"].split(".")])
	hosts = val["hostnames"]
	if len(hosts) == 0:
		foo.append([])
	else:
		foo.append(vectorizer.fit_transform(hosts))
	outputIp.append(foo)
 
print(outputIp)

