import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
export class MailService {
  public transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: 'djipiti@mail.ru',
        pass: '525ZV5mMsNEUaGP2cix1',
      },
    });
  }
  async sendActivationMail(to, link) {
    try {
      await this.transporter.sendMail({
        from: 'djipiti@mail.ru',
        to,
        subject: 'Подтвердите почту на djipiti.ru',
        html: `
        <div>
        <h1>Для активации прейдите по ссылке</h1>
        <a href="${link}">${link}</a>
</div> 
      `,
      });
      return;
    } catch (e) {
      console.log(e);
    }
  }
}
