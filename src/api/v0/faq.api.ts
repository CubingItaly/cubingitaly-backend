import { getCustomRepository } from "typeorm";
import { sendError } from "../../shared/error.utils";
import { Router } from "express";
//# we need this because otherwise passport doesn't work
import * as passport from "passport";
import { getUser, verifyLogin } from "../../shared/login.utils";
import { FAQEntity } from "../../db/entity/faq.entity";
import { FAQRepository } from "../../db/repository/faq.repository";
import { FAQModel } from "../../models/classes/faq.model";
import { sanitize } from "./sanitizer";
import { Deserialize } from "cerialize";
import { UserEntity } from "../../db/entity/user.entity";
import { FAQCategoryEntity } from "../../db/entity/faq-category.entity";
import { FAQCategoryRepository } from "../../db/repository/faq-category.repository";
import { FAQCategoryModel } from "../../models/classes/faq-category.model";

const router: Router = Router();


function getFAQRepository(): FAQRepository {
    return getCustomRepository(FAQRepository);
}

function verifyRequest(req, res, next) {
    let faq: FAQModel = Deserialize(req.body.faq, FAQModel);
    if (faq.title && faq.content) {
        next();
    } else {
        sendError(res, 400, "Bad request. The request is malformed");
    }
}

function sanitizeContent(req, res, next) {
    let tmp: string = req.sanitize(req.body.faq.title) || "";
    req.body.faq.title = tmp.substr(0, 120);
    req.body.faq.content = sanitize(req.body.faq.content);
    next();
}

function canAdminFAQs(req, res, next) {
    if (getUser(req).canAdminFAQs()) {
        next();
    } else {
        sendError(res, 403, "You don't have sufficient permissions to perform this operations");
    }
}

function canEditFAQs(req, res, next) {
    if (getUser(req).canEditFAQs()) {
        next();
    } else {
        sendError(res, 403, "You don't have sufficient permissions to perform this operations");
    }
}

function getUserEntity(req): UserEntity {
    let entity: UserEntity = new UserEntity();
    entity._assimilate(getUser(req));
    return entity;
}

router.get("/", async (req, res) => {
    let category: string = req.query.category || null
    let faqsEntity: FAQEntity[] = await getFAQRepository().getFAQs(category);
    let model: FAQModel[] = faqsEntity.map((f: FAQEntity) => f._transform());
    res.status(200).json(model);
});

router.get("/categories", async (req, res) => {
    let catEntities: FAQCategoryEntity[] = await getCustomRepository(FAQCategoryRepository).getCategories();
    let model: FAQCategoryModel[] = catEntities.map((f: FAQCategoryEntity) => f._transform());
    res.status(200).json(model);
});

router.get("/:id", async (req, res) => {
    let faqEntity: FAQEntity = await getFAQRepository().getFAQ(Number(req.params.id));
    let model: FAQModel = faqEntity._transform();
    if (model) {
        res.status(200).json(model);
    } else {
        sendError(res, 404, "The requested resource doesn't exist.");
    }
});

router.post("/", verifyLogin, canAdminFAQs, verifyRequest, sanitizeContent, async (req, res) => {
    let faq: FAQModel = Deserialize(req.body.faq, FAQModel);
    if (!faq.id) {
        let faqEntity: FAQEntity = new FAQEntity();
        faqEntity._assimilate(faq);
        faqEntity = await getFAQRepository().createFAQ(faqEntity, getUserEntity(req));
        res.status(200).json(faqEntity);
    } else {
        sendError(res, 400, "Bad request. The request is malformed.");
    }
});

router.put("/:id", verifyLogin, canEditFAQs, verifyRequest, sanitizeContent, async (req, res) => {
    let faq: FAQModel = Deserialize(req.body.faq, FAQModel);
    if (faq.id && faq.id === Number(req.params.id)) {
        let faqEntity: FAQEntity = new FAQEntity();
        faqEntity._assimilate(faq);
        faqEntity = await getFAQRepository().updateFAQ(faqEntity, getUserEntity(req));

        if (faqEntity) {
            res.status(200).json(faqEntity);
        } else {
            sendError(res, 404, "The requested resource doesn't exist.");
        }
    } else {
        sendError(res, 400, "f Bad request. The request is malformed.");
    }
});

router.delete("/:id", verifyLogin, canAdminFAQs, async (req, res) => {
    await getFAQRepository().deleteFAQ(Number(req.params.id));
    res.status(200).json({});
});

export { router }