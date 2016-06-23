# -*- coding: utf-8 -*-

import cPickle as pickle
import numpy as np
import featureExtraction as fe

with open("model.pickle", "rb") as f:
  clf, normalizer = pickle.load(f)

def predict(facade_data):
  features = fe.processSample(facade_data)
  X = normalizer.transform(np.array([features]))
  pred = clf.predict(X)
  return pred
