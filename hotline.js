/*
Hotline Meme Generator
Api: https://api.cuki.biz.id/
deskripsi: intinya begitu 🗿
*/

import axios from "axios";

const handler = async (ann, m, { prefix, command }) => {
    await m.react("🕐"); // fungsi react
    const raw = m.body.slice((prefix + command).length).trim();
    if (!raw)
        return m.reply(
            `Format:\n${prefix + command} teks atas|teks bawah\n\nContoh:\n${prefix + command} p|salam`
        );
    if (!raw.includes("|"))
        return m.reply(
            `Gunakan pemisah |\n\nContoh:\n${prefix + command} hello|word`
        );
    const [text1Raw, text2Raw] = raw.split("|");
    const text1 = encodeURIComponent(text1Raw.trim());
    const text2 = encodeURIComponent(text2Raw.trim());
    const imgUrl =
        `https://api.cuki.biz.id/api/canvas/meme/hotline` +
        `?apikey=cuki-x&text1=${text1}&text2=${text2}`;
    try {
        const res = await axios.get(imgUrl, {
            responseType: "arraybuffer"
        });
        // kirim gambar
        await m.sendFile(Buffer.from(res.data), {
            fileName: "hotline.png",
            caption: "🖼️ Hotline Meme",
            mimetype: "image/png"
        });
        await m.react("✅");
    } catch (e) {
        console.error("❌ hotline error:", e);
        await m.react("❌");
        m.reply(`*ERROR:* ${e.message}`);
    }
};

handler.help = ["hotline"];
handler.tags = ["tools"];
handler.command = ["hotline"];

export default handler;
