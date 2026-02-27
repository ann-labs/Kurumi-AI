/*
  • Feature: YouTube Downloader
  • Request: Nyxore
  • Deskripsi: Fitur ytmp3
  • Author: Xiao Ann
  • Scrape Base: -
  • Note: mau gua bikin ytmp4 sekalian tapi error 🗿
*/

import axios from "axios";

class AgungDevXYTDownloader {
    constructor() {
        this.baseUrl = "https://ht.flvto.online";
    }

    async download(videoId, format = "mp3") {
        if (!videoId || typeof videoId !== "string") {
            return { success: false, error: "Video ID is required" };
        }

        if (!["mp3", "mp4"].includes(format)) {
            return { success: false, error: "Format must be mp3 or mp4" };
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/converter`,
                {
                    id: videoId,
                    fileType: format
                },
                {
                    headers: {
                        "accept-encoding": "gzip, deflate, br, zstd",
                        origin: "https://ht.flvto.online",
                        "content-type": "application/json",
                        "user-agent":
                            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36"
                    },
                    timeout: 30000
                }
            );

            const data = response.data;

            if (data.status === "ok") {
                return {
                    success: true,
                    videoId,
                    format,
                    title: data.title,
                    duration: data.duration,
                    fileSize: data.filesize,
                    downloadUrl: data.link,
                    progress: data.progress
                };
            } else {
                return {
                    success: false,
                    error: data.msg || "Download failed"
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async downloadFromUrl(youtubeUrl, format = "mp3") {
        try {
            const videoId = this.extractVideoId(youtubeUrl);
            if (!videoId) {
                return { success: false, error: "Invalid YouTube URL" };
            }

            return await this.download(videoId, format);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }
}

function pickFormat(text = "") {
    const t = text.toLowerCase();
    if (t.includes("--mp4") || t.includes("-mp4")) return "mp4";
    return "mp3";
}

function extractArgUrl(text = "") {
    const m = text.match(/https?:\/\/\S+/i);
    return m ? m[0] : null;
}

const kurumi = async (ann, m, { text, prefix, command }) => {
    const input = (text || "").trim();
    if (!input) {
        return m.reply(
            `Format:\n${prefix}${command} <url/id> [--mp3|--mp4]\n\nContoh:\n${prefix}${command} https://youtu.be/5OLs1GWB4OA --mp3`
        );
    }

    const format = pickFormat(input);
    const url = extractArgUrl(input);
    const dl = new AgungDevXYTDownloader();

    await m.react("🕐");
    let result;
    try {
        if (url) result = await dl.downloadFromUrl(url, format);
        else result = await dl.download(input, format);

        const caption = `• *Judul:* ${result.title || "-"},
      • *Durasi:* ${result.duration || "-"},
      • *Format:* ${result.format}
      • *Size:* ${result.fileSize || "-"}`;
        const isMp4 = result.format === "mp4";
        const fileRes = await axios.get(result.downloadUrl, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });
        const buffer = Buffer.from(fileRes.data);
        await ann.sendMessage(
            m.chat,
            {
                [isMp4 ? "video" : "audio"]: buffer,
                mimetype: isMp4 ? "video/mp4" : "audio/mpeg",
                fileName: isMp4 ? "youtubedl.mp4" : "youtubedl.mp3",
                caption: isMp4 ? caption : undefined
            },
            { quoted: m }
        );
        await m.react("✅");
    } catch (e) {
        result = { success: false, error: e?.message || String(e) };
    }
    if (!result?.success) {
        m.react("❌");
        return m.reply(`*ERROR:* ${result?.error || "unknown_error"}`);
    }
};

kurumi.command = ["yt"];
kurumi.tags = ["tools"];
kurumi.help = ["yt <url atau id>"];

export default kurumi;
