import { assert } from 'chai';
import 'mocha';
import { TestDatabase } from './___db';
import { getCustomRepository } from 'typeorm';
import { FAQCategoryRepository } from '../../src/db/repository/faq-category.repository';
import { FAQCategoryEntity } from '../../src/db/entity/faq-category.entity';
import { FAQRepository } from '../../src/db/repository/faq.repository';
import { UserEntity } from '../../src/db/entity/user.entity';
import { UserRepository } from '../../src/db/repository/user.repository';
import { FAQEntity } from '../../src/db/entity/faq.entity';

let database: TestDatabase;
let repo: FAQRepository;
let user: UserEntity;
let catRepo: FAQCategoryRepository;

describe('Test the faq repo', () => {

    before(async () => {
        database = new TestDatabase();
        await database.createConnection();
        repo = getCustomRepository(FAQRepository);
        catRepo = getCustomRepository(FAQCategoryRepository);
        user = await (getCustomRepository(UserRepository)).getUserById(0);
    });

    it('Test the method to get a FAQ', async () => {
        let faq: FAQEntity = await repo.getFAQ(1);
        assert.equal(faq, null);
    });

    it('Test the method to create a FAQ', async () => {
        let faq: FAQEntity = new FAQEntity();
        faq.title = "Test title";
        faq.content = "Test content";
        let categories: FAQCategoryEntity[] = await catRepo.getCategories();
        faq.category = categories[0];
        let newFAQ: FAQEntity = await repo.createFAQ(faq, user);
        assert.equal(newFAQ.id, 1);
        assert.equal(newFAQ.title, faq.title);
        assert.equal(newFAQ.content, faq.content);
        assert.equal(newFAQ.editor.id, 0);
        assert.equal(newFAQ.category.id, "1");
    });

    it('Test the method to get a FAQ', async () => {
        let faq: FAQEntity = await repo.getFAQ(1);
        assert.equal(faq.id, 1);
        assert.equal(faq.title, "Test title");
        assert.equal(faq.content, "Test content");
        assert.equal(faq.editor, null);
        assert.equal(faq.category.id, "1");
    });

    it('Test the method to update a FAQ', async () => {
        let faq: FAQEntity = await repo.getFAQ(1);
        faq.id = 45;
        faq = await repo.updateFAQ(faq, user);
        assert.equal(faq, null);
        faq = await repo.getFAQ(1);
        faq.title = "new title";
        faq = await repo.updateFAQ(faq, user);
        assert.equal(faq.title, "new title");
        faq.content = "new content";
        faq = await repo.updateFAQ(faq, user);
        assert.equal(faq.content, "new content");
        let categories: FAQCategoryEntity[] = await catRepo.getCategories();
        faq.category = categories[1];
        faq = await repo.updateFAQ(faq, user);
        assert.equal(faq.category.weight, 2);
    });

    it('Test the method to get FAQs', async () => {
        let faq: FAQEntity = new FAQEntity();
        faq.title = "Test title";
        faq.content = "Test content";
        let categories: FAQCategoryEntity[] = await catRepo.getCategories();
        faq.category = categories[0];
        let newFAQ: FAQEntity = await repo.createFAQ(faq, user);

        let faqs: FAQEntity[] = await repo.getFAQs("");
        assert.equal(faqs.length, 2);

        faqs = await repo.getFAQs("1");
        assert.equal(faqs.length, 1);
        faqs = await repo.getFAQs("2");
        assert.equal(faqs.length, 1);
        faqs = await repo.getFAQs("3");
        assert.equal(faqs.length, 0);
    });

    it('Test the method to delete a FAQ', async () => {
        await repo.deleteFAQ(1);
        let faqs: FAQEntity[] = await repo.getFAQs("");
        assert.equal(faqs.length, 1);
        let faq: FAQEntity = await repo.getFAQ(1);
        assert.equal(faq, null);
    })


    after(async () => {
        await database.closeConnection();
    })
})


