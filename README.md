# ImAwake ☀️

PWA de coloc : un bouton **ImAwake** passe ton statut en « réveillé·e » pendant 1 h, et tout le monde voit qui est debout.

## Stack

Next.js 16 (App Router, Server Actions) · Supabase (Postgres) + Drizzle ORM · shadcn/ui · auth maison (sessions en base, mots de passe scrypt).

## Démarrer en local

```bash
cp .env.example .env.local      # renseigne DATABASE_URL et BOOTSTRAP_TOKEN (openssl rand -hex 24)
npm install
npm run db:push                 # crée les tables
npm run dev
```

Puis ouvre `http://localhost:3000/invite/<BOOTSTRAP_TOKEN>` pour créer le **premier compte, qui sera admin**.
Ce lien ne marche que tant que la base ne contient aucun utilisateur.

## Inviter la coloc

`/admin` → **Nouveau lien**. Chaque lien est à usage unique et expire après 7 jours.
Il n'y a pas d'inscription publique : sans lien valide, impossible de créer un compte.

## Supabase

L'app utilise Supabase comme base Postgres (connexion directe via Drizzle, pas de clé API nécessaire).

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Clique sur le bouton **Connect** en haut du dashboard du projet :
   - `DATABASE_URL` = *Transaction pooler* (port **6543**) — utilisé par l'app sur Vercel.
   - `DIRECT_URL` = *Session pooler* (port **5432**) — utilisé seulement par `npm run db:push`.
   - Ajoute `?sslmode=require` à la fin des deux URLs.
3. `npm run db:push` crée les tables avec **RLS activée sans policy** : elles sont invisibles
   depuis l'API publique de Supabase (clé `anon`), seule l'app y accède.

## Déployer sur Vercel

1. Ajoute `DATABASE_URL` et `BOOTSTRAP_TOKEN` dans les variables d'environnement du projet Vercel.
2. Lance `npm run db:push` une fois en local avec les URLs Supabase dans `.env.local`.
3. Déploie, puis va sur `https://<ton-app>/invite/<BOOTSTRAP_TOKEN>`.

Sur téléphone : « Ajouter à l'écran d'accueil » (Safari) ou « Installer l'application » (Chrome).
