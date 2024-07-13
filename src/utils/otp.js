import nodemailer from 'nodemailer'

export const sendOtp = async (email,otp)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
          user: process.env.SEND_EMAIL_GMAIL,
          pass: process.env.SEND_EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"search job app" <${process.env.SEND_EMAIL_GMAIL}>`, // sender address
        to: email, // list of receivers
        subject: "the new otp", // Subject line
        text: `your otp is ${otp}`, // plain text body
      });
}