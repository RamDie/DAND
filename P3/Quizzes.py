
# coding: utf-8

# Quizzes
# =======

from pymongo import MongoClient

#Connection to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client.maps


# What is the number of documents?
# --------------------------------

db.nodos.find().count()


# What is the number of phones?
# -----------------------------


result = db.nodos.aggregate([{"$match":{"phone":{"$exists":1,"$not":{"$size":0}}}},{"$unwind":"$phone"},
                             {"$group":{"_id":"tot_phone","count":{"$sum":1}}}])

print('What is the number of phones?')
print(list(result))
print("\r")


# What is the number of postcodes?
# --------------------------------


result = db.nodos.aggregate([{"$match":{"postcode":{"$exists":1}}}, 
                           {"$group":{"_id":"postcodes","postcode_set":{ "$addToSet":"$postcode"}}},
                           {"$unwind":"$postcode_set"},{"$group":{"_id":"$_id","count":{"$sum":1}}}])

print('What is the number of postcodes?')
print(list(result))
print("\r")


# What is the number of phone codes?
# ----------------------------------

result = db.nodos.aggregate([{"$match":{"phonecode":{"$exists":1}}}, 
                           {"$group":{"_id":"phonecodes","phonecode_set":{ "$addToSet":"$phonecode"}}},
                           {"$unwind":"$phonecode_set"},{"$group":{"_id":"$_id","count":{"$sum":1}}}])

print('What is the number of phone codes?')
print(list(result))
print("\r")


# What is the number of streets?
# ------------------------------

result = db.nodos.aggregate([{"$match":{"street":{"$exists":1}}}, 
                             {"$group":{"_id":"streets","street_set":{ "$addToSet":"$street"}}},
                             {"$unwind":"$street_set"},{"$group":{"_id":"$_id","count":{"$sum":1}}}])

print('What is the number of streets?')
print(list(result))
print("\r")


# Is there a telation between Phone Code and PostCode Number?
# ------------------------------------------------
# In Buenos Aires the Phone Code is composed by the first four numbers of the phone. The first one is always 4, therefore only the three last numbers are taken into account (e.g.: for 4833-1212 the code is 833), and generally people who lives in the same neighborhood has a similar code (the code begin with 833 for instance). As the PostCode number also has a relation with the neighborhood, I wanted to determine if one phone code was related to one or more PostCode numbers. To determine that I ran the following query:

result = db.nodos.aggregate([{"$match":{"postcode":{"$exists":"1"},"phonecode":{"$exists":"1"}}},
                             {"$group":{"_id":"$phonecode", "codtel":{ "$addToSet":"$postcode"}}},{"$unwind":"$codtel"},
                             {"$group":{"_id":"$_id","count":{"$sum":1}}},{"$group":{"_id":"mean_cp","mean":{"$avg":"$count"}}}])

print('Is there a telation between Phone Code and PostCode Number?')
print(list(result))
print("\r")

# The results seems to show a correlation between the phone code and the postcode area, due to the fact that both are related to neighborhoods. Multiple phone codes could be related to a particular postcode area, but a particular phone code tends to be circumscribed to one postcode area.

# Which Three Most Popular Banks?
# -------------------------------

result = db.nodos.aggregate([{"$match":{"amenity.type":"bank"}},{"$group":{"_id":"$amenity.name","count":{"$sum":1}}},
                             {"$sort":{"count":-1}},{"$limit":3}])

print('Which Three Most Popular Banks?')
print(list(result))
print("\r")

# Are there most restaurants than fastfoods or viceversa?
# -------------------------------------------------------

result = db.nodos.aggregate([{"$match":{"amenity.type": {"$in":["restaurant","fast_food"]}}},
                             {"$group":{"_id":"$amenity.type","count":{"$sum":1}}},{"$sort":{"count":-1}},{"$limit":3}])

print('Are there most restaurants than fastfoods or viceversa?')
print(list(result))
print("\r")