```sql
db.students.updateOne(
    {
        hobbies : {
            $elemMatch : {
                title : "Developer", frequency : {$gt : 3}
            }
        }
    },
    {
        $set  : { "hobbies.$.seniorDeveloper" : true }
    }
)
```

### Update All Documents in an array matching condition

```sql
db.students.updateMany(
    {
        "hobbies.frequency" : {
            $gt : 2
        }
    },
    {
        $set : {
            "hobbies.$[el].goodDev" : true
        }
    },
    {
        upsert: true, arrayFilters : [{ "el.title" : "Developer" }]
    }
)
```

```sql
db.students.updateMany(
    {
        "hobbies.goodDev" : true
    },
    {
        $pull : {
            hobbies : {
                title : "Web Development"
            }
        }
    }
)
```

```sql
db.students.find(
    {
        $and : [
            { age : { $exists : true } },
            {age : { $ne : null } }
        ]
    }).pretty()

```

```sql
db.students.updateMany({$and : [{ age :{$exists : true}}, {age : {$ne : null}}]}, {$pop : {hobbies : 1}})
```

```sql
db.students.updateMany(
    {"hobbies.goodDev" : true},
    { $addToSet : {hobbies : {title : "Web Development", language : "Python"}} }
)
```

```bash
mongoimport persons.json -d contactData -c contacts --drop --jsonArray
```

### Indexes In MongoDB

```sql
db.collectionName.explain("queryPlanner/executionStats/allPlansExecution").find();
```

_1_. queryPlanner - Show Summary for Executed Query

_2_. executionStats - Show Summary for Executed Plan + Winning Plan + Possibly Rejected Plan

_3_. allPlansExecution - Show Detailed Summary for Executed Query + Winning Plan + Winning Plan Decision Process

MongoDB Scans
_ IXSCAN (Index Scan)
_ COLLSCAN (Full Collection Scan)

Number of keys that are examined.
Number of Documents that are examined.
Number of Documents that are returned.

```json
{
   "executionStats" : {
		"executionSuccess" : true,
		"nReturned" : 1,
		"executionTimeMillis" : 1,
		"totalKeysExamined" : 1,
		"totalDocsExamined" : 1,
		"executionStages" : {
			"stage" : "FETCH",
			"nReturned" : 1,
			"executionTimeMillisEstimate" : 0,
			"works" : 2,
    ...
}
```

> if totalDocsExamined === 0 than the query is a covered query.

```json
{
    "inputStage" : {
	    "stage" : "IXSCAN",
        ...
    }
}
```

```json
{
    "executionStages" : {
        "stage" : "FETCH",
        ...
    }
}
```

```sql
db.contacts.explain("executionStats").find({"dob.age" : {$gt : 30} })
```

```sql
> db.contacts.explain("executionStats").find({"dob.age" : {$gt : 30} })
```

```sql
> db.contacts.createIndex({"dob.age" : 1}, {partialFilterExpression : {gender : "male"}})
> db.contacts.createIndex({"dob.age" : 1}, {partialFilterExpression : {"dob.age" : {$gt : 40}}})
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
```

```sql
> db.contacts.createIndex({ createdAt : 1 }, { expireAfterSeconds : 20 }) // 20second
```

```sql
db.wishlists.createIndex({userId : 1}, {unique : true})
```

```js
const session = db.getMongo().startSession();
const postsColl = session.getDatabase('testdb').posts;
const usersColl = session.getDatabase('testdb').users;

session.startTransaction();

usersColl.deleteOne({_id : ObjectId("609704091b463b30fbe64e20") })
{ acknowledged: true, deletedCount: 1 }

postsColl.deleteMany({ userId : ObjectId("609704091b463b30fbe64e20") })
{ acknowledged: true, deletedCount: 2 }

session.commitTransaction()
{
  ok: 1,
  '$clusterTime': {
    clusterTime: Timestamp(3, 1620510666),
    signature: {
      hash: Binary(Buffer.from("6b82a16013797c600b5b80373b9eca1c9f8e2b95", "hex"), 0),
      keyId: Long("6926016170780786689")
    }
  },
  operationTime: Timestamp(1, 1620510666)
}
```

```sql
> db.contacts.insertMany(
    [{
        name : "Max",
        hobbies : ["Cooking", "Sports"],
        addresses : [
            {street : "Main street"}, {street : "Second Street"}
        ]
    }]
)


```

