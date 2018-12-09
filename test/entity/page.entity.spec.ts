import 'mocha';
import { assert } from 'chai';
import { PageEntity } from '../../src/db/entity/page.entity';
import { PageModel } from '../../src/models/classes/page.model';
import { UserEntity } from '../../src/db/entity/user.entity';
import { UserModel } from '../../src/models/classes/user.model';


describe('It test the transform function of the page', () => {

    let entity: PageEntity;

    beforeEach(() => {
        entity = new PageEntity();
        entity.id = 1;
        entity.title = "title";
        entity.content = "fake content";
        entity.createDate = new Date();
        entity.updateDate = new Date();
        entity.isPublic = false;
        entity.indexInTutorial = -1;
    });

    it('Test a page without author', () => {
        let model: PageModel = entity._transform();

        assert.equal(model.id, entity.id);
        assert.equal(model.title, entity.title);
        assert.equal(model.content, entity.content);
        assert.equal(model.createDate, entity.createDate);
        assert.equal(model.updateDate, entity.updateDate);
        assert.equal(model.isPublic, entity.isPublic);
        assert.equal(model.indexInTutorial, entity.indexInTutorial);
        assert.equal(undefined, model.author);
        assert.equal(undefined, model.lastEditor);
    });

    it('Test a page with an author and an editor', () => {
        entity.indexInTutorial = undefined;

        let user: UserEntity = new UserEntity();
        user.id = 1;
        entity.author = user;

        user = new UserEntity();
        user.id = 2;
        entity.lastEditor = user;

        let model: PageModel = entity._transform();

        assert.equal(model.indexInTutorial, -1);
        assert.equal(1, model.author.id);
        assert.equal(2, model.lastEditor.id);
    });



});

describe('It test the assimilate function of the page', () => {

    let model: PageModel;

    beforeEach(() => {
        model = new PageModel();
        model.id = 1;
        model.title = "title";
        model.content = "fake content";
        model.createDate = new Date();
        model.updateDate = new Date();
        model.isPublic = false;
        model.indexInTutorial = -1;
    });

    it('Test a page without author', () => {
        let entity: PageEntity = new PageEntity();
        entity._assimilate(model);

        assert.equal(entity.id, model.id);
        assert.equal(entity.title, model.title);
        assert.equal(entity.content, model.content);
        assert.equal(entity.createDate, model.createDate);
        assert.equal(entity.updateDate, model.updateDate);
        assert.equal(entity.isPublic, model.isPublic);
        assert.equal(entity.indexInTutorial, model.indexInTutorial);
        assert.equal(undefined, model.author);
        assert.equal(undefined, model.lastEditor);
    });

    it('Test a page with an author and an editor', () => {
        model.indexInTutorial = undefined;
        let user: UserModel = new UserModel();
        user.id = 1;
        model.author = user;

        user = new UserModel();
        user.id = 2;
        model.lastEditor = user;

        let entity: PageEntity = new PageEntity();
        entity._assimilate(model);

        assert.equal(entity.indexInTutorial, -1);
        assert.equal(1, model.author.id);
        assert.equal(2, model.lastEditor.id);
    });


});