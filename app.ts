// Module: Player Chromium (Puppeteer)
// Description: Chromium Browser as a Player via Puppeteer
// Author(s): Earl Vhin Gabuat (earlgabuat@gmail.com)

import * as dotenv from 'dotenv';
import * as logsym from 'log-symbols';
import puppeteer from 'puppeteer-core';
import io from 'socket.io-client';

// Environment Variables Initialization
dotenv.config();

// Socket Constants
enum SOCKET_EVENTS {
    connect = 'connect',
    disconnect = 'disconnect',
    online = 'online'
}

const socket = io(process.env.PLAYER_SERVER!, {query:"connecting_as=player-chromium"});

socket.on(SOCKET_EVENTS.connect, () => {
    console.log(logsym.success, 'Connected to Local Socket Server');
});

socket.on(SOCKET_EVENTS.disconnect, () => {
    console.log(logsym.info, 'Disconnected from Local Socket Server');
});

const chrome_puppet = async () => {
    try {
        // Switch to Puppeteer-Core
        const browser = await puppeteer.launch({ 
            executablePath: '/usr/bin/chromium-browser',
            headless: false, 
            args: ['--start-fullscreen', `--app=${process.env.PLAYER_UI}`, '--incognito'], 
            ignoreDefaultArgs: ["--enable-automation"]
        });

        const [page] = await browser.pages();

        await page.setViewport({width:1920, height:1080});

        console.log(logsym.success, "Puppeteer Started");
    
        browser.on('targetdestroyed', target => {
            console.log(logsym.error, "Puppeteer Closed, Respawn in a few");
            setTimeout(() => {
                chrome_puppet();
            }, 3000);
        })

        page.on('error', err => {
            console.log(logsym.error, "Page Crashed, Recovering in a few");
            
        })
    } catch(err) {
        console.log(logsym.error, 'Puppeteer_error', err);
    }
};

chrome_puppet();