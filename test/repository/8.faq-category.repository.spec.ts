import { assert } from 'chai';
import 'mocha';
import { TestDatabase } from './___db';
import { getCustomRepository } from 'typeorm';
import { FAQCategoryRepository } from '../../src/db/repository/faq-category.repository';
import { FAQCategoryEntity } from '../../src/db/entity/faq-category.entity';

let database: TestDatabase;
let repo: FAQCategoryRepository;

describe('Test the faq category repo', () => {

    before(async () => {
        database = new TestDatabase();
        await database.createConnection();
        repo = getCustomRepository(FAQCategoryRepository);

    });

    it('Test the init and getCategories methods', async () => {
        let categories: FAQCategoryEntity[] = await repo.getCategories();
        assert.equal(3, categories.length);
        assert.equal(2, categories[1].weight);

        await repo.InitDefaults();
        categories = await repo.getCategories();
        assert.equal(3, categories.length);
    })


    after(async () => {
        await database.closeConnection();
    })
})


