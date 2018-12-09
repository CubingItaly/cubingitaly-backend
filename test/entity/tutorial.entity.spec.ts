import 'mocha';
import { assert } from 'chai';
import { TutorialEntity } from '../../src/db/entity/tutorial.entity';
import { TutorialModel } from '../../src/models/classes/tutorial.model';
import { UserEntity } from '../../src/db/entity/user.entity';
import { PageEntity } from '../../src/db/entity/page.entity';
import { UserModel } from '../../src/models/classes/user.model';

describe('Test the funcion to transform the entity', () => {

    let tutorial: TutorialEntity;

    beforeEach(() => {
        tutorial = new TutorialEntity();

        tutorial.id = "test";
        tutorial.title = "title";
        tutorial.isPublic = false;
        tutorial.createDate = new Date();
        tutorial.updateDate = new Date();
    });

    it('test without author and editor', () => {
        let model: TutorialModel = tutorial._transform();

        assert.equal(model.id, tutorial.id);
        assert.equal(model.title, tutorial.title);
        assert.equal(model.isPublic, tutorial.isPublic);
        assert.equal(model.createDate, tutorial.createDate);
        assert.equal(model.updateDate, tutorial.updateDate);
        assert.equal(model.pages.length, 0);
        assert.equal(model.author, undefined);
        assert.equal(model.lastEditor, undefined);
    });

    it('test with author and editor', () => {
        let user: UserEntity = new UserEntity();
        user.id = 1;
        tutorial.author = user;

        user = new UserEntity();
        user.id = 2;
        tutorial.lastEditor = user;

        let model: TutorialModel = tutorial._transform();
        assert.equal(model.author.id, 1);
        assert.equal(model.lastEditor.id, 2);
    });

    it('test with pages', () => {
        let pages: PageEntity[] = [];
        pages[0] = new PageEntity();
        pages[0].id = 2;
        pages[0].indexInTutorial = 2
        pages[1] = new PageEntity();
        pages[1].id = 1;
        pages[1].indexInTutorial = 1;
        pages[2] = new PageEntity();
        pages[2].id = 3;
        pages[2].indexInTutorial = 2;
        pages[3] = new PageEntity();
        pages[3].id = 4;
        pages[3].indexInTutorial = 3;



        tutorial.pages = pages;

        let model: TutorialModel = tutorial._transform();
        assert.equal(model.pages.length, 4);
        assert.equal(model.pages[1].id, 2);
    });


});


describe('Test the function to assimilate a model', () => {
    let tutorial: TutorialModel;

    beforeEach(() => {
        tutorial = new TutorialModel();

        tutorial.id = "test";
        tutorial.title = "title";
        tutorial.isPublic = false;
        tutorial.createDate = new Date();
        tutorial.updateDate = new Date();
    });

    it('test without author and editor', () => {
        let entity: TutorialEntity = new TutorialEntity();
        entity._assimilate(tutorial);

        assert.equal(entity.id, tutorial.id);
        assert.equal(entity.title, tutorial.title);
        assert.equal(entity.isPublic, tutorial.isPublic);
        assert.equal(entity.createDate, tutorial.createDate);
        assert.equal(entity.updateDate, tutorial.updateDate);
        assert.equal(entity.pages, undefined);
        assert.equal(entity.author, undefined);
        assert.equal(entity.lastEditor, undefined);
    });

    it('test with author and editor', () => {
        let user: UserModel = new UserModel();
        user.id = 1;
        tutorial.author = user;

        user = new UserModel();
        user.id = 2;
        tutorial.lastEditor = user;

        let entity: TutorialEntity = new TutorialEntity();
        entity._assimilate(tutorial);
        assert.equal(entity.author.id, 1);
        assert.equal(entity.lastEditor.id, 2);
    });

    it('test with pages', () => {
        let pages: PageEntity[] = [];
        pages[0] = new PageEntity();
        pages[0].id = 1;
        pages[1] = new PageEntity();
        pages[1].id = 2;

        tutorial.pages = pages;

        let entity: TutorialEntity = new TutorialEntity();
        entity._assimilate(tutorial);

        assert.equal(entity.pages, undefined);
    });
});