'use strict';

import * as Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { getDevices, registerDevice, sendMessage } from "./hubProxy";
export let server: Server;

export const initServer = async function (): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 80,
        host: '0.0.0.0'
    });

    server.route({
        method: 'GET',
        path: '/devices',
        handler: async (request, h) => {
            let devices: any = await getDevices();
            return h.response(devices).code(201)
        }
    });    
    server.route({
        method: 'POST',
        path: '/{deviceId}',
        options: {
            plugins: {
                body: { merge: false, sanitizer: { stripNullorEmpty: false } }
            },
            handler: async (request, h) => {
                let code = 201
                let deviceId: string = request.params.deviceId;
                let payload: any = request.payload || {};
                console.log(payload)
                let result: any = await registerDevice(deviceId, payload);
                console.log(result)
                if (result !== 'ok') 
                    code = 500;

                return h.response(result).code(code)
            }
        }
    })
    server.route({
        method: 'POST',
        path: '/message/{deviceId}',
        options: {
            plugins: {
                body: { merge: false, sanitizer: { stripNullorEmpty: false } }
            },
            handler: async (request, h) => {
                let deviceId: string = request.params.deviceId;
                let payload: any = request.payload;
                console.log(payload)
                sendMessage(deviceId, payload);
                return h.response('ok').code(201)
            }
        }
    })
    await startServer();
    return server;
};

export const startServer = async function (): Promise<void> {
    console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

process.on('unhandledRejection', (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});