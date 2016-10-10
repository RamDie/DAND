from __future__ import division
from sklearn.cross_validation import cross_val_score
import numpy as np

def computeFraction( poi_messages, all_messages ):
    """ given a number messages to/from POI (numerator) 
        and number of all messages to/from a person (denominator),
        return the fraction of messages to/from that person
        that are from/to a POI
   """

    fraction = 0.
    
    if (all_messages != 0) and (all_messages != 'NaN'):
        fraction = poi_messages / all_messages

    return fraction


def algorithm_evaluation(clf, features, labels, nfolds, metric):
    """" Evaluate the algorithm according a metric (i.e.: recall, precision, f1) """

    features_np = np.array(features)
    labels_np = np.array(labels)
    scores = cross_val_score(clf,features_np,labels_np,cv=nfolds,scoring=metric)
    print metric + ': ' + str(scores.mean())

    return scores.mean()

def find_outliers(data, names, m):
    """ Functions for detecting outliers"""
    
    u = np.mean(data)
    s = np.std(data)
    filtered = [names[ind] for ind, e in enumerate(data) if not (u - m * s < e < u + m * s)]
    return filtered

def outliers_by(feature):
    data = np.array([])
    names = []
    # Feature List is buit
    for name in data_dict:      
        data_point = data_dict[name]
        if (not data_point['poi'] and not math.isnan(float(data_point[feature]))):
            names.append(name)
            data = np.append(data,data_point[feature])

    # Searching for outliers
    return find_outliers(data, names, 2)    