import * as nodemailer from 'nodemailer';
import * as mailgunTransport from 'nodemailer-mailgun-transport';
import { keys } from '../../secrets/keys';

export class EmailService {

    emailClient;
    transport;

    constructor() {
        this.transport = mailgunTransport({ auth: keys.mail.auth })
        this.emailClient = nodemailer.createTransport(this.transport)
    }
    public sendContactRequest(replyTo, html) {
        return new Promise((resolve, reject) => {
            this.emailClient.sendMail({
                from: keys.mail.contact.from,
                to: keys.mail.contact.to,
                subject: keys.mail.contact.subject,
                replyTo: replyTo,
                html: html
            }, (err, info) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(info)
                }
            })
        })
    }

    public sendAssociationRequest(replyTo, html) {
        return new Promise((resolve, reject) => {
            this.emailClient.sendMail({
                from: keys.mail.association.from,
                to: keys.mail.association.to,
                subject: keys.mail.association.subject,
                replyTo: replyTo,
                html: html
            }, (err, info) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(info)
                }
            })
        })
    }
}
