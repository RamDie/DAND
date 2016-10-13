#!/usr/bin/python

import sys
import pickle
sys.path.append("../tools/")

from feature_format import featureFormat, targetFeatureSplit
from tester import dump_classifier_and_data

################################################
###        Task 1: Feature Selection.        ###
################################################

features_list = ['poi','salary', 'total_payments', 'loan_advances', 'long_term_incentive',  'fraction_from_poi', 'fraction_to_poi', 
				  'deferral_payments', 'bonus',  'restricted_stock_deferred', 'deferred_income', 'total_stock_value', 'expenses', 
				  'exercised_stock_options',  'restricted_stock', 'director_fees', 'other']

### Load the dictionary containing the dataset
with open("final_project_dataset.pkl", "r") as data_file:
    data_dict = pickle.load(data_file)

################################################
### 		Task 2: Remove outliers			 ###
################################################

#These three outliers were found by visualizing the dataset
data_dict.pop("TOTAL")
data_dict.pop("THE TRAVEL AGENCY IN THE PARK")
data_dict.pop("LOCKHART EUGENE E")

#These outliers were found by using the functions "outliers_by" and "find_ouliers" included in my_function.py
#Only NO-POI are Discarded (in order to ensure this, the function outliers_by takes into account the boolean data_point['poi'] )
data_dict.pop("FREVERT MARK A")
data_dict.pop("LAVORATO JOHN J")
data_dict.pop("BHATNAGAR SANJAY")
data_dict.pop("MARTIN AMANDA K")
data_dict.pop("ALLEN PHILLIP K")
data_dict.pop("BAXTER JOHN C")
data_dict.pop("WHITE JR THOMAS E")
data_dict.pop("PAI LOU L")
data_dict.pop("REDMOND BRIAN L")
data_dict.pop("DIMICHELE RICHARD G")
data_dict.pop("DERRICK JR. JAMES V")


################################################
### 	Task 3: Create new feature(s)    	 ###
################################################

from my_functions import computeFraction

for name in data_dict:	
	data_point = data_dict[name]

	data_point["fraction_from_poi"] = computeFraction( data_point["from_poi_to_this_person"], data_point["to_messages"] )
	data_point["fraction_to_poi"] = computeFraction( data_point["from_this_person_to_poi"], data_point["from_messages"] )

### Store to my_dataset for easy export below.
my_dataset = data_dict

### Extract features and labels from dataset for local testing
data = featureFormat(my_dataset, features_list, sort_keys = True)
labels, features = targetFeatureSplit(data)


### Once outliers are removed and new features are created, a new feature selection is made using SelectKBest
from sklearn.feature_selection import SelectKBest
SB = SelectKBest(k=6)

SB.fit_transform(features, labels)

from itertools import compress

features_list = [features_list[0]] + list(compress(features_list[1:], SB.get_support()))


### Extract features and labels from dataset for local testing
data = featureFormat(my_dataset, features_list, sort_keys = True)
labels, features = targetFeatureSplit(data)


################################################
###	 Task 4: Try a varity of classifiers     ###
################################################

from sklearn import tree
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler


scaler = StandardScaler()
pca = PCA(n_components=1)

# ### Decision Tree with arguments determined by using GridSearchCV
clf_tree = tree.DecisionTreeClassifier(splitter='random', criterion='gini', max_depth=4, min_samples_leaf=1, min_samples_split=1, random_state=42)

tree_pipe = Pipeline(steps=[('scaler',scaler),('pca', pca),('tree', clf_tree)])

### SVM with arguments determined by using GridSearchCV
clf_svm = SVC(kernel='rbf', C=1, gamma=1.0)

svm_pipe = Pipeline(steps=[('scaler',scaler),('pca', pca),('svm', clf_svm)])


################################################ 
### 	Task 5: Classifier tuning	 		 ###
################################################ 

## The best classifier is selected.

from my_functions import algorithm_evaluation

algorithms = [tree_pipe, svm_pipe]

max_score = 0

for ind, clf in enumerate(algorithms):
	score = algorithm_evaluation(clf, features, labels, 10, 'f1')
	if score >= max_score:	
		max_score = score
		best_algorithm = ind

clf = algorithms[best_algorithm]

###########################################################
### Task 6: Dump classifier, dataset, and features_list ###
###########################################################

dump_classifier_and_data(clf, my_dataset, features_list)