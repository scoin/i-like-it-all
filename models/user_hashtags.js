conString = require('../db')
var pg = require('pg')
var Hashtag = require('./hashtags')
var User = require('./users')

var UserHashtag = function(utag_obj){
	if(utag_obj){
		for(var key in utag_obj){
			this[key] = utag_obj[key];
		}
	}
}

UserHashtag.all_query = function(callback){
	pg.connect(conString, function(err, client, done){
		if(err){
			done(client);
			console.error(err);
			return;
		}
		client.query("SELECT user_hashtags.id AS uhid, user_hashtags.last_liked, user_hashtags.like_amount,\
			hashtags.tag, users.oauth_token AS token FROM user_hashtags\
			INNER JOIN users ON (user_hashtags.user_id = users.id)\
			INNER JOIN hashtags ON (user_hashtags.hashtag_id = hashtags.id)", 
			function(err, result){
			done(client);
			if(err){
				callback(err, undefined);
				return;
			}
			if(callback){
				var utag_array = [];
				for(var i in result.rows){
					utag_array.push(result.rows[i])
				}
				callback(undefined, utag_array);
				return;
			}
		});
	});
}

UserHashtag.create = function(user, hashtag, amount, callback){
	pg.connect(conString, function(err, client, done){
		if(err){
			done(client);
			console.error(err);
			return;
		}
		client.query("INSERT INTO user_hashtags(user_id, hashtag_id, like_amount) VALUES(($1), ($2), ($3)) RETURNING id, user_id, hashtag_id, last_liked, like_amount", [user.id, hashtag.id, amount], function(err, result){
			done(client);
			if(err){
				callback(err, undefined);
				return;
			}
			if(callback){
				callback(undefined, new UserHashtag(result.rows[0]));
				return;
			}
		});
	});
}

UserHashtag.prototype.save = function(callback){
	var utag = this;
	pg.connect(conString, function(err, client, done){
		if(err){
			done(client);
			console.error(err);
			return;
		}
		if(utag.id){
			client.query("UPDATE user_hashtags\
						SET hashtag_id=($1), user_id=($2), last_liked=($3), like_amount=($4) WHERE id=($5)", 
						[utag.hashtag_id, utag.user_id, utag.last_liked, utag.like_amount, utag.id], 
						function(err, result){
							done(client);
							if(callback){
								callback(err, result);
								return;
							}
						});
		} else {
			client.query("INSERT INTO users\
						(hashtag_id, user_id, last_liked, like_amount)\
						VALUES(($1),($2), ($3), ($4))", 
						[utag.hashtag_id, utag.user_id, utag.last_liked, utag.like_amount], 
						function(err, result){
							done(client);
							if(callback){
								callback(err, result);
								return;
							}
						});
		}
	});
}

UserHashtag.get_by_id = function(utag_id, callback){
	pg.connect(conString, function(err, client, done){
		if(err){
			done(client);
			console.log(err);
			return;
		}
		client.query("SELECT * FROM user_hashtags WHERE id=($1)", [utag_id], function(err, result){
			done(client);
			if(err){
				callback(err, undefined);
				return;
			}
			if(callback){
				callback(undefined, new UserHashtag(result.rows[0]));
				return;
			}
		});
	});
}

UserHashtag.search = function(user, hashtag, callback){
	pg.connect(conString, function(err, client, done){
		if(err){
			done(client);
			console.error(err);
			return;
		}
		client.query("SELECT * FROM user_hashtags WHERE user_id=($1) AND hashtag_id=($2)", [user.id, hashtag.id], function(err, result){
			done(client);
			if(err){
				callback(err, undefined);
				return;
			}
			if(callback){
				callback(undefined, new UserHashtag(result.rows[0]));
				return;
			}
		});
	});
}

UserHashtag.delete = function(utagId, callback){
	pg.connect(conString, function(err, client, done){
		if(err){
			done(client);
			console.error(err);
			return;
		}
		client.query("DELETE FROM user_hashtags WHERE id=($1)", [utagId], function(err, result){
			done(client);
			if(err){
				callback(err, undefined);
				return;
			}
			if(callback){
				callback(undefined, {"success": "delete"});
				return;
			}
		});
	});
}

// User.get_by_id(1, function(err, user){
// 	UserHashtag.search(user, {"id":1}, function(err, hashtag, utag){
// 		console.log(hashtag)
// 	})
// })

module.exports = UserHashtag