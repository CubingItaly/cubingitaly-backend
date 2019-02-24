import * as passport from 'passport';
import { Strategy as WCAStrategy } from 'passport-wca';
import { keys } from '../secrets/keys';
import { UserModel } from '../models/classes/user.model';
import { Deserialize } from 'cerialize';
import { UserRepository } from '../db/repository/user.repository';
import { getCustomRepository } from 'typeorm';
import { UserEntity } from '../db/entity/user.entity';

export function authMiddleWare(req, res, next) {

    if (process.env.NODE_ENV === "production") {
        passport.use(new WCAStrategy({
            clientID: keys.wca.prod.client_id,
            clientSecret: keys.wca.prod.client_secret,
            callbackURL: keys.wca.prod.redirect_uri,
            scope: keys.wca.prod.scope,
            userAgent: keys.wca.prod.user_agent
        }, loginCallback));
    } else {
        passport.use(new WCAStrategy({
            clientID: keys.wca.dev.client_id,
            clientSecret: keys.wca.dev.client_secret,
            callbackURL: keys.wca.dev.redirect_uri,
            scope: keys.wca.dev.scope,
            userAgent: keys.wca.dev.user_agent,
            authorizationURL: 'https://staging.worldcubeassociation.org/oauth/authorize',
            tokenURL: 'https://staging.worldcubeassociation.org/oauth/token',
            userProfileURL: 'https://staging.worldcubeassociation.org/api/v0/me'
        }, loginCallback));
    }
    next();
}

async function loginCallback(accessToken, refreshToken, profile, done) {
    const user: UserModel = Deserialize(profile._json.me, UserModel);
    const userRepo: UserRepository = getCustomRepository(UserRepository);
    let dbUser: UserEntity = new UserEntity();
    dbUser._assimilate(user);
    dbUser = await userRepo.updateUser(dbUser);
    done(null, user);
}

export function scheduleMiddleWare(req, res, next) {

    if (process.env.NODE_ENV === "production") {
        passport.use(new WCAStrategy({
            clientID: keys.wca.prod.client_id,
            clientSecret: keys.wca.prod.client_secret,
            callbackURL: keys.wca.prod.redirect_uri,
            scope: keys.wca.prod.scope,
            userAgent: keys.wca.prod.user_agent
        }, loginCallback));
    } else {
        passport.use(new WCAStrategy({
            clientID: keys.wca.dev.client_id,
            clientSecret: keys.wca.dev.client_secret,
            callbackURL: 'http://localhost:4200/api/v0/competitions/schedule/wca/callback',
            scope: 'public manage_competitions',
            userAgent: keys.wca.dev.user_agent,
            authorizationURL: 'https://staging.worldcubeassociation.org/oauth/authorize',
            tokenURL: 'https://staging.worldcubeassociation.org/oauth/token',
            userProfileURL: 'https://staging.worldcubeassociation.org/api/v0/me',

        }, async (accessToken, refreshToken, profile, done) => {
            let compToken={ 'comp':req.params.id, 'token': accessToken};
            done(null, compToken);
        }));
    }
    next();
}




passport.serializeUser((user: UserModel, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    const userRepo: UserRepository = getCustomRepository(UserRepository);
    let dbUser: UserEntity = await userRepo.getUserById(id);
    done(null, dbUser._transform());
});