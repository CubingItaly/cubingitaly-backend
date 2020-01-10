import { getCustomRepository } from "typeorm";
import { sendError } from "../../shared/error.utils";
import { Router, response } from "express";
//# we need this because otherwise passport doesn't work
import * as passport from "passport";
import { validationResult, body } from "express-validator";
import { isLoggedIn, getUser } from "../../shared/login.utils";
import { EmailService } from './mail.service';
import { Deserialize } from "cerialize";
import { AssociationRequest } from "../../models/classes/association-request.model";
import * as upload from "express-fileupload";
import * as path from "path";
import { UserModel } from "../../models/classes/user.model";
import { AssociationDocumentRepository } from "../../db/repository/association-document.repository";
import * as fs from "fs";
import { AssociationDocumentEntity } from "../../db/entity/association.entity";

const router: Router = Router();

router.use(upload({
    limits: 4 * 1024 * 1024
}));

router.post("/associate", [
    body('request.name').isString().isLength({ max: 50 }).trim().escape(),
    body('request.surname').isString().isLength({ max: 50 }).trim().escape(),
    body('request.birthplace').isString().isLength({ max: 50 }).trim().escape(),
    body('request.birthdate').isString().matches(/^\d{4}-\d{2}-\d{2}$/).trim().escape(),
    body('request.fiscalCode').matches(/^$|^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$/).trim().escape(),
    body('request.city').isString().isLength({ max: 50 }).trim().escape(),
    body('request.state').isString().isLength({ max: 50 }).trim().escape(),
    body('request.street').isString().isLength({ max: 50 }).trim().escape(),
    body('request.num').isString().isLength({ max: 10 }).trim().escape(),
    body('request.country').isString().isLength({ max: 50 }).trim().escape(),
    body('request.email').isEmail().normalizeEmail(),
    body('request.assLevel').isString().matches(/^premium$|^base$/).trim().escape(),
], async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            const email: string = req.body.request.email;
            let mailservice = new EmailService();
            mailservice.sendAssociationRequest(email, composeHTML(req,false))
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


router.post("/associate-eng", [
    body('request.name').isString().isLength({ max: 50 }).trim().escape(),
    body('request.surname').isString().isLength({ max: 50 }).trim().escape(),
    body('request.birthplace').isString().isLength({ max: 50 }).trim().escape(),
    body('request.birthdate').isString().matches(/^\d{4}-\d{2}-\d{2}$/).trim().escape(),
    body('request.city').isString().isLength({ max: 50 }).trim().escape(),
    body('request.state').isString().isLength({ max: 50 }).trim().escape(),
    body('request.street').isString().isLength({ max: 50 }).trim().escape(),
    body('request.num').isString().isLength({ max: 10 }).trim().escape(),
    body('request.country').isString().isLength({ max: 50 }).trim().escape(),
    body('request.email').isEmail().normalizeEmail(),
    body('request.assLevel').isString().matches(/^premium$|^base$/).trim().escape(),
], async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        try {
            const email: string = req.body.request.email;
            let mailservice = new EmailService();
            mailservice.sendAssociationRequest(email, composeHTML(req,true))
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


function composeHTML(req, eng: boolean): string {
    let html: string = "";
    const request: AssociationRequest = Deserialize(req.body.request, AssociationRequest);
    if (isLoggedIn(req)) {
        html = `<p>Messaggio inviato dall'utente riconosciuto come: ${getUser(req).name}</p>`;
    }
    html += "<h2>Dati anagrafici</h2>";
    html += `<p><strong>Nome</strong>: ${request.name}</p>`;
    html += `<p><strong>Cognome</strong>: ${request.surname}</p>`;
    html += `<p><strong>Luogo di nascita</strong>: ${request.birthplace}</p>`;
    html += `<p><strong>Data di nascita</strong>: ${request.birthdate}</p>`;
    html += `<p><strong>Codice fiscale</strong>: ${request.fiscalCode}</p>`;
    html += "<h2>Dati di residenza</h2>";
    html += `<p><strong>Via</strong>: ${request.street}</p>`;
    html += `<p><strong>Numero civico</strong>: ${request.num}</p>`;
    html += `<p><strong>Città</strong>: ${request.city}</p>`;
    html += `<p><strong>Provincia</strong>: ${request.state}</p>`;
    html += `<p><strong>Nazione</strong>: ${request.country}</p>`;
    html += "<h2>Contatti</h2>";
    html += `<p><strong>Email</strong>: ${request.email}</p>`;
    html += "<h2>Richiesta di associazione</h2>";
    html += `<p><strong>Tipo di richiesta</strong>: socio <strong>${request.assLevel}</strong></p>`;
    if(eng){
        html += "<p><strong>Richiesta inviata in lingua inglese</strong></p>";
    }
    return html;
}



router.get("/", async (req, res) => {
    let repo: AssociationDocumentRepository = getCustomRepository(AssociationDocumentRepository);
    let docs: AssociationDocumentEntity[] = await repo.getDocuments();
    res.status(200).json(docs.map(d => d._transform()));
});

const fileValidators = [
    body('title').isString().matches(/^[a-zA-Z\à\è\é\ì\ò\ù\À\È\É\Ì\Ò\Ù]+[a-zA-Z0-9\à\è\é\ì\ò\ù\À\È\É\Ì\Ò\Ù\_\-\.\\\/\s]+[a-zA-Z0-9\à\è\é\ì\ò\ù\À\È\É\Ì\Ò\Ù]+$/).isLength({ max: 150 }).trim().escape(),
    body('type').isNumeric().toInt().isIn([0, 1, 2])
];


router.post("/", canManageAssociation, fileValidators, async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() && req.files && Object.keys(req.files).length === 1) {
        const file: upload.UploadedFile = req.files.uploadFile as upload.UploadedFile;
        if (file.mimetype === "application/pdf" && file.truncated === false) {
            let repo: AssociationDocumentRepository = getCustomRepository(AssociationDocumentRepository);
            file.name = getFileName(req.body.title);
            let exists: boolean = await repo.getTitleExists(file.name, -1);
            if (!exists) {
                file.mv(path.join(path.dirname(require.main.filename), "../uploads/" + file.name + ".pdf"), async (err) => {
                    if (err) {
                        sendError(res, 500, "Something went wrong");
                    } else {
                        let doc: AssociationDocumentEntity = new AssociationDocumentEntity();
                        doc.title = req.body.title;
                        doc.type = req.body.type;
                        doc.path = "/caricamenti/" + file.name + ".pdf";
                        doc.title_low = file.name;
                        doc = await repo.createDoc(doc);
                        res.status(200).json(doc._transform());
                    }
                });
            } else {
                sendError(res, 400, "Invalid file.");
            }

        } else {
            sendError(res, 400, "you need to upload a PDF");
        }
    } else {
        sendError(res, 400, "Error. Some parameter is missing or not valid");
    }
});

router.put("/:id", canManageAssociation, fileValidators, async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        let repo: AssociationDocumentRepository = getCustomRepository(AssociationDocumentRepository);
        let exists: boolean = await repo.idExists(Number(req.params.id));
        if (exists) {
            if (req.files && req.files && Object.keys(req.files).length === 1) {
                const file: upload.UploadedFile = req.files.uploadFile as upload.UploadedFile;
                if (file.mimetype === "application/pdf" && file.truncated === false) {
                    file.name = getFileName(req.body.title);
                    exists = await repo.getTitleExists(file.name, Number(req.params.id));
                    if (!exists) {
                        file.mv(path.join(path.dirname(require.main.filename), "../uploads/" + file.name + ".pdf"), async (err) => {
                            if (err) {
                                sendError(res, 500, "Something went wrong");
                            } else {
                                let doc: AssociationDocumentEntity = new AssociationDocumentEntity();
                                doc = await repo.updateDoc(Number(req.params.id), req.body.title, file.name, "/caricamenti/" + file.name + ".pdf", req.body.type);
                                res.status(200).json(doc._transform());
                            }
                        });
                    } else {
                        sendError(res, 400, "Invalid file.");
                    }
                } else {
                    sendError(res, 400, "you need to upload a PDF");
                }
            } else if (!req.files) {
                let oldDoc: AssociationDocumentEntity = await repo.getDocument(Number(req.params.id));
                let title_low: string = getFileName(req.body.title);
                exists = await repo.getTitleExists(title_low, Number(req.params.id));
                if (!exists) {
                    fs.rename(path.join(path.dirname(require.main.filename), "../uploads/" + oldDoc.title_low + ".pdf"), path.join(path.dirname(require.main.filename), "../uploads/" + title_low + ".pdf"), async (err) => {
                        if (err) {
                            sendError(res, 500, "Something went wrong");
                        } else {
                            let doc: AssociationDocumentEntity = new AssociationDocumentEntity();
                            doc = await repo.updateDoc(Number(req.params.id), req.body.title, req.body.title, "/caricamenti/" + title_low + ".pdf", req.body.type);
                            res.status(200).json(doc._transform());
                        }
                    });
                } else {
                    sendError(res, 400, "Invalid title");
                }
            }
        } else {
            sendError(res, 400, "Bad request");
        }
    } else {
        sendError(res, 400, "Document doesn't exist");
    }
});

router.delete("/:id", canManageAssociation, async (req, res) => {
    let repo: AssociationDocumentRepository = getCustomRepository(AssociationDocumentRepository);
    repo.deleteDoc(Number(req.params.id));
    res.status(200).json({});
});

function canManageAssociation(req, res, next) {
    let user: UserModel = getUser(req);
    if (user.canManageAssociation()) {
        next();
    } else {
        sendError(res, 403, "Permission denied.");
    }
}

function getFileName(title: string): string {
    title = title.toLowerCase();
    title = title.replace(/[ ]/g, "_");
    title = title.replace(/[\-\\\/\.]/g, "");
    title = title.replace(/\à/g, "a");
    title = title.replace(/\è/g, "e");
    title = title.replace(/\é/g, "e");
    title = title.replace(/\ì/g, "i");
    title = title.replace(/\ò/g, "o");
    title = title.replace(/\ù/g, "u");
    return title;
}

export { router }