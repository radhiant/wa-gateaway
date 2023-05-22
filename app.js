const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const {intro, namaLengkap, namaPanggilan, alamatRumah, alamatKantor, tentang, pendidikan, pengalamanKerja, skill, ttl, webpribadi} = require('./portfolio-bot/intro');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
	args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ],
    }
});

client.initialize();

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('message', msg => {
    if(msg.body === '!intro'){
        msg.reply(intro);
    }else if (msg.body === '!nama-lengkap') {
        msg.reply(namaLengkap);
    } else if (msg.body === '!nama-panggilan') {
        msg.reply(namaPanggilan);
    }else if (msg.body === '!alamat-rumah') {
        msg.reply(alamatRumah);
    }else if (msg.body === '!alamat-kantor') {
        msg.reply(alamatKantor);
    }else if (msg.body === '!tentang') {
        msg.reply(tentang);
    }else if (msg.body === '!pendidikan') {
        msg.reply(pendidikan);
    }else if (msg.body === '!pengalaman-kerja') {
        msg.reply(pengalamanKerja);
    }else if (msg.body === '!skill') {
        msg.reply(skill);
    }else if (msg.body === '!ttl') {
        msg.reply(ttl);
    }else if (msg.body === '!website-pribadi') {
        msg.reply(webpribadi);
    }
});

client.on('disconnected', (reason) => {
    console.log('Disconnect Whatsapp Bot', reason);
})

// SOCKET IO
io.on('connection', function (socket) {
    socket.emit('message', 'Connection...');

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'QR Code received, scan please !');
        });
    });

    client.on('ready', () => {
        socket.emit('message', 'Whatsapp is ready !');
    });

    client.on('authenticated', () => {
        console.log('AUTHENTICATED');
        socket.emit('authenticated', 'Whatsapp is authenticated !');
        socket.emit('message', 'Whatsapp is authenticated !');
    });
    
});

// SEND MESSAGE
app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const message = intro;

    client.sendMessage(number, message).then(respone => {
        res.status(200).json({
            status: true,
            respone: respone
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            respone: err
        })
    });
})

const PORT = 8080;

server.listen(PORT, function () {
    console.log(`App is running on ${PORT}`);
});