```sql
> db.products.find({$text : {$search : "book"}})
> db.products.explain("executionStats").find({$text : {$search : "book"}})
```

```sql
> db.products.find(
    {
        description : { $regex : "book", $options: "i"}
    }
)

> db.products.explain("executionStats").find(
    {
        description : {$regex : "book", $options: "i"}
    }
)
```

```sql
> db.products.find(
    {
        $text : {
            $search : "art of war"
        }
    },
    { score :
        {
            $meta : "textScore"
        }
    }
).pretty()
```

```sql
> db.products.find(
    {
        $text : {$search : "art of war"}
    },
    {
        score : {$meta : "textScore"}
    }
)
.sort(
    { score : {$meta : "textScore"} }
).pretty()

```

```sql
> db.products.find(
    {
        $text : {
            $search : "art of war"
        }
    },
    {
        score : {
            $meta : "textScore"
        }
    }
).sort(
    {
        score : {
            $meta : "textScore"
        }
    }
).pretty()

```

## Geospatial Data

Insert the GeoSpatial data to MongoDB

```sql
db.places.insertOne(
    {
        name : "California Academy of Sciences",
        location : {
            type : "Point",
            coordinates: [-122.4686961, 37.7693187]
        }
    }
);
```

Create Index to work with Geospatial data

```sql
db.places.createIndex({location: "2dsphere" })
```

Find the neared places that are present in the DB with the provided Coordinates

```sql
db.places.find(
    {
        location : {
            $near : {
                $geometry: {
                    type : "Point",
                    coordinates : [-122.4726609, 37.7698611]
                }
            }
        }
    }
);
```

Find Places with in distance

```sql
db.places.find(
    {
        location : {
            $near : {
                $geometry: {
                    type : "Point",
                    coordinates : [-122.4726609, 37.7698611]
                },
                $maxDistance: 30,
                $minDistance : 10
            }
        }
    }
).pretty()
```

Find Places in side Given Coordinates

```sql
db.places.find(
    {
        location : {
            $geoWithin : {
                $geometry : {
                    type : "Polygon",
                    coordinates: [[p1, p2, p4, p3, p1]]
                }
            }
        }
    }
).pretty()

```

Set a Area (Polygon) in DB

```sql
db.areas.insertOne(
    {
        name : "Golden gate park SF",
        area : {
            type : "Polygon",
            coordinates: [[p1, p2, p4, p3, p1]]
        }
    }
)
```

Intersect (Find if a coordinate is inside the specified area)

```sql
db.areas.find(
    {
        area : {
            $geoIntersects : {
                $geometry : {
                    type : "Point",
                    coordinates : [-122.49694, 37.76759]
                }
            }
        }
    }
).pretty()
```

Find Places with Radius

```sql
db.places.find(
    {
        location : {
            $geoWithin : {
                $centerSphere : [
                    [-122.49784, 37.77594], 3 / 6378.1
                ]
            }
        }
    }
).pretty()
```

### Aggregate

```sql
db.person.aggregate([
    {
        $match: {
            "dob.age": {
                $gt : 50
            },
        }
    },
    // {
    //   $group: {
    //       _id : {id : "$_id"},
    //       totalPerson : { $sum: 1 },
    //       avgAge : {
    //           $avg : "$dob.age"
    //       }
    //   }
    // },
    {
        $sort: {
            totalPerson : -1
        }
    },
    {
      $project: {
          _id : 0,
          name :1,
          email: 1,
           //   birthdate : { $convert: { input: "$dob.date", to: "date", onError:"0", onNull:"0"}},
          birthdate : {$toDate: "$dob.date"},
          age : "$dob.age",
          location : {
              type : "Point",
              coordinates : [
                  {
                      $convert: {
                          input: "$location.coordinates.longitude",
                          to: "double",
                          onError: 0,
                          onNull: 0
                      }

                  },
                  {
                      $convert: {
                          input: "$location.coordinates.latitude",
                          to: "double",
                          onError: 0,
                          onNull: 0
                      }


                  }
              ]
          }

      }
    },
    {
        $project: {


            location: 1,
            fullName : {
                $concat: [
                        {
                            $toUpper: {
                                $substrCP: [ "$name.title", 0, 1 ]
                            }
                        },

                        {
                            $substrCP: [
                                "$name.title", 1, { $subtract: [{$strLenCP: "$name.title"}, 1]}
                            ]
                        },


                        " ",

                        {
                            $toUpper: {
                                $substrCP: [ "$name.first", 0, 1 ]
                            }
                        },

                        {
                            $substrCP: [ "$name.first", 1, { $subtract: [
                                    {
                                        $strLenCP: "$name.first"
                                    }, 1
                                ] }]
                        },

                        " ",

                        {
                            $toUpper: {
                                $substrCP: [ "$name.last", 0, 1 ]
                            }

                        },
                        {
                            $substrCP: [
                                "$name.last", 1,
                                {
                                    $subtract: [
                                        {
                                            $strLenCP: "$name.last"
                                        },
                                        1
                                    ]
                                }
                            ]
                        }
                ]
            }

        }
    }

])
```

