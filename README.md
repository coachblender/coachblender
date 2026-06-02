# 1. Lokales Next.js-Projekt erstellen (falls noch nicht geschehen)
npx create-next-app@latest coachblender --typescript --tailwind

# 2. In den Ordner wechseln
cd coachblender

# 3. Git initialisieren
git init

# 4. GitHub-Repo erstellen (auf github.com/new) und dann:
git remote add origin https://github.com/dein-benutzername/coachblender.git
git add .
git commit -m "Initial commit"
git push -u origin main
