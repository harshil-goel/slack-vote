var poll = ''
  , dbActions = require('./../persist.js')
  , tally = require('./../tally.js')
  , activePoll = ''
  , redis = require('redis')
  , pollnameText = ''
  , triggerWord = ''
  , channelId = ''
  , pollnameText = ''
  , slackRes = ''
  , rtg = ''
  , newPollID = ''
  , ts = Math.floor(Date.now() / 1000);

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

exports.post = function(req, res, next) {

  console.log('Start vote route.');

  /*
   * Start poll data.
   */
  pollnameText = req.body.text;
  triggerWord = req.body.trigger_word;
  channelId = req.body.channel_id;
  pollnameText = pollnameText.replace(triggerWord + ' ','');
  poll = {
    'pollName': pollnameText,
    'active': 1,
    'created':  new Date(),
    'answers': []
  };

  newPollID = 'activePoll_' + channelId;

  /*
   * Fetch and print current active poll.
   */
  dbActions.getPoll(newPollID, listActivePoll);
  function listActivePoll(data) {
    console.log('Current Active Poll: ' + data);
    if (data === null) {
      console.log('There is no current active poll, setting up new poll.');
    } else {
      var temp = JSON.parse(data)
      temp.active = 0;
      console.log('Current poll is closing.', temp);
      dbActions.setPoll(makeid(10), JSON.stringify(temp), () => {})
      dbActions.deletePoll(newPollID, () => {})
      slackRes = 'Closing Active Poll. Here were the results of the now-closed poll.\n' + tally.printPoll(JSON.parse(data)) + '\n';
    }
  }

  /*
   * Set new poll with the active poll id.
   * Print confirmation and vote message.
   */
  console.log('Setting up new poll with ID: ' + newPollID);
  dbActions.setPoll(newPollID, JSON.stringify(poll), printNewPoll);

  function printNewPoll() {
    console.log('New poll is set up with the ID: ' + newPollID);
    dbActions.getPoll(newPollID, confirmNewPoll);
  }

  function confirmNewPoll(data) {
    if (data == null) {
	console.log("NULLLLLL");
	return;
    }
    slackRes += '\nYour poll is set up. Please start voting for ' + tally.printPoll(JSON.parse(data));
    res.json({text: slackRes, "response_type": "in_channel"});
  }

};
