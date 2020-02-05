import { keys } from '../../../secrets/keys';
import e = require('express');
import { AssociationRequest } from '../../../models/classes/association-request.model';
import { Deserialize } from 'cerialize';
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../../../secrets/client_secret.json');

export function saveSpreadsheet(req) {
    let doc = new GoogleSpreadsheet(keys.sheets.file);
    doc.useServiceAccountAuth(creds, function (err) {
        if (err) {
            console.log(err);
        } else {
            const request: AssociationRequest = Deserialize(req.body.request, AssociationRequest);
            doc.addRow(1, {
                "Nome": request.name,
                "Cognome": request.surname,
                "Email": request.email,
                "Tipo": request.assLevel[0].toUpperCase()+ request.assLevel.substr(1),
                "Luogo di nascita": request.birthplace,
                "Data di nascita": request.birthdate,
                "Codice Fiscale": request.fiscalCode ? request.fiscalCode : "",
                "Via": request.street,
                "Numero civico": request.num,
                "Città": request.city,
                "Provincia": request.state,
                "Nazione": request.country,
            }, (err, row) => {
                if (err) {
                    console.log("something went wrong while updating the spreadsheet");
                } else {
                    console.log("Spreadsheet updated");
                }
            });
        }
    });
}
