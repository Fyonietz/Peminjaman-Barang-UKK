# Pembekalan UKK

Starter project React + TypeScript + Vite. Sudah dikonfigurasi dengan [Oxlint](https://oxc.rs) untuk linting dan [React Compiler](https://react.dev/learn/react-compiler) untuk optimasi render otomatis.

## Kebutuhan

- [Bun](https://bun.sh) (direkomendasikan, repo ini memakai `bun.lock`) atau Node.js 22+
- npm/pnpm juga bisa dipakai jika lebih nyaman

## Memulai

```bash
bun install     # sekali saja
bun run dev     # buka http://localhost:5173
```

## Perintah

| Perintah            | Fungsi                                                    |
| ------------------- | --------------------------------------------------------- |
| `bun run dev`       | Jalankan dev server dengan HMR                            |
| `bun run build`     | Typecheck (`tsc -b`) lalu build produksi ke `dist/`        |
| `bun run typecheck` | Cek tipe saja tanpa build                                 |
| `bun run lint`      | Jalankan Oxlint                                           |
| `bun run preview`   | Preview hasil build secara lokal                          |

Menjalankan dev server dari container/VPS? Pakai `bun run dev --host --port 5000`.

## Struktur

```
index.html          entry HTML (judul, meta, favicon)
src/main.tsx        bootstrap React (StrictMode + createRoot)
src/App.tsx         komponen halaman utama — mulai ngoding di sini
src/index.css       design token (light/dark) + style dasar
vite.config.ts      plugin React + React Compiler
.oxlintrc.json      aturan lint
```

## Catatan

- Tema gelap mengikuti `prefers-color-scheme`; ubah warna di `src/index.css`.
- React Compiler aktif lewat `@rolldown/plugin-babel`. Untuk mencoba implementasi native, ganti `vite.config.ts` menjadi `react({ compiler: true })` lalu hapus plugin Babel.
- Untuk lint type-aware, instal `oxlint-tsgolint` lalu tambahkan `"options": { "typeAware": true }` di `.oxlintrc.json`.
