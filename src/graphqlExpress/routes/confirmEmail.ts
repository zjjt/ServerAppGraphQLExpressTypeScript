import {User} from "../typeORM/entity/User";
import {Request, Response} from "express";
import {redis} from "../redis";

export const confirmEmailRoute = async(req : Request, res : Response) => {
    const {id} = req.params;
    const userId = await redis.get(id);
    await redis.del(id);
    if (userId) {
        await User.update({
            id: userId
        }, {confirmed: true});
        res.send("ok");
    } else {
        res.send("invalid");
    }

}