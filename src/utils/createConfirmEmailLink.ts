import {v4} from 'uuid';
import {Redis} from 'ioredis';

export const createConfirmEmailLink = async(url : string, userId : string, redis : Redis) => {
    const id = v4();
    await redis.set(id, userId, "ex", 60 * 60 * 24); // expire in 24h
    return `${url}/confirm-user/${id}`;

}