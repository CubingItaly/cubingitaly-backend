import { getCustomRepository } from "typeorm";
import { sendError } from "../../shared/error.utils";
import { Router } from "express";
//# we need this because otherwise passport doesn't work
import * as passport from "passport";
import { validationResult, Result, body } from "express-validator";
import { isLoggedIn, getUser } from "../../shared/login.utils";
import { EmailService } from './mail.service';
import { Deserialize } from "cerialize";
import { AssociationRequest } from "../../models/classes/association-request.model";
const router: Router = Router();



router.post("/associate", [
    body('request.name').isString().isLength({ max: 50 }),
    body('request.surname').isString().isLength({ max: 50 }),
    body('request.birthplace').isString().isLength({ max: 50 }),
    body('request.birthdate').isString().matches(/^\d{4}-\d{2}-\d{2}/$),
    body('request.fiscalCode').matches(/^$|^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$/),
    body('request.city').isString().isLength({ max: 50 }),
    body('request.street').isString().isLength({ max: 50 }),
    body('request.num').isString().isLength({ max: 10 }),
    body('request.country').isString().isLength({ max: 50 }),
    body('request.email').isEmail(),
    body('request.assLevel').isString().matches(/^premium$|^base$/),
], async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            const email: string = req.body.request.email;
            let mailservice = new EmailService();
            mailservice.sendAssociationRequest(email, composeHTML(req))
                .then(() => {
                    res.status(200).send({});
                })
                .catch(() => {
                    sendError(res, 500, "There was an error while trying to process the request");
                })

        } catch (e) {
            if (process.env.NODE_ENV !== "production") {
                console.log(e)
            }
            sendError(res, 500, "There was an error while trying to process the request");
        }
    } else {
        sendError(res, 400, "Error. Some parameter is missing or not valid");
    }
});

function composeHTML(req): string {
    let html: string = "";
    const request: AssociationRequest = Deserialize(req.body.request, AssociationRequest);
    if (isLoggedIn(req)) {
        html = `<p>Messaggio inviato dall'utente riconosciuto come: ${getUser(req).name}</p>`;
    }
    html+="<h2>Dati anagrafici</h2>";
    html+=`<p><strong>Nome</strong>:${request.name}</p>`;
    html+=`<p><strong>Cognome</strong>:${request.surname}</p>`;
    html+=`<p><strong>Luogo di nascita</strong>:${request.birthplace}</p>`;
    html+=`<p><strong>Data di nascita</strong>:${request.birthdate}</p>`;
    html+=`<p><strong>Codice fiscale</strong>:${request.fiscalCode}</p>`;
    html+="<h2>Dati di residenza</h2>";
    html+=`<p><strong>Via</strong>:${request.street}</p>`;
    html+=`<p><strong>Numero civico</strong>:${request.num}</p>`;
    html+=`<p><strong>Città</strong>:${request.city}</p>`;
    html+=`<p><strong>Nazione</strong>:${request.country}</p>`;
    html+="<h2>Contatti</h2>";
    html+=`<p><strong>Email</strong>:${request.email}</p>`;
    html+="<h2>Richiesta di associazione</h2>";
    html+=`<p><strong>Tipo di richiesta</strong>:socio <strong>${request.assLevel}</strong></p>`;
    return html;
}

export { router }