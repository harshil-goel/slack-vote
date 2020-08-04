var data = ''
  , tally = require('./../tally.js')
  , returnText = ''
  , slackRes = ''
  , poll = ''
  , dbActions = require('./../persist.js')
  , channelId = '';

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

exports.post = function (req, res, next) {
  /*
   * Get poll data.
   */
  triggerWord = req.body.trigger_word;
  channelId = req.body.channel_id;
  pollId = 'activePoll_' + channelId;

  console.log('About to close the poll for pollId: ' + pollId);
  dbActions.getPoll(pollId, setData);
  function setData(poll_string) {
    if (poll_string) {
      data = JSON.parse(poll_string);
      dbActions.deletePoll(pollId, ()=>{});

      // disallow more voting but save the data to keep some kind of an archive
      data.active = 0;
      data.id = makeid(10);
      console.log("HERE", data)

      closePoll(data);
    }
  }

  /*
   * Print active poll
   */
  function closePoll(data) {
    slackRes = 'Closing active poll. Here are the final results\n ' + tally.printPoll(data);
    console.log('closePoll: ' + slackRes);
    dbActions.setPoll(data.id, JSON.stringify(data), confirmClosePoll);
  }
  function confirmClosePoll(data) {
    console.log('confirmClosePoll: ' + slackRes);
    res.json({text: slackRes});
  }
};
