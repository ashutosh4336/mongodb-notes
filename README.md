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
