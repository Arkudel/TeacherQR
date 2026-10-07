# Booking QR Code Maker

A small React tool that helps teachers turn a Google Calendar, Calendly, or any booking link into a printable QR code. Add a picture in the middle, pick colors, put a headline above or below, and download it or print it on a full page (US Letter, Legal, Tabloid, A5, A4, or A3).

Everything runs in the browser. There is no server, and no link or image leaves the user's device.

## Run it on your computer

```bash
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

## Deploy to GitHub Pages

1. Create a new repository on GitHub and push this folder to the `main` branch.
2. In the repository, open **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push any change (or open the **Actions** tab and run "Deploy to GitHub Pages"). In a minute or two the site appears at `https://<your-username>.github.io/<repo-name>/`.

The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the site, and publishes the `dist` folder. `package-lock.json` must stay in the repository because the workflow uses `npm ci`.

## Where to change things

| To change | Edit |
| --- | --- |
| Booking services, paper sizes, color lists, center pictures | `src/data.js` |
| QR drawing, page layout, PNG and SVG export | `src/lib.js` |
| Screens and controls | `src/App.js` (plain `React.createElement`, easy to convert to JSX) |
| Look and feel, print rules | `src/styles.css` |

To add a center picture, add an entry to `IMGS` in `src/data.js`: an id, a name, and SVG shapes drawn in a 100 x 100 box.

## Notes

- The page loads the Familjen Grotesk font from Google Fonts. Without it, the tool falls back to the system font.
- A picture in the middle makes the code use the highest error correction. Always scan-test a code before printing many copies.
- The QR code is made with the [qrcode-generator](https://www.npmjs.com/package/qrcode-generator) package. Add a license file of your choice before sharing the repository publicly.
