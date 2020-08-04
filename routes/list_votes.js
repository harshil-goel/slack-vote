var data = ''
  , tally = require('./../tally.js')
  , returnText = ''
  , slackRes = ''
  , poll = ''
  , dbActions = require('./../persist.js')

exports.post = function (req, res, next) {

  console.log('List results of current poll.');
  pollId = 'activePoll_' + req.body.channel_id;
  dbActions.getPoll(pollId, printPoll);

  function printPoll(data) {
    slackRes = 'Here are the current votes: \n ' + tally.printPoll(JSON.parse(data));
    console.log('printPoll: ' + slackRes);
    res.json({text: slackRes});
  }

};
