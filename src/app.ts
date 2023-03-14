'use strict';

import { initServer } from "./server";
import { initProxy } from "./hubProxy";

const init = async (): Promise<void> => {
    
    console.time('Starting App took...');
    await initProxy();
    await initServer();
    console.timeEnd('Starting App took...');
}

init();
