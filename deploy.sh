#!/usr/bin/env bash
# Floradex — script de déploiement (Session 6 — pivot national + vernaculaire)
# Lance ceci depuis le dossier github-deploy/ pour pousser sur main.
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ Vérification du repo git…"
if [ ! -d .git ]; then
  echo "❌ Pas de .git ici. Si c'est ton premier deploy, fais :"
  echo "   git init && git remote add origin git@github.com:docteuriannotta/florescence-poc.git"
  exit 1
fi

git status --short

echo ""
echo "▶ Stage de tous les fichiers…"
git add -A

echo ""
DEFAULT_MSG="S9.3 — modal détail des badges"
read -p "Message de commit [$DEFAULT_MSG] : " MSG
MSG="${MSG:-$DEFAULT_MSG}"

echo ""
echo "▶ Commit + push…"
git commit -m "$MSG" || echo "(rien à commiter)"
git push origin main

echo ""
echo "✅ Push terminé."
echo "   URL prod : https://docteuriannotta.github.io/florescence-poc/"
echo "   Compte ~1 minute pour que GitHub Pages reflète le commit."
echo ""
echo "▶ Vérif post-deploy : recharge l'app sur ton téléphone."
echo "   Le SW v3 va invalider l'ancien cache 'floradex-v2-genus-…' tout seul."
echo "   Au premier lancement S6, une bannière 'Floradex passe au national'"
echo "   t'informera que ta progression a été remise à zéro (décision Q5)."
