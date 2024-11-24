const Queue = require("bull");
const emailService = require("./email.service");
require("dotenv").config();

const emailQueue = new Queue("emailQueue", {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIST_PORT
    },
    limiter: {
        max: 10,
        duration: 1000
    }
});

emailQueue.process(async (job) => {
    console.log(`processing job ${job.id} for ${job.id.to}`);
    try{
        const {to, subject, text, html} = job.data;
        const emailOptions = { from: process.env.MAIL_USER, to,subject, text, html };
        await emailService.sendEmail(emailOptions);
        console.log(`email send to ${to}`);
    } catch (error)
    {
        console.error(`error send email: ${error.message}`);
        if(job.attemptsMade < 3 ) throw error;
    }
});

emailQueue.on('failed',(job, err) =>{
    console.error(`job ${job.id} failed : ${err.message}`);

});
module.exports = emailQueue;