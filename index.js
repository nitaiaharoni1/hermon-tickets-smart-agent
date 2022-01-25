const axios = require("axios");
const nodemailer = require("nodemailer");

let interval;
const RECIPIENTS = ['email@gmail.com']
const INTERVAL_TIME = 1000 * 60 * 3;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
        user: 'EMAIL',
        pass: 'PASSWORD'
  }
});

let sendMail = (date) => {
  const mailOptions = {
    from: 'MY_EMAIL@gmail.com',
    to: RECIPIENTS.join(','),
    subject: 'Hermon Buy Tickets!',
    text: `The date ${date} is available. buy tickets at: \n https://hermon.pres.global/vouchers`
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      clearInterval(interval);
      process.exit()
    }
  });
}

let getIsDateAvailable = (res, date) => {
  try {
    const isDateAvailable = res.some(item => (+item.Date.split('-')[2]) >= date);
    return isDateAvailable;
  } catch (e) {
    console.log(e);
    return false;
  }
}

let getDates = async () => {
  try {
    const res = await axios("https://hermon.pres.global/api/system-vouchers/byDate?recaptchaToken=TOKEN")
    return res.data.Dates;
  } catch (e) {
    console.log(e);
  }

}

const main = async (date) => {
  console.log("start", new Date());
  const res = await getDates();
  const isDateAvailable = getIsDateAvailable(res, date);
  console.log("isDateAvailable:", isDateAvailable);
  if (isDateAvailable) {
    sendMail(date)
  }
}

const run = (minDate) => {
  console.log("Interval time: ", INTERVAL_TIME)
  console.log("Min date: ", minDate)
  console.log("Recipients: ", RECIPIENTS.join(', '))
  main(minDate);
  interval = setInterval(() => {
    main(minDate);
  }, INTERVAL_TIME);
}

run(28)
