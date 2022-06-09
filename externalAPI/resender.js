const db = require('../db/requestTable');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const scheduler = new ToadScheduler();

exports.registerSeqnum = (seqnum, request) => {
    db.storeRequest(request);
}


const registerWork = (seqnum) => {
    const task = new Task('simple task', () => {
        resend();
    });

    const job = new SimpleIntervalJob({seconds: 5, runImmediately: true}, task, String(seqnum));
    scheduler.addIntervalJob(job);
}

const resend = () => {
}
