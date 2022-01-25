const axios = require("axios");
const nodemailer = require("nodemailer");
const config = require("./config");

let interval;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.MY_EMAIL,
    pass: config.MY_EMAIL_PASSWORD
  }
});

let sendMail = (date) => {
  const mailOptions = {
    from: config.MY_EMAIL,
    to: config.RECIPIENTS.join(','),
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

let getIsDateAvailable = (res, minDate) => {
  try {
    const isDateAvailable = res.some(item => (+item.Date.split('-')[2]) >= minDate);
    return isDateAvailable;
  } catch (e) {
    console.log(e);
    return false;
  }
}

let getDates = async () => {
  try {
    const res = await axios(`https://hermon.pres.global/api/system-vouchers/byDate?recaptchaToken=${config.HERMON_RECAPTCHA_TOKEN}`)
    return res.data.Dates;
  } catch (e) {
    console.log(e);
  }

}

const main = async (minDate) => {
  console.log("start", new Date());
  const res = await getDates();
  const isDateAvailable = getIsDateAvailable(res, minDate);
  console.log("isDateAvailable:", isDateAvailable);
  if (isDateAvailable) {
    sendMail(minDate)
  }
}

const run = () => {
  const minDate = +process.argv.slice(2)[0]
  if (!minDate || isNaN(minDate) || minDate < 1 || minDate > 31) {
    throw new Error("Please provide a min day number 1-31")
  }
  console.log("Interval time: ", config.INTERVAL_TIME)
  console.log("Min date: ", minDate)
  console.log("Recipients: ", config.RECIPIENTS.join(', '))
  main(minDate);
  interval = setInterval(() => {
    main(minDate);
  }, config.INTERVAL_TIME);
}

run()
