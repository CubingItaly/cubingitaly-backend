import * as nodemailer from 'nodemailer';
import * as mailgunTransport from 'nodemailer-mailgun-transport';
import { keys } from '../../secrets/keys';

export class EmailService {

    emailClient;
    transport;

    constructor() {
        this.transport = mailgunTransport({ auth: process.env.NODE_ENV === "production" ? keys.mail.prod.auth : keys.mail.dev.auth })
        this.emailClient = nodemailer.createTransport(this.transport)
    }
    public sendContactRequest(replyTo, html) {
        return new Promise((resolve, reject) => {
            this.emailClient.sendMail({
                from: process.env.NODE_ENV === "production" ? keys.mail.prod.contact.from : keys.mail.dev.contact.from,
                to: process.env.NODE_ENV === "production" ? keys.mail.prod.contact.to : keys.mail.dev.contact.to,
                subject: process.env.NODE_ENV === "production" ? keys.mail.prod.contact.subject : keys.mail.dev.contact.subject,
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

    public sendAssociationRequest(replyTo, html, name, surname) {
        return new Promise((resolve, reject) => {
            this.emailClient.sendMail({
                from: process.env.NODE_ENV === "production" ? keys.mail.prod.association.from : keys.mail.dev.association.from,
                to: process.env.NODE_ENV === "production" ? keys.mail.prod.association.to : keys.mail.dev.association.to,
                subject: process.env.NODE_ENV === "production" ? `${name} ${surname} - ${keys.mail.prod.association.subject}` : `${name} ${surname} - ${keys.mail.dev.association.subject}`,
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
