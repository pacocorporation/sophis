const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// Logger suave
const logger = pino({ level: 'silent' });

async function connectToWhatsApp() {
    console.log('\n🚀 [LOG] Iniciando Ponte WhatsApp -> Nanda AI...');
    
    const authPath = path.join(__dirname, 'auth_info');
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    
    console.log('⏳ [LOG] Buscando versão do WhatsApp...');
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    console.log(`✅ [LOG] Usando versão: ${version.join('.')}`);

    const sock = makeWASocket({
        version,
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false, // Vamos imprimir manualmente para controlar o tamanho
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n📸 [QR CODE] Escaneie para conectar:');
            // 'small: true' ajuda a caber em terminais menores (especialmente no Windows/VS Code)
            qrcode.generate(qr, { small: true });
            console.log('\n(Se o código acima estiver estranho, tente diminuir o zoom do terminal com Ctrl e -)');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ [LOG] Conexão fechada. Reconectando:', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('\n✅ [SUCESSO] WHATSAPP CONECTADO!');
            console.log('🤖 Nanda AI está ativa no seu número pessoal.');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (messageText) {
            console.log(`📩 [WHATSAPP] Recebido: "${messageText}"`);

            try {
                const response = await axios.post('http://localhost:3000/api/nanda', {
                    prompt: messageText,
                    trainingExamples: [],
                    products: [] 
                }, { timeout: 15000 });

                const reply = response.data.response;
                if (reply) {
                    await sock.sendMessage(remoteJid, { text: reply });
                    console.log('🤖 [NANDA] Resposta enviada.');
                }
            } catch (error) {
                console.error('❌ [ERRO] Falha na Nanda:', error.message);
            }
        }
    });
}

connectToWhatsApp().catch(err => console.error("❌ Erro fatal:", err));