```sql
db.person.aggregate([
    {
        $match: {
            "dob.age": {
                $gt : 50
            },
        }
    },
    {
        $sort: {
            totalPerson : -1
        }
    },
    {
      $project: {
          _id : 0,
          name :1,
          email: 1,
          //   birthdate : { $convert: { input: "$dob.date", to: "date", onError:"0", onNull:"0"}},
          birthdate : {$toDate: "$dob.date"},
          age : "$dob.age",

          location : {
              type : "Point",
              coordinates : [
                  {
                      $convert: {
                          input: "$location.coordinates.longitude",
                          to: "double",
                          onError: 0,
                          onNull: 0
                      }
                  },
                  {
                      $convert: {
                          input: "$location.coordinates.latitude",
                          to: "double",
                          onError: 0,
                          onNull: 0
                      }
                  }
              ]
          }

      }
    },
    {
        $project: {

            birthdate: 1,
            age: 1,
            location: 1,
            fullName : {
                $concat: [
                        {
                            $toUpper: {
                                $substrCP: [ "$name.title", 0, 1 ]
                            }
                        },

                        {
                            $substrCP: [
                                "$name.title", 1, { $subtract: [{$strLenCP: "$name.title"}, 1]}
                            ]
                        },


                        " ",

                        {
                            $toUpper: {
                                $substrCP: [ "$name.first", 0, 1 ]
                            }
                        },

                        {
                            $substrCP: [ "$name.first", 1, { $subtract: [
                                    {
                                        $strLenCP: "$name.first"
                                    }, 1
                                ] }]
                        },

                        " ",

                        {
                            $toUpper: {
                                $substrCP: [ "$name.last", 0, 1 ]
                            }

                        },
                        {
                            $substrCP: [
                                "$name.last", 1,
                                {
                                    $subtract: [
                                        {
                                            $strLenCP: "$name.last"
                                        },
                                        1
                                    ]
                                }
                            ]
                        }
                ]
            }

        }
    }, {
        $group: {
            _id: {
                    birthYear : {
                        $isoWeekYear: "$birthdate"
                }
            },

            numPersons : {
                  $sum : 1
            }
        }
    },
    {
        $sort : {
            numPersons : -1
        }
    }

])

```

```sql
db.employees.aggregate([

    {
        $group: {
            _id: {
                age : "$age",
            },
            allHobbies: {
                $push: "$hobbies"
            }

        }
    }

])

```

### `$size` of an array

```sql
db.employees.aggregate([
{
    $project: {_id : 1, numScores : {$size: "$examScores"}}
}
])
```

### `$slice` of an Array

```sql
db.employees.aggregate([
    {
        $project: {_id : 0, examScores : {$slice: ["$examScores", -2]}}
    }
])
```

### $filter

> Local Variable `$$`

```sql
db.employees.aggregate([
    {
        $project: {
            _id : 1,
            examScores : {
                $filter: {
                    input: "$examScores",
                    as: "finalScore",
                    cond: { $gt: ["$$finalScore.score", 60]  }
                }
            }
        }
    }
])
```

### Numbers in MongoDB

```sql
db.numbers.insertOne(
    {
        a : NumberDecimal("0.3"),
        b : NumberDecimal("0.2")
    }
)
```

```sql
db.numbers.aggregate([
    {
        $project : {
            result : {
                $subtract : ["$a",  "$b"]
            }
        }
    }
])
```
