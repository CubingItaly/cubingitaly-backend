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
            callbackURL: keys.wca.prod.login_redirect_uri,
            scope: keys.wca.prod.scope,
            userAgent: keys.wca.prod.user_agent
        }, loginCallback));
    } else if (process.env.NODE_ENV === "test") {
        passport.use(new WCAStrategy({
            clientID: keys.wca.test.client_id,
            clientSecret: keys.wca.test.client_secret,
            callbackURL: keys.wca.test.login_redirect_uri,
            scope: keys.wca.test.scope,
            userAgent: keys.wca.test.user_agent,
            authorizationURL: 'https://staging.worldcubeassociation.org/oauth/authorize',
            tokenURL: 'https://staging.worldcubeassociation.org/oauth/token',
            userProfileURL: 'https://staging.worldcubeassociation.org/api/v0/me'
        }, loginCallback));
    } else {
        passport.use(new WCAStrategy({
            clientID: keys.wca.dev.client_id,
            clientSecret: keys.wca.dev.client_secret,
            callbackURL: keys.wca.dev.login_redirect_uri,
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

passport.serializeUser((user: UserModel, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    const userRepo: UserRepository = getCustomRepository(UserRepository);
    let dbUser: UserEntity = await userRepo.getUserById(id);
    done(null, dbUser._transform());
});