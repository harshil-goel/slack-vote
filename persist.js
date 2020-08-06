const { request } = require('graphql-request')
const assert = require('assert').strict;
var endpoint = 'http://localhost:8080/graphql'

const get_query = `
query($inp: String!) {
  queryPoll(filter:{id:{eq:$inp}}) {
      created
      pollName
	active
	answers {
	answerName
	id
	votes {
		created
		userName
		userID
	}
	}
	}
}
`

const update_query = `
mutation($inp: PollPatch, $id:String!) {
  updatePoll(input:{
    filter: {id: {eq: $id}}, 
    set:$inp
  }) {
    poll {
      created
      pollName
	active
	answers {
	answerName
	id
	votes {
		created
		userName
		userID
	}
	}
	}
  }
}
`

const add_query = `
mutation($inp: AddPollInput!) {
  addPoll(input: [$inp]) {
    poll {
    created
      pollName
	active
	answers {
	answerName
	id
	votes {
		created
		userName
		userID
	}
	}
	}
  }
}
`

const delete_poll_query = `
mutation($id: String) {
  deletePoll(filter:{id:{eq: $id}}) {
    msg
  }
}
`

const delete_query = `
mutation($id: ID!){
  deleteAnswer(filter:{id:[$id]}) {
    msg
  }
}
`

var redis = require('redis')
	, pollnameText = ''
	, triggerWord = ''
	, pollnameText = ''
	, slackRes = ''
	, client = ''
	, rtg = ''
	, operationComplete = false
	, ts = Math.floor(Date.now() / 1000);

/*
 * Set correct environment for redis.
 *
 * Lines 19-20 are for using Heroku Redis
 * If not using Heroku Redis, uncomment lines 22-23 and comment out lines 19-20
 *
 */

var getPoll = async function(pollId, callback) {
	try {
		console.log("****GET POLL****", pollId);
		assert(pollId != null)
		const data = await request(endpoint, get_query, {inp: pollId})
		var reply = JSON.stringify(data["queryPoll"][0], undefined, 2)
		if (data["queryPoll"].length > 0) {
			callback(reply);
		} else {
			callback(null);
		}
	} catch(err) {
		console.log("here1", err);
		callback(null);
	}
}


var dbActions = {
	deletePoll: async function(pollKey, callback) {
		try {
		const data = await request(endpoint, delete_poll_query, {id: pollKey})
			callback(data)
		} catch (err) {
			console.log("here2", err);
			callback(null);
		}
	},

	deleteAnswer: async function(answerKey, callback) {
		try {
		const data = await request(endpoint, delete_query, {id: answerKey})
			callback(data)
		} catch (err) {
			console.log("here2", err);
			callback(null);
		}
	},

	/*
	 * Set poll data.
	 */
	setPoll: async function(pollKey, pollData, callbacki) {
		getPoll(pollKey, async (reply) => {
			assert(pollKey != null);
			console.log("Setting to:", pollKey)
			if (reply) {
				const vars = {inp: JSON.parse(pollData), id: pollKey}
				const data = await request(endpoint, update_query, vars)
				callbacki(pollData);
			} else {
				var temp = Object.assign({id: pollKey}, JSON.parse(pollData))
				const data = await request(endpoint, add_query, {inp: temp})
				callbacki(pollData);
			}
		}) 
	},

	/*
	 * Get poll from id.
	 */
	getPoll: getPoll

};

module.exports = dbActions;
