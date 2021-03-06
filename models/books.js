var mongodb = require('./db');
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');

//Book is a function container
var Book = function(){
	
};
module.exports = Book;

Book.get = function (bookName, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if (bookName) {
				query.bookName = bookName;
			}
			collection.find(query).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				db.collection('cata', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					collection.find({}).toArray(function(err, cata) {
						mongodb.close();
						if (err) {
							callback(err, null);
						}

						callback(null, docs,cata);
					});
				});

			});
		});
	});
};

Book.update = function (book,callback) {

	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}

		//获取users集合
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var id = new ObjectID(book.bookId)
			collection.update({"_id":id}, { $set :book}, function(err, doc) {
				mongodb.close();
				callback(err, doc);
			});
		});
	});
};

Book.delete = function (bid,callback) {
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}

		//获取Book集合
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(bid)
			collection.remove({"_id":id},function(err, doc) {
				mongodb.close();
				callback(err, doc);
			});
		});
	});

};

Book.getCata = function (cata, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			if(cata){
				var searchObj = {'cata':cata}
			}else{
				var searchObj = {}
			}
			collection.find(searchObj).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				db.collection('cata', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					collection.find({}).toArray(function(err, cata) {
						mongodb.close();
						if (err) {
							callback(err, null);
						}

						callback(null, docs,cata);
					});
				});

			});
		});
	});
};

Book.getStatus= function (status, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			if(status === 'online'){
				var statusId = 1;
			}else if(status === 'check'){
				var statusId = 0;
			}else{
				var statusId = 2;
			}
			collection.find({'status':statusId}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}

				db.collection('cata', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					collection.find({}).toArray(function(err, cata) {
						mongodb.close();
						if (err) {
							callback(err, null);
						}

						callback(null, docs,cata);
					});
				});

			});
		});
	});
};

Book.getContent= function (key, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var searchContent = eval("/"+key+"/i");
			collection.find({'$or':[{'content':searchContent},{'bookName':searchContent}]}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				
				db.collection('cata', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					collection.find({}).toArray(function(err, cata) {
						mongodb.close();
						if (err) {
							callback(err, null);
						}

						callback(null, docs,cata);
					});
				});

			});
		});
	});
};

Book.create = function (bookName,cata,uploader,desc,bookType,callback) {
	mongodb.open(function(err, db) {
		if (err) {
		  return callback(err);
		}

		//获取books集合
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//save
			var book ={};
			book['bookName'] = bookName;
			book['cata'] = cata;
			book['time'] = new Date();
			book['uploader'] = uploader;
			book['status'] = 0;
			book['descption'] = desc;
			book['bookType'] = bookType;
			book['content'] = '';
			book['note'] = {};
			book['reader'] =[uploader];
			collection.insert(book, {safe: true}, function(err, book) {
				db.collection('cata', function(err, collection) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					
					collection.find({'cname':cata}).toArray(function(err, docs) {
						console.log(docs);
						if(!docs[0]){
							collection.insert({'cname':cata}, {safe: true}, function(err, docs) {
								if (err) {
									mongodb.close();
									return callback(err);
								}
								mongodb.close();
								callback(err, book);
							});
						}
						mongodb.close();
						callback(err, book);
					});
				});
			});
		});
	});

};

Book.getSingle = function (bookId, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if (bookId) {
				var id = new ObjectID(bookId)
				query._id = id;
			}

			collection.find(query).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				callback(null, docs);

			});
		});
	});
};

Book.addReadList = function (bookId,user, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if (bookId) {
				var id = new ObjectID(bookId)
				query._id = id;
			}

			collection.update({'_id':id},{ $addToSet :{'reader':user}},function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				callback(null);

			});
		});
	});
};

Book.getUser = function (name, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.find({'uploader':name}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				var list ={};
				list.makeList = docs;
				collection.find({'reader':{'$all':[name]}}).toArray(function(err, docs) {
					list.readList = docs;
					callback(null, list);
				});
				

			});
		});
	});
};


