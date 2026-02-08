/*
 - Fitur: REMOVE WM 
 - Author: Xiao Ann 
 - Base: https://ezremove.ai/
 - Deskripsi: sesuiin ajah
*/

import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ezremove(imagePath) {
    const form = new FormData();
    form.append(
        "image_file",
        fs.createReadStream(imagePath),
        path.basename(imagePath)
    );

    const create = await axios
        .post(
            "https://api.ezremove.ai/api/ez-remove/watermark-remove/create-job",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "User-Agent": "Mozilla/5.0",
                    origin: "https://ezremove.ai",
                    "product-serial": "sr-" + Date.now()
                },
                timeout: 30000
            }
        )
        .then(r => r.data)
        .catch(() => null);

    if (!create || !create.result || !create.result.job_id) return null;
    const job = create.result.job_id;

    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 4000));

        const check = await axios
            .get(
                `https://api.ezremove.ai/api/ez-remove/watermark-remove/get-job/${job}`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        origin: "https://ezremove.ai",
                        "product-serial": "sr-" + Date.now()
                    },
                    timeout: 30000
                }
            )
            .then(r => r.data)
            .catch(() => null);

        if (check?.code === 100000 && check?.result?.output?.length) {
            return check.result.output[0];
        }
    }

    return null;
}

const kurumi = async (ann, m, { prefix, command }) => {
    try {
        await m.react("🕐"); // fungsi react
        const q = m.quoted || m;
        const type = Object.keys(q.message || {})[0];
        const mime = q.message?.[type]?.mimetype || "";

        if (!mime)
            throw `⚠️ Kirim/reply gambar dengan caption:\n${prefix + command}`;

        if (!/image\/(jpe?g|png)/.test(mime))
            throw `❌ Format ${mime} tidak didukung`;
        // download media
        const media = await ann.downloadMediaMessage(q);
        const inputPath = path.join(__dirname, `tmp_${Date.now()}.png`);
        fs.writeFileSync(inputPath, media);

        const result = await ezremove(inputPath);
        fs.unlinkSync(inputPath);

        if (!result) throw "❌ Gagal menghapus watermark";

        const ext = result.endsWith(".png") ? "png" : "jpg";
        // kirim gambar
        await m.sendFile(result, {
            caption: "✅ Watermark berhasil dihapus",
            mimetype: `image/${ext}`,
            fileName: `ezremove.${ext}`
        });

        await m.react("✅");
    } catch (err) {
        await m.react("❌");
        m.reply(String(err));
    }
};

kurumi.command = ["removewm", "rmwm", "nowm"];
kurumi.help = ["ezremove - Hapus watermark dari gambar"];
kurumi.tags = ["tools", "image"];
kurumi.onlyPremium = true; // kalau mau hanya untuk premium

export default kurumi;
