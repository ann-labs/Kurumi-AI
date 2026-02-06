/*
- Tourl
- Base: https://ikyyzx-uploader.lol/
- deskripsi: Ubah sesuai dengan sc kalian aja 🗿
*/

import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import { randomBytes } from "crypto";

async function uploadFile(filePath) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    const res = await axios.post("https://ikyyzx-uploader.lol/upload", form, {
        headers: {
            ...form.getHeaders(),
            Accept: "application/json"
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });
    return res.data;
}

let handler = async (ann, m, { mime }) => {
    try {
        const q = m.quoted || m;
        if (!q) throw new Error("Reply media");
        const type = q.mimetype || mime || "";
        if (!type) throw new Error("Media tidak terdeteksi");
        //deteksi media
        const isImage = /^image\/(png|jpe?g|webp|gif|bmp)$/i.test(type);
        const isVideo = /^video\/(mp4|webm|ogg|mov|mkv)$/i.test(type);
        const isAudio = /^audio\/(mpeg|mp3|wav|ogg|opus|aac|flac|m4a)$/i.test(
            type
        );
        if (!isImage && !isVideo && !isAudio)
            throw new Error("Media tidak didukung");
        // download media
        const buffer = await ann.downloadMediaMessage(q);

        if (!buffer || !Buffer.isBuffer(buffer))
            throw new Error("Gagal mengunduh media");

        const ext = isImage ? "jpg" : isVideo ? "mp4" : "mp3";
        const tmp = `${Date.now()}.${ext}`;
        fs.writeFileSync(tmp, buffer);
        // fungsi react
        await m.react("🕐");
        // uploadFile
        const res = await uploadFile(tmp);
        fs.unlinkSync(tmp);
        if (!res.success) throw new Error("Upload gagal");

        const url = res.url || res.catbox;
        if (!url) throw new Error("Url tidak ditemukan");
        // kirim link
        await m.reply(`*Url:* ${url}`);
        await m.react("✅");
    } catch (e) {
        m.reply(`*ERROR:* ${e.message}`);
        m.react("❌");
    }
};

handler.command = ["upload", "uploader"];
handler.tags = ["tools"];
handler.help = ["upload (reply/kirim media image/video/audio)"];

export default handler;
