/*
- Fiture: Zerochan search and detail
- reques: NX
- Author: Xiao Ann
- Base: https://nozomi.dev.ar/snippet/code/zerochan.js
- reques: NX
- Note: Sesuaikan aja sama punya kalian 😁
*/

import axios from "axios";

class Zerochan {
    constructor() {
        this.is = axios.create({
            baseURL: "https://www.zerochan.net",
            headers: {
                "user-agent": "okhttp/3.14.9"
            }
        });
        this.bot = "";
    }
    async st() {
        if (!this.bot) {
            const { headers } = await this.is.get("/xbotcheck-image.svg");
            const cookie = headers["set-cookie"]?.[0];
            if (!cookie) throw new Error("Failed to get Zerochan cookie");
            this.is.defaults.headers.cookie = cookie;
            this.bot = cookie;
        } else {
            this.is.defaults.headers.cookie = this.bot;
        }
    }
    async search(query) {
        await this.st();
        const res = await this.is.get("/search", {
            validateStatus: () => true,
            maxRedirects: 0,
            params: { q: query }
        });
        if (!res.headers.location) return [];
        const { data } = await this.is.get(res.headers.location, {
            params: {
                s: "recent",
                json: 1
            }
        });
        return data?.items || [];
    }
    async detail(id) {
        await this.st();
        const { data } = await this.is.get(`/${id}`, {
            params: { json: 1 }
        });
        return data;
    }
}

const zc = new Zerochan();
const delay = ms => new Promise(res => setTimeout(res, ms));

const kurumi = async (ann, m, { text, args, prefix, command }) => {
    try {
        if (!text) {
            return m.reply(
                `Usage:
${prefix + command} <query>
${prefix + command} detail <id>`
            );
        }

        //ini react
        await m.react("🕐");

        // ini detail ygy
        if (args[0] === "detail") {
            if (!args[1] || isNaN(args[1])) {
                return m.reply(
                    `Masukkan ID yang valid.\nExample: ${prefix + command} detail 1383525`
                );
            }

            const data = await zc.detail(args[1]);
            if (!data || !data.full) {
                return m.reply("Detail tidak ditemukan");
            }

            const tags = data.tags?.slice(0, 10).join(", ") || "-";

            const caption = `*${data.primary}*

*ID:* ${data.id}
*SIZE:* ${data.width}×${data.height}
*FILE:* ${(data.size / 1024 / 1024).toFixed(2)} MB
*TAGS:* ${tags}
*SOURCE:* Zerochan`;

            await m.sendFile(data.full, {
                caption,
                fileName: "Zerochan-HD.jpg",
                mimetype: "image/jpeg"
            });

            await m.react("✅");
            return;
        }

        // ini search ygy
        const data = await zc.search(text);
        if (!data || data.length === 0) {
            return m.reply("Data tidak ditemukan");
        }

        const picks = data
            .filter(v => v.thumbnail)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5); // kirim 5 gambar

        for (const pick of picks) {
            const tags = pick.tags?.slice(0, 6).join(", ") || "-";

            const caption = `*${pick.tag}*

*ID:* ${pick.id}
*SIZE:* ${pick.width}×${pick.height}
*TAGS:* ${tags}
*Gunakan:*
${prefix + command} detail ${pick.id}`;

            await m.sendFile(pick.thumbnail, {
                caption,
                fileName: "Zerochan.jpg",
                mimetype: "image/jpeg"
            });

            await delay(1500);
        }

        await m.react("✅");
    } catch (e) {
        await m.react("❌");
        m.reply(`*ERROR:* ${e.message}`);
    }
};

kurumi.command = ["zerochan", "zc"];
kurumi.help = ["zerochan <query> [limit]", "zerochan detail <id>"];
kurumi.tags = ["anime", "image", "zerochan"];

export default kurumi;
