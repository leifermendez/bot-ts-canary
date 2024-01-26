import { addKeyword, createBot, createFlow, createProvider, MemoryDB, utils } from '@bot-whatsapp/bot'
import { BaileysProvider } from '@bot-whatsapp/provider-baileys'


const fakeHttp = async (input: string) => {
    await utils.delay(500)
    return Promise.resolve(input)
}

const flowWelcome = addKeyword<BaileysProvider, MemoryDB>('hola')
    .addAnswer(`Bienvenido a este bot!`, undefined, async (_, { flowDynamic, provider }) => {
        // podemos obtener datos de base de datos o llamados http
        const data = await fakeHttp(`Este dato puede venir de una DB`)

        // de esta manera lo enviamos al whatsapp
        await flowDynamic(data)
        await flowDynamic(`Escribe *comenszar*`)
    })

const flowToAsk = addKeyword<BaileysProvider, MemoryDB>('comenzar')
    .addAction(async (_, { flowDynamic }) => {
        //puedes usar addAction para ejecutar logica antes de enviar un mensaje
        await flowDynamic('Voy a comenzar...')
    })
    .addAnswer(`¿Cual es tu nombre?`, { capture: true }, async (ctx, { state }) => {
        const name = ctx.body
        await state.update({ name })

    })
    .addAction(async (_, { flowDynamic, state }) => {
        await flowDynamic(`¿Cual es tu email ${state.get('name')}?`)
    })
    .addAction({ capture: true }, async (ctx, { fallBack }) => {
        const answer = ctx.body
        if (!answer.includes('@')) {
            return fallBack(`Parece que no es un mail valido intenta nuevamente!`)
        }
    })
    .addAnswer(`Gracias`)


const main = async () => {
    await createBot({
        database: new MemoryDB(),
        provider: createProvider(BaileysProvider),
        flow: createFlow([flowWelcome, flowToAsk])
    })
}

main()