Book.delRead = function (bid,user, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(bid);
			collection.update({'_id':id},{ $pull :{'reader':user}}, function(err, doc) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				callback(err, doc);
			});
		});
	});
};

Book.getSalons = function (bid, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(bid);
			collection.findOne({'_id':id}, function(err, doc) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				if(!doc.salons){
					doc.salons =[]
				}
				callback(err, doc);
			});
		});
	});
};

Book.getOneSalon = function (bid,sid, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(bid);
			collection.findOne({'_id':id}, function(err, doc) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				var salonid = Number(sid.split('_')[1]);
				for(var i=0;i<doc.salons.length;i++){
					if(doc.salons[i].time === salonid){
						callback(err, doc,doc.salons[i]);
					}
				}
				
			});
		});
	});
};

Book.addSalon = function (salon, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(salon.bookid);
			var one  ={};
			one['content'] = salon['salonContent'];
			one['title'] = salon['salonTitle'];
			one['user'] = salon['user'];
			one['time'] =  new Date().valueOf();
			one['like'] = {
				num : 0,
				users :[]
			};
			one['comment'] = [];
			collection.update({'_id':id}, { $push :{'salons':one}},function(err, doc) {
				mongodb.close();
				callback(err, doc);
			});
		});

	});
};

Book.editSalon = function (salon, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(salon.bookid);
			var one  ={};
			one['content'] = salon['salonContent'];
			one['title'] = salon['salonTitle'];
			one['user'] = salon['user'];
			one['time'] =  salon['newtime'];
			collection.findOne({'_id':id}, function(err, doc) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				var salonid =Number(salon['time']);	
				for(var i=0;i<doc.salons.length;i++){
					if(doc.salons[i].time === salonid){
						one['comment'] = doc.salons[i].comment;
						one['like'] = doc.salons[i].like;
						collection.update({'_id':id,'salons.time':Number(salon['time'])},{"$set":{'salons.$':one}},function(err, doc) {
							mongodb.close();
							callback(err, doc);
						})
					}
				}
				
			});
			
		});
	});
};

Book.delSalon = function (salon,callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(salon.bookid);

			collection.update({'_id':id},{"$pull":{'salons':{'time':Number(salon.salonTime)}}},function(err, doc) {
				mongodb.close();
				callback(err, doc);
			})
		});
	});
};

Book.likeSalon = function (salon,username,callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(salon.bookid);
			collection.update({'_id':id,'salons.time':Number(salon.salonTime)},{"$inc":{'salons.$.like.num' : 1},"$push":{'salons.$.like.users' : username}},function(err, doc) {
				mongodb.close();
				callback(err, doc);
			})
		});
	});
};

Book.pubCmt = function (salon, callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(salon.bookid);
			var one = {};
			one['content'] = salon['content'];
			one['user'] = salon['user'];
			one['time'] = new Date().valueOf();
			collection.update({'_id':id,'salons.time':Number(salon['time'])},{"$push":{'salons.$.comment':one}},function(err, doc) {
				mongodb.close();
				one['bookid'] = salon.bookid;
				callback(err, one);
			});
		});
		
	});
};

Book.delCmt = function (salon,callback) {
	//check db
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('book', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var id = new ObjectID(salon.bookid);
			collection.update({'_id':id,'salons.time':Number(salon.stime)},{"$pull":{'salons.$.comment':{'time':Number(salon.time)}}},function(err, doc) {
				mongodb.close();
				callback(err, doc);
			})
		});
	});
};

Book.saveEdited = function(book,callback){

	fs.writeFile('./bookFiles/'+book.bookName+'.txt', book.content, function (err) {
		  if (err) {
		  	callback(err)
		  }
		  

		mongodb.open(function(err, db) {
			if (err) {
			  return callback(err);
			}

			//获取users集合
			db.collection('book', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}

				var id = new ObjectID(book.bookid);
				if(book.status){
					status = 1;
				}else{
					status = 0;
				}
				collection.update({"_id":id}, { $set :{'content':book.content,'status':status}}, function(err, doc) {
					mongodb.close();
					callback(err, book.bookid);
				});
			});
		});
	});

};

