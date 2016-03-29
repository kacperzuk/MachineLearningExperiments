# -*- coding: utf-8 -*-

import numpy as np
import cPickle as pickle
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.cross_validation import train_test_split

# 2. Pobranie danych
raw_X = np.load("../../Test Data/2016-03-24/ratio_25/training_features.npy")
raw_X = raw_X.astype("float64")
raw_y = np.load("../../Test Data/2016-03-24/ratio_25/bots.npy")

X_train, X_test, y_train, y_test = train_test_split(raw_X, raw_y, test_size = 0.4, random_state = 5)

clf = SVC(kernel='rbf', C=1000, gamma=0.005, coef0=0.0)
clf.fit(X_train, y_train)
pred = clf.predict(X_test)
acc = accuracy_score(pred, y_test)

# 10. Wynik
print "Accuracy:",acc

# 11. Zapisanie modelu
with open("model.pickle", "wb") as f:
  pickle.dump(clf, f, 2);
