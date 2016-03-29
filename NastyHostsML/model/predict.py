# -*- coding: utf-8 -*-

import cPickle as pickle
import numpy as np
import featureExtraction as fe

with open("model/model.pickle", "rb") as f:
  clf = pickle.load(f)

def predict(facade_data):
  features = fe.processSample(facade_data)
  X = np.array([features])
  pred = clf.predict(X)
  return pred
