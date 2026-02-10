/*

Feature: Image ToHitam
Author: Xiao Ann
API Base: https://api.snowping.my.id/
Request: aim meletup
Note: kalau request bawa api mas 🗿
*/

import axios from "axios";

const kurumi = async (ann, m, { prefix, command, mime }) => {
    try {
        const q = m.quoted || m;
        if (!mime || !mime.startsWith("image/")) {
            return m.reply(
                `Kirim atau reply gambar dengan caption ${prefix + command}`
            );
        }
        // react
        await m.react("🕐");
        // upload image ke url
        const imgUrl = await m.upload(q);
        if (!imgUrl) return m.reply("Gagal upload image");
        // request ke api
        const { data } = await axios.get(
            "https://api.snowping.my.id/api/imageai/tohitam",
            {
                params: { url: imgUrl },
                timeout: 100000
            }
        );

        if (data.status !== 200 || !data.result?.url) {
            return m.reply("API gagal memproses gambar");
        }

        const { url, size, mimetype } = data.result;
        // kirim gambar
        await m.sendFile(url, {
            caption: `Size: ${size}`,
            fileName: "hitam.png",
            mimetype: mimetype || "image/png"
        });

        await m.react("✅");
    } catch (e) {
        await m.react("❌");
        m.reply(`*ERROR:* ${e.message}`);
    }
};

kurumi.command = ["hitamkan", "hytam", "ireng"];
kurumi.help = ["hitamkan <reply image>"];
kurumi.tags = ["tools", "image"];

export default kurumi